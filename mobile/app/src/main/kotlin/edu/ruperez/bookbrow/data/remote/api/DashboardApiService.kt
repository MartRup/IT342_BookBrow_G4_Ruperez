package edu.ruperez.bookbrow.data.remote.api

import edu.ruperez.bookbrow.data.remote.model.DashboardResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Header

/**
 * Retrofit API interface for dashboard-related endpoints
 */
interface DashboardApiService {

    /**
     * GET /api/v1/dashboard/stats
     * Fetch dashboard statistics for current user
     */
    @GET("dashboard/stats")
    suspend fun getDashboardStats(
        @Header("Authorization") token: String
    ): Response<DashboardResponse>

    /**
     * GET /api/v1/dashboard/admin/stats
     * Fetch admin dashboard statistics (ADMIN only)
     */
    @GET("dashboard/admin/stats")
    suspend fun getAdminDashboardStats(
        @Header("Authorization") token: String
    ): Response<DashboardResponse>
}
