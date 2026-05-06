package edu.ruperez.bookbrow.feature.auth

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.ruperez.bookbrow.feature.auth.AuthResponse
import edu.ruperez.bookbrow.feature.auth.AuthRepository
import kotlinx.coroutines.launch

/**
 * AuthViewModel â€“ shared ViewModel for both LoginActivity and RegisterActivity.
 *
 * Exposes:
 *   loginState  â€“ LiveData<UiState<AuthResponse>> for login results
 *   registerState â€“ LiveData<UiState<AuthResponse>> for register results
 *
 * Design patterns used:
 *   - MVVM (ViewModel separates UI from data logic)
 *   - Observer (LiveData notifies Activities of state changes)
 */
class AuthViewModel : ViewModel() {

    private val repository = AuthRepository()

    // â”€â”€ Login state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    private val _loginState = MutableLiveData<UiState<AuthResponse>>()
    val loginState: LiveData<UiState<AuthResponse>> = _loginState

    // â”€â”€ Register state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    private val _registerState = MutableLiveData<UiState<AuthResponse>>()
    val registerState: LiveData<UiState<AuthResponse>> = _registerState

    /**
     * Initiate login flow.
     * Input validation is performed in the Activity before calling this.
     */
    fun login(email: String, password: String) {
        _loginState.value = UiState.Loading
        viewModelScope.launch {
            repository.login(email, password)
                .onSuccess { response ->
                    if (response.success) {
                        _loginState.value = UiState.Success(response)
                    } else {
                        val msg = response.error?.message ?: "Invalid email or password"
                        _loginState.value = UiState.Error(msg)
                    }
                }
                .onFailure { throwable ->
                    _loginState.value = UiState.Error(throwable.message ?: "Network error")
                }
        }
    }

    /**
     * Initiate registration flow.
     * Input validation is performed in the Activity before calling this.
     */
    fun register(fullName: String, email: String, password: String, confirmPassword: String) {
        _registerState.value = UiState.Loading
        viewModelScope.launch {
            repository.register(fullName, email, password, confirmPassword)
                .onSuccess { response ->
                    if (response.success) {
                        _registerState.value = UiState.Success(response)
                    } else {
                        val msg = response.error?.message ?: "Registration failed"
                        _registerState.value = UiState.Error(msg)
                    }
                }
                .onFailure { throwable ->
                    _registerState.value = UiState.Error(throwable.message ?: "Network error")
                }
        }
    }
}

/**
 * Generic sealed class representing the three UI states for any async operation.
 */
sealed class UiState<out T> {
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}
