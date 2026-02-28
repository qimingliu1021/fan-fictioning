"use client";

import { Home, Library, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
    const navItems = [
        { label: "Home", href: "/", icon: Home },
        { label: "My Comics", href: "/my-comics", icon: Library },
    ];

    return (
        <aside className="sticky top-0 h-screen w-full max-w-[275px] flex flex-col justify-between py-4 pr-4 hidden sm:flex">
            {/* Single Vertical Navigation Column */}
            <div className="flex flex-col items-start gap-3">
                {/* Logo */}
                <Link href="/" className="mb-4 flex h-12 w-12 items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <div className="text-3xl font-bold font-serif text-black dark:text-white">F</div>
                </Link>

                <nav className="flex flex-col gap-1 w-full">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex w-fit items-center gap-4 rounded-full p-3 text-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-black dark:text-white"
                        >
                            <item.icon size={28} />
                            <span className="font-semibold hidden xl:block">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Action Button */}
                <button
                    className="mt-4 w-[90%] rounded-full bg-blue-500 py-4 text-xl font-bold text-white hover:bg-blue-600 transition-colors cursor-pointer"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-analyze-modal'))}
                >
                    <span className="hidden xl:inline text-lg">Create</span>
                    <span className="xl:hidden flex justify-center">
                        <Sparkles size={24} />
                    </span>
                </button>
            </div>

            {/* User profile placeholder at bottom - optional for now */}
            <div className="mt-auto flex w-full items-center gap-3 rounded-full p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer mb-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-blue-500/20" />
                <div className="flex flex-col">
                    <span className="font-bold text-black dark:text-white leading-tight">Vivek Aher</span>
                    <span className="text-zinc-500 dark:text-zinc-400 text-sm">@vivek_aher</span>
                </div>
                <div className="ml-auto">
                    {/* 3 dots icon */}
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current text-black dark:text-white"><g><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></g></svg>
                </div>
            </div>
        </aside>
    );
}
