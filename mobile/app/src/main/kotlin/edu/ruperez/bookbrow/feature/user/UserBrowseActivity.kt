package edu.ruperez.bookbrow.feature.user

import android.content.Intent
import android.os.Bundle
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SearchView
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.bottomnavigation.BottomNavigationView
import edu.ruperez.bookbrow.R
import edu.ruperez.bookbrow.databinding.ActivityUserBrowseBinding
import edu.ruperez.bookbrow.feature.books.Book
import edu.ruperez.bookbrow.feature.books.BooksApiService
import edu.ruperez.bookbrow.feature.borrow.BorrowRequest
import edu.ruperez.bookbrow.shared.RetrofitClient
import edu.ruperez.bookbrow.shared.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * UserBrowseActivity - Browse and search books
 * 
 * Features:
 * - Search books by title or author
 * - Filter books
 * - Grid view of all available books
 * - Borrow books
 */
class UserBrowseActivity : AppCompatActivity(), BottomNavigationView.OnNavigationItemSelectedListener {

    private lateinit var binding: ActivityUserBrowseBinding
    private lateinit var sessionManager: SessionManager
    private lateinit var booksApiService: BooksApiService
    private lateinit var booksAdapter: UserBooksAdapter
    private var allBooks = emptyList<Book>()
    private var selectedGenre: String? = null
    private var suspensionStatus: UserSuspensionStatus? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityUserBrowseBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)
        booksApiService = RetrofitClient.booksApiService

        setupUI()
        setupBottomNavigation()
        loadSuspensionStatus()
        loadBooks()
    }

    private fun setupUI() {
        // Setup search
        binding.searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                query?.let { searchBooks(it) }
                return true
            }

            override fun onQueryTextChange(newText: String?): Boolean {
                applyLocalFilters(newText.orEmpty())
                return true
            }
        })

        // Setup filter button
        binding.btnFilter.setOnClickListener {
            showGenreFilter()
        }

        binding.profileButton.setOnClickListener {
            binding.bottomNavigation.selectedItemId = R.id.nav_menu
        }

        // Setup books RecyclerView with grid layout
        booksAdapter = UserBooksAdapter(
            onBookClick = { book -> showBookDetails(book) },
            onBorrowClick = { book -> requestBorrow(book) },
            showBorrowButton = false
        )
        binding.rvBooks.apply {
            layoutManager = LinearLayoutManager(this@UserBrowseActivity)
            adapter = booksAdapter
        }

        // Setup swipe refresh
        binding.swipeRefresh.setOnRefreshListener {
            loadBooks()
        }
    }

    private fun setupBottomNavigation() {
        binding.bottomNavigation.setOnNavigationItemSelectedListener(this)
        binding.bottomNavigation.selectedItemId = R.id.nav_browse
    }

    private fun loadBooks() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val token = sessionManager.getToken() ?: ""
                val response = booksApiService.getAllBooks("Bearer $token", 1, 50)
                
                withContext(Dispatchers.Main) {
                    binding.swipeRefresh.isRefreshing = false
                    
                    if (response.isSuccessful) {
                        val books = response.body()?.data?.books ?: emptyList()
                        allBooks = books
                        applyLocalFilters(binding.searchView.query?.toString().orEmpty())
                    } else {
                        Toast.makeText(
                            this@UserBrowseActivity,
                            "Failed to load books",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.swipeRefresh.isRefreshing = false
                    Toast.makeText(
                        this@UserBrowseActivity,
                        "Error: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    private fun searchBooks(query: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val token = sessionManager.getToken() ?: ""
                val response = booksApiService.getAllBooks(
                    token = "Bearer $token",
                    page = 1,
                    limit = 50,
                    search = query
                )
                
                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        val books = response.body()?.data?.books ?: emptyList()
                        booksAdapter.submitList(books)
                    } else {
                        Toast.makeText(
                            this@UserBrowseActivity,
                            "No books found",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@UserBrowseActivity,
                        "Search error: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    private fun showGenreFilter() {
        val genres = allBooks
            .mapNotNull { it.genre?.takeIf { genre -> genre.isNotBlank() } }
            .distinct()
            .sorted()
        val options = listOf("All genres") + genres

        AlertDialog.Builder(this)
            .setTitle("Filter books")
            .setItems(options.toTypedArray()) { _, which ->
                selectedGenre = options[which].takeUnless { it == "All genres" }
                applyLocalFilters(binding.searchView.query?.toString().orEmpty())
            }
            .show()
    }

    private fun applyLocalFilters(query: String = "") {
        val normalizedQuery = query.trim()
        val filtered = allBooks.filter { book ->
            val matchesQuery = normalizedQuery.isBlank() ||
                book.title.contains(normalizedQuery, ignoreCase = true) ||
                book.author.contains(normalizedQuery, ignoreCase = true)
            val matchesGenre = selectedGenre == null ||
                book.genre.equals(selectedGenre, ignoreCase = true)
            matchesQuery && matchesGenre
        }
        booksAdapter.submitList(filtered)
    }

    private fun requestBorrow(book: Book) {
        if (suspensionStatus?.isSuspended == true) {
            Toast.makeText(this, "Borrowing is currently suspended for your account.", Toast.LENGTH_SHORT).show()
            return
        }

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val token = sessionManager.getToken()
                if (token.isNullOrBlank()) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(this@UserBrowseActivity, "Session expired. Please login again.", Toast.LENGTH_SHORT).show()
                    }
                    return@launch
                }

                val response = RetrofitClient.borrowApiService.borrowBook(
                    token = "Bearer $token",
                    request = BorrowRequest(book.id)
                )

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful && response.body()?.success == true) {
                        Toast.makeText(this@UserBrowseActivity, "Borrow request sent for \"${book.title}\"", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(
                            this@UserBrowseActivity,
                            response.body()?.message ?: response.message(),
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@UserBrowseActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun showBookDetails(book: Book) {
        BookDetailsDialog.show(this, book, suspensionStatus = suspensionStatus) { selectedBook ->
            requestBorrow(selectedBook)
        }
    }

    private fun loadSuspensionStatus() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val token = sessionManager.getToken()
                if (token.isNullOrBlank()) return@launch
                val response = RetrofitClient.userApiService.getSuspensionStatus("Bearer $token")
                if (response.isSuccessful && response.body()?.success == true) {
                    suspensionStatus = response.body()?.data
                }
            } catch (_: Exception) {
                suspensionStatus = null
            }
        }
    }

    override fun onNavigationItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            R.id.nav_home -> {
                startActivity(Intent(this, UserHomeActivity::class.java))
                overridePendingTransition(0, 0)
                finish()
                return true
            }
            R.id.nav_browse -> {
                // Already on browse
                return true
            }
            R.id.nav_my_books -> {
                startActivity(Intent(this, UserMyBooksActivity::class.java))
                overridePendingTransition(0, 0)
                finish()
                return true
            }
            R.id.nav_menu -> {
                startActivity(Intent(this, UserMenuActivity::class.java))
                overridePendingTransition(0, 0)
                finish()
                return true
            }
        }
        return false
    }
}
