package edu.ruperez.bookbrow.feature.borrow

import retrofit2.Response
import retrofit2.http.*

/**
 * API service for borrow records endpoints
 */
interface BorrowApiService {
    
    @GET("borrow/all")
    suspend fun getAllBorrows(
        @Header("Authorization") token: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("status") status: String? = null
    ): Response<ApiResponse<BorrowsResponse>>
    
    @GET("borrow/user")
    suspend fun getUserBorrows(
        @Header("Authorization") token: String,
        @Query("status") status: String? = null
    ): Response<ApiResponse<List<BorrowRecord>>>
    
    @POST("borrow")
    suspend fun borrowBook(
        @Header("Authorization") token: String,
        @Body request: BorrowRequest
    ): Response<ApiResponse<BorrowRecord>>
    
    @PUT("borrow/{id}/return")
    suspend fun returnBook(
        @Header("Authorization") token: String,
        @Path("id") id: Long
    ): Response<ApiResponse<BorrowRecord>>
    
    @PUT("borrow/{id}/approve")
    suspend fun approveBorrow(
        @Header("Authorization") token: String,
        @Path("id") id: Long
    ): Response<ApiResponse<BorrowRecord>>
    
    @PUT("borrow/{id}/reject")
    suspend fun rejectBorrow(
        @Header("Authorization") token: String,
        @Path("id") id: Long
    ): Response<ApiResponse<BorrowRecord>>
}

data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val message: String?,
    val errorCode: String?
)

data class BorrowsResponse(
    val borrowRecords: List<BorrowRecord>,
    val pagination: Pagination?
)

data class Pagination(
    val page: Int,
    val limit: Int,
    val total: Long,
    val pages: Int
)

data class BorrowRecord(
    val id: Long,
    val bookId: Long?,
    val bookTitle: String?,
    val bookAuthor: String?,
    val bookCoverUrl: String?,
    val userId: Long?,
    val userEmail: String?,
    val userFullName: String?,
    val borrowDate: String,
    val dueDate: String?,
    val returnDate: String?,
    val borrowStatus: String,
    val status: String,
    val daysLeft: Long
)

data class BorrowRequest(
    val bookId: Long
)
