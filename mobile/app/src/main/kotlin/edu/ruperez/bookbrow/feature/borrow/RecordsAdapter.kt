package edu.ruperez.bookbrow.feature.borrow

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import edu.ruperez.bookbrow.databinding.ItemRecordBinding
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

/**
 * Adapter for displaying borrow records in a RecyclerView
 */
class RecordsAdapter : ListAdapter<BorrowRecord, RecordsAdapter.RecordViewHolder>(RecordDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecordViewHolder {
        val binding = ItemRecordBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return RecordViewHolder(binding)
    }

    override fun onBindViewHolder(holder: RecordViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class RecordViewHolder(
        private val binding: ItemRecordBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(record: BorrowRecord) {
            // Book info
            binding.tvBookTitle.text = record.bookTitle ?: "Unknown Book"
            binding.tvBookAuthor.text = record.bookAuthor ?: "Unknown Author"
            binding.tvUserName.text = "Borrowed by: ${record.userFullName ?: "Unknown User"}"

            // Dates
            binding.tvBorrowDate.text = formatDate(record.borrowDate)
            binding.tvDueDate.text = formatDate(record.dueDate ?: "")

            // Status badge based on the computed status from backend
            when (record.status) {
                "RETURNED" -> {
                    binding.tvStatus.text = "Returned"
                    binding.tvStatus.setBackgroundColor(0xFF4CAF50.toInt()) // Green
                    binding.tvReturnStatus.text = "Returned"
                    binding.tvReturnStatus.setTextColor(0xFF4CAF50.toInt())
                    binding.tvReturnStatus.visibility = View.VISIBLE
                }
                "OVERDUE" -> {
                    binding.tvStatus.text = "OverDue"
                    binding.tvStatus.setBackgroundColor(0xFFF44336.toInt()) // Red
                    binding.tvReturnStatus.visibility = View.GONE
                }
                "ACTIVE" -> {
                    binding.tvStatus.text = "Active"
                    binding.tvStatus.setBackgroundColor(0xFF2196F3.toInt()) // Blue
                    binding.tvReturnStatus.visibility = View.GONE
                }
                "PENDING" -> {
                    binding.tvStatus.text = "Pending"
                    binding.tvStatus.setBackgroundColor(0xFFFF9800.toInt()) // Orange
                    binding.tvReturnStatus.visibility = View.GONE
                }
                "REJECTED" -> {
                    binding.tvStatus.text = "Rejected"
                    binding.tvStatus.setBackgroundColor(0xFF999999.toInt()) // Gray
                    binding.tvReturnStatus.visibility = View.GONE
                }
                else -> {
                    binding.tvStatus.text = record.status
                    binding.tvStatus.setBackgroundColor(0xFF999999.toInt()) // Gray
                    binding.tvReturnStatus.visibility = View.GONE
                }
            }

            // TODO: Load book cover image using Glide or Coil
        }

        private fun formatDate(dateString: String): String {
            return try {
                val dateTime = LocalDateTime.parse(dateString, DateTimeFormatter.ISO_DATE_TIME)
                dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
            } catch (e: Exception) {
                dateString.take(10) // Just take the date part if parsing fails
            }
        }
    }

    class RecordDiffCallback : DiffUtil.ItemCallback<BorrowRecord>() {
        override fun areItemsTheSame(oldItem: BorrowRecord, newItem: BorrowRecord): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: BorrowRecord, newItem: BorrowRecord): Boolean {
            return oldItem == newItem
        }
    }
}
