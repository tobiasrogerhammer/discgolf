"use client";
import React from "react";

export default function Header({ title, chip }: { title: string; chip?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 bg-[var(--background)]/90 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/70 border-b">
      <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold dark:text-white text-[#002F45]">{title}</h1>
        {chip}
      </div>
    </header>
  );
}


