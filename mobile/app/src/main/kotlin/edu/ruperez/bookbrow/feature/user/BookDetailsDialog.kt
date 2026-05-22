package edu.ruperez.bookbrow.feature.user

import android.app.AlertDialog
import android.content.Context
import android.graphics.Typeface
import android.view.Gravity
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import com.bumptech.glide.Glide
import edu.ruperez.bookbrow.R
import edu.ruperez.bookbrow.feature.books.Book

object BookDetailsDialog {

    fun show(
        context: Context,
        book: Book,
        showBorrowButton: Boolean = true,
        suspensionStatus: UserSuspensionStatus? = null,
        onBorrowClick: (Book) -> Unit
    ) {
        val content = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(context, 20), dp(context, 18), dp(context, 20), dp(context, 14))
        }

        val cover = ImageView(context).apply {
            layoutParams = LinearLayout.LayoutParams(dp(context, 150), dp(context, 220)).also {
                it.gravity = Gravity.CENTER_HORIZONTAL
            }
            scaleType = ImageView.ScaleType.CENTER_CROP
            contentDescription = "Book cover"
            setBackgroundColor(0xFFE0E0E0.toInt())
        }

        Glide.with(context)
            .load(resolveCoverUrl(book))
            .placeholder(R.drawable.ic_book)
            .error(R.drawable.ic_book)
            .centerCrop()
            .into(cover)

        val title = TextView(context).apply {
            text = book.title
            textSize = 20f
            setTypeface(typeface, Typeface.BOLD)
            gravity = Gravity.CENTER
            setTextColor(0xFF212121.toInt())
            setPadding(0, dp(context, 14), 0, 0)
        }

        val author = TextView(context).apply {
            text = "by ${book.author}"
            textSize = 14f
            gravity = Gravity.CENTER
            setTextColor(0xFF616161.toInt())
            setPadding(0, dp(context, 4), 0, 0)
        }

        val metadata = TextView(context).apply {
            val details = listOfNotNull(
                book.genre?.takeIf { it.isNotBlank() }?.let { "Genre: $it" },
                book.isbn?.takeIf { it.isNotBlank() }?.let { "ISBN: $it" },
                "Status: ${if (book.available) "Available" else "Unavailable"}"
            )
            text = details.joinToString("\n")
            textSize = 13f
            setTextColor(0xFF424242.toInt())
            setPadding(0, dp(context, 14), 0, 0)
        }

        val description = TextView(context).apply {
            text = book.description?.takeIf { it.isNotBlank() } ?: "No description available."
            textSize = 14f
            setTextColor(0xFF424242.toInt())
            setLineSpacing(2f, 1.05f)
            setPadding(0, dp(context, 12), 0, 0)
        }

        val isSuspended = suspensionStatus?.isSuspended == true
        val borrowButton = Button(context).apply {
            text = when {
                isSuspended -> "Borrowing Suspended"
                book.available -> "Request Borrowing"
                else -> "Unavailable"
            }
            isEnabled = book.available && !isSuspended
            alpha = if (book.available && !isSuspended) 1f else 0.5f
            setTextColor(0xFFFFFFFF.toInt())
            setBackgroundColor(if (isSuspended) 0xFF9E9E9E.toInt() else 0xFF1976D2.toInt())
            isAllCaps = false
            visibility = if (showBorrowButton) android.view.View.VISIBLE else android.view.View.GONE
        }

        val suspensionNotice = TextView(context).apply {
            visibility = if (isSuspended) android.view.View.VISIBLE else android.view.View.GONE
            text = buildSuspensionMessage(suspensionStatus)
            textSize = 13f
            setTextColor(0xFFD32F2F.toInt())
            setPadding(0, dp(context, 14), 0, 0)
        }

        content.addView(cover)
        content.addView(title)
        content.addView(author)
        content.addView(metadata)
        content.addView(description)
        content.addView(suspensionNotice)
        if (showBorrowButton) {
            content.addView(borrowButton, LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dp(context, 48)
            ).also {
                it.topMargin = dp(context, 18)
            })
        }

        val dialog = AlertDialog.Builder(context)
            .setView(ScrollView(context).apply { addView(content) })
            .create()

        borrowButton.setOnClickListener {
            dialog.dismiss()
            onBorrowClick(book)
        }

        dialog.setOnShowListener {
            dialog.window?.setBackgroundDrawableResource(android.R.color.white)
        }
        dialog.show()
    }

    private fun resolveCoverUrl(book: Book): String? {
        book.coverUrl?.takeIf { it.isNotBlank() }?.let { return it }
        return book.isbn
            ?.filter { it.isDigit() || it == 'X' || it == 'x' }
            ?.takeIf { it.isNotBlank() }
            ?.let { "https://covers.openlibrary.org/b/isbn/$it-L.jpg" }
    }

    private fun dp(context: Context, value: Int): Int =
        (value * context.resources.displayMetrics.density).toInt()

    private fun buildSuspensionMessage(status: UserSuspensionStatus?): String {
        val reason = status?.suspensionReason?.takeIf { it.isNotBlank() }
        val time = status?.remainingSeconds?.takeIf { it > 0 }?.let { seconds ->
            val days = seconds / 86400
            val hours = (seconds % 86400) / 3600
            when {
                days > 0 -> "$days day(s), $hours hour(s) remaining"
                hours > 0 -> "$hours hour(s) remaining"
                else -> "less than an hour remaining"
            }
        }

        return listOfNotNull(
            "Your borrowing access is temporarily suspended.",
            reason?.let { "Reason: $it" },
            time
        ).joinToString("\n")
    }
}
