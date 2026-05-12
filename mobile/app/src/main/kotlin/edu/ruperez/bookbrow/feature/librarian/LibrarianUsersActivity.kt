package edu.ruperez.bookbrow.feature.librarian

import android.os.Bundle
import android.view.View
import android.widget.SearchView
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import edu.ruperez.bookbrow.databinding.ActivityLibrarianUsersBinding
import edu.ruperez.bookbrow.shared.BaseActivity
import edu.ruperez.bookbrow.shared.RetrofitClient
import edu.ruperez.bookbrow.shared.SessionManager
import kotlinx.coroutines.launch

class LibrarianUsersActivity : BaseActivity() {

    private lateinit var binding: ActivityLibrarianUsersBinding
    private lateinit var apiService: LibrarianApiService
    private lateinit var sessionManager: SessionManager
    private lateinit var usersAdapter: UsersAdapter
    
    private var currentPage = 1
    private var currentSearch: String? = null
    private var currentRole: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLibrarianUsersBinding.inflate(layoutInflater)
        setContentView(binding.root as View)

        sessionManager = SessionManager(this)
        apiService = RetrofitClient.librarianApiService

        setupUI()
        loadUsers()
    }

    private fun setupUI() {
        // Back button
        binding.btnBack.setOnClickListener {
            finish()
        }

        // Search
        binding.searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                currentSearch = query
                currentPage = 1
                loadUsers()
                return true
            }

            override fun onQueryTextChange(newText: String?): Boolean {
                if (newText.isNullOrEmpty()) {
                    currentSearch = null
                    currentPage = 1
                    loadUsers()
                }
                return true
            }
        })

        // Role filter chips
        binding.chipAll.setOnClickListener {
            currentRole = null
            currentPage = 1
            loadUsers()
        }

        binding.chipUser.setOnClickListener {
            currentRole = "USER"
            currentPage = 1
            loadUsers()
        }

        binding.chipLibrarian.setOnClickListener {
            currentRole = "LIBRARIAN"
            currentPage = 1
            loadUsers()
        }

        binding.chipAdmin.setOnClickListener {
            currentRole = "ADMIN"
            currentPage = 1
            loadUsers()
        }

        // RecyclerView
        usersAdapter = UsersAdapter { user ->
            showUserDetails(user)
        }
        
        binding.recyclerUsers.apply {
            layoutManager = LinearLayoutManager(this@LibrarianUsersActivity)
            adapter = usersAdapter
        }

        // Swipe refresh
        binding.swipeRefresh.setOnRefreshListener {
            loadUsers()
        }
    }

    private fun loadUsers() {
        binding.progressBar.visibility = View.VISIBLE
        
        lifecycleScope.launch {
            try {
                val token = sessionManager.getToken()
                if (token.isNullOrEmpty()) {
                    showError("Authentication required")
                    finish()
                    return@launch
                }
                
                val response = apiService.getUsers(
                    token = "Bearer $token",
                    page = currentPage,
                    limit = 20,
                    search = currentSearch,
                    role = currentRole
                )
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()!!.data
                    usersAdapter.submitList(data.users)
                    updatePaginationInfo(data.pagination)
                } else {
                    showError("Failed to load users")
                }
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            } finally {
                binding.progressBar.visibility = View.GONE
                binding.swipeRefresh.isRefreshing = false
            }
        }
    }

    private fun updatePaginationInfo(pagination: Pagination) {
        binding.tvPagination.text = "Page ${pagination.page} of ${pagination.pages} (${pagination.total} users)"
    }

    private fun showUserDetails(user: UserItem) {
        val dialog = UserDetailsDialog(this, user.id, apiService) { updated ->
            if (updated) {
                loadUsers() // Refresh list
            }
        }
        dialog.show()
    }

    override fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }
}
