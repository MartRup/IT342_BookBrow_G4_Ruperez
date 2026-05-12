package edu.ruperez.bookbrow.shared

import edu.ruperez.bookbrow.BuildConfig
import edu.ruperez.bookbrow.feature.auth.AuthApiService
import edu.ruperez.bookbrow.feature.admin.AdminApiService
import edu.ruperez.bookbrow.feature.books.BooksApiService
import edu.ruperez.bookbrow.feature.borrow.BorrowApiService
import edu.ruperez.bookbrow.feature.librarian.LibrarianApiService
import edu.ruperez.bookbrow.data.remote.api.BookApiService
import edu.ruperez.bookbrow.data.remote.api.BorrowApiService as DataBorrowApiService
import edu.ruperez.bookbrow.data.remote.api.DashboardApiService
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Singleton Retrofit client.
 *
 * The BASE_URL is injected from BuildConfig so it can be changed
 * without touching source code. For local development it defaults to
 * "http://10.0.2.2:8080/api/v1/" (the Android emulator loopback).
 */
object RetrofitClient {

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    /** Lazily-created AuthApiService instance */
    val authApiService: AuthApiService by lazy {
        retrofit.create(AuthApiService::class.java)
    }

    /** Lazily-created AdminApiService instance */
    val adminApiService: AdminApiService by lazy {
        retrofit.create(AdminApiService::class.java)
    }

    /** Lazily-created BooksApiService instance (feature) */
    val booksApiService: BooksApiService by lazy {
        retrofit.create(BooksApiService::class.java)
    }

    /** Lazily-created BorrowApiService instance (feature) */
    val borrowApiService: BorrowApiService by lazy {
        retrofit.create(BorrowApiService::class.java)
    }

    /** Lazily-created LibrarianApiService instance */
    val librarianApiService: LibrarianApiService by lazy {
        retrofit.create(LibrarianApiService::class.java)
    }

    // ===== Data Layer API Services =====

    /** Lazily-created BookApiService instance (data layer) */
    val bookApiService: BookApiService by lazy {
        retrofit.create(BookApiService::class.java)
    }

    /** Lazily-created BorrowApiService instance (data layer) */
    val dataBorrowApiService: DataBorrowApiService by lazy {
        retrofit.create(DataBorrowApiService::class.java)
    }

    /** Lazily-created DashboardApiService instance (data layer) */
    val dashboardApiService: DashboardApiService by lazy {
        retrofit.create(DashboardApiService::class.java)
    }
}
