package com.example.bookbrow

import android.os.Bundle
import android.view.MenuItem
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat

/**
 * BaseActivity is the base class for all activities in the BookBrow application.
 * It provides common functionality and styling that should be shared across all screens.
 * 
 * Features:
 * - Common toolbar setup
 * - Consistent theme handling
 * - Lifecycle management
 * - Common error handling
 */
abstract class BaseActivity : AppCompatActivity() {

    /**
     * Called when the activity is first created.
     * Initialize common UI elements and settings here.
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Apply common theme settings
        setupTheme()
        
        // Setup toolbar if needed
        setupToolbar()
    }

    /**
     * Setup the theme for the activity
     */
    protected open fun setupTheme() {
        // Override in subclasses if needed
    }

    /**
     * Setup the toolbar for the activity
     */
    protected open fun setupToolbar() {
        supportActionBar?.apply {
            setDisplayHomeAsUpEnabled(true)
            setDisplayShowHomeEnabled(true)
        }
    }

    /**
     * Handle back navigation from toolbar
     */
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                onBackPressed()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    /**
     * Show an error message to the user
     */
    protected fun showError(message: String) {
        // Override in subclasses to implement error handling
    }

    /**
     * Show a loading state
     */
    protected fun showLoading(isLoading: Boolean) {
        // Override in subclasses to implement loading state
    }

    /**
     * Common cleanup when activity is destroyed
     */
    override fun onDestroy() {
        super.onDestroy()
        // Cleanup resources
    }
}
