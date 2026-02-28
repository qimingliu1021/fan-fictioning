import { NextRequest, NextResponse } from "next/server";
import { getComicByUid, getCommentsByComicUid } from "@/lib/db";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ uid: string }> }
) {
    try {
        const { uid } = await context.params;

        if (!uid) {
            return NextResponse.json(
                { error: "Comic UID is required" },
                { status: 400 }
            );
        }

        const comic = getComicByUid(uid);

        if (!comic) {
            return NextResponse.json(
                { error: "Comic not found" },
                { status: 404 }
            );
        }

        const rawComments = getCommentsByComicUid(uid);

        // Build nested comment tree
        const commentMap = new Map<string, any>();
        const topLevelComments: any[] = [];

        // First pass: create all comment objects
        rawComments.forEach((c) => {
            commentMap.set(c.uid, {
                uid: c.uid,
                text: c.text,
                likes: c.likes,
                createdAt: c.created_at,
                user: {
                    username: c.username,
                    displayName: c.display_name,
                    avatarUrl: c.avatar_url,
                },
                replies: [],
                parentId: c.parent_id
            });
        });

        // Second pass: wire up the tree
        Array.from(commentMap.values()).forEach((comment) => {
            if (comment.parentId) {
                const parent = commentMap.get(comment.parentId);
                if (parent) {
                    parent.replies.push(comment);
                } else {
                    // Orphaned reply, treat as top-level
                    topLevelComments.push(comment);
                }
            } else {
                topLevelComments.push(comment);
            }
        });

        return NextResponse.json({
            comic: {
                uid: comic.uid,
                character: comic.character,
                movie: comic.movie,
                userPrompt: comic.user_prompt,
                script: comic.script,
                imageBase64: comic.image_base64,
                createdAt: comic.created_at,
                user: {
                    username: comic.username,
                    displayName: comic.display_name,
                    avatarUrl: comic.avatar_url,
                },
            },
            comments: topLevelComments,
        });
    } catch (error) {
        console.error("Fetch comic error:", error);
        const message =
            error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
