import { Heart, MessageCircle, Repeat2, Share } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const MOCK_POSTS = [
    {
      id: 1,
      author: "FanFic Creator",
      handle: "@creator_ff",
      time: "2h",
      content: "Just generated this alternate ending for Naruto and Sasuke! What if they never fought at the Valley of the End? 🍥⚡️",
      tags: ["#Naruto", "#FanFiction", "#WhatIf"],
      image: true
    },
    {
      id: 2,
      author: "Anime Enjoyer",
      handle: "@weeb_life",
      time: "5h",
      content: "The comic generator is literally insane. I put in a One Piece clip and the generated art for Zoro looks officially drawn. 🗡️",
      tags: ["#OnePiece", "#Zoro"],
      image: false
    },
  ];

  return (
    <div className="flex flex-col w-full h-full pb-20 sm:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="flex w-full">
          <div className="flex flex-1 items-center justify-center h-14 hover:bg-zinc-100 transition-colors cursor-pointer relative">
            <span className="font-bold text-black">For you</span>
            <div className="absolute bottom-0 h-1 w-16 rounded-full bg-blue-500" />
          </div>
          <div className="flex flex-1 items-center justify-center h-14 hover:bg-zinc-100 transition-colors cursor-pointer text-zinc-500">
            <span className="font-medium">Following</span>
          </div>
        </div>
      </div>

      {/* Feed Container */}
      <div className="flex flex-col">
        {MOCK_POSTS.map((post) => (
          <Link href={`/post/${post.id}`} key={post.id} className="block border-b border-zinc-200 hover:bg-zinc-50 transition-colors">
            <article className="flex gap-4 px-4 py-3 cursor-pointer">
              {/* Avatar */}
              <div className="h-10 w-10 shrink-0 rounded-full bg-blue-500/20" />

              {/* Post Content */}
              <div className="flex flex-col w-full">
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-bold text-black hover:underline">{post.author}</span>
                  <span className="text-zinc-500">{post.handle}</span>
                  <span className="text-zinc-500">·</span>
                  <span className="text-zinc-500 hover:underline">{post.time}</span>
                </div>

                <p className="mt-1 text-[15px] leading-tight text-black">
                  {post.content}
                </p>

                <div className="mt-1 text-sm text-blue-500">
                  {post.tags.join(" ")}
                </div>

                {/* Mock Image Box */}
                {post.image && (
                  <div className="mt-3 aspect-video w-full rounded-2xl border border-zinc-200 bg-zinc-900 flex items-center justify-center relative overflow-hidden group">
                    <p className="text-zinc-500 font-mono text-sm">[Generated Comic Output Placeholder]</p>
                  </div>
                )}

                {/* Action Bar */}
                <div className="mt-3 flex w-full justify-between text-zinc-500 max-w-md">
                  <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
                    <div className="rounded-full p-2 group-hover:bg-blue-500/10">
                      <MessageCircle size={18} />
                    </div>
                    <span className="text-xs">12</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-green-500 transition-colors group">
                    <div className="rounded-full p-2 group-hover:bg-green-500/10">
                      <Repeat2 size={18} />
                    </div>
                    <span className="text-xs">4</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-pink-500 transition-colors group">
                    <div className="rounded-full p-2 group-hover:bg-pink-500/10">
                      <Heart size={18} />
                    </div>
                    <span className="text-xs">148</span>
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
        <div className="py-8 text-center text-zinc-600 border-b border-zinc-200">
          No more posts to show.
        </div>
      </div>
    </div>
  );
}
