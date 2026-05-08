package edu.ruperez.bookbrow.feature.user

import android.content.Intent
import android.os.Bundle
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SearchView
import androidx.recyclerview.widget.GridLayoutManager
import com.google.android.material.bottomnavigation.BottomNavigationView
import edu.ruperez.bookbrow.R
import edu.ruperez.bookbrow.databinding.ActivityUserBrowseBinding
import edu.ruperez.bookbrow.feature.books.Book
import edu.ruperez.bookbrow.feature.books.BooksAdapter
import edu.ruperez.bookbrow.feature.books.BooksApiService
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
    private lateinit var booksAdapter: BooksAdapter
    private var allBooks = emptyList<Book>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityUserBrowseBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)
        booksApiService = RetrofitClient.booksApiService

        setupUI()
        setupBottomNavigation()
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
                if (newText.isNullOrEmpty()) {
                    booksAdapter.submitList(allBooks)
                }
                return true
            }
        })

        // Setup filter button
        binding.btnFilter.setOnClickListener {
            // Show filter dialog
            Toast.makeText(this, "Filter options coming soon", Toast.LENGTH_SHORT).show()
        }

        // Setup books RecyclerView with grid layout
        booksAdapter = BooksAdapter(
            onEditClick = { book ->
                // Handle book click - show details or borrow
                Toast.makeText(this, "Book: ${book.title}", Toast.LENGTH_SHORT).show()
            },
            onDeleteClick = { }
        )
        binding.rvBooks.apply {
            layoutManager = GridLayoutManager(this@UserBrowseActivity, 2)
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
                val response = booksApiService.getAllBooks("Bearer $token", 0, 50)
                
                withContext(Dispatchers.Main) {
                    binding.swipeRefresh.isRefreshing = false
                    
                    if (response.isSuccessful) {
                        val books = response.body()?.data?.books ?: emptyList()
                        allBooks = books
                        booksAdapter.submitList(books)
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
                    page = 0,
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
