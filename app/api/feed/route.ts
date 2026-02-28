import { NextRequest, NextResponse } from "next/server";
import { getLatestComics } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
        const cursor = searchParams.get("cursor") || undefined; // uid of last comic seen

        const comics = getLatestComics(limit, cursor);

        const feed = comics.map((c) => ({
            uid: c.uid,
            character: c.character,
            movie: c.movie,
            userPrompt: c.user_prompt,
            script: c.script,
            imageBase64: c.image_base64,
            createdAt: c.created_at,
            user: {
                username: c.username,
                displayName: c.display_name,
                avatarUrl: c.avatar_url,
            },
        }));

        const nextCursor = comics.length === limit ? comics[comics.length - 1].uid : null;

        return NextResponse.json({
            comics: feed,
            nextCursor,
        });
    } catch (error) {
        console.error("Feed error:", error);
        const message =
            error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
