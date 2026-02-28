import { Heart, MessageCircle, Repeat2, Share, ArrowLeft, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";

export default function PostPage({ params }: { params: { id: string } }) {
    // Mock finding a post
    const post = {
        id: params.id,
        author: "FanFic Creator",
        handle: "@creator_ff",
        time: "2h",
        content: "Just generated this alternate ending for Naruto and Sasuke! What if they never fought at the Valley of the End? 🍥⚡️",
        tags: ["#Naruto", "#FanFiction", "#WhatIf"],
        image: true
    };

    const MOCK_COMMENTS = [
        {
            id: 101,
            author: "AnimeFan99",
            handle: "@weeb_master",
            time: "1h",
            text: "This is so cool! I always wondered what would happen if they teamed up against Madara earlier.",
            likes: 42,
            replies: [
                {
                    id: 102,
                    author: "NarutoLover",
                    handle: "@naru_hina",
                    time: "45m",
                    text: "Right? The animation style here looks exactly like Shippuden!",
                    likes: 12,
                    replies: [
                        {
                            id: 104,
                            author: "BorutoHater",
                            handle: "@og_fan",
                            time: "10m",
                            text: "Much better than anything in the new series tbh.",
                            likes: 8,
                            replies: []
                        }
                    ]
                }
            ]
        },
        {
            id: 103,
            author: "SasukeStan",
            handle: "@uchiha_avenger",
            time: "30m",
            text: "The details on Susanoo are incredible.",
            likes: 8,
            replies: []
        }
    ];

    return (
        <div className="flex flex-col w-full min-h-screen pb-20 justify-start bg-white">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-md px-4 py-3 flex items-center gap-6">
                <Link href="/" className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
                    <ArrowLeft size={20} className="text-black" />
                </Link>
                <h1 className="font-bold text-xl text-black">Post</h1>
            </div>

            {/* Main Post */}
            <article className="flex flex-col gap-4 border-b border-zinc-200 px-4 py-4">
                {/* Author Header */}
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-blue-500/20" />
                    <div className="flex flex-col">
                        <span className="font-bold text-black hover:underline cursor-pointer">{post.author}</span>
                        <span className="text-zinc-500 text-sm">{post.handle}</span>
                    </div>
                </div>

                <p className="text-[17px] leading-relaxed text-black mt-2">
                    {post.content}
                </p>

                <div className="text-sm text-blue-500">
                    {post.tags.join(" ")}
                </div>

                {post.image && (
                    <div className="mt-2 aspect-video w-full rounded-2xl border border-zinc-200 bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                        <p className="text-zinc-500 font-mono text-sm">[Generated Comic Output Placeholder]</p>
                    </div>
                )}

                {/* Timestamp */}
                <div className="text-sm text-zinc-500 py-3 border-b border-zinc-100">
                    10:24 AM · Oct 21, 2026 · <span className="text-black font-semibold">124.5K</span> Views
                </div>

                {/* Action Bar */}
                <div className="flex w-full justify-between text-zinc-500 py-3 border-b border-zinc-100 px-2 lg:px-8">
                    <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group cursor-pointer">
                        <div className="rounded-full p-2 group-hover:bg-blue-500/10">
                            <MessageCircle size={20} />
                        </div>
                        <span className="text-sm">12</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-green-500 transition-colors group cursor-pointer">
                        <div className="rounded-full p-2 group-hover:bg-green-500/10">
                            <Repeat2 size={20} />
                        </div>
                        <span className="text-sm">4</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-pink-500 transition-colors group cursor-pointer">
                        <div className="rounded-full p-2 group-hover:bg-pink-500/10">
                            <Heart size={20} />
                        </div>
                        <span className="text-sm">148</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group cursor-pointer">
                        <div className="rounded-full p-2 group-hover:bg-blue-500/10">
                            <Share size={20} />
                        </div>
                    </button>
                </div>
            </article>

            {/* Composition Area */}
            <div className="flex gap-3 px-4 py-4 border-b border-zinc-200">
                <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-200" />
                <div className="flex flex-col w-full gap-2">
                    <textarea
                        placeholder="Post your reply"
                        className="w-full bg-transparent border-none focus:outline-none resize-none min-h-[50px] text-lg text-black placeholder:text-zinc-500"
                    />
                    <div className="flex justify-end">
                        <button className="bg-black text-white font-bold rounded-full px-5 py-2 hover:bg-zinc-800 transition-colors cursor-pointer">
                            Reply
                        </button>
                    </div>
                </div>
            </div>

            {/* Comment Thread (Reddit Style) */}
            <div className="flex flex-col">
                {MOCK_COMMENTS.map(comment => (
                    <CommentThread key={comment.id} comment={comment} isTopLevel={true} />
                ))}
            </div>
        </div>
    );
}

function CommentThread({ comment, isTopLevel }: { comment: any, isTopLevel: boolean }) {
    return (
        <div className={`flex gap-3 px-4 py-3 ${isTopLevel ? 'border-b border-zinc-100' : 'pt-3'}`}>
            {/* Avatar & Thread Line Col */}
            <div className="flex flex-col items-center shrink-0">
                <div className="h-8 w-8 rounded-full bg-zinc-200" />
                {comment.replies && comment.replies.length > 0 && (
                    <div className="w-[2px] flex-grow bg-zinc-200 mt-2 hover:bg-zinc-400 transition-colors cursor-pointer" />
                )}
            </div>

            {/* Comment Body */}
            <div className="flex flex-col w-full pb-2">
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-black hover:underline cursor-pointer">{comment.author}</span>
                    <span className="text-zinc-500 cursor-pointer">{comment.handle}</span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-500 hover:underline cursor-pointer">{comment.time}</span>
                </div>
                <p className="mt-1 text-[15px] text-black">
                    {comment.text}
                </p>

                {/* Reddit Style Actions */}
                <div className="flex items-center gap-4 mt-2 text-zinc-500">
                    <div className="flex items-center gap-1 bg-zinc-100 rounded-full px-2 py-1 cursor-pointer hover:bg-zinc-200 transition-colors">
                        <ArrowUp size={16} className="hover:text-orange-500" />
                        <span className="text-xs font-bold text-black">{comment.likes}</span>
                        <ArrowDown size={16} className="hover:text-indigo-500" />
                    </div>
                    <button className="flex items-center gap-1 text-xs font-bold hover:bg-zinc-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer">
                        <MessageCircle size={16} />
                        Reply
                    </button>
                    <button className="flex items-center gap-1 text-xs font-bold hover:bg-zinc-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer">
                        <Share size={16} />
                        Share
                    </button>
                </div>

                {/* Recursive Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-1">
                        {comment.replies.map((reply: any) => (
                            <CommentThread key={reply.id} comment={reply} isTopLevel={false} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
