package edu.ruperez.bookbrow.ui.books

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.ruperez.bookbrow.data.remote.model.Book
import edu.ruperez.bookbrow.data.remote.model.BookRequest
import edu.ruperez.bookbrow.data.repository.BookRepository
import edu.ruperez.bookbrow.util.Resource
import kotlinx.coroutines.launch

/**
 * ViewModel for book-related operations
 */
class BookViewModel : ViewModel() {

    private val repository = BookRepository()

    private val _books = MutableLiveData<Resource<List<Book>>>()
    val books: LiveData<Resource<List<Book>>> = _books

    private val _bookDetail = MutableLiveData<Resource<Book>>()
    val bookDetail: LiveData<Resource<Book>> = _bookDetail

    private val _bookOperation = MutableLiveData<Resource<String>>()
    val bookOperation: LiveData<Resource<String>> = _bookOperation

    fun loadBooks(
        token: String,
        page: Int = 1,
        limit: Int = 100,
        search: String? = null,
        available: Boolean? = null
    ) {
        viewModelScope.launch {
            _books.value = Resource.Loading()
            try {
                val response = repository.getAllBooks(token, page, limit, search, available)
                if (response.isSuccessful && response.body()?.success == true) {
                    val booksList = response.body()?.data?.books ?: emptyList()
                    _books.value = Resource.Success(booksList)
                } else {
                    val errorMsg = response.body()?.error?.message
                        ?: response.message()
                        ?: "Failed to load books"
                    _books.value = Resource.Error(errorMsg)
                }
            } catch (e: Exception) {
                _books.value = Resource.Error(e.message ?: "Network error occurred")
            }
        }
    }

    fun loadBookDetail(token: String, bookId: Long) {
        viewModelScope.launch {
            _bookDetail.value = Resource.Loading()
            try {
                val response = repository.getBookById(token, bookId)
                if (response.isSuccessful && response.body()?.success == true) {
                    val book = response.body()?.data?.book
                    if (book != null) {
                        _bookDetail.value = Resource.Success(book)
                    } else {
                        _bookDetail.value = Resource.Error("Book not found")
                    }
                } else {
                    val errorMsg = response.body()?.error?.message
                        ?: response.message()
                        ?: "Failed to load book details"
                    _bookDetail.value = Resource.Error(errorMsg)
                }
            } catch (e: Exception) {
                _bookDetail.value = Resource.Error(e.message ?: "Network error occurred")
            }
        }
    }

    fun createBook(token: String, request: BookRequest) {
        viewModelScope.launch {
            _bookOperation.value = Resource.Loading()
            try {
                val response = repository.createBook(token, request)
                if (response.isSuccessful && response.body()?.success == true) {
                    _bookOperation.value = Resource.Success("Book created successfully")
                } else {
                    val errorMsg = response.body()?.error?.message
                        ?: response.message()
                        ?: "Failed to create book"
                    _bookOperation.value = Resource.Error(errorMsg)
                }
            } catch (e: Exception) {
                _bookOperation.value = Resource.Error(e.message ?: "Network error occurred")
            }
        }
    }

    fun updateBook(token: String, bookId: Long, request: BookRequest) {
        viewModelScope.launch {
            _bookOperation.value = Resource.Loading()
            try {
                val response = repository.updateBook(token, bookId, request)
                if (response.isSuccessful && response.body()?.success == true) {
                    _bookOperation.value = Resource.Success("Book updated successfully")
                } else {
                    val errorMsg = response.body()?.error?.message
                        ?: response.message()
                        ?: "Failed to update book"
                    _bookOperation.value = Resource.Error(errorMsg)
                }
            } catch (e: Exception) {
                _bookOperation.value = Resource.Error(e.message ?: "Network error occurred")
            }
        }
    }

    fun deleteBook(token: String, bookId: Long) {
        viewModelScope.launch {
            _bookOperation.value = Resource.Loading()
            try {
                val response = repository.deleteBook(token, bookId)
                if (response.isSuccessful && response.body()?.success == true) {
                    _bookOperation.value = Resource.Success("Book deleted successfully")
                } else {
                    val errorMsg = response.body()?.error?.message
                        ?: response.message()
                        ?: "Failed to delete book"
                    _bookOperation.value = Resource.Error(errorMsg)
                }
            } catch (e: Exception) {
                _bookOperation.value = Resource.Error(e.message ?: "Network error occurred")
            }
        }
    }
}
