package edu.ruperez.bookbrow.feature.books

import android.app.Dialog
import android.content.Context
import android.os.Bundle
import android.view.View
import android.view.Window
import android.widget.Toast
import edu.ruperez.bookbrow.databinding.DialogAddEditBookBinding
import edu.ruperez.bookbrow.shared.RetrofitClient
import edu.ruperez.bookbrow.shared.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Dialog for adding or editing a book
 */
class AddEditBookDialog(
    context: Context,
    private val book: Book? = null,
    private val onSuccess: () -> Unit
) : Dialog(context) {

    private lateinit var binding: DialogAddEditBookBinding
    private val sessionManager = SessionManager(context)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        binding = DialogAddEditBookBinding.inflate(layoutInflater)
        setContentView(binding.root as View)

        setupUI()
        setupClickListeners()
    }

    private fun setupUI() {
        // Set title
        binding.tvDialogTitle.text = if (book == null) "Add Book" else "Edit Book"

        // Populate fields if editing
        book?.let {
            binding.etTitle.setText(it.title)
            binding.etAuthor.setText(it.author)
            binding.etIsbn.setText(it.isbn ?: "")
            binding.etGenre.setText(it.genre ?: "")
            binding.etDescription.setText(it.description ?: "")
            binding.etCoverUrl.setText(it.coverUrl ?: "")
            binding.switchAvailable.isChecked = it.available
        }
    }

    private fun setupClickListeners() {
        binding.btnCancel.setOnClickListener {
            dismiss()
        }

        binding.btnSave.setOnClickListener {
            saveBook()
        }
    }

    private fun saveBook() {
        val title = binding.etTitle.text.toString().trim()
        val author = binding.etAuthor.text.toString().trim()
        val isbn = binding.etIsbn.text.toString().trim()
        val genre = binding.etGenre.text.toString().trim()
        val description = binding.etDescription.text.toString().trim()
        val coverUrl = binding.etCoverUrl.text.toString().trim()
        val available = binding.switchAvailable.isChecked

        // Validation
        if (title.isEmpty()) {
            Toast.makeText(context, "Title is required", Toast.LENGTH_SHORT).show()
            return
        }

        if (author.isEmpty()) {
            Toast.makeText(context, "Author is required", Toast.LENGTH_SHORT).show()
            return
        }

        // Disable button to prevent double submission
        binding.btnSave.isEnabled = false

        val bookRequest = BookRequest(
            title = title,
            author = author,
            description = description.ifEmpty { null },
            available = available,
            isbn = isbn.ifEmpty { null },
            genre = genre.ifEmpty { null },
            coverUrl = coverUrl.ifEmpty { null }
        )

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val token = sessionManager.getToken()
                if (token.isNullOrBlank()) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(
                            context,
                            "Session expired. Please login again.",
                            Toast.LENGTH_SHORT
                        ).show()
                        dismiss()
                    }
                    return@launch
                }

                val response = if (book == null) {
                    // Create new book
                    RetrofitClient.booksApiService.createBook("Bearer $token", bookRequest)
                } else {
                    // Update existing book
                    RetrofitClient.booksApiService.updateBook("Bearer $token", book.id, bookRequest)
                }

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful && response.body()?.success == true) {
                        Toast.makeText(
                            context,
                            if (book == null) "Book added successfully" else "Book updated successfully",
                            Toast.LENGTH_SHORT
                        ).show()
                        onSuccess()
                        dismiss()
                    } else {
                        binding.btnSave.isEnabled = true
                        Toast.makeText(
                            context,
                            "Error: ${response.body()?.message ?: response.message()}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.btnSave.isEnabled = true
                    Toast.makeText(
                        context,
                        "Error: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }
}
