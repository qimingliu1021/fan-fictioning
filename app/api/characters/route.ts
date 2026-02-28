import { NextRequest, NextResponse } from "next/server";
import { ai, TEXT_MODEL } from "@/lib/gemini";
import { getCharactersByYoutubeUrl, saveCharacters } from "@/lib/db";

const YOUTUBE_URL_REGEX =
    /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { youtubeUrl } = body;

        if (!youtubeUrl || typeof youtubeUrl !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid 'youtubeUrl' field" },
                { status: 400 }
            );
        }

        if (!YOUTUBE_URL_REGEX.test(youtubeUrl)) {
            return NextResponse.json(
                { error: "Invalid YouTube URL format" },
                { status: 400 }
            );
        }

        // --- Check DB cache first ---
        const cached = getCharactersByYoutubeUrl(youtubeUrl);
        if (cached.length > 0) {
            const characters = cached.map((c) => ({
                name: c.name,
                movie: c.movie,
                description: c.description,
            }));
            return NextResponse.json({ characters, youtubeUrl, cached: true });
        }

        // --- Not cached — call Gemini ---
        const prompt = `You are a movie and TV expert. Watch this video clip carefully and identify all recognizable characters that appear in it. For each character, provide:
- name: The character's name
- movie: The movie or TV show the character is from
- description: A brief 1-2 sentence description of the character

Return ONLY a valid JSON array with no markdown formatting, no code fences, no extra text. Example format:
[{"name": "Tony Stark", "movie": "Iron Man", "description": "Genius billionaire inventor who builds a powered suit of armor."}]

If you cannot identify any characters, return an empty array: []`;

        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: [
                {
                    fileData: {
                        fileUri: youtubeUrl,
                    },
                },
                { text: prompt },
            ],
        });

        const rawText = response.text?.trim() ?? "[]";

        // Strip any markdown code fences the model might add
        const cleaned = rawText
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        let characters: Array<{
            name: string;
            movie: string;
            description: string;
        }>;

        try {
            characters = JSON.parse(cleaned);
            if (!Array.isArray(characters)) {
                characters = [];
            }
        } catch {
            // If parsing fails, return raw text so the caller can debug
            return NextResponse.json(
                { error: "Failed to parse character data from AI response", rawText },
                { status: 502 }
            );
        }

        // --- Save to DB if we got characters ---
        if (characters.length > 0) {
            saveCharacters(youtubeUrl, characters);
        }

        return NextResponse.json({ characters, youtubeUrl, cached: false });
    } catch (error) {
        console.error("Character recognition error:", error);
        const message =
            error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

