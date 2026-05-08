package edu.ruperez.bookbrow.feature.librarian

import retrofit2.Response
import retrofit2.http.*

interface LibrarianApiService {

    // Dashboard
    @GET("librarian/stats")
    suspend fun getStats(
        @Header("Authorization") token: String
    ): Response<StatsResponse>

    // Users Management
    @GET("librarian/users")
    suspend fun getUsers(
        @Header("Authorization") token: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("search") search: String? = null,
        @Query("role") role: String? = null
    ): Response<UsersResponse>

    @GET("librarian/users/{id}")
    suspend fun getUserDetails(
        @Header("Authorization") token: String,
        @Path("id") userId: Long
    ): Response<UserDetailsResponse>

    @PUT("librarian/users/{id}")
    suspend fun updateUser(
        @Header("Authorization") token: String,
        @Path("id") userId: Long,
        @Body request: UpdateUserRequest
    ): Response<UpdateUserResponse>

    @PUT("librarian/users/{id}/deactivate")
    suspend fun deactivateUser(
        @Header("Authorization") token: String,
        @Path("id") userId: Long
    ): Response<MessageResponse>

    @PUT("librarian/users/{id}/activate")
    suspend fun activateUser(
        @Header("Authorization") token: String,
        @Path("id") userId: Long
    ): Response<MessageResponse>

    // Records Management
    @GET("librarian/records")
    suspend fun getRecords(
        @Header("Authorization") token: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("status") status: String? = null
    ): Response<RecordsResponse>

    @GET("librarian/records/{id}")
    suspend fun getRecordDetails(
        @Header("Authorization") token: String,
        @Path("id") recordId: Long
    ): Response<RecordDetailsResponse>
}

// Response Models
data class StatsResponse(
    val success: Boolean,
    val data: StatsData
)

data class StatsData(
    val borrowed: Int,
    val dueSoon: Int,
    val returned: Int,
    val timestamp: String
)

data class UsersResponse(
    val success: Boolean,
    val data: UsersData
)

data class UsersData(
    val users: List<UserItem>,
    val pagination: Pagination
)

data class UserItem(
    val id: Long,
    val fullName: String,
    val email: String,
    val role: String,
    val isActive: Boolean
)

data class UserDetailsResponse(
    val success: Boolean,
    val data: UserDetailsData
)

data class UserDetailsData(
    val user: UserDetails
)

data class UserDetails(
    val id: Long,
    val fullName: String,
    val email: String,
    val phone: String?,
    val about: String?,
    val role: String,
    val isActive: Boolean,
    val joinedDate: String,
    val booksBorrowed: Int,
    val activeLoans: Int
)

data class UpdateUserRequest(
    val fullName: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val about: String? = null,
    val role: String? = null,
    val isActive: Boolean? = null
)

data class UpdateUserResponse(
    val success: Boolean,
    val data: UpdatedUserData
)

data class UpdatedUserData(
    val user: UserItem
)

data class MessageResponse(
    val success: Boolean,
    val data: MessageData
)

data class MessageData(
    val message: String
)

data class RecordsResponse(
    val success: Boolean,
    val data: RecordsData
)

data class RecordsData(
    val records: List<RecordItem>,
    val pagination: Pagination
)

data class RecordItem(
    val id: Long,
    val userId: Long,
    val userName: String,
    val bookId: Long,
    val bookTitle: String,
    val borrowDate: String,
    val dueDate: String,
    val returnDate: String?,
    val status: String,
    val processedBy: String?
)

data class RecordDetailsResponse(
    val success: Boolean,
    val data: RecordDetailsData
)

data class RecordDetailsData(
    val record: RecordItem
)

data class Pagination(
    val page: Int,
    val limit: Int,
    val total: Long,
    val pages: Int
)
