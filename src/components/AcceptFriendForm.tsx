"use client";

import { useState } from "react";

interface AcceptFriendFormProps {
  friendshipId: string;
}

export default function AcceptFriendForm({ friendshipId }: AcceptFriendFormProps) {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/friends/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId }),
      });

      if (res.ok) {
        setAccepted(true);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to accept friend request");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert("Failed to accept friend request");
    } finally {
      setLoading(false);
    }
  };

  if (accepted) {
    return (
      <span className="text-green-600 dark:text-green-400 text-sm">
        ✓ Accepted
      </span>
    );
  }

  return (
    <button
      onClick={handleAccept}
      disabled={loading}
      className="btn btn-outline"
    >
      {loading ? "Accepting..." : "Accept"}
    </button>
  );
}
