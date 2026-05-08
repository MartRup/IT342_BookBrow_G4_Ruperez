package edu.ruperez.bookbrow.feature.librarian

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.lifecycle.lifecycleScope
import edu.ruperez.bookbrow.R
import edu.ruperez.bookbrow.databinding.ActivityLibrarianDashboardBinding
import edu.ruperez.bookbrow.feature.auth.LoginActivity
import edu.ruperez.bookbrow.feature.books.BooksActivity
import edu.ruperez.bookbrow.feature.borrow.RecordsActivity
import edu.ruperez.bookbrow.shared.BaseActivity
import edu.ruperez.bookbrow.shared.RetrofitClient
import edu.ruperez.bookbrow.shared.SessionManager
import kotlinx.coroutines.launch

class LibrarianDashboardActivity : BaseActivity() {

    private lateinit var binding: ActivityLibrarianDashboardBinding
    private lateinit var sessionManager: SessionManager
    private lateinit var apiService: LibrarianApiService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLibrarianDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root as View)

        sessionManager = SessionManager(this)
        apiService = RetrofitClient.librarianApiService

        setupUI()
        loadStats()
    }

    private fun setupUI() {
        // Profile icon click
        binding.profileIcon.setOnClickListener {
            // Navigate to profile/menu
            Toast.makeText(this, "Profile menu", Toast.LENGTH_SHORT).show()
        }

        // Stats cards click listeners
        binding.cardBorrowed.setOnClickListener {
            navigateToRecords("active")
        }

        binding.cardDueSoon.setOnClickListener {
            navigateToRecords("overdue")
        }

        binding.cardReturned.setOnClickListener {
            navigateToRecords("returned")
        }

        // Bottom navigation
        binding.bottomNav.navDashboard.setOnClickListener {
            // Already on dashboard
        }

        binding.bottomNav.navBooks.setOnClickListener {
            startActivity(Intent(this, BooksActivity::class.java))
        }

        binding.bottomNav.navUsers.setOnClickListener {
            startActivity(Intent(this, LibrarianUsersActivity::class.java))
        }

        binding.bottomNav.navRecords.setOnClickListener {
            startActivity(Intent(this, RecordsActivity::class.java))
        }

        binding.bottomNav.navMore.setOnClickListener {
            showMoreMenu()
        }

        // Swipe refresh
        binding.swipeRefresh.setOnRefreshListener {
            loadStats()
        }
    }

    private fun loadStats() {
        binding.progressBar.visibility = View.VISIBLE
        
        lifecycleScope.launch {
            try {
                val token = sessionManager.getToken()
                if (token.isNullOrEmpty()) {
                    showError("Authentication required")
                    logout()
                    return@launch
                }
                
                val response = apiService.getStats("Bearer $token")
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val stats = response.body()!!.data
                    updateStatsUI(stats)
                } else {
                    showError("Failed to load statistics")
                }
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            } finally {
                binding.progressBar.visibility = View.GONE
                binding.swipeRefresh.isRefreshing = false
            }
        }
    }

    private fun updateStatsUI(stats: StatsData) {
        binding.tvBorrowedCount.text = stats.borrowed.toString()
        binding.tvDueSoonCount.text = stats.dueSoon.toString()
        binding.tvReturnedCount.text = stats.returned.toString()
        
        // Update timestamp
        binding.tvLastUpdated.text = "Last updated: ${formatTimestamp(stats.timestamp)}"
    }

    private fun formatTimestamp(timestamp: String): String {
        // Simple formatting - you can enhance this
        return try {
            timestamp.substring(11, 16) // Extract HH:mm
        } catch (e: Exception) {
            "Now"
        }
    }

    private fun navigateToRecords(status: String) {
        val intent = Intent(this, RecordsActivity::class.java)
        intent.putExtra("filter_status", status)
        startActivity(intent)
    }

    private fun showMoreMenu() {
        val items = arrayOf("Profile", "Settings", "Help & Support", "About", "Logout")
        
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Menu")
            .setItems(items) { _, which ->
                when (which) {
                    0 -> Toast.makeText(this, "Profile", Toast.LENGTH_SHORT).show()
                    1 -> Toast.makeText(this, "Settings", Toast.LENGTH_SHORT).show()
                    2 -> Toast.makeText(this, "Help & Support", Toast.LENGTH_SHORT).show()
                    3 -> Toast.makeText(this, "About", Toast.LENGTH_SHORT).show()
                    4 -> showLogoutConfirmation()
                }
            }
            .show()
    }

    private fun showLogoutConfirmation() {
        AlertDialog.Builder(this)
            .setTitle("Logout")
            .setMessage("Are you sure you want to logout?")
            .setPositiveButton("Yes") { _, _ ->
                logout()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun logout() {
        lifecycleScope.launch {
            sessionManager.clearSession()
            val intent = Intent(this@LibrarianDashboardActivity, LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }
    }

    override fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }
}
