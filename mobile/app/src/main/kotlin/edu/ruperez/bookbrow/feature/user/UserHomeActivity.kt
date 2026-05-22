package edu.ruperez.bookbrow.feature.user

import android.content.Intent
import android.os.Bundle
import android.view.MenuItem
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.bottomnavigation.BottomNavigationView
import edu.ruperez.bookbrow.R
import edu.ruperez.bookbrow.databinding.ActivityUserHomeBinding
import edu.ruperez.bookbrow.feature.auth.LoginActivity
import edu.ruperez.bookbrow.feature.books.BooksApiService
import edu.ruperez.bookbrow.feature.books.Book
import edu.ruperez.bookbrow.shared.RetrofitClient
import edu.ruperez.bookbrow.shared.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * UserHomeActivity - Main dashboard for regular users
 * 
 * Features:
 * - Browse available books
 * - Search books
 * - View featured books
 * - Filter by categories
 * - Bottom navigation for Home, Browse, My Books, Menu
 */
class UserHomeActivity : AppCompatActivity(), BottomNavigationView.OnNavigationItemSelectedListener {

    private lateinit var binding: ActivityUserHomeBinding
    private lateinit var sessionManager: SessionManager
    private lateinit var booksApiService: BooksApiService
    private lateinit var featuredBooksAdapter: UserBooksAdapter
    private var featuredBooks = emptyList<Book>()
    private var suspensionStatus: UserSuspensionStatus? = null
    private var selectedCategory = "All"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityUserHomeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)
        booksApiService = RetrofitClient.booksApiService

        setupUI()
        setupBottomNavigation()
        loadUserInfo()
        loadSuspensionStatus()
        loadFeaturedBooks()
    }

    private fun setupUI() {
        // Setup search bar click
        binding.searchBar.setOnClickListener {
            // Navigate to browse screen
            binding.bottomNavigation.selectedItemId = R.id.nav_browse
        }

        binding.profileButton.setOnClickListener {
            binding.bottomNavigation.selectedItemId = R.id.nav_menu
        }

        // Setup category buttons
        setupCategoryButtons()

        // Setup featured books RecyclerView
        featuredBooksAdapter = UserBooksAdapter(
            onBookClick = { book -> showBookDetails(book) },
            onBorrowClick = { book -> requestBorrow(book) },
            showBorrowButton = false
        )
        binding.rvFeaturedBooks.apply {
            layoutManager = LinearLayoutManager(this@UserHomeActivity)
            adapter = featuredBooksAdapter
        }

        // Setup view all button
        binding.btnViewAllFeatured.setOnClickListener {
            binding.bottomNavigation.selectedItemId = R.id.nav_browse
        }

        binding.btnSeeAllCategories.setOnClickListener {
            binding.bottomNavigation.selectedItemId = R.id.nav_browse
        }
    }

    private fun setupCategoryButtons() {
        val chips = listOf(
            binding.chipAll to "All",
            binding.chipFiction to "Fiction",
            binding.chipEducational to "Educational",
            binding.chipSciFi to "Sci-Fi"
        )

        chips.forEach { (chip, category) ->
            chip.setOnClickListener {
                selectedCategory = category
                updateCategoryChips(chips)
                applyCategoryFilter()
            }
        }
        updateCategoryChips(chips)
    }

    private fun updateCategoryChips(chips: List<Pair<TextView, String>>) {
        chips.forEach { (chip, category) ->
            val selected = category == selectedCategory
            chip.setBackgroundResource(if (selected) R.drawable.bg_user_chip_selected else R.drawable.bg_user_chip)
            chip.setTextColor(getColor(if (selected) R.color.white else R.color.text_primary))
        }
    }

    private fun applyCategoryFilter() {
        val books = if (selectedCategory == "All") {
            featuredBooks
        } else {
            featuredBooks.filter { it.genre.equals(selectedCategory, ignoreCase = true) }
        }
        featuredBooksAdapter.submitList(books)
    }

    private fun setupBottomNavigation() {
        binding.bottomNavigation.setOnNavigationItemSelectedListener(this)
        binding.bottomNavigation.selectedItemId = R.id.nav_home
    }

    private fun loadUserInfo() {
        CoroutineScope(Dispatchers.IO).launch {
            val userName = sessionManager.getFullName() ?: "User"
            withContext(Dispatchers.Main) {
                binding.tvWelcome.text = getString(R.string.welcome_user, userName)
            }
        }
    }

    private fun loadFeaturedBooks() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val token = sessionManager.getToken() ?: ""
                val response = booksApiService.getFeaturedBooks("Bearer $token")
                    
                withContext(Dispatchers.Main) {
                    if (response.isSuccessful && response.body()?.success == true) {
                        val books = response.body()?.data ?: emptyList()
                        featuredBooks = books
                        applyCategoryFilter()
                    } else {
                        Toast.makeText(
                            this@UserHomeActivity,
                            "Failed to load books",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@UserHomeActivity,
                        "Error: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
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
                        Toast.makeText(this@UserHomeActivity, "Session expired. Please login again.", Toast.LENGTH_SHORT).show()
                    }
                    return@launch
                }

                val response = RetrofitClient.borrowApiService.borrowBook(
                    token = "Bearer $token",
                    request = edu.ruperez.bookbrow.feature.borrow.BorrowRequest(book.id)
                )

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful && response.body()?.success == true) {
                        Toast.makeText(this@UserHomeActivity, "Borrow request sent for \"${book.title}\"", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(
                            this@UserHomeActivity,
                            response.body()?.message ?: response.message(),
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@UserHomeActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun showBookDetails(book: Book) {
        BookDetailsDialog.show(this, book, suspensionStatus = suspensionStatus) { selectedBook ->
            requestBorrow(selectedBook)
        }
    }

    override fun onNavigationItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            R.id.nav_home -> {
                // Already on home
                return true
            }
            R.id.nav_browse -> {
                startActivity(Intent(this, UserBrowseActivity::class.java))
                overridePendingTransition(0, 0)
                finish()
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

    private fun logout() {
        CoroutineScope(Dispatchers.IO).launch {
            sessionManager.clearSession()
            withContext(Dispatchers.Main) {
                startActivity(Intent(this@UserHomeActivity, LoginActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                })
                overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            }
        }
    }
}
