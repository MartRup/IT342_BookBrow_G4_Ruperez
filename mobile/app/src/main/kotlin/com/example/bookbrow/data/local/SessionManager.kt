package com.example.bookbrow.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

/** Extension property to create/get the DataStore instance on Context */
private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "bookbrow_prefs")

/**
 * SessionManager persists JWT token and basic user info across app launches
 * using Jetpack DataStore (Preferences).
 *
 * Usage:
 *   val session = SessionManager(applicationContext)
 *   session.saveSession(token, fullName, email, role)
 *   val token = session.getToken()
 *   session.clearSession()
 */
class SessionManager(private val context: Context) {

    companion object {
        private val KEY_TOKEN      = stringPreferencesKey("jwt_token")
        private val KEY_FULL_NAME  = stringPreferencesKey("full_name")
        private val KEY_EMAIL      = stringPreferencesKey("email")
        private val KEY_ROLE       = stringPreferencesKey("role")
    }

    /** Persist all session data after a successful login/register */
    suspend fun saveSession(token: String, fullName: String, email: String, role: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_TOKEN]     = token
            prefs[KEY_FULL_NAME] = fullName
            prefs[KEY_EMAIL]     = email
            prefs[KEY_ROLE]      = role
        }
    }

    /** Returns the stored JWT token, or null if not logged in */
    suspend fun getToken(): String? =
        context.dataStore.data.map { it[KEY_TOKEN] }.first()

    /** Returns the stored full name */
    suspend fun getFullName(): String? =
        context.dataStore.data.map { it[KEY_FULL_NAME] }.first()

    /** Returns the stored email */
    suspend fun getEmail(): String? =
        context.dataStore.data.map { it[KEY_EMAIL] }.first()

    /** Returns the stored role */
    suspend fun getRole(): String? =
        context.dataStore.data.map { it[KEY_ROLE] }.first()

    /** Returns true if a valid token is present */
    suspend fun isLoggedIn(): Boolean = !getToken().isNullOrBlank()

    /** Remove all stored session data (logout) */
    suspend fun clearSession() {
        context.dataStore.edit { it.clear() }
    }
}
