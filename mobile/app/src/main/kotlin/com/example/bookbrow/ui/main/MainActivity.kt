package com.example.bookbrow.ui.main

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.bookbrow.R
import com.example.bookbrow.data.local.SessionManager
import com.example.bookbrow.databinding.ActivityMainBinding
import com.example.bookbrow.ui.auth.LoginActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * MainActivity – the home screen shown after a successful login.
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
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Populate user info from intent extras
        val name  = intent.getStringExtra(EXTRA_NAME)  ?: "User"
        val email = intent.getStringExtra(EXTRA_EMAIL) ?: ""
        val role  = intent.getStringExtra(EXTRA_ROLE)  ?: "USER"

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
