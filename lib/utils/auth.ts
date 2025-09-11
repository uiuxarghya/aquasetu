import client from "@/lib/appwrite.config";
import { ensureUserInDB } from "@/lib/utils/db";
import Constants from "expo-constants";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Account, ID } from "react-native-appwrite";

// ============================================================================
// TYPES
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user is currently logged in
 */
export async function getLoginStatus(account: Account): Promise<boolean> {
  try {
    await account.get();
    return true;
  } catch {
    return false;
  }
}

/**
 * Logout the current user session
 */
export async function logoutAccount(account: Account): Promise<boolean> {
  try {
    await account.deleteSession({
      sessionId: "current",
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the app's URL scheme dynamically from app configuration
 * Falls back to 'aquasetu' if not found
 */
export function getAppScheme(): string {
  return (Constants.expoConfig?.scheme as string) || "aquasetu";
}

// ============================================================================
// AUTHENTICATION HOOK
// ============================================================================

/**
 * Custom hook for managing authentication state and operations
 *
 * Usage:
 * ```tsx
 * const { isAuthenticated, user, login, logout, isLoading } = useAuth();
 *
 * // Check auth status
 * if (isLoading) return <LoadingSpinner />;
 *
 * // Login user
 * const handleLogin = async () => {
 *   const result = await login(email, password);
 *   if (result.success) {
 *     // Login successful
 *   }
 * };
 *
 * // Logout user
 * const handleLogout = async () => {
 *   await logout();
 * };
 * ```
 */
export const useAuth = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // ============================================================================
  // APPWRITE ACCOUNT INSTANCE
  // ============================================================================

  const account = useMemo(() => new Account(client), []);

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  /**
   * Check current authentication status
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const isLoggedIn = await getLoginStatus(account);

      if (isLoggedIn) {
        // Get user details
        const userAccount = await account.get();
        const user: User = {
          id: userAccount.$id,
          name: userAccount.name || "",
          email: userAccount.email || "",
        };

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Failed to check authentication status",
      });
    }
  }, [account]);

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      await account.createEmailPasswordSession({
        email,
        password,
      });

      // Get user details after successful login
      const userAccount = await account.get();
      const user: User = {
        id: userAccount.$id,
        name: userAccount.name || "",
        email: userAccount.email || "",
      };

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Register a new user
   */
  const register = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const userId = ID.unique();

      await account.create({
        userId,
        email,
        password,
        name: fullName,
      });

      // Save user to database
      try {
        const [firstName, ...rest] = fullName.split(" ");
        const lastName = rest.join(" ") || "";
        await ensureUserInDB(userId, {
          first_name: firstName,
          last_name: lastName,
          email,
        });
      } catch {
        // Silently handle database errors to avoid interrupting user flow
        console.warn("Database operation failed, but registration succeeded");
      }

      // Auto-login after registration
      await account.createEmailPasswordSession({
        email,
        password,
      });

      // Get user details after successful registration
      const userAccount = await account.get();
      const user: User = {
        id: userAccount.$id,
        name: userAccount.name || "",
        email: userAccount.email || "",
      };

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const result = await logoutAccount(account);

      if (result) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return { success: true };
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Logout failed";
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Refresh authentication status
   */
  const refreshAuth = () => {
    checkAuthStatus();
  };

  /**
   * Clear any authentication errors
   */
  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  // ============================================================================
  // LIFECYCLE EFFECTS
  // ============================================================================

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // ============================================================================
  // HOOK RETURN
  // ============================================================================

  return {
    // State
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,

    // Actions
    login,
    register,
    logout,
    refreshAuth,
    clearError,
    checkAuthStatus,
  };
};
