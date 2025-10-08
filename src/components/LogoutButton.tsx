"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      signOut({ callbackUrl: "/login" });
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="btn btn-outline w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
    >
      🚪 Logout
    </button>
  );
}
