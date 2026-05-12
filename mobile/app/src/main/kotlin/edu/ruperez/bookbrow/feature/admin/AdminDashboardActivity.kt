package edu.ruperez.bookbrow.feature.admin

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import edu.ruperez.bookbrow.R
import edu.ruperez.bookbrow.databinding.ActivityAdminDashboardBinding
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
    private val handler = Handler(Looper.getMainLooper())
    private var updateRunnable: Runnable? = null
    private val UPDATE_INTERVAL = 30000L // 30 seconds

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAdminDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root as View)

        sessionManager = SessionManager(applicationContext)

        setupBottomNavigation()
        setupClickListeners()
        
        // Initial load
        loadDashboardStats()
        
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

    private fun updateUI(stats: DashboardStats) {
        binding.tvTotalUsers.text = stats.totalUsers.toString()
        binding.tvTotalBooks.text = stats.totalBooks.toString()
        binding.tvActiveLoans.text = stats.activeLoans.toString()
        binding.tvOverdue.text = stats.overDue.toString()
        
        // Update timestamp
        val dateFormat = SimpleDateFormat("MMM dd, yyyy HH:mm:ss", Locale.getDefault())
        val currentTime = dateFormat.format(Date())
        binding.tvLastUpdated.text = "Last updated: $currentTime"
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
        startRealTimeUpdates()
    }
}
