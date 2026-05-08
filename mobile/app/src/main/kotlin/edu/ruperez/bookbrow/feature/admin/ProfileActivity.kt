package edu.ruperez.bookbrow.feature.admin

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import edu.ruperez.bookbrow.R
import edu.ruperez.bookbrow.databinding.ActivityProfileBinding
import edu.ruperez.bookbrow.feature.auth.LoginActivity
import edu.ruperez.bookbrow.shared.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * ProfileActivity - User profile and settings screen
 */
class ProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityProfileBinding
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root as View)

        sessionManager = SessionManager(applicationContext)

        loadUserInfo()
        setupBottomNavigation()
        setupClickListeners()
    }

    private fun loadUserInfo() {
        CoroutineScope(Dispatchers.IO).launch {
            val name = sessionManager.getFullName() ?: "User"
            val email = sessionManager.getEmail() ?: ""
            val role = sessionManager.getRole() ?: "USER"

            withContext(Dispatchers.Main) {
                binding.tvUserName.text = name
                binding.tvUserEmail.text = email
                binding.tvUserRole.text = role
                
                // Set initials
                val initials = name.split(" ")
                    .take(2)
                    .mapNotNull { it.firstOrNull()?.uppercaseChar() }
                    .joinToString("")
                binding.tvInitials.text = initials.ifEmpty { "U" }
            }
        }
    }

    private fun setupBottomNavigation() {
        binding.bottomNavigation.selectedItemId = R.id.nav_more
        binding.bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_dashboard -> {
                    startActivity(Intent(this, AdminDashboardActivity::class.java))
                    overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
                    finish()
                    true
                }
                R.id.nav_books -> {
                    startActivity(Intent(this, edu.ruperez.bookbrow.feature.books.BooksActivity::class.java))
                    overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
                    finish()
                    true
                }
                R.id.nav_records -> {
                    startActivity(Intent(this, edu.ruperez.bookbrow.feature.borrow.RecordsActivity::class.java))
                    overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
                    finish()
                    true
                }
                R.id.nav_more -> true
                else -> false
            }
        }
    }

    private fun setupClickListeners() {
        binding.btnEditProfile.setOnClickListener {
            startActivity(Intent(this, EditProfileActivity::class.java))
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        }

        binding.btnDarkMode.setOnClickListener {
            binding.switchDarkMode.toggle()
        }

        binding.switchDarkMode.setOnCheckedChangeListener { _, isChecked ->
            Toast.makeText(
                this,
                if (isChecked) "Dark mode enabled" else "Dark mode disabled",
                Toast.LENGTH_SHORT
            ).show()
        }

        binding.btnHelp.setOnClickListener {
            Toast.makeText(this, "Help and Support", Toast.LENGTH_SHORT).show()
        }

        binding.btnAbout.setOnClickListener {
            Toast.makeText(this, "About the Developer", Toast.LENGTH_SHORT).show()
        }

        binding.btnLogout.setOnClickListener {
            logout()
        }
    }

    private fun logout() {
        CoroutineScope(Dispatchers.IO).launch {
            sessionManager.clearSession()
            withContext(Dispatchers.Main) {
                startActivity(Intent(this@ProfileActivity, LoginActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                })
                overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            }
        }
    }
}
