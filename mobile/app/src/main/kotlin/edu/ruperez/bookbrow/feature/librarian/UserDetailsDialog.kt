package edu.ruperez.bookbrow.feature.librarian

import android.app.Dialog
import android.content.Context
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.view.Window
import android.widget.Toast
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.lifecycleScope
import edu.ruperez.bookbrow.databinding.DialogUserDetailsBinding
import edu.ruperez.bookbrow.shared.SessionManager
import kotlinx.coroutines.launch

class UserDetailsDialog(
    context: Context,
    private val userId: Long,
    private val apiService: LibrarianApiService,
    private val onUpdated: (Boolean) -> Unit
) : Dialog(context) {

    private lateinit var binding: DialogUserDetailsBinding
    private lateinit var sessionManager: SessionManager
    private var userDetails: UserDetails? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        binding = DialogUserDetailsBinding.inflate(layoutInflater)
        setContentView(binding.root as View)

        sessionManager = SessionManager(context)

        window?.setLayout(
            (context.resources.displayMetrics.widthPixels * 0.9).toInt(),
            android.view.ViewGroup.LayoutParams.WRAP_CONTENT
        )

        setupUI()
        loadUserDetails()
    }

    private fun setupUI() {
        binding.btnClose.setOnClickListener {
            dismiss()
        }

        binding.btnEdit.setOnClickListener {
            showEditDialog()
        }

        binding.btnDeactivate.setOnClickListener {
            toggleUserStatus()
        }
    }

    private fun loadUserDetails() {
        binding.progressBar.visibility = View.VISIBLE
        
        (context as? LifecycleOwner)?.lifecycleScope?.launch {
            try {
                val token = sessionManager.getToken()
                if (token.isNullOrEmpty()) {
                    showError("Authentication required")
                    dismiss()
                    return@launch
                }
                
                val response = apiService.getUserDetails("Bearer $token", userId)
                
                if (response.isSuccessful && response.body()?.success == true) {
                    userDetails = response.body()!!.data.user
                    displayUserDetails(userDetails!!)
                } else {
                    showError("Failed to load user details")
                    dismiss()
                }
            } catch (e: Exception) {
                showError("Error: ${e.message}")
                dismiss()
            } finally {
                binding.progressBar.visibility = View.GONE
            }
        }
    }

    private fun displayUserDetails(user: UserDetails) {
        // Avatar
        val initials = user.fullName.split(" ")
            .mapNotNull { it.firstOrNull()?.toString() }
            .take(2)
            .joinToString("")
            .uppercase()
        binding.tvUserAvatar.text = initials
        
        val avatarColor = when (user.role) {
            "ADMIN" -> Color.parseColor("#E57373")
            "LIBRARIAN" -> Color.parseColor("#81C784")
            else -> Color.parseColor("#64B5F6")
        }
        binding.avatarCircle.setCardBackgroundColor(avatarColor)
        
        // User info
        binding.tvUserName.text = user.fullName
        binding.tvUserEmail.text = user.email
        binding.tvUserRole.text = user.role
        binding.tvUserPhone.text = user.phone ?: "Not provided"
        binding.tvUserAbout.text = user.about ?: "No bio"
        
        // Stats
        binding.tvJoinedDate.text = "Joined: ${formatDate(user.joinedDate)}"
        binding.tvBooksBorrowed.text = "Books Borrowed: ${user.booksBorrowed}"
        binding.tvActiveLoans.text = "Active Loans: ${user.activeLoans}"
        
        // Status
        if (!user.isActive) {
            binding.tvUserStatus.text = "Status: Inactive"
            binding.tvUserStatus.setTextColor(Color.RED)
            binding.btnDeactivate.text = "Activate"
        } else {
            binding.tvUserStatus.text = "Status: Active"
            binding.tvUserStatus.setTextColor(Color.GREEN)
            binding.btnDeactivate.text = "Deactivate"
        }
        
        // Hide deactivate button for admins
        if (user.role == "ADMIN") {
            binding.btnDeactivate.visibility = View.GONE
        }
    }

    private fun showEditDialog() {
        userDetails?.let { user ->
            val editDialog = EditUserDialog(context, user, apiService) { updated ->
                if (updated) {
                    loadUserDetails() // Refresh
                    onUpdated(true)
                }
            }
            editDialog.show()
        }
    }

    private fun toggleUserStatus() {
        userDetails?.let { user ->
            (context as? LifecycleOwner)?.lifecycleScope?.launch {
                try {
                    val token = sessionManager.getToken()
                    if (token.isNullOrEmpty()) {
                        showError("Authentication required")
                        return@launch
                    }
                    
                    val response = if (user.isActive) {
                        apiService.deactivateUser("Bearer $token", userId)
                    } else {
                        apiService.activateUser("Bearer $token", userId)
                    }
                    
                    if (response.isSuccessful && response.body()?.success == true) {
                        Toast.makeText(context, response.body()!!.data.message, Toast.LENGTH_SHORT).show()
                        loadUserDetails() // Refresh
                        onUpdated(true)
                    } else {
                        showError("Failed to update user status")
                    }
                } catch (e: Exception) {
                    showError("Error: ${e.message}")
                }
            }
        }
    }

    private fun formatDate(dateString: String): String {
        return try {
            dateString.substring(0, 10) // Extract YYYY-MM-DD
        } catch (e: Exception) {
            dateString
        }
    }

    private fun showError(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }
}
