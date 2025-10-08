"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-[var(--header-color)]">Login</h1>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
          });
          if (res?.error) setError(res.error);
          if (res?.ok) window.location.href = "/";
        }}
      >
        <input
          className="w-full border rounded p-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded p-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full btn btn-primary">Log in</button>
      </form>
      <p className="mt-3 text-sm">
        No account? <Link className="underline" href="/register">Register</Link>
      </p>
    </main>
  );
}


