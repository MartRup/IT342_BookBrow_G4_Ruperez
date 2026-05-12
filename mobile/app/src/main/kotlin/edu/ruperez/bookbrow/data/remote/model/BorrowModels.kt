package edu.ruperez.bookbrow.data.remote.model

import com.google.gson.annotations.SerializedName

/**
 * Borrow record entity matching backend BorrowRecord model
 */
data class BorrowRecord(
    @SerializedName("id") val id: Long,
    @SerializedName("userId") val userId: Long,
    @SerializedName("userName") val userName: String?,
    @SerializedName("userEmail") val userEmail: String?,
    @SerializedName("bookId") val bookId: Long,
    @SerializedName("bookTitle") val bookTitle: String?,
    @SerializedName("bookAuthor") val bookAuthor: String?,
    @SerializedName("borrowDate") val borrowDate: String,
    @SerializedName("dueDate") val dueDate: String?,
    @SerializedName("returnDate") val returnDate: String?,
    @SerializedName("status") val status: String, // PENDING, APPROVED, RETURNED, REJECTED
    @SerializedName("processedBy") val processedBy: String?,
    @SerializedName("createdAt") val createdAt: String?
) {
    fun isOverdue(): Boolean {
        if (status != "APPROVED" || returnDate != null) return false
        // Simple check - in production, parse dates properly
        return false // TODO: Implement proper date comparison
    }

    fun getStatusColor(): Int {
        return when (status) {
            "PENDING" -> android.graphics.Color.parseColor("#FFA500") // Orange
            "APPROVED" -> android.graphics.Color.parseColor("#4CAF50") // Green
            "RETURNED" -> android.graphics.Color.parseColor("#2196F3") // Blue
            "REJECTED" -> android.graphics.Color.parseColor("#F44336") // Red
            else -> android.graphics.Color.GRAY
        }
    }
}

/**
 * Request body for borrowing a book
 */
data class BorrowRequest(
    @SerializedName("bookId") val bookId: Long
)

/**
 * Response wrapper for borrow operations
 */
data class BorrowResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: BorrowData?,
    @SerializedName("error") val error: ErrorData?,
    @SerializedName("timestamp") val timestamp: String?
) {
    data class BorrowData(
        @SerializedName("record") val record: BorrowRecord?,
        @SerializedName("records") val records: List<BorrowRecord>?,
        @SerializedName("message") val message: String?,
        @SerializedName("totalRecords") val totalRecords: Int?,
        @SerializedName("currentPage") val currentPage: Int?,
        @SerializedName("totalPages") val totalPages: Int?
    )

    data class ErrorData(
        @SerializedName("code") val code: String?,
        @SerializedName("message") val message: String?
    )
}
