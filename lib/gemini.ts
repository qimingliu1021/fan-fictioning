import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
}

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Model for video understanding and text generation (script writing)
export const TEXT_MODEL = "gemini-3-flash-preview";

// Model for image generation (Nano Banana 2)
export const IMAGE_MODEL = "gemini-3.1-flash-image-preview";
