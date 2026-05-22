package edu.ruperez.bookbrow.feature.user

import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Header

interface UserApiService {

    @GET("api/v1/users/suspension-status")
    suspend fun getSuspensionStatus(
        @Header("Authorization") token: String
    ): Response<UserSuspensionResponse>
}

data class UserSuspensionResponse(
    val success: Boolean,
    val data: UserSuspensionStatus?,
    val message: String?,
    val errorCode: String?
)

data class UserSuspensionStatus(
    val isSuspended: Boolean,
    val remainingSeconds: Long,
    val suspensionReason: String?,
    val suspendedUntil: String?
)
