package edu.ruperez.bookbrow.data.repository

import edu.ruperez.bookbrow.shared.RetrofitClient
import edu.ruperez.bookbrow.data.remote.model.DashboardResponse
import retrofit2.Response

/**
 * Repository for dashboard-related operations
 */
class DashboardRepository {

    private val api = RetrofitClient.dashboardApiService

    suspend fun getDashboardStats(token: String): Response<DashboardResponse> {
        return api.getDashboardStats("Bearer $token")
    }

    suspend fun getAdminDashboardStats(token: String): Response<DashboardResponse> {
        return api.getAdminDashboardStats("Bearer $token")
    }
}
