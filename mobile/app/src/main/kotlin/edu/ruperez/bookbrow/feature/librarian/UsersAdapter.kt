package edu.ruperez.bookbrow.feature.librarian

import android.graphics.Color
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import edu.ruperez.bookbrow.databinding.ItemUserBinding

class UsersAdapter(
    private val onUserClick: (UserItem) -> Unit
) : ListAdapter<UserItem, UsersAdapter.UserViewHolder>(UserDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): UserViewHolder {
        val binding = ItemUserBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return UserViewHolder(binding)
    }

    override fun onBindViewHolder(holder: UserViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class UserViewHolder(
        private val binding: ItemUserBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(user: UserItem) {
            binding.tvUserName.text = user.fullName
            binding.tvUserEmail.text = user.email
            binding.tvUserRole.text = user.role
            
            // Set avatar initials
            val initials = user.fullName.split(" ")
                .mapNotNull { it.firstOrNull()?.toString() }
                .take(2)
                .joinToString("")
                .uppercase()
            binding.tvUserAvatar.text = initials
            
            // Set avatar color based on role
            val avatarColor = when (user.role) {
                "ADMIN" -> Color.parseColor("#E57373")
                "LIBRARIAN" -> Color.parseColor("#81C784")
                else -> Color.parseColor("#64B5F6")
            }
            binding.avatarCircle.setCardBackgroundColor(avatarColor)
            
            // Show active/inactive status
            if (!user.isActive) {
                binding.tvUserRole.text = "${user.role} (Inactive)"
                binding.tvUserRole.setTextColor(Color.RED)
            }
            
            binding.root.setOnClickListener {
                onUserClick(user)
            }
        }
    }

    class UserDiffCallback : DiffUtil.ItemCallback<UserItem>() {
        override fun areItemsTheSame(oldItem: UserItem, newItem: UserItem): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: UserItem, newItem: UserItem): Boolean {
            return oldItem == newItem
        }
    }
}
