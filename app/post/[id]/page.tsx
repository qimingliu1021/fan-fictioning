"use client";

import { Heart, MessageCircle, Repeat2, Share, ArrowLeft, ArrowUp, ArrowDown } from "lucide-react";
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

export default function PostPage({ params }: { params: { id: string } }) {
    const comicUid = params.id;
    const [comic, setComic] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [replyText, setReplyText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Which comment ID we are replying to (null = top level reply to the post)
    const [replyingToId, setReplyingToId] = useState<string | null>(null);

    const fetchComic = async () => {
        try {
            const res = await fetch(`/api/comic/${comicUid}`);
            if (!res.ok) throw new Error("Failed to fetch comic details");
            const data = await res.json();
            setComic(data.comic);
            setComments(data.comments || []);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComic();
    }, [comicUid]);

    const handlePostComment = async () => {
        if (!replyText.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/comic/${comicUid}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: replyText,
                    parentId: replyingToId,
                    username: "moviebuff42" // mock logged-in user
                })
            });
            if (!res.ok) throw new Error("Failed to post comment");

            // Reload to get updated nested tree
            await fetchComic();
            setReplyText("");
            setReplyingToId(null);
        } catch (err) {
            console.error(err);
            alert("Failed to post comment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-zinc-500">Loading post...</div>;
    if (error || !comic) return <div className="p-8 text-center text-red-500">{error || "Post not found."}</div>;

    const dateStr = new Date(comic.createdAt).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric"
    });

    return (
        <div className="flex flex-col w-full min-h-screen pb-20 justify-start bg-white dark:bg-black">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 py-3 flex items-center gap-6">
                <Link href="/" className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                    <ArrowLeft size={20} className="text-black dark:text-white" />
                </Link>
                <h1 className="font-bold text-xl text-black dark:text-white">Post</h1>
            </div>

            {/* Main Post */}
            <article className="flex flex-col gap-4 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
                {/* Author Header */}
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-blue-500/20 overflow-hidden flex items-center justify-center">
                        {comic.user?.avatarUrl ? (
                            <img src={comic.user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-xl text-blue-700 uppercase">{comic.user?.displayName?.charAt(0) || '?'}</span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-black dark:text-white hover:underline cursor-pointer">{comic.user?.displayName || "Unknown"}</span>
                        <span className="text-zinc-500 dark:text-zinc-400 text-sm">@{comic.user?.username || "unknown"}</span>
                    </div>
                </div>

                <p className="text-[17px] leading-relaxed text-black dark:text-zinc-100 mt-2">
                    {comic.userPrompt}
                </p>

                <div className="text-sm text-blue-500">
                    #{comic.character.replace(/\s+/g, '')} #{comic.movie.replace(/\s+/g, '')}
                </div>

                {comic.imageBase64 && (
                    <div className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                        <img src={`data:image/jpeg;base64,${comic.imageBase64}`} alt="Comic" className="w-full h-auto object-contain" />
                    </div>
                )}

                {/* Timestamp */}
                <div className="text-sm text-zinc-500 dark:text-zinc-400 py-3 border-b border-zinc-100 dark:border-zinc-800">
                    {dateStr} · <span className="text-black dark:text-white font-semibold">0</span> Views
                </div>

                {/* Action Bar */}
                <div className="flex w-full justify-between text-zinc-500 dark:text-zinc-400 py-3 border-b border-zinc-100 dark:border-zinc-800 px-2 lg:px-8">
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
            <div className="flex gap-3 px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="h-10 w-10 shrink-0 rounded-full bg-blue-500/20 overflow-hidden flex items-center justify-center">
                    <span className="font-bold text-blue-700 uppercase">M</span>
                </div>
                <div className="flex flex-col w-full gap-2">
                    {replyingToId && (
                        <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-md">
                            <span>Replying to thread...</span>
                            <button className="hover:text-black dark:hover:text-white font-bold" onClick={() => setReplyingToId(null)}>Cancel</button>
                        </div>
                    )}
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={replyingToId ? "Write a reply..." : "Post your reply"}
                        className="w-full bg-transparent border-none focus:outline-none resize-none min-h-[50px] text-lg text-black dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
                    />
                    <div className="flex justify-end">
                        <button
                            disabled={!replyText.trim() || isSubmitting}
                            onClick={handlePostComment}
                            className="bg-black text-white font-bold rounded-full px-5 py-2 hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Reply
                        </button>
                    </div>
                </div>
            </div>

            {/* Comment Thread (Reddit Style) */}
            <div className="flex flex-col">
                {comments.length === 0 ? (
                    <div className="py-8 text-center text-zinc-500 dark:text-zinc-400 bg-white dark:bg-black">No comments yet. Be the first to reply!</div>
                ) : (
                    comments.map(comment => (
                        <CommentThread
                            key={comment.uid}
                            comment={comment}
                            isTopLevel={true}
                            onReply={(id) => {
                                setReplyingToId(id);
                                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                            }}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function CommentThread({ comment, isTopLevel, onReply }: { comment: any, isTopLevel: boolean, onReply: (id: string) => void }) {
    return (
        <div className={`flex gap-3 px-4 py-3 ${isTopLevel ? 'border-b border-zinc-100 dark:border-zinc-800' : 'pt-3'}`}>
            {/* Avatar & Thread Line Col */}
            <div className="flex flex-col items-center shrink-0">
                <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                {comment.replies && comment.replies.length > 0 && (
                    <div className="w-[2px] flex-grow bg-zinc-200 dark:bg-zinc-800 mt-2 hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors cursor-pointer" />
                )}
            </div>

            {/* Comment Body */}
            <div className="flex flex-col w-full pb-2">
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-black dark:text-white hover:underline cursor-pointer">{comment.user?.displayName || "Unknown"}</span>
                    <span className="text-zinc-500 dark:text-zinc-400 cursor-pointer">@{comment.user?.username || "unknown"}</span>
                    <span className="text-zinc-500 dark:text-zinc-400">·</span>
                    <span className="text-zinc-500 dark:text-zinc-400 hover:underline cursor-pointer">{formatTimeAgo(comment.createdAt)}</span>
                </div>
                <p className="mt-1 text-[15px] text-black dark:text-zinc-100">
                    {comment.text}
                </p>

                {/* Reddit Style Actions */}
                <div className="flex items-center gap-4 mt-2 text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-full px-2 py-1 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                        <ArrowUp size={16} className="hover:text-orange-500" />
                        <span className="text-xs font-bold text-black dark:text-white">{comment.likes}</span>
                        <ArrowDown size={16} className="hover:text-indigo-500" />
                    </div>
                    <button
                        onClick={() => onReply(comment.uid)}
                        className="flex items-center gap-1 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                    >
                        <MessageCircle size={16} />
                        Reply
                    </button>
                    <button className="flex items-center gap-1 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-full transition-colors cursor-pointer">
                        <Share size={16} />
                        Share
                    </button>
                </div>

                {/* Recursive Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-1">
                        {comment.replies.map((reply: any) => (
                            <CommentThread key={reply.uid} comment={reply} isTopLevel={false} onReply={onReply} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
