package edu.ruperez.bookbrow.feature.user

import android.content.Intent
import android.os.Bundle
import android.view.MenuItem
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import com.google.android.material.bottomnavigation.BottomNavigationView
import edu.ruperez.bookbrow.R
import edu.ruperez.bookbrow.databinding.ActivityUserMenuBinding
import edu.ruperez.bookbrow.feature.admin.EditProfileActivity
import edu.ruperez.bookbrow.feature.auth.LoginActivity
import edu.ruperez.bookbrow.shared.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * UserMenuActivity - User profile and settings
 * 
 * Features:
 * - View profile information
 * - Edit profile
 * - Toggle dark mode
 * - Help and support
 * - About the app
 * - Logout
 */
class UserMenuActivity : AppCompatActivity(), BottomNavigationView.OnNavigationItemSelectedListener {

    private lateinit var binding: ActivityUserMenuBinding
    private lateinit var sessionManager: SessionManager
    private var isDarkMode = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityUserMenuBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        setupUI()
        setupBottomNavigation()
        loadUserInfo()
        loadDarkModePreference()
    }

    private fun setupUI() {
        // Edit Profile
        binding.btnEditProfile.setOnClickListener {
            startActivity(Intent(this, EditProfileActivity::class.java))
        }

        // Dark Mode Toggle
        binding.switchDarkMode.setOnCheckedChangeListener { _, isChecked ->
            isDarkMode = isChecked
            saveDarkModePreference(isChecked)
            applyDarkMode(isChecked)
        }

        // Help and Support
        binding.btnHelpSupport.setOnClickListener {
            // Show help dialog or navigate to help screen
            showHelpDialog()
        }

        // About the Dev
        binding.btnAboutDev.setOnClickListener {
            showAboutDialog()
        }

        // Logout
        binding.btnLogout.setOnClickListener {
            showLogoutConfirmation()
        }
    }

    private fun setupBottomNavigation() {
        binding.bottomNavigation.setOnNavigationItemSelectedListener(this)
        binding.bottomNavigation.selectedItemId = R.id.nav_menu
    }

    private fun loadUserInfo() {
        CoroutineScope(Dispatchers.IO).launch {
            val userName = sessionManager.getFullName() ?: "User"
            val userEmail = sessionManager.getEmail() ?: ""
            val userRole = sessionManager.getRole() ?: "USER"
            
            withContext(Dispatchers.Main) {
                binding.tvUserName.text = userName
                binding.tvUserEmail.text = userEmail
                binding.tvUserRole.text = userRole
                
                // Set avatar initials
                val initials = userName.split(" ")
                    .mapNotNull { it.firstOrNull()?.toString() }
                    .take(2)
                    .joinToString("")
                    .uppercase()
                binding.tvAvatarInitials.text = initials
            }
        }
    }

    private fun loadDarkModePreference() {
        val sharedPrefs = getSharedPreferences("app_preferences", MODE_PRIVATE)
        isDarkMode = sharedPrefs.getBoolean("dark_mode", false)
        binding.switchDarkMode.isChecked = isDarkMode
    }

    private fun saveDarkModePreference(enabled: Boolean) {
        val sharedPrefs = getSharedPreferences("app_preferences", MODE_PRIVATE)
        sharedPrefs.edit().putBoolean("dark_mode", enabled).apply()
    }

    private fun applyDarkMode(enabled: Boolean) {
        if (enabled) {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
        } else {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
        }
    }

    private fun showHelpDialog() {
        AlertDialog.Builder(this)
            .setTitle("Help & Support")
            .setMessage("For assistance, please contact:\n\nEmail: support@bookbrow.edu\nPhone: +1 234 567 8900\n\nOffice Hours:\nMonday - Friday: 9:00 AM - 5:00 PM")
            .setPositiveButton("OK", null)
            .show()
    }

    private fun showAboutDialog() {
        AlertDialog.Builder(this)
            .setTitle("About BookBrow")
            .setMessage("BookBrow Library Management System\n\nVersion 1.0.0\n\nDeveloped by: Raymart Ruperez\n\n© 2026 BookBrow. All rights reserved.")
            .setPositiveButton("OK", null)
            .show()
    }

    private fun showLogoutConfirmation() {
        AlertDialog.Builder(this)
            .setTitle("Logout")
            .setMessage("Are you sure you want to logout?")
            .setPositiveButton("Yes") { _, _ ->
                logout()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun logout() {
        CoroutineScope(Dispatchers.IO).launch {
            sessionManager.clearSession()
            withContext(Dispatchers.Main) {
                startActivity(Intent(this@UserMenuActivity, LoginActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                })
                overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            }
        }
    }

    override fun onNavigationItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            R.id.nav_home -> {
                startActivity(Intent(this, UserHomeActivity::class.java))
                overridePendingTransition(0, 0)
                finish()
                return true
            }
            R.id.nav_browse -> {
                startActivity(Intent(this, UserBrowseActivity::class.java))
                overridePendingTransition(0, 0)
                finish()
                return true
            }
            R.id.nav_my_books -> {
                startActivity(Intent(this, UserMyBooksActivity::class.java))
                overridePendingTransition(0, 0)
                finish()
                return true
            }
            R.id.nav_menu -> {
                // Already on menu
                return true
            }
        }
        return false
    }
}
