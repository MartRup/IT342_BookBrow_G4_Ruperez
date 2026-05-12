package edu.ruperez.bookbrow.data.remote.api

import edu.ruperez.bookbrow.data.remote.model.BorrowRequest
import edu.ruperez.bookbrow.data.remote.model.BorrowResponse
import retrofit2.Response
import retrofit2.http.*

/**
 * Retrofit API interface for borrow-related endpoints
 */
interface BorrowApiService {

    /**
     * GET /api/v1/borrow/user
     * Fetch current user's borrow records
     */
    @GET("borrow/user")
    suspend fun getUserBorrows(
        @Header("Authorization") token: String,
        @Query("status") status: String? = null
    ): Response<BorrowResponse>

    /**
     * GET /api/v1/borrow/all
     * Fetch all borrow records (LIBRARIAN/ADMIN only)
     */
    @GET("borrow/all")
    suspend fun getAllBorrows(
        @Header("Authorization") token: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("status") status: String? = null
    ): Response<BorrowResponse>

    /**
     * POST /api/v1/borrow
     * Create a new borrow request
     */
    @POST("borrow")
    suspend fun borrowBook(
        @Header("Authorization") token: String,
        @Body request: BorrowRequest
    ): Response<BorrowResponse>

    /**
     * PUT /api/v1/borrow/{id}/return
     * Mark a book as returned
     */
    @PUT("borrow/{id}/return")
    suspend fun returnBook(
        @Header("Authorization") token: String,
        @Path("id") borrowId: Long
    ): Response<BorrowResponse>

    /**
     * PUT /api/v1/borrow/{id}/approve
     * Approve a borrow request (LIBRARIAN/ADMIN only)
     */
    @PUT("borrow/{id}/approve")
    suspend fun approveBorrow(
        @Header("Authorization") token: String,
        @Path("id") borrowId: Long
    ): Response<BorrowResponse>

    /**
     * PUT /api/v1/borrow/{id}/reject
     * Reject a borrow request (LIBRARIAN/ADMIN only)
     */
    @PUT("borrow/{id}/reject")
    suspend fun rejectBorrow(
        @Header("Authorization") token: String,
        @Path("id") borrowId: Long
    ): Response<BorrowResponse>
}
