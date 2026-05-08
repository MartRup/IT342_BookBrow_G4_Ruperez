package edu.ruperez.bookbrow.feature.borrow

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import edu.ruperez.bookbrow.R
import edu.ruperez.bookbrow.databinding.ActivityRecordsBinding
import edu.ruperez.bookbrow.feature.admin.AdminDashboardActivity
import edu.ruperez.bookbrow.feature.admin.ProfileActivity
import edu.ruperez.bookbrow.feature.books.BooksActivity
import edu.ruperez.bookbrow.shared.RetrofitClient
import edu.ruperez.bookbrow.shared.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

/**
 * RecordsActivity - Display and manage borrow records
 */
class RecordsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRecordsBinding
    private lateinit var sessionManager: SessionManager
    private lateinit var recordsAdapter: RecordsAdapter
    private var currentFilter: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRecordsBinding.inflate(layoutInflater)
        setContentView(binding.root as View)

        sessionManager = SessionManager(applicationContext)

        setupRecyclerView()
        setupBottomNavigation()
        setupClickListeners()
        setupFilterChips()
        
        loadRecords()
    }

    private fun setupRecyclerView() {
        recordsAdapter = RecordsAdapter()
        
        binding.rvRecords.apply {
            layoutManager = LinearLayoutManager(this@RecordsActivity)
            adapter = recordsAdapter
        }
    }

    private fun setupBottomNavigation() {
        binding.bottomNavigation.selectedItemId = R.id.nav_records
        binding.bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_dashboard -> {
                    startActivity(Intent(this, AdminDashboardActivity::class.java))
                    finish()
                    true
                }
                R.id.nav_books -> {
                    startActivity(Intent(this, BooksActivity::class.java))
                    finish()
                    true
                }
                R.id.nav_records -> true
                R.id.nav_more -> {
                    startActivity(Intent(this, ProfileActivity::class.java))
                    finish()
                    true
                }
                else -> false
            }
        }
    }

    private fun setupClickListeners() {
        binding.btnProfile.setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
        }
    }

    private fun setupFilterChips() {
        binding.chipAll.setOnClickListener {
            selectChip(binding.chipAll)
            currentFilter = null
            loadRecords()
        }

        binding.chipActive.setOnClickListener {
            selectChip(binding.chipActive)
            currentFilter = "APPROVED"
            loadRecords()
        }

        binding.chipOverdue.setOnClickListener {
            selectChip(binding.chipOverdue)
            currentFilter = "OVERDUE"
            loadRecords()
        }

        binding.chipReturned.setOnClickListener {
            selectChip(binding.chipReturned)
            currentFilter = "RETURNED"
            loadRecords()
        }
    }

    private fun selectChip(selectedChip: TextView) {
        // Reset all chips
        listOf(binding.chipAll, binding.chipActive, binding.chipOverdue, binding.chipReturned).forEach { chip ->
            chip.setBackgroundResource(R.drawable.bg_menu_item)
            chip.setTextColor(ContextCompat.getColor(this, android.R.color.black))
        }

        // Highlight selected chip
        selectedChip.setBackgroundResource(R.drawable.bg_logout_button)
        selectedChip.setTextColor(ContextCompat.getColor(this, android.R.color.white))
    }

    private fun loadRecords() {
        binding.progressBar.visibility = View.VISIBLE
        binding.rvRecords.visibility = View.GONE
        binding.tvEmptyState.visibility = View.GONE

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val token = sessionManager.getToken()
                if (token.isNullOrBlank()) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(
                            this@RecordsActivity,
                            "Session expired. Please login again.",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                    return@launch
                }

                android.util.Log.d("RecordsActivity", "Fetching records with filter: $currentFilter")
                
                val response = RetrofitClient.borrowApiService.getAllBorrows(
                    token = "Bearer $token",
                    status = currentFilter
                )

                android.util.Log.d("RecordsActivity", "Response code: ${response.code()}")
                android.util.Log.d("RecordsActivity", "Response body: ${response.body()}")

                withContext(Dispatchers.Main) {
                    binding.progressBar.visibility = View.GONE
                    
                    if (response.isSuccessful && response.body()?.success == true) {
                        val records = response.body()?.data?.borrowRecords ?: emptyList()
                        
                        android.util.Log.d("RecordsActivity", "Records count: ${records.size}")
                        
                        // Filter records based on the status computed by backend
                        val filteredRecords = when (currentFilter) {
                            "APPROVED" -> records.filter { it.status == "ACTIVE" }
                            "OVERDUE" -> records.filter { it.status == "OVERDUE" }
                            "RETURNED" -> records.filter { it.status == "RETURNED" }
                            else -> records
                        }
                        
                        android.util.Log.d("RecordsActivity", "Filtered records count: ${filteredRecords.size}")
                        
                        if (filteredRecords.isEmpty()) {
                            binding.tvEmptyState.visibility = View.VISIBLE
                            binding.tvEmptyState.text = when (currentFilter) {
                                "APPROVED" -> "No active records"
                                "OVERDUE" -> "No overdue records"
                                "RETURNED" -> "No returned records"
                                else -> "No records found"
                            }
                        } else {
                            binding.rvRecords.visibility = View.VISIBLE
                            recordsAdapter.submitList(filteredRecords)
                        }
                    } else {
                        binding.tvEmptyState.visibility = View.VISIBLE
                        binding.tvEmptyState.text = "Failed to load records"
                        val errorMsg = response.body()?.message ?: response.message()
                        android.util.Log.e("RecordsActivity", "Error: $errorMsg")
                        Toast.makeText(
                            this@RecordsActivity,
                            "Error: $errorMsg",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                android.util.Log.e("RecordsActivity", "Exception: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    binding.progressBar.visibility = View.GONE
                    binding.tvEmptyState.visibility = View.VISIBLE
                    binding.tvEmptyState.text = "Error loading records"
                    Toast.makeText(
                        this@RecordsActivity,
                        "Error: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }
}
