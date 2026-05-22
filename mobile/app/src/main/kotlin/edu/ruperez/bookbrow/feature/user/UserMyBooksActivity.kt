package edu.ruperez.bookbrow.feature.user

import android.content.Intent
import android.os.Bundle
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.tabs.TabLayout
import edu.ruperez.bookbrow.R
import edu.ruperez.bookbrow.databinding.ActivityUserMyBooksBinding
import edu.ruperez.bookbrow.feature.borrow.BorrowApiService
import edu.ruperez.bookbrow.feature.borrow.RecordsAdapter
import edu.ruperez.bookbrow.shared.RetrofitClient
import edu.ruperez.bookbrow.shared.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * UserMyBooksActivity - View borrowed books
 * 
 * Features:
 * - View currently borrowed books
 * - View borrowing history
 * - See due dates and status
 * - Return books
 */
class UserMyBooksActivity : AppCompatActivity(), BottomNavigationView.OnNavigationItemSelectedListener {

    private lateinit var binding: ActivityUserMyBooksBinding
    private lateinit var sessionManager: SessionManager
    private lateinit var borrowApiService: BorrowApiService
    private lateinit var borrowedBooksAdapter: RecordsAdapter
    private var currentTab = 0 // 0 = Currently, 1 = History

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityUserMyBooksBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)
        borrowApiService = RetrofitClient.borrowApiService

        setupUI()
        setupBottomNavigation()
        loadBorrowedBooks()
    }

    private fun setupUI() {
        // Setup tabs
        binding.tabLayout.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab?) {
                currentTab = tab?.position ?: 0
                loadBorrowedBooks()
            }

            override fun onTabUnselected(tab: TabLayout.Tab?) {}
            override fun onTabReselected(tab: TabLayout.Tab?) {}
        })

        // Setup RecyclerView
        borrowedBooksAdapter = RecordsAdapter()
        binding.rvBorrowedBooks.apply {
            layoutManager = LinearLayoutManager(this@UserMyBooksActivity)
            adapter = borrowedBooksAdapter
        }

        // Setup swipe refresh
        binding.swipeRefresh.setOnRefreshListener {
            loadBorrowedBooks()
        }

        binding.profileButton.setOnClickListener {
            binding.bottomNavigation.selectedItemId = R.id.nav_menu
        }

        // Setup browse button (shown when empty)
        binding.btnBrowseBooks.setOnClickListener {
            binding.bottomNavigation.selectedItemId = R.id.nav_browse
        }
    }

    private fun setupBottomNavigation() {
        binding.bottomNavigation.setOnNavigationItemSelectedListener(this)
        binding.bottomNavigation.selectedItemId = R.id.nav_my_books
    }

    private fun loadBorrowedBooks() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val token = sessionManager.getToken() ?: ""
                
                val response = borrowApiService.getUserBorrows(
                    token = "Bearer $token",
                    status = if (currentTab == 0) "active" else null
                )
                
                withContext(Dispatchers.Main) {
                    binding.swipeRefresh.isRefreshing = false
                    
                    if (response.isSuccessful) {
                        val records = response.body()?.data?.borrowRecords ?: emptyList()
                        val activeRecords = records.filter { it.status == "ACTIVE" || it.borrowStatus == "APPROVED" }
                        val historyRecords = records.filter { it.status != "ACTIVE" && it.borrowStatus != "APPROVED" }
                        val visibleRecords = if (currentTab == 0) activeRecords else historyRecords

                        binding.tabLayout.getTabAt(0)?.text = "Current (${activeRecords.size})"
                        binding.tabLayout.getTabAt(1)?.text = "History (${historyRecords.size})"
                        
                        if (visibleRecords.isEmpty()) {
                            showEmptyState()
                        } else {
                            hideEmptyState()
                            borrowedBooksAdapter.submitList(visibleRecords)
                        }
                    } else {
                        Toast.makeText(
                            this@UserMyBooksActivity,
                            "Failed to load books",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.swipeRefresh.isRefreshing = false
                    Toast.makeText(
                        this@UserMyBooksActivity,
                        "Error: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    private fun showEmptyState() {
        binding.emptyState.visibility = android.view.View.VISIBLE
        binding.rvBorrowedBooks.visibility = android.view.View.GONE
        
        val message = if (currentTab == 0) {
            "No books borrowed\nStart exploring the library"
        } else {
            "No books in history\nStart exploring the library"
        }
        binding.tvEmptyMessage.text = message
    }

    private fun hideEmptyState() {
        binding.emptyState.visibility = android.view.View.GONE
        binding.rvBorrowedBooks.visibility = android.view.View.VISIBLE
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
                startActivity(Intent(this, UserBrowseActivity::class.java))
                overridePendingTransition(0, 0)
                finish()
                return true
            }
            R.id.nav_my_books -> {
                // Already on my books
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
