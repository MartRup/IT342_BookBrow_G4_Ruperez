import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { generateCSRFToken, storeCSRFToken, sessionManager } from './utils/security';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider initializing...');
    
    // Initialize CSRF token
    try {
      const token = generateCSRFToken();
      storeCSRFToken(token);
      console.log('CSRF token initialized');
    } catch (error) {
      console.error('CSRF token initialization failed:', error);
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session retrieved:', session ? 'User logged in' : 'No user');
        setUser(session?.user ?? null);
        
        // Initialize session timeout if user is logged in
        if (session?.user) {
          sessionManager.init();
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
        setUser(session?.user ?? null);
        
        // Handle session events
        if (event === 'SIGNED_IN' && session?.user) {
          sessionManager.init();
        } else if (event === 'SIGNED_OUT') {
          sessionManager.warningShown = false;
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      // Clear any sensitive data
      sessionStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    logout,
  };

  console.log('AuthProvider rendering, loading:', loading);

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px'
        }}>
          Loading...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
