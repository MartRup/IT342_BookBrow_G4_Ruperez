package edu.ruperez.bookbrow.feature.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import edu.ruperez.bookbrow.shared.SessionManager
import edu.ruperez.bookbrow.databinding.ActivityLoginBinding
import edu.ruperez.bookbrow.feature.main.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import android.util.Log
import androidx.activity.result.contract.ActivityResultContracts
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task
class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private val viewModel: AuthViewModel by viewModels()
    private lateinit var sessionManager: SessionManager
    private lateinit var googleSignInClient: GoogleSignInClient

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root as View)

        sessionManager = SessionManager(applicationContext)

        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(getString(edu.ruperez.bookbrow.R.string.default_web_client_id))
            .requestEmail()
            .build()
        googleSignInClient = GoogleSignIn.getClient(this, gso)

        setupClickListeners()
        observeViewModel()
    }

    private val googleSignInLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == RESULT_OK) {
            val task: Task<GoogleSignInAccount> = GoogleSignIn.getSignedInAccountFromIntent(result.data)
            try {
                val account = task.getResult(ApiException::class.java)
                val idToken = account?.idToken
                if (idToken != null) {
                    viewModel.loginWithGoogle(idToken)
                } else {
                    showError("Failed to get Google ID token")
                }
            } catch (e: ApiException) {
                Log.w("LoginActivity", "Google sign in failed", e)
                showError("Google sign in failed: ${e.message}")
            }
        }
    }

    private fun setupClickListeners() {
        binding.btnLogin.setOnClickListener {
            if (validateInputs()) {
                val email    = binding.etEmail.text?.toString()?.trim() ?: ""
                val password = binding.etPassword.text?.toString() ?: ""
                viewModel.login(email, password)
            }
        }

        binding.btnRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        binding.btnGoogleSignIn.setOnClickListener {
            val signInIntent = googleSignInClient.signInIntent
            googleSignInLauncher.launch(signInIntent)
        }

        binding.tvForgotPassword.setOnClickListener {
            Toast.makeText(this, "Password reset coming soon", Toast.LENGTH_SHORT).show()
        }
    }

    private fun observeViewModel() {
        viewModel.loginState.observe(this) { state ->
            when (state) {
                is UiState.Loading -> setLoading(true)

                is UiState.Success -> {
                    setLoading(false)
                    Toast.makeText(applicationContext, "Login successful!", Toast.LENGTH_SHORT).show()
                    val authResponse = state.data
                    val userData = authResponse.data

                    // Persist session asynchronously
                    CoroutineScope(Dispatchers.IO).launch {
                        sessionManager.saveSession(
                            token    = userData?.token    ?: "",
                            fullName = userData?.fullName ?: "",
                            email    = userData?.email    ?: "",
                            role     = userData?.role     ?: "USER"
                        )
                    }

                    // Navigate to main screen
                    navigateToMain(
                        name  = userData?.fullName ?: "User",
                        email = userData?.email    ?: "",
                        role  = userData?.role     ?: "USER"
                    )
                }

                is UiState.Error -> {
                    setLoading(false)
                    showError(state.message)
                }
            }
        }
    }

    private fun validateInputs(): Boolean {
        var valid = true
        val email    = binding.etEmail.text?.toString()?.trim() ?: ""
        val password = binding.etPassword.text?.toString() ?: ""

        // Clear previous errors
        binding.tilEmail.error    = null
        binding.tilPassword.error = null
        hideError()

        if (email.isEmpty()) {
            binding.tilEmail.error = getString(edu.ruperez.bookbrow.R.string.error_empty_email)
            valid = false
        } else if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.tilEmail.error = getString(edu.ruperez.bookbrow.R.string.error_invalid_email)
            valid = false
        }

        if (password.isEmpty()) {
            binding.tilPassword.error = getString(edu.ruperez.bookbrow.R.string.error_empty_password)
            valid = false
        }

        return valid
    }

    // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    private fun setLoading(isLoading: Boolean) {
        binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        binding.btnLogin.visibility    = if (isLoading) View.INVISIBLE else View.VISIBLE
        binding.btnGoogleSignIn.visibility = if (isLoading) View.INVISIBLE else View.VISIBLE
        binding.btnLogin.isEnabled     = !isLoading
        binding.btnGoogleSignIn.isEnabled = !isLoading
        binding.btnRegister.isEnabled  = !isLoading
    }

    private fun showError(message: String) {
        binding.tvError.text       = message
        binding.tvError.visibility = View.VISIBLE
    }

    private fun hideError() {
        binding.tvError.visibility = View.GONE
    }

    private fun navigateToMain(name: String, email: String, role: String) {
        val intent = Intent(this, MainActivity::class.java).apply {
            putExtra(MainActivity.EXTRA_NAME,  name)
            putExtra(MainActivity.EXTRA_EMAIL, email)
            putExtra(MainActivity.EXTRA_ROLE,  role)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        startActivity(intent)
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
    }
}
