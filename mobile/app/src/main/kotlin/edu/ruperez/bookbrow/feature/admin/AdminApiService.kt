package edu.ruperez.bookbrow.feature.admin

import retrofit2.Response
import retrofit2.http.*

/**
 * API service for admin-specific endpoints
 */
interface AdminApiService {
    
    @GET("admin/stats")
    suspend fun getDashboardStats(
        @Header("Authorization") token: String
    ): Response<ApiResponse<DashboardStats>>
    
    @GET("admin/stats/detailed")
    suspend fun getDetailedStats(
        @Header("Authorization") token: String
    ): Response<ApiResponse<DetailedStats>>
    
    @GET("admin/logs")
    suspend fun getRecentLogs(
        @Header("Authorization") token: String
    ): Response<ApiResponse<List<SystemLog>>>
}

data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val message: String?,
    val errorCode: String?
)

data class DashboardStats(
    val totalUsers: Long,
    val totalBooks: Long,
    val activeLoans: Long,
    val overDue: Long,
    val timestamp: String
)

data class DetailedStats(
    val summary: SummaryStats,
    val books: BookStats,
    val borrows: BorrowStats,
    val timestamp: String
)

data class SummaryStats(
    val totalUsers: Long,
    val totalBooks: Long,
    val activeLoans: Long,
    val overDue: Long
)

data class BookStats(
    val total: Long,
    val available: Long,
    val borrowed: Long
)

data class BorrowStats(
    val total: Long,
    val active: Long,
    val returned: Long,
    val overdue: Long
)

data class SystemLog(
    val id: Long,
    val action: String,
    val details: String,
    val timestamp: String,
    val userId: Long?
)
