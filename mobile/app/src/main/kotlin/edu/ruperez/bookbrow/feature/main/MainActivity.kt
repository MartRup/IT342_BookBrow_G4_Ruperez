package edu.ruperez.bookbrow.feature.main

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import edu.ruperez.bookbrow.R
import edu.ruperez.bookbrow.shared.SessionManager
import edu.ruperez.bookbrow.databinding.ActivityMainBinding
import edu.ruperez.bookbrow.feature.auth.LoginActivity
import edu.ruperez.bookbrow.feature.user.UserHomeActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * MainActivity â€“ the home screen shown after a successful login.
 *
 * Displays the logged-in user's name, email, and role.
 * Provides a logout button that clears the session and returns to LoginActivity.
 */
class MainActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_NAME  = "extra_name"
        const val EXTRA_EMAIL = "extra_email"
        const val EXTRA_ROLE  = "extra_role"
    }

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Check if user is admin/librarian and redirect to dashboard
        val role = intent.getStringExtra(EXTRA_ROLE)?.trim().orEmpty().ifBlank { "USER" }
        val normalizedRole = role.removePrefix("ROLE_")
        if (normalizedRole.equals("ADMIN", ignoreCase = true) || normalizedRole.equals("LIBRARIAN", ignoreCase = true)) {
            startActivity(Intent(this, edu.ruperez.bookbrow.feature.admin.AdminDashboardActivity::class.java))
            finish()
            return
        }

        if (normalizedRole.equals("USER", ignoreCase = true)) {
            startActivity(Intent(this, UserHomeActivity::class.java))
            finish()
            return
        }
        
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root as View)

        // Populate user info from intent extras
        val name  = intent.getStringExtra(EXTRA_NAME)  ?: "User"
        val email = intent.getStringExtra(EXTRA_EMAIL) ?: ""

        binding.tvUserName.text  = name
        binding.tvUserEmail.text = email
        binding.tvUserRole.text  = role
        binding.tvWelcome.text   = getString(R.string.welcome_user, name)

        binding.btnLogout.setOnClickListener {
            logout()
        }
    }

    private fun logout() {
        val sessionManager = SessionManager(applicationContext)
        CoroutineScope(Dispatchers.IO).launch {
            sessionManager.clearSession()
        }
        startActivity(Intent(this, LoginActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        })
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
    }
}
