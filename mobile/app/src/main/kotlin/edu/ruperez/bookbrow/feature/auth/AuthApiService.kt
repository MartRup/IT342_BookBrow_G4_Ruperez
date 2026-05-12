package edu.ruperez.bookbrow.feature.auth

import edu.ruperez.bookbrow.feature.auth.AuthResponse
import edu.ruperez.bookbrow.feature.auth.LoginRequest
import edu.ruperez.bookbrow.feature.auth.RegisterRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

/**
 * Retrofit interface for the BookBrow authentication endpoints.
 *
 * Base URL is set in RetrofitClient. All paths here are relative:
 *   POST /api/v1/auth/register
 *   POST /api/v1/auth/login
 */
interface AuthApiService {

    /**
     * Register a new member account.
     * POST /api/v1/auth/register
     */
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    /**
     * Login with email and password.
     * POST /api/v1/auth/login
     */
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
}
