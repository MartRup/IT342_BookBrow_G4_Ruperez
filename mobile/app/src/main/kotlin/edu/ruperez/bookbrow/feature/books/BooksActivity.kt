package edu.ruperez.bookbrow.feature.books

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import edu.ruperez.bookbrow.R
import edu.ruperez.bookbrow.databinding.ActivityBooksBinding
import edu.ruperez.bookbrow.feature.admin.AdminDashboardActivity
import edu.ruperez.bookbrow.feature.admin.ProfileActivity
import edu.ruperez.bookbrow.shared.RetrofitClient
import edu.ruperez.bookbrow.shared.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * BooksActivity - Display and manage books
 */
class BooksActivity : AppCompatActivity() {

    private lateinit var binding: ActivityBooksBinding
    private lateinit var sessionManager: SessionManager
    private lateinit var booksAdapter: BooksAdapter
    private var searchJob: Job? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBooksBinding.inflate(layoutInflater)
        setContentView(binding.root as View)

        sessionManager = SessionManager(applicationContext)

        setupRecyclerView()
        setupBottomNavigation()
        setupClickListeners()
        setupSearch()
        
        loadBooks()
    }

    private fun setupRecyclerView() {
        booksAdapter = BooksAdapter(
            onEditClick = { book ->
                showAddEditDialog(book)
            },
            onDeleteClick = { book ->
                showDeleteConfirmation(book)
            }
        )
        
        binding.rvBooks.apply {
            layoutManager = LinearLayoutManager(this@BooksActivity)
            adapter = booksAdapter
        }
    }

    private fun setupBottomNavigation() {
        binding.bottomNavigation.selectedItemId = R.id.nav_books
        binding.bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_dashboard -> {
                    startActivity(Intent(this, AdminDashboardActivity::class.java))
                    finish()
                    true
                }
                R.id.nav_books -> true
                R.id.nav_records -> {
                    startActivity(Intent(this, edu.ruperez.bookbrow.feature.borrow.RecordsActivity::class.java))
                    finish()
                    true
                }
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

        binding.btnAddBook.setOnClickListener {
            showAddEditDialog(null)
        }
    }

    private fun showAddEditDialog(book: Book?) {
        val dialog = AddEditBookDialog(this, book) {
            loadBooks() // Reload books after add/edit
        }
        dialog.show()
    }

    private fun showDeleteConfirmation(book: Book) {
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Delete Book")
            .setMessage("Are you sure you want to delete \"${book.title}\"?")
            .setPositiveButton("Delete") { _, _ ->
                deleteBook(book)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun deleteBook(book: Book) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val token = sessionManager.getToken()
                if (token.isNullOrBlank()) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(
                            this@BooksActivity,
                            "Session expired. Please login again.",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                    return@launch
                }

                val response = RetrofitClient.booksApiService.deleteBook("Bearer $token", book.id)

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful && response.body()?.success == true) {
                        Toast.makeText(
                            this@BooksActivity,
                            "Book deleted successfully",
                            Toast.LENGTH_SHORT
                        ).show()
                        loadBooks() // Reload books after delete
                    } else {
                        Toast.makeText(
                            this@BooksActivity,
                            "Error: ${response.body()?.message ?: response.message()}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@BooksActivity,
                        "Error: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    private fun setupSearch() {
        binding.etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                searchJob?.cancel()
                searchJob = CoroutineScope(Dispatchers.Main).launch {
                    delay(500) // Debounce
                    loadBooks(s?.toString())
                }
            }
        })
    }

    private fun loadBooks(search: String? = null) {
        binding.progressBar.visibility = View.VISIBLE
        binding.rvBooks.visibility = View.GONE
        binding.tvEmptyState.visibility = View.GONE

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val token = sessionManager.getToken()
                if (token.isNullOrBlank()) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(
                            this@BooksActivity,
                            "Session expired. Please login again.",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                    return@launch
                }

                val response = RetrofitClient.booksApiService.getAllBooks(
                    token = "Bearer $token",
                    search = search
                )

                withContext(Dispatchers.Main) {
                    binding.progressBar.visibility = View.GONE
                    
                    if (response.isSuccessful && response.body()?.success == true) {
                        val books = response.body()?.data?.books ?: emptyList()
                        
                        if (books.isEmpty()) {
                            binding.tvEmptyState.visibility = View.VISIBLE
                            binding.tvEmptyState.text = if (search.isNullOrBlank()) {
                                "No books available"
                            } else {
                                "No books found for \"$search\""
                            }
                        } else {
                            binding.rvBooks.visibility = View.VISIBLE
                            booksAdapter.submitList(books)
                        }
                    } else {
                        binding.tvEmptyState.visibility = View.VISIBLE
                        binding.tvEmptyState.text = "Failed to load books"
                        Toast.makeText(
                            this@BooksActivity,
                            "Error: ${response.message()}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.progressBar.visibility = View.GONE
                    binding.tvEmptyState.visibility = View.VISIBLE
                    binding.tvEmptyState.text = "Error loading books"
                    Toast.makeText(
                        this@BooksActivity,
                        "Error: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }
}
