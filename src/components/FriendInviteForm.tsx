"use client";

import { useState } from "react";

export default function FriendInviteForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/friends/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Friend request sent successfully!");
        setEmail("");
      } else {
        setMessage(data.error || "Failed to send friend request");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      setMessage("Failed to send friend request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Invite by email"
          className="flex-1 border p-2 rounded bg-white dark:bg-white dark:text-black"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Sending..." : "Invite"}
        </button>
      </form>
      {message && (
        <div className={`mt-2 text-sm p-2 rounded ${
          message.includes("successfully") 
            ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" 
            : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
