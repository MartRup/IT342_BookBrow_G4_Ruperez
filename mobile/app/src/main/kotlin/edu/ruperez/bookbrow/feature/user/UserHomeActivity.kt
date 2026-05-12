package edu.ruperez.bookbrow.feature.user

import android.content.Intent
import android.os.Bundle
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.bottomnavigation.BottomNavigationView
import edu.ruperez.bookbrow.R
import edu.ruperez.bookbrow.databinding.ActivityUserHomeBinding
import edu.ruperez.bookbrow.feature.auth.LoginActivity
import edu.ruperez.bookbrow.feature.books.BooksAdapter
import edu.ruperez.bookbrow.feature.books.BooksApiService
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
    private lateinit var featuredBooksAdapter: BooksAdapter
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
        loadFeaturedBooks()
    }

    private fun setupUI() {
        // Setup search bar click
        binding.searchBar.setOnClickListener {
            // Navigate to browse screen
            binding.bottomNavigation.selectedItemId = R.id.nav_browse
        }

        // Setup category buttons
        setupCategoryButtons()

        // Setup featured books RecyclerView
        featuredBooksAdapter = BooksAdapter(
            onEditClick = { book ->
                // Handle book click - show details
                Toast.makeText(this, "Book: ${book.title}", Toast.LENGTH_SHORT).show()
            },
            onDeleteClick = { }
        )
        binding.rvFeaturedBooks.apply {
            layoutManager = LinearLayoutManager(this@UserHomeActivity, LinearLayoutManager.HORIZONTAL, false)
            adapter = featuredBooksAdapter
        }

        // Setup view all button
        binding.btnViewAllFeatured.setOnClickListener {
            binding.bottomNavigation.selectedItemId = R.id.nav_browse
        }
    }

    private fun setupCategoryButtons() {
        val categories = listOf("All", "Fiction", "Educational", "Sci-Fi", "Mystery", "Romance")
        
        // You can implement category chips/buttons here
        // For now, we'll just set the default category
        selectedCategory = "All"
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
                val response = booksApiService.getAllBooks("Bearer $token", 0, 10)
                    
                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        val books = response.body()?.data?.books ?: emptyList()
                        featuredBooksAdapter.submitList(books)
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
