import { NextRequest, NextResponse } from "next/server";
import { ai, IMAGE_MODEL } from "@/lib/gemini";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { imageBase64, compositedImageBase64, prompt } = body;

        if (!imageBase64 || typeof imageBase64 !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid 'imageBase64' field" },
                { status: 400 }
            );
        }
        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid 'prompt' field" },
                { status: 400 }
            );
        }

        // Use the composited image (original + red mask overlay) if available,
        // otherwise fall back to the plain original image
        const imageToSend = compositedImageBase64 || imageBase64;

        const editPrompt = `Edit this image. The user has drawn red highlights/circles on the image to indicate which areas they want modified. 
Focus your edits ONLY on the red-highlighted areas. Keep everything else unchanged as much as possible.

User's edit instruction: ${prompt}

Important: Preserve the overall style, colors, and composition of the original image. Only modify the areas indicated by the red highlights according to the user's instruction.`;

        const response = await ai.models.generateContent({
            model: IMAGE_MODEL,
            contents: [
                {
                    text: editPrompt,
                },
                {
                    inlineData: {
                        mimeType: "image/png",
                        data: imageToSend,
                    },
                },
            ],
            config: {
                responseModalities: ["Image"],
            },
        });

        let editedImageBase64: string | null = null;

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    editedImageBase64 = part.inlineData.data ?? null;
                    break;
                }
            }
        }

        if (!editedImageBase64) {
            return NextResponse.json(
                { error: "Failed to generate edited image — no image in response" },
                { status: 502 }
            );
        }

        return NextResponse.json({
            imageBase64: editedImageBase64,
        });
    } catch (error) {
        console.error("Image edit error:", error);
        const message =
            error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
