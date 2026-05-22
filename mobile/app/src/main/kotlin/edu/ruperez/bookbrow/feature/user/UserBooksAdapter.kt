package edu.ruperez.bookbrow.feature.user

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import edu.ruperez.bookbrow.R
import edu.ruperez.bookbrow.databinding.ItemUserBookBinding
import edu.ruperez.bookbrow.feature.books.Book

class UserBooksAdapter(
    private val onBookClick: (Book) -> Unit,
    private val onBorrowClick: (Book) -> Unit,
    private val showBorrowButton: Boolean = true,
    private val isBorrowSuspended: Boolean = false
) : ListAdapter<Book, UserBooksAdapter.UserBookViewHolder>(BookDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): UserBookViewHolder {
        val binding = ItemUserBookBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return UserBookViewHolder(binding, onBookClick, onBorrowClick, showBorrowButton, isBorrowSuspended)
    }

    override fun onBindViewHolder(holder: UserBookViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class UserBookViewHolder(
        private val binding: ItemUserBookBinding,
        private val onBookClick: (Book) -> Unit,
        private val onBorrowClick: (Book) -> Unit,
        private val showBorrowButton: Boolean,
        private val isBorrowSuspended: Boolean
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(book: Book) {
            binding.tvBookTitle.text = book.title
            binding.tvBookAuthor.text = book.author

            if (book.genre.isNullOrBlank()) {
                binding.tvBookGenre.visibility = View.GONE
            } else {
                binding.tvBookGenre.visibility = View.VISIBLE
                binding.tvBookGenre.text = book.genre
            }

            binding.tvAvailability.text = if (book.available) "Available" else "Unavailable"
            binding.tvAvailability.setTextColor(
                if (book.available) 0xFF4CAF50.toInt() else 0xFFF44336.toInt()
            )

            if (showBorrowButton) {
                binding.btnBorrow.visibility = View.VISIBLE
                binding.btnBorrow.isEnabled = book.available && !isBorrowSuspended
                binding.btnBorrow.alpha = if (book.available && !isBorrowSuspended) 1f else 0.45f
                binding.btnBorrow.text = when {
                    isBorrowSuspended -> "Suspended"
                    book.available -> "Borrow"
                    else -> "Unavailable"
                }
                binding.btnBorrow.setOnClickListener {
                    if (book.available && !isBorrowSuspended) onBorrowClick(book)
                }
            } else {
                binding.btnBorrow.visibility = View.GONE
            }
            binding.root.setOnClickListener {
                onBookClick(book)
            }

            Glide.with(binding.ivBookCover)
                .load(resolveCoverUrl(book))
                .placeholder(R.drawable.ic_book)
                .error(R.drawable.ic_book)
                .centerCrop()
                .into(binding.ivBookCover)
        }

        private fun resolveCoverUrl(book: Book): String? {
            book.coverUrl?.takeIf { it.isNotBlank() }?.let { return it }
            return book.isbn
                ?.filter { it.isDigit() || it == 'X' || it == 'x' }
                ?.takeIf { it.isNotBlank() }
                ?.let { "https://covers.openlibrary.org/b/isbn/$it-L.jpg" }
        }
    }

    class BookDiffCallback : DiffUtil.ItemCallback<Book>() {
        override fun areItemsTheSame(oldItem: Book, newItem: Book): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: Book, newItem: Book): Boolean {
            return oldItem == newItem
        }
    }
}
