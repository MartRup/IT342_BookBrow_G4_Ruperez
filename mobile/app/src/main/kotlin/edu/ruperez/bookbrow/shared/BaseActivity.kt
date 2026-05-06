package edu.ruperez.bookbrow.shared

import android.os.Bundle
import android.view.MenuItem
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat


abstract class BaseActivity : AppCompatActivity() {


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Apply common theme settings
        setupTheme()
        
        // Setup toolbar if needed
        setupToolbar()
    }


    protected open fun setupTheme() {
        // Override in subclasses if needed
    }


    protected open fun setupToolbar() {
        supportActionBar?.apply {
            setDisplayHomeAsUpEnabled(true)
            setDisplayShowHomeEnabled(true)
        }
    }


    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                onBackPressed()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }


    protected fun showError(message: String) {
        // Override in subclasses to implement error handling
    }


    protected fun showLoading(isLoading: Boolean) {
        // Override in subclasses to implement loading state
    }


    override fun onDestroy() {
        super.onDestroy()
        // Cleanup resources
    }
}
