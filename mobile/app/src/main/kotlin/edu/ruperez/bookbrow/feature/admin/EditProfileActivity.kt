package edu.ruperez.bookbrow.feature.admin

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import edu.ruperez.bookbrow.R
import edu.ruperez.bookbrow.databinding.ActivityEditProfileBinding
import edu.ruperez.bookbrow.shared.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * EditProfileActivity - Edit user profile and change password
 */
class EditProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityEditProfileBinding
    private lateinit var sessionManager: SessionManager
    private var currentTab = Tab.PERSONAL_INFO

    enum class Tab {
        PERSONAL_INFO,
        CHANGE_PASSWORD
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEditProfileBinding.inflate(layoutInflater)
        setContentView(binding.root as View)

        sessionManager = SessionManager(applicationContext)

        loadUserInfo()
        setupClickListeners()
        showTab(Tab.PERSONAL_INFO)
    }

    private fun loadUserInfo() {
        CoroutineScope(Dispatchers.IO).launch {
            val name = sessionManager.getFullName() ?: ""
            val email = sessionManager.getEmail() ?: ""

            withContext(Dispatchers.Main) {
                binding.etFullName.setText(name)
                binding.etEmail.setText(email)
            }
        }
    }

    private fun setupClickListeners() {
        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.tabPersonalInfo.setOnClickListener {
            showTab(Tab.PERSONAL_INFO)
        }

        binding.tabChangePassword.setOnClickListener {
            showTab(Tab.CHANGE_PASSWORD)
        }

        binding.btnUpdateProfile.setOnClickListener {
            updateProfile()
        }

        binding.btnUpdatePassword.setOnClickListener {
            updatePassword()
        }
    }

    private fun showTab(tab: Tab) {
        currentTab = tab
        
        when (tab) {
            Tab.PERSONAL_INFO -> {
                binding.sectionPersonalInfo.visibility = View.VISIBLE
                binding.sectionChangePassword.visibility = View.GONE
                
                binding.tabPersonalInfo.setBackgroundResource(R.drawable.bg_menu_item)
                binding.tabPersonalInfo.setTextColor(ContextCompat.getColor(this, android.R.color.black))
                binding.tabChangePassword.background = null
                binding.tabChangePassword.setTextColor(ContextCompat.getColor(this, android.R.color.darker_gray))
            }
            Tab.CHANGE_PASSWORD -> {
                binding.sectionPersonalInfo.visibility = View.GONE
                binding.sectionChangePassword.visibility = View.VISIBLE
                
                binding.tabChangePassword.setBackgroundResource(R.drawable.bg_menu_item)
                binding.tabChangePassword.setTextColor(ContextCompat.getColor(this, android.R.color.black))
                binding.tabPersonalInfo.background = null
                binding.tabPersonalInfo.setTextColor(ContextCompat.getColor(this, android.R.color.darker_gray))
            }
        }
    }

    private fun updateProfile() {
        val fullName = binding.etFullName.text.toString().trim()
        
        if (fullName.isEmpty()) {
            Toast.makeText(this, "Please enter your full name", Toast.LENGTH_SHORT).show()
            return
        }

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val email = sessionManager.getEmail() ?: ""
                val role = sessionManager.getRole() ?: ""
                val token = sessionManager.getToken() ?: ""
                
                // Save updated name
                sessionManager.saveSession(token, fullName, email, role)
                
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@EditProfileActivity,
                        "Profile updated successfully",
                        Toast.LENGTH_SHORT
                    ).show()
                    finish()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@EditProfileActivity,
                        "Error: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    private fun updatePassword() {
        val currentPassword = binding.etCurrentPassword.text.toString()
        val newPassword = binding.etNewPassword.text.toString()
        val confirmPassword = binding.etConfirmPassword.text.toString()

        if (currentPassword.isEmpty() || newPassword.isEmpty() || confirmPassword.isEmpty()) {
            Toast.makeText(this, "Please fill all password fields", Toast.LENGTH_SHORT).show()
            return
        }

        if (newPassword != confirmPassword) {
            Toast.makeText(this, "New passwords do not match", Toast.LENGTH_SHORT).show()
            return
        }

        if (newPassword.length < 6) {
            Toast.makeText(this, "Password must be at least 6 characters", Toast.LENGTH_SHORT).show()
            return
        }

        // TODO: Implement password change API call
        Toast.makeText(this, "Password change functionality coming soon", Toast.LENGTH_SHORT).show()
    }
}
