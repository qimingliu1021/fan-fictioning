import { NextRequest, NextResponse } from "next/server";
import { addComment, getRandomUser, getUserByUsername } from "@/lib/db";

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ uid: string }> }
) {
    try {
        const { uid: comicUid } = await context.params;

        if (!comicUid) {
            return NextResponse.json(
                { error: "Comic UID is required" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { text, parentId, username } = body;

        if (!text || typeof text !== "string" || text.trim() === "") {
            return NextResponse.json(
                { error: "Comment text is required" },
                { status: 400 }
            );
        }

        // Resolve user — use provided username or pick a random mock user
        const user = username ? getUserByUsername(username) : getRandomUser();
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const newComment = addComment({
            comicUid,
            username: user.username,
            text: text.trim(),
            parentId: parentId || undefined
        });

        return NextResponse.json({
            uid: newComment.uid,
            text: newComment.text,
            likes: newComment.likes,
            createdAt: newComment.created_at,
            user: {
                username: newComment.username,
                displayName: newComment.display_name,
                avatarUrl: newComment.avatar_url,
            },
            replies: [],
        });
    } catch (error) {
        console.error("Post comment error:", error);
        const message =
            error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
