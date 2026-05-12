package edu.ruperez.bookbrow.feature.librarian

import android.app.Dialog
import android.content.Context
import android.os.Bundle
import android.view.View
import android.view.Window
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.lifecycleScope
import edu.ruperez.bookbrow.databinding.DialogEditUserBinding
import edu.ruperez.bookbrow.shared.SessionManager
import kotlinx.coroutines.launch

class EditUserDialog(
    context: Context,
    private val user: UserDetails,
    private val apiService: LibrarianApiService,
    private val onUpdated: (Boolean) -> Unit
) : Dialog(context) {

    private lateinit var binding: DialogEditUserBinding
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        binding = DialogEditUserBinding.inflate(layoutInflater)
        setContentView(binding.root as View)

        sessionManager = SessionManager(context)

        window?.setLayout(
            (context.resources.displayMetrics.widthPixels * 0.9).toInt(),
            android.view.ViewGroup.LayoutParams.WRAP_CONTENT
        )

        setupUI()
    }

    private fun setupUI() {
        // Pre-fill fields
        binding.etFullName.setText(user.fullName)
        binding.etEmail.setText(user.email)
        binding.etPhone.setText(user.phone ?: "")
        binding.etAbout.setText(user.about ?: "")
        
        // Role spinner
        val roles = arrayOf("USER", "LIBRARIAN", "ADMIN")
        val adapter = ArrayAdapter(context, android.R.layout.simple_spinner_item, roles)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerRole.adapter = adapter
        binding.spinnerRole.setSelection(roles.indexOf(user.role))
        
        // Buttons
        binding.btnCancel.setOnClickListener {
            dismiss()
        }
        
        binding.btnSave.setOnClickListener {
            saveChanges()
        }
    }

    private fun saveChanges() {
        val fullName = binding.etFullName.text.toString().trim()
        val email = binding.etEmail.text.toString().trim()
        val phone = binding.etPhone.text.toString().trim()
        val about = binding.etAbout.text.toString().trim()
        val role = binding.spinnerRole.selectedItem.toString()
        
        if (fullName.isEmpty()) {
            binding.etFullName.error = "Name is required"
            return
        }
        
        if (email.isEmpty()) {
            binding.etEmail.error = "Email is required"
            return
        }
        
        val request = UpdateUserRequest(
            fullName = if (fullName != user.fullName) fullName else null,
            email = if (email != user.email) email else null,
            phone = if (phone != user.phone) phone else null,
            about = if (about != user.about) about else null,
            role = if (role != user.role) role else null
        )
        
        (context as? LifecycleOwner)?.lifecycleScope?.launch {
            try {
                val token = sessionManager.getToken()
                if (token.isNullOrEmpty()) {
                    showError("Authentication required")
                    return@launch
                }
                
                val response = apiService.updateUser("Bearer $token", user.id, request)
                
                if (response.isSuccessful && response.body()?.success == true) {
                    Toast.makeText(context, "User updated successfully", Toast.LENGTH_SHORT).show()
                    onUpdated(true)
                    dismiss()
                } else {
                    showError("Failed to update user")
                }
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            }
        }
    }

    private fun showError(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }
}
