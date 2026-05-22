package edu.ruperez.bookbrow.feature.books

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import edu.ruperez.bookbrow.R
import edu.ruperez.bookbrow.databinding.ItemBookBinding

/**
 * Adapter for displaying books in a RecyclerView
 */
class BooksAdapter(
    private val onEditClick: (Book) -> Unit,
    private val onDeleteClick: (Book) -> Unit
) : ListAdapter<Book, BooksAdapter.BookViewHolder>(BookDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): BookViewHolder {
        val binding = ItemBookBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return BookViewHolder(binding, onEditClick, onDeleteClick)
    }

    override fun onBindViewHolder(holder: BookViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class BookViewHolder(
        private val binding: ItemBookBinding,
        private val onEditClick: (Book) -> Unit,
        private val onDeleteClick: (Book) -> Unit
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(book: Book) {
            binding.tvBookTitle.text = book.title
            binding.tvBookAuthor.text = book.author
            
            // For now, we'll show placeholder values for total and available
            // In a real app, you'd need to fetch this from the backend
            binding.tvTotalCopies.text = "Total: 1"
            
            if (book.available) {
                binding.tvAvailableCopies.text = "Avail: 1"
                binding.tvAvailableCopies.setTextColor(0xFF4CAF50.toInt()) // Green
            } else {
                binding.tvAvailableCopies.text = "Avail: 0"
                binding.tvAvailableCopies.setTextColor(0xFFF44336.toInt()) // Red
            }

            Glide.with(binding.ivBookCover)
                .load(resolveCoverUrl(book))
                .placeholder(R.drawable.ic_book)
                .error(R.drawable.ic_book)
                .centerCrop()
                .into(binding.ivBookCover)
            
            binding.btnEdit.setOnClickListener {
                onEditClick(book)
            }

            // Long press to delete
            binding.root.setOnLongClickListener {
                onDeleteClick(book)
                true
            }
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
