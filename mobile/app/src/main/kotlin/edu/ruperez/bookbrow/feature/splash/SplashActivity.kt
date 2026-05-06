package edu.ruperez.bookbrow.feature.splash

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import edu.ruperez.bookbrow.shared.SessionManager
import edu.ruperez.bookbrow.feature.auth.LoginActivity
import edu.ruperez.bookbrow.feature.main.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * SplashActivity â€“ displayed on app launch.
 *
 * Checks for an existing session:
 *  - If a JWT token is stored â†’ navigate directly to MainActivity (skip login)
 *  - Otherwise â†’ navigate to LoginActivity
 *
 * The splash is shown for at least 1.2 seconds so the branding is visible.
 */
class SplashActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        edu.ruperez.bookbrow.databinding.ActivitySplashBinding.inflate(layoutInflater).also {
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
