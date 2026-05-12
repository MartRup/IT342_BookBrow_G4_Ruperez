package edu.ruperez.bookbrow.data.remote.model

import com.google.gson.annotations.SerializedName

/**
 * User entity matching backend User model
 */
data class User(
    @SerializedName("id") val id: Long,
    @SerializedName("email") val email: String,
    @SerializedName("fullName") val fullName: String,
    @SerializedName("role") val role: String, // USER, LIBRARIAN, ADMIN
    @SerializedName("isActive") val isActive: Boolean,
    @SerializedName("createdAt") val createdAt: String?
)

/**
 * Dashboard statistics
 */
data class DashboardStats(
    @SerializedName("totalBooks") val totalBooks: Int,
    @SerializedName("availableBooks") val availableBooks: Int,
    @SerializedName("borrowedBooks") val borrowedBooks: Int,
    @SerializedName("totalUsers") val totalUsers: Int?,
    @SerializedName("activeUsers") val activeUsers: Int?,
    @SerializedName("pendingRequests") val pendingRequests: Int?,
    @SerializedName("overdueBooks") val overdueBooks: Int?
)

/**
 * Response wrapper for user operations
 */
data class UserResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: UserData?,
    @SerializedName("error") val error: ErrorData?,
    @SerializedName("timestamp") val timestamp: String?
) {
    data class UserData(
        @SerializedName("user") val user: User?,
        @SerializedName("users") val users: List<User>?,
        @SerializedName("message") val message: String?
    )

    data class ErrorData(
        @SerializedName("code") val code: String?,
        @SerializedName("message") val message: String?
    )
}

/**
 * Response wrapper for dashboard stats
 */
data class DashboardResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: DashboardData?,
    @SerializedName("error") val error: ErrorData?,
    @SerializedName("timestamp") val timestamp: String?
) {
    data class DashboardData(
        @SerializedName("stats") val stats: DashboardStats?,
        @SerializedName("message") val message: String?
    )

    data class ErrorData(
        @SerializedName("code") val code: String?,
        @SerializedName("message") val message: String?
    )
}
