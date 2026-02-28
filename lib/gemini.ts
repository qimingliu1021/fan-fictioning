import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY environment variable is not set. Comic generation will fail, but the app won't crash.");
}

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy_key_for_ui_testing" });

// Model for video understanding and text generation (script writing)
export const TEXT_MODEL = "gemini-3-flash-preview";

// Model for image generation (Nano Banana 2)
export const IMAGE_MODEL = "gemini-3.1-flash-image-preview";
