package edu.ruperez.bookbrow.feature.auth

import com.google.gson.annotations.SerializedName

/**
 * Request body for POST /api/v1/auth/login
 */
data class LoginRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

/**
 * Request body for POST /api/v1/auth/register
 */
data class RegisterRequest(
    @SerializedName("fullName") val fullName: String,
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String,
    @SerializedName("confirmPassword") val confirmPassword: String
)

/**
 * Top-level response returned by both /login and /register.
 * Mirrors the Java AuthResponse DTO in the backend.
 */
data class AuthResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: UserData?,
    @SerializedName("error") val error: ErrorData?,
    @SerializedName("timestamp") val timestamp: String?
) {
    data class UserData(
        @SerializedName("id") val id: Long?,
        @SerializedName("email") val email: String?,
        @SerializedName("fullName") val fullName: String?,
        @SerializedName("role") val role: String?,
        @SerializedName("token") val token: String?,
        @SerializedName("message") val message: String?
    )

    data class ErrorData(
        @SerializedName("code") val code: String?,
        @SerializedName("message") val message: String?
    )
}
