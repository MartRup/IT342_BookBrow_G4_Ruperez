package edu.ruperez.bookbrow.feature.auth

import edu.ruperez.bookbrow.shared.RetrofitClient
import edu.ruperez.bookbrow.feature.auth.AuthResponse
import edu.ruperez.bookbrow.feature.auth.LoginRequest
import edu.ruperez.bookbrow.feature.auth.RegisterRequest

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
            val rawError = response.errorBody()?.string()
            val errorMsg = parseError(rawError, "Registration failed (${response.code()})")
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
            val rawError = response.errorBody()?.string()
            val errorMsg = parseError(rawError, "Login failed (${response.code()})")
            throw Exception(errorMsg)
        }
    }

    /**
     * Attempt to login with Google ID token.
     * @return Result.Success with AuthResponse on HTTP 2xx, Result.Error otherwise.
     */
    suspend fun googleLogin(idToken: String): Result<AuthResponse> = runCatching {
        val response = api.googleLogin(GoogleLoginRequest(idToken = idToken))
        if (response.isSuccessful) {
            response.body() ?: throw Exception("Empty response body")
        } else {
            val rawError = response.errorBody()?.string()
            val errorMsg = parseError(rawError, "Google login failed (${response.code()})")
            throw Exception(errorMsg)
        }
    }

    private fun parseError(errorBody: String?, fallback: String): String {
        if (errorBody.isNullOrBlank()) return fallback
        return try {
            val jsonObject = org.json.JSONObject(errorBody)
            if (jsonObject.has("error")) {
                val errorObj = jsonObject.getJSONObject("error")
                if (errorObj.has("message")) {
                    return errorObj.getString("message")
                }
            }
            if (jsonObject.has("message")) {
                return jsonObject.getString("message")
            }
            errorBody
        } catch (e: Exception) {
            errorBody
        }
    }
}
