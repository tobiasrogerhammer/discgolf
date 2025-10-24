"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      setIsLoggingOut(true);
      try {
        // Sign out without redirect first
        await signOut({ redirect: false });
        // Clear any local storage or session data
        localStorage.clear();
        sessionStorage.clear();
        // Use a more reliable redirect method
        const currentOrigin = window.location.origin;
        const loginUrl = `${currentOrigin}/login`;
        window.location.href = loginUrl;
      } catch (error) {
        console.error("Logout error:", error);
        // Force redirect to login page even if signOut fails
        const currentOrigin = window.location.origin;
        const loginUrl = `${currentOrigin}/login`;
        window.location.href = loginUrl;
      } finally {
        setIsLoggingOut(false);
      }
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="btn btn-outline w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50"
    >
      {isLoggingOut ? "⏳ Logging out..." : "🚪 Logout"}
    </button>
  );
}
