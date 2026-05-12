package edu.ruperez.bookbrow.data.repository

import edu.ruperez.bookbrow.shared.RetrofitClient
import edu.ruperez.bookbrow.data.remote.model.BorrowRequest
import edu.ruperez.bookbrow.data.remote.model.BorrowResponse
import retrofit2.Response

/**
 * Repository for borrow-related operations
 */
class BorrowRepository {

    private val api = RetrofitClient.dataBorrowApiService

    suspend fun getUserBorrows(token: String, status: String? = null): Response<BorrowResponse> {
        return api.getUserBorrows("Bearer $token", status)
    }

    suspend fun getAllBorrows(
        token: String,
        page: Int = 1,
        limit: Int = 20,
        status: String? = null
    ): Response<BorrowResponse> {
        return api.getAllBorrows("Bearer $token", page, limit, status)
    }

    suspend fun borrowBook(token: String, bookId: Long): Response<BorrowResponse> {
        return api.borrowBook("Bearer $token", BorrowRequest(bookId))
    }

    suspend fun returnBook(token: String, borrowId: Long): Response<BorrowResponse> {
        return api.returnBook("Bearer $token", borrowId)
    }

    suspend fun approveBorrow(token: String, borrowId: Long): Response<BorrowResponse> {
        return api.approveBorrow("Bearer $token", borrowId)
    }

    suspend fun rejectBorrow(token: String, borrowId: Long): Response<BorrowResponse> {
        return api.rejectBorrow("Bearer $token", borrowId)
    }
}
