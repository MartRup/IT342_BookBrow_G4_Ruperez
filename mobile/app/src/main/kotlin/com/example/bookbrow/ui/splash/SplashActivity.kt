package com.example.bookbrow.ui.splash

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.bookbrow.data.local.SessionManager
import com.example.bookbrow.ui.auth.LoginActivity
import com.example.bookbrow.ui.main.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * SplashActivity – displayed on app launch.
 *
 * Checks for an existing session:
 *  - If a JWT token is stored → navigate directly to MainActivity (skip login)
 *  - Otherwise → navigate to LoginActivity
 *
 * The splash is shown for at least 1.2 seconds so the branding is visible.
 */
class SplashActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        com.example.bookbrow.databinding.ActivitySplashBinding.inflate(layoutInflater).also {
            setContentView(it.root)
        }

        val sessionManager = SessionManager(applicationContext)

        CoroutineScope(Dispatchers.IO).launch {
            delay(1200) // minimum splash duration

            val isLoggedIn = sessionManager.isLoggedIn()
            val name       = sessionManager.getFullName() ?: ""
            val email      = sessionManager.getEmail()    ?: ""
            val role       = sessionManager.getRole()     ?: "USER"

            withContext(Dispatchers.Main) {
                if (isLoggedIn) {
                    startActivity(Intent(this@SplashActivity, MainActivity::class.java).apply {
                        putExtra(MainActivity.EXTRA_NAME,  name)
                        putExtra(MainActivity.EXTRA_EMAIL, email)
                        putExtra(MainActivity.EXTRA_ROLE,  role)
                    })
                } else {
                    startActivity(Intent(this@SplashActivity, LoginActivity::class.java))
                }
                overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            }
        }
    }
}
