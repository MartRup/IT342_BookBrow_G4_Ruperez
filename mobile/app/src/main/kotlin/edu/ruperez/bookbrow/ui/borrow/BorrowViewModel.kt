package edu.ruperez.bookbrow.ui.borrow

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.ruperez.bookbrow.data.remote.model.BorrowRecord
import edu.ruperez.bookbrow.data.repository.BorrowRepository
import edu.ruperez.bookbrow.util.Resource
import kotlinx.coroutines.launch

/**
 * ViewModel for borrow-related operations
 */
class BorrowViewModel : ViewModel() {

    private val repository = BorrowRepository()

    private val _borrows = MutableLiveData<Resource<List<BorrowRecord>>>()
    val borrows: LiveData<Resource<List<BorrowRecord>>> = _borrows

    private val _borrowOperation = MutableLiveData<Resource<String>>()
    val borrowOperation: LiveData<Resource<String>> = _borrowOperation

    fun loadUserBorrows(token: String, status: String? = null) {
        viewModelScope.launch {
            _borrows.value = Resource.Loading()
            try {
                val response = repository.getUserBorrows(token, status)
                if (response.isSuccessful && response.body()?.success == true) {
                    val records = response.body()?.data?.records ?: emptyList()
                    _borrows.value = Resource.Success(records)
                } else {
                    val errorMsg = response.body()?.error?.message
                        ?: response.message()
                        ?: "Failed to load borrow records"
                    _borrows.value = Resource.Error(errorMsg)
                }
            } catch (e: Exception) {
                _borrows.value = Resource.Error(e.message ?: "Network error occurred")
            }
        }
    }

    fun loadAllBorrows(token: String, page: Int = 1, limit: Int = 100, status: String? = null) {
        viewModelScope.launch {
            _borrows.value = Resource.Loading()
            try {
                val response = repository.getAllBorrows(token, page, limit, status)
                if (response.isSuccessful && response.body()?.success == true) {
                    val records = response.body()?.data?.records ?: emptyList()
                    _borrows.value = Resource.Success(records)
                } else {
                    val errorMsg = response.body()?.error?.message
                        ?: response.message()
                        ?: "Failed to load borrow records"
                    _borrows.value = Resource.Error(errorMsg)
                }
            } catch (e: Exception) {
                _borrows.value = Resource.Error(e.message ?: "Network error occurred")
            }
        }
    }

    fun borrowBook(token: String, bookId: Long) {
        viewModelScope.launch {
            _borrowOperation.value = Resource.Loading()
            try {
                val response = repository.borrowBook(token, bookId)
                if (response.isSuccessful && response.body()?.success == true) {
                    _borrowOperation.value = Resource.Success("Borrow request submitted successfully")
                } else {
                    val errorMsg = response.body()?.error?.message
                        ?: response.message()
                        ?: "Failed to borrow book"
                    _borrowOperation.value = Resource.Error(errorMsg)
                }
            } catch (e: Exception) {
                _borrowOperation.value = Resource.Error(e.message ?: "Network error occurred")
            }
        }
    }

    fun returnBook(token: String, borrowId: Long) {
        viewModelScope.launch {
            _borrowOperation.value = Resource.Loading()
            try {
                val response = repository.returnBook(token, borrowId)
                if (response.isSuccessful && response.body()?.success == true) {
                    _borrowOperation.value = Resource.Success("Book returned successfully")
                } else {
                    val errorMsg = response.body()?.error?.message
                        ?: response.message()
                        ?: "Failed to return book"
                    _borrowOperation.value = Resource.Error(errorMsg)
                }
            } catch (e: Exception) {
                _borrowOperation.value = Resource.Error(e.message ?: "Network error occurred")
            }
        }
    }

    fun approveBorrow(token: String, borrowId: Long) {
        viewModelScope.launch {
            _borrowOperation.value = Resource.Loading()
            try {
                val response = repository.approveBorrow(token, borrowId)
                if (response.isSuccessful && response.body()?.success == true) {
                    _borrowOperation.value = Resource.Success("Borrow request approved")
                } else {
                    val errorMsg = response.body()?.error?.message
                        ?: response.message()
                        ?: "Failed to approve request"
                    _borrowOperation.value = Resource.Error(errorMsg)
                }
            } catch (e: Exception) {
                _borrowOperation.value = Resource.Error(e.message ?: "Network error occurred")
            }
        }
    }

    fun rejectBorrow(token: String, borrowId: Long) {
        viewModelScope.launch {
            _borrowOperation.value = Resource.Loading()
            try {
                val response = repository.rejectBorrow(token, borrowId)
                if (response.isSuccessful && response.body()?.success == true) {
                    _borrowOperation.value = Resource.Success("Borrow request rejected")
                } else {
                    val errorMsg = response.body()?.error?.message
                        ?: response.message()
                        ?: "Failed to reject request"
                    _borrowOperation.value = Resource.Error(errorMsg)
                }
            } catch (e: Exception) {
                _borrowOperation.value = Resource.Error(e.message ?: "Network error occurred")
            }
        }
    }
}
