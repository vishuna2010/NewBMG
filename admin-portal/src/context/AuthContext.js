import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as authServiceLogin } from '../services/authService'; // Assuming authService.js is in ../services
// We might need jwt-decode if we want to extract info like roles directly from token client-side
// import { jwtDecode } from 'jwt-decode'; // Example: yarn add jwt-decode or npm install jwt-decode

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [user, setUser] = useState(null); // Could be user object from backend or decoded from token
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));
  const [isLoading, setIsLoading] = useState(true); // Start with loading true to check token

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('adminToken');
      if (storedToken) {
        setToken(storedToken);
        // Option 1: Assume token is valid and decode (simple, less secure without validation)
        // try {
        //   const decodedUser = jwtDecode(storedToken);
        //   // You might want to check token expiry here: if (decodedUser.exp * 1000 < Date.now()) ... logout()
        //   setUser({ email: decodedUser.email, role: decodedUser.role, id: decodedUser.id }); // Adjust based on your token payload
        //   setIsAuthenticated(true);
        // } catch (error) {
        //   console.error("Failed to decode token or token expired:", error);
        //   localStorage.removeItem('adminToken');
        //   setToken(null);
        //   setUser(null);
        //   setIsAuthenticated(false);
        // }

        // Option 2: Validate token with backend (more secure) by fetching user profile
        // This requires an endpoint like /api/v1/auth/me that returns user data if token is valid
        // For now, we'll keep it simple: if a token exists, we assume it's valid for this phase.
        // Later, we can add a call to an auth/me endpoint.
        // For this initial setup, we'll just set isAuthenticated based on token presence.
        // A proper implementation would fetch user data using the token.
        // For example:
        // try {
        //   const userData = await getMeService(storedToken); // Create getMeService in authService.js
        //   setUser(userData.data); // Assuming response is { success: true, data: userObject }
        //   setIsAuthenticated(true);
        // } catch (error) {
        //   console.error("Token validation failed or session expired:", error);
        //   localStorage.removeItem('adminToken');
        //   setToken(null);
        //   setUser(null);
        //   setIsAuthenticated(false);
        // }

        // Simplified initial load: if token is in localStorage, assume authenticated.
        // User object will be set upon login. We could try to fetch it here too.
        // For now, role/user details might be missing on initial load until a /me endpoint is called or re-login.
        setIsAuthenticated(true);
        // To get user details on load, you'd typically call a 'getMe' service here.
        // For example, if you have a 'getMe' service:
        // if (authServiceGetMe) { // Check if service exists
        //    try {
        //        const meResponse = await authServiceGetMe(storedToken);
        //        if(meResponse.success) setUser(meResponse.data);
        //    } catch (e) { console.error("Failed to fetch user on load", e); }
        // }

      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []); // Empty dependency array so it runs only once on mount

  // Login function (to be implemented in next step)
  const login = async (email, password) => {
    try {
      const response = await authServiceLogin(email, password); // Call the service
      if (response.success && response.token && response.data) {
        localStorage.setItem('adminToken', response.token);
        setToken(response.token);
        setUser(response.data); // Assuming response.data is the user object
        setIsAuthenticated(true);
        return response; // Return the full response for LoginPage to handle navigation or messages
      } else {
        // This path might be taken if backend returns success:false explicitly
        // or if token/data is missing in a success:true response.
        // authServiceLogin should throw an error for non-ok HTTP statuses,
        // which would be caught by the catch block below.
        const errorMessage = response.error || 'Login failed: Invalid response from server.';
        console.error("AuthContext Login Error:", errorMessage, response);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("AuthContext Login Exception:", error);
      // Clear any partial auth state if login fails badly
      localStorage.removeItem('adminToken');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      throw error; // Re-throw the error so LoginPage can catch it and display message
    }
  };

  // Logout function (to be implemented in next step)
  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    // Navigation to /login will be handled by the component calling logout or by ProtectedRoute
    console.log("User logged out. Token and user state cleared.");
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isLoading, login, logout, setUser, setToken, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) { // Check for null as well
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
