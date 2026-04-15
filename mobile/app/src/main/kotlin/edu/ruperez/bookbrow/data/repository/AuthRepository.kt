package edu.ruperez.bookbrow.data.repository

import edu.ruperez.bookbrow.data.remote.RetrofitClient
import edu.ruperez.bookbrow.data.remote.model.AuthResponse
import edu.ruperez.bookbrow.data.remote.model.LoginRequest
import edu.ruperez.bookbrow.data.remote.model.RegisterRequest

/**
 * AuthRepository is the single source of truth for authentication data.
 *
 * It mediates between the ViewModels and the Retrofit API service,
 * returning a sealed Result to simplify error handling in the UI layer.
 *
 * Design pattern: Repository (from Clean Architecture)
 */
class AuthRepository {

    private val api = RetrofitClient.authApiService

    /**
     * Attempt to register a new user.
     * @return Result.Success with AuthResponse on HTTP 2xx, Result.Error otherwise.
     */
    suspend fun register(
        fullName: String,
        email: String,
        password: String,
        confirmPassword: String
    ): Result<AuthResponse> = runCatching {
        val response = api.register(
            RegisterRequest(
                fullName = fullName,
                email = email,
                password = password,
                confirmPassword = confirmPassword
            )
        )
        if (response.isSuccessful) {
            response.body() ?: throw Exception("Empty response body")
        } else {
            // Try to extract the backend's error message
            val errorMsg = response.errorBody()?.string() ?: "Registration failed (${response.code()})"
            throw Exception(errorMsg)
        }
    }

    /**
     * Attempt to login with email and password.
     * @return Result.Success with AuthResponse on HTTP 2xx, Result.Error otherwise.
     */
    suspend fun login(email: String, password: String): Result<AuthResponse> = runCatching {
        val response = api.login(LoginRequest(email = email, password = password))
        if (response.isSuccessful) {
            response.body() ?: throw Exception("Empty response body")
        } else {
            val errorMsg = response.errorBody()?.string() ?: "Login failed (${response.code()})"
            throw Exception(errorMsg)
        }
    }
}
