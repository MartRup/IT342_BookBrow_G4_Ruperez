package edu.ruperez.bookbrow.feature.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import edu.ruperez.bookbrow.R
import edu.ruperez.bookbrow.databinding.ActivityRegisterBinding

/**
 * RegisterActivity â€“ lets new users create a BookBrow account.
 *
 * Responsibilities:
 *  - Validate full name, email, password, and confirm-password locally
 *  - Delegate API call to AuthViewModel
 *  - On success: show toast and navigate back to LoginActivity
 *  - Show inline errors and a server-side error message on failure
 */
class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding
    private val viewModel: AuthViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root as View)

        setupClickListeners()
        observeViewModel()
    }

    // â”€â”€ Click listeners â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    private fun setupClickListeners() {
        binding.btnRegister.setOnClickListener {
            if (validateInputs()) {
                viewModel.register(
                    fullName        = binding.etFullName.text?.toString()?.trim() ?: "",
                    email           = binding.etEmail.text?.toString()?.trim()    ?: "",
                    password        = binding.etPassword.text?.toString()          ?: "",
                    confirmPassword = binding.etConfirmPassword.text?.toString()   ?: ""
                )
            }
        }

        binding.btnLogin.setOnClickListener {
            finish() // go back to LoginActivity
        }
    }

    // â”€â”€ Observer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    private fun observeViewModel() {
        viewModel.registerState.observe(this) { state ->
            when (state) {
                is UiState.Loading -> setLoading(true)

                is UiState.Success -> {
                    setLoading(false)
                    Toast.makeText(applicationContext, getString(R.string.register_success), Toast.LENGTH_LONG).show()
                    // Navigate back to login
                    val intent = Intent(this, LoginActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
                    }
                    startActivity(intent)
                    finish()
                }

                is UiState.Error -> {
                    setLoading(false)
                    showError(state.message)
                }
            }
        }
    }

    // â”€â”€ Validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    private fun validateInputs(): Boolean {
        var valid = true

        val fullName        = binding.etFullName.text?.toString()?.trim() ?: ""
        val email           = binding.etEmail.text?.toString()?.trim()    ?: ""
        val password        = binding.etPassword.text?.toString()          ?: ""
        val confirmPassword = binding.etConfirmPassword.text?.toString()   ?: ""

        // Clear any previous errors
        binding.tilFullName.error        = null
        binding.tilEmail.error           = null
        binding.tilPassword.error        = null
        binding.tilConfirmPassword.error = null
        hideError()

        if (fullName.isEmpty()) {
            binding.tilFullName.error = getString(R.string.error_empty_name)
            valid = false
        }

        if (email.isEmpty()) {
            binding.tilEmail.error = getString(R.string.error_empty_email)
            valid = false
        } else if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.tilEmail.error = getString(R.string.error_invalid_email)
            valid = false
        }

        if (password.isEmpty()) {
            binding.tilPassword.error = getString(R.string.error_empty_password)
            valid = false
        } else if (password.length < 8) {
            binding.tilPassword.error = getString(R.string.error_short_password)
            valid = false
        }

        if (confirmPassword.isEmpty()) {
            binding.tilConfirmPassword.error = getString(R.string.error_empty_password)
            valid = false
        } else if (password != confirmPassword) {
            binding.tilConfirmPassword.error = getString(R.string.error_password_mismatch)
            valid = false
        }

        return valid
    }

    // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    private fun setLoading(isLoading: Boolean) {
        binding.progressBar.visibility   = if (isLoading) View.VISIBLE else View.GONE
        binding.btnRegister.visibility   = if (isLoading) View.INVISIBLE else View.VISIBLE
        binding.btnRegister.isEnabled    = !isLoading
        binding.btnLogin.isEnabled       = !isLoading
    }

    private fun showError(message: String) {
        binding.tvError.text       = message
        binding.tvError.visibility = View.VISIBLE
    }

    private fun hideError() {
        binding.tvError.visibility = View.GONE
    }
}
