"use client";

import { Home, Library, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
    return (
        <aside className="sticky top-0 h-screen w-full max-w-[275px] flex flex-col justify-between py-4 pr-4 hidden sm:flex">
            {/* Single Vertical Navigation Column */}
            <div className="flex flex-col items-start gap-3">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center justify-center rounded-full bg-white hover:bg-zinc-100 transition-colors px-4 py-3 w-fit"
                >
                    <span className="text-3xl font-extrabold text-black leading-none w-[28px] flex justify-center">F</span>
                </Link>

                <Link
                    href="/"
                    className="flex items-center gap-4 rounded-full px-4 py-3 text-xl hover:bg-zinc-100 transition-colors w-fit text-black"
                >
                    <Home size={28} />
                    <span className="font-semibold hidden xl:block text-black">Home</span>
                </Link>

                <Link
                    href="/my-comics"
                    className="flex items-center gap-4 rounded-full px-4 py-3 text-xl hover:bg-zinc-100 transition-colors w-fit text-black"
                >
                    <Library size={28} />
                    <span className="font-semibold hidden xl:block text-black">My Comics</span>
                </Link>

                {/* Action Button */}
                <button
                    className="w-full max-w-[220px] rounded-full bg-black py-4 text-center font-bold text-white transition-colors hover:bg-zinc-800 shadow-sm cursor-pointer"
                    onClick={() => {
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
                <div className="flex items-center gap-3 rounded-full p-2 hover:bg-zinc-200 transition-colors cursor-pointer">
                    <div className="h-10 w-10 rounded-full bg-zinc-800" />
                    <div className="hidden flex-col xl:flex">
                        <span className="text-sm font-bold text-black">User</span>
                        <span className="text-sm text-zinc-500">@user</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
