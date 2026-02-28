import { NextRequest, NextResponse } from "next/server";
import { ai, TEXT_MODEL, IMAGE_MODEL } from "@/lib/gemini";
import { saveComic, getRandomUser, getUserByUsername } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { character, movie, userPrompt, youtubeUrl, username } = body;

        // --- Validation ---
        if (!character || typeof character !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid 'character' field" },
                { status: 400 }
            );
        }
        if (!userPrompt || typeof userPrompt !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid 'userPrompt' field" },
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

        const movieContext = movie ? ` from the movie/show "${movie}"` : "";

        // --- Step 1: Generate the comic script via Gemini ---
        const scriptPrompt = `You are a creative comic book writer known for punchy, witty, and visually dynamic storytelling.

CHARACTER: ${character}${movieContext}
USER'S IDEA: ${userPrompt}

Write a short, punchy comic strip script (4-6 panels). For each panel, include:
- PANEL NUMBER
- VISUAL DESCRIPTION (what we see — be specific about expressions, poses, backgrounds)
- DIALOGUE/CAPTION (speech bubbles or narrator text)

Make it funny, dramatic, or emotionally impactful. The dialogue should feel authentic to the character's voice. Keep it concise — each panel description should be 1-3 sentences max.

Use the character's personality, catchphrases, and mannerisms from ${movie || "their source material"} to make it feel authentic.

Return the script as plain text (no markdown formatting).`;

        const scriptContents: Array<
            { text: string } | { fileData: { fileUri: string } }
        > = [];

        // Include YouTube video for additional context if provided
        if (youtubeUrl && typeof youtubeUrl === "string") {
            scriptContents.push({
                fileData: { fileUri: youtubeUrl },
            });
        }

        scriptContents.push({ text: scriptPrompt });

        const scriptResponse = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: scriptContents,
        });

        const script = scriptResponse.text?.trim();

        if (!script) {
            return NextResponse.json(
                { error: "Failed to generate script — empty response from AI" },
                { status: 502 }
            );
        }

        // --- Step 2: Generate the comic image via Nano Banana 2 ---
        const comicImagePrompt = `Create a vibrant, professional comic strip page based on this script. 
    
The main character is ${character}${movieContext}. Make sure the character is recognizable and visually consistent across all panels.

SCRIPT:
${script}

STYLE INSTRUCTIONS:
- Draw this as a colorful comic book page with clear panel borders
- Use dynamic angles, expressive characters, and bold colors
- Include speech bubbles with the dialogue from the script
- Make it punchy and visually exciting with action lines and dramatic lighting
- The art style should be high-quality comic book / graphic novel style
- Include 4-6 panels arranged in a visually appealing layout on a single page`;

        const imageResponse = await ai.models.generateContent({
            model: IMAGE_MODEL,
            contents: comicImagePrompt,
            config: {
                responseModalities: ["Image"],
            },
        });

        let imageBase64: string | null = null;

        if (imageResponse.candidates?.[0]?.content?.parts) {
            for (const part of imageResponse.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageBase64 = part.inlineData.data ?? null;
                    break;
                }
            }
        }

        if (!imageBase64) {
            return NextResponse.json(
                {
                    error: "Failed to generate comic image",
                    script, // Still return the script so it's not wasted
                },
                { status: 502 }
            );
        }

        // --- Step 3: Save to database ---
        const comic = saveComic({
            username: user.username,
            character,
            movie: movie || "Unknown",
            userPrompt,
            script,
            imageBase64,
            youtubeUrl,
        });

        // --- Step 4: Return the result ---
        return NextResponse.json({
            uid: comic.uid,
            character: comic.character,
            movie: comic.movie,
            script: comic.script,
            imageBase64: comic.image_base64,
            createdAt: comic.created_at,
            user: {
                username: user.username,
                displayName: user.display_name,
            },
        });
    } catch (error) {
        console.error("Comic generation error:", error);
        const message =
            error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
