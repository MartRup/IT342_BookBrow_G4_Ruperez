package edu.ruperez.bookbrow.feature.admin

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import edu.ruperez.bookbrow.R
import edu.ruperez.bookbrow.databinding.ActivityAdminDashboardBinding
import edu.ruperez.bookbrow.feature.books.Book
import edu.ruperez.bookbrow.feature.librarian.StatsData
import edu.ruperez.bookbrow.feature.user.BookDetailsDialog
import edu.ruperez.bookbrow.feature.user.UserBooksAdapter
import edu.ruperez.bookbrow.shared.RetrofitClient
import edu.ruperez.bookbrow.shared.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.*

/**
 * AdminDashboardActivity - Main dashboard for admin users
 * Features real-time status updates every 30 seconds
 */
class AdminDashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAdminDashboardBinding
    private lateinit var sessionManager: SessionManager
    private lateinit var featuredBooksAdapter: UserBooksAdapter
    private val handler = Handler(Looper.getMainLooper())
    private var updateRunnable: Runnable? = null
    private val UPDATE_INTERVAL = 30000L // 30 seconds

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAdminDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root as View)

        sessionManager = SessionManager(applicationContext)

        setupFeaturedBooks()
        setupBottomNavigation()
        setupClickListeners()
        
        // Initial load
        loadDashboardStats()
        loadFeaturedBooks()
        
        // Start real-time updates
        startRealTimeUpdates()
    }

    private fun setupBottomNavigation() {
        binding.bottomNavigation.selectedItemId = R.id.nav_dashboard
        binding.bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_dashboard -> true
                R.id.nav_books -> {
                    startActivity(Intent(this, edu.ruperez.bookbrow.feature.books.BooksActivity::class.java))
                    overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
                    finish()
                    true
                }
                R.id.nav_records -> {
                    startActivity(Intent(this, edu.ruperez.bookbrow.feature.borrow.RecordsActivity::class.java))
                    overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
                    finish()
                    true
                }
                R.id.nav_more -> {
                    startActivity(Intent(this, ProfileActivity::class.java))
                    overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
                    true
                }
                else -> false
            }
        }
    }

    private fun setupClickListeners() {
        binding.btnProfile.setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        }

        binding.etSearch.setOnClickListener {
            startActivity(Intent(this, edu.ruperez.bookbrow.feature.books.BooksActivity::class.java))
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        }
    }

    private fun setupFeaturedBooks() {
        featuredBooksAdapter = UserBooksAdapter(
            onBookClick = { book -> showBookDetails(book) },
            onBorrowClick = {},
            showBorrowButton = false
        )
        binding.rvFeaturedBooks.apply {
            layoutManager = LinearLayoutManager(this@AdminDashboardActivity)
            adapter = featuredBooksAdapter
        }
    }

    private fun startRealTimeUpdates() {
        updateRunnable = object : Runnable {
            override fun run() {
                loadDashboardStats()
                handler.postDelayed(this, UPDATE_INTERVAL)
            }
        }
        handler.postDelayed(updateRunnable!!, UPDATE_INTERVAL)
    }

    private fun loadDashboardStats() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val token = sessionManager.getToken()
                if (token.isNullOrBlank()) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(
                            this@AdminDashboardActivity,
                            "Session expired. Please login again.",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                    return@launch
                }

                val role = sessionManager.getRole()?.removePrefix("ROLE_") ?: "USER"
                if (role.equals("LIBRARIAN", ignoreCase = true)) {
                    loadLibrarianStats(token)
                    return@launch
                }

                val response = RetrofitClient.adminApiService.getDashboardStats("Bearer $token")

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful && response.body()?.success == true) {
                        val stats = response.body()?.data
                        stats?.let {
                            updateUI(it)
                        }
                    } else {
                        Toast.makeText(
                            this@AdminDashboardActivity,
                            "Failed to load stats: ${response.message()}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@AdminDashboardActivity,
                        "Error: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    private suspend fun loadLibrarianStats(token: String) {
        try {
            val response = RetrofitClient.librarianApiService.getStats("Bearer $token")

            withContext(Dispatchers.Main) {
                if (response.isSuccessful && response.body()?.success == true) {
                    updateUI(response.body()!!.data)
                } else {
                    Toast.makeText(
                        this@AdminDashboardActivity,
                        "Failed to load librarian stats: ${response.message()}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        } catch (e: Exception) {
            withContext(Dispatchers.Main) {
                Toast.makeText(
                    this@AdminDashboardActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    private fun loadFeaturedBooks() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val token = sessionManager.getToken().orEmpty()
                val response = RetrofitClient.booksApiService.getFeaturedBooks(
                    token.takeIf { it.isNotBlank() }?.let { "Bearer $it" }
                )

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful && response.body()?.success == true) {
                        featuredBooksAdapter.submitList(response.body()?.data ?: emptyList())
                    }
                }
            } catch (_: Exception) {
                withContext(Dispatchers.Main) {
                    featuredBooksAdapter.submitList(emptyList())
                }
            }
        }
    }

    private fun updateUI(stats: DashboardStats) {
        updateStats(
            totalUsers = stats.totalUsers,
            totalBooks = stats.totalBooks,
            activeLoans = stats.activeLoans,
            overdue = stats.overDue,
            timestamp = stats.timestamp
        )
    }

    private fun updateUI(stats: StatsData) {
        updateStats(
            totalUsers = stats.totalUsers.toLong(),
            totalBooks = stats.totalBooks.toLong(),
            activeLoans = stats.activeLoans.toLong(),
            overdue = stats.overdue.toLong(),
            timestamp = stats.timestamp
        )
    }

    private fun updateStats(
        totalUsers: Long,
        totalBooks: Long,
        activeLoans: Long,
        overdue: Long,
        timestamp: String?
    ) {
        binding.tvTotalUsers.text = totalUsers.toString()
        binding.tvTotalBooks.text = totalBooks.toString()
        binding.tvActiveLoans.text = activeLoans.toString()
        binding.tvOverdue.text = overdue.toString()

        binding.tvLastUpdated.text = "Last updated: ${formatTimestamp(timestamp)}"
    }

    private fun formatTimestamp(timestamp: String?): String {
        if (timestamp.isNullOrBlank()) {
            val dateFormat = SimpleDateFormat("MMM dd, yyyy HH:mm:ss", Locale.getDefault())
            return dateFormat.format(Date())
        }

        return try {
            timestamp.replace('T', ' ').take(19)
        } catch (_: Exception) {
            val dateFormat = SimpleDateFormat("MMM dd, yyyy HH:mm:ss", Locale.getDefault())
            dateFormat.format(Date())
        }
    }

    private fun showBookDetails(book: Book) {
        BookDetailsDialog.show(this, book, showBorrowButton = false) {
            startActivity(Intent(this, edu.ruperez.bookbrow.feature.books.BooksActivity::class.java))
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        // Stop real-time updates when activity is destroyed
        updateRunnable?.let { handler.removeCallbacks(it) }
    }

    override fun onPause() {
        super.onPause()
        // Pause updates when activity is not visible
        updateRunnable?.let { handler.removeCallbacks(it) }
    }

    override fun onResume() {
        super.onResume()
        // Resume updates when activity becomes visible
        loadDashboardStats()
        loadFeaturedBooks()
        startRealTimeUpdates()
    }
}
