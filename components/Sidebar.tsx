"use client";

import { Home, Library, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
    return (
        <aside className="sticky top-0 h-screen w-full max-w-[275px] flex-col justify-between py-4 pr-4 hidden sm:flex">
            <div className="flex flex-col items-start gap-4">
                {/* Logo Placeholder */}
                <Link
                    href="/"
                    className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-zinc-900 transition-colors"
                >
                    <span className="text-3xl font-extrabold text-white">F</span>
                </Link>

                {/* Navigation */}
                <nav className="flex w-full flex-col gap-2 mt-2">
                    <Link
                        href="/"
                        className="flex items-center gap-4 rounded-full px-4 py-3 text-xl hover:bg-zinc-900 transition-colors w-fit"
                    >
                        <Home size={28} />
                        <span className="font-semibold hidden xl:block">Home</span>
                    </Link>

                    <Link
                        href="/my-comics"
                        className="flex items-center gap-4 rounded-full px-4 py-3 text-xl hover:bg-zinc-900 transition-colors w-fit"
                    >
                        <Library size={28} />
                        <span className="font-semibold hidden xl:block">My Comics</span>
                    </Link>
                </nav>

                {/* Action Button */}
                <button
                    className="mt-4 w-[90%] rounded-full bg-blue-500 py-4 text-center font-bold text-white transition-colors hover:bg-blue-600 shadow-sm"
                    onClick={() => {
                        // TODO: Open Analyze Modal
                        window.dispatchEvent(new CustomEvent("open-analyze-modal"));
                    }}
                >
                    <span className="hidden xl:inline text-lg">Create</span>
                    <span className="xl:hidden flex justify-center">
                        <Sparkles size={24} />
                    </span>
                </button>
            </div>

            {/* User profile placeholder at bottom - optional for now */}
            <div className="mt-auto">
                <div className="flex items-center gap-3 rounded-full p-2 hover:bg-zinc-900 transition-colors cursor-pointer">
                    <div className="h-10 w-10 rounded-full bg-zinc-800" />
                    <div className="hidden flex-col xl:flex">
                        <span className="text-sm font-bold text-white">User</span>
                        <span className="text-sm text-zinc-500">@user</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
