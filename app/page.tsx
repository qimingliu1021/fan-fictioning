"use client";

import { Heart, MessageCircle, Repeat2, Share } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Helper to format date relative to now
function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d`;
}

export default function Home() {
  const [comics, setComics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch("/api/feed");
        if (!res.ok) throw new Error("Failed to fetch feed");
        const data = await res.json();
        setComics(data.comics || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
  }, []);

  return (
    <div className="flex flex-col w-full h-full pb-20 sm:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 h-14 flex items-center">
        <h1 className="font-bold text-xl text-black dark:text-white">Home</h1>
      </div>

      {/* Feed Container */}
      <div className="flex flex-col">
        {loading && (
          <div className="py-8 text-center text-zinc-500 font-medium">Loading feed...</div>
        )}
        {error && (
          <div className="py-8 text-center text-red-500 font-medium">{error}</div>
        )}
        {!loading && !error && comics.map((comic) => (
          <Link href={`/post/${comic.uid}`} key={comic.uid} className="block border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
            <article className="flex gap-4 px-4 py-3 cursor-pointer">
              {/* Avatar */}
              <div className="h-10 w-10 shrink-0 rounded-full bg-blue-500/20 overflow-hidden flex items-center justify-center">
                {comic.user?.avatarUrl ? (
                  <img src={comic.user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-blue-700 uppercase">{comic.user?.displayName?.charAt(0) || '?'}</span>
                )}
              </div>

              {/* Post Content */}
              <div className="flex flex-col w-full">
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-bold text-black dark:text-white hover:underline">{comic.user?.displayName || "Unknown"}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">@{comic.user?.username || "unknown"}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">·</span>
                  <span className="text-zinc-500 dark:text-zinc-400 hover:underline">{formatTimeAgo(comic.createdAt)}</span>
                </div>

                <p className="mt-1 text-[15px] leading-tight text-black dark:text-zinc-100">
                  {comic.userPrompt}
                </p>

                <div className="mt-1 text-sm text-blue-500">
                  #{comic.character.replace(/\s+/g, '')} #{comic.movie.replace(/\s+/g, '')}
                </div>

                {/* Comic Image Box */}
                {comic.imageBase64 && (
                  <div className="mt-3 w-full rounded-2xl border border-zinc-200 bg-zinc-900 flex items-center justify-center relative overflow-hidden group">
                    <img src={`data:image/jpeg;base64,${comic.imageBase64}`} alt="Comic" className="w-full h-auto object-contain" />
                  </div>
                )}

                {/* Action Bar */}
                <div className="mt-3 flex w-full justify-between text-zinc-500 max-w-md">
                  <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
                    <div className="rounded-full p-2 group-hover:bg-blue-500/10">
                      <MessageCircle size={18} />
                    </div>
                    <span className="text-xs">0</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-green-500 transition-colors group">
                    <div className="rounded-full p-2 group-hover:bg-green-500/10">
                      <Repeat2 size={18} />
                    </div>
                    <span className="text-xs">0</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-pink-500 transition-colors group">
                    <div className="rounded-full p-2 group-hover:bg-pink-500/10">
                      <Heart size={18} />
                    </div>
                    <span className="text-xs">0</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
                    <div className="rounded-full p-2 group-hover:bg-blue-500/10">
                      <Share size={18} />
                    </div>
                  </button>
                </div>
              </div>
            </article>
          </Link>
        ))}
        {/* End of feed message */}
        {!loading && !error && comics.length > 0 && (
          <div className="py-8 text-center text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
            No more posts to show.
          </div>
        )}
        {!loading && !error && comics.length === 0 && (
          <div className="py-8 text-center text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
            Your feed is empty. Start generating some comics!
          </div>
        )}
      </div>
    </div>
  );
}
