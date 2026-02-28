"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Youtube, CheckCircle2 } from "lucide-react";

type ModalState = "closed" | "input" | "loading-analysis" | "story" | "loading-comic" | "result";

export default function AnalyzeModal() {
    const [modalState, setModalState] = useState<ModalState>("closed");
    const [url, setUrl] = useState("");
    const [characters, setCharacters] = useState<string[]>([]);
    const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
    const [storyInput, setStoryInput] = useState("");

    // Listen for the custom event from the Sidebar to open the modal
    useEffect(() => {
        const handleOpen = () => setModalState("input");
        window.addEventListener("open-analyze-modal", handleOpen);
        return () => window.removeEventListener("open-analyze-modal", handleOpen);
    }, []);

    const closeModal = () => {
        setModalState("closed");
        // Reset state after a brief delay for animation smoothness (if we add animations later)
        setTimeout(() => {
            setUrl("");
            setCharacters([]);
            setSelectedCharacter(null);
            setStoryInput("");
        }, 300);
    };

    const handleAnalyze = async () => {
        if (!url) return;
        setModalState("loading-analysis");
        // Simulate API Call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setCharacters(["Naruto Uzumaki", "Sasuke Uchiha", "Sakura Haruno"]);
        setModalState("story");
    };

    const handleGenerate = async () => {
        if (!storyInput || !selectedCharacter) return;
        setModalState("loading-comic");
        // Simulate API Call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setModalState("result");
    };

    if (modalState === "closed") return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-[600px] rounded-2xl bg-black border border-zinc-800 shadow-2xl overflow-hidden sm:min-h-[400px]">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                    <button
                        onClick={closeModal}
                        className="rounded-full p-2 hover:bg-zinc-900 transition-colors"
                    >
                        <X size={20} className="text-white" />
                    </button>
                    <span className="font-bold text-white">Create Fan Fiction</span>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>

                {/* Content Area */}
                <div className="p-6">

                    {/* STEP 1: INPUT */}
                    {modalState === "input" && (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
                                    <Youtube size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-2">Analyze YouTube Video</h3>
                                    <p className="text-zinc-500 text-sm mb-4">Paste a YouTube link to extract characters and settings for your fan fiction.</p>
                                    <input
                                        type="text"
                                        placeholder="https://youtube.com/watch?v=..."
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <button
                                className="self-end rounded-full bg-white px-6 py-2 font-bold text-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                onClick={handleAnalyze}
                                disabled={!url}
                            >
                                Analyze
                            </button>
                        </div>
                    )}

                    {/* LOADING ANALYSIS */}
                    {modalState === "loading-analysis" && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Sparkles className="animate-pulse text-blue-500" size={48} />
                            <p className="text-zinc-400 font-medium">Extracting characters from video...</p>
                        </div>
                    )}

                    {/* STEP 2: CHARACTER SELECTION & STORY */}
                    {modalState === "story" && (
                        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-lg font-bold mb-3">1. Select Character</h3>
                                <div className="flex flex-wrap gap-2">
                                    {characters.map(char => (
                                        <button
                                            key={char}
                                            onClick={() => setSelectedCharacter(char)}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors border ${selectedCharacter === char
                                                    ? "bg-blue-500 border-blue-500 text-white"
                                                    : "border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                                                }`}
                                        >
                                            {char}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold mb-3">2. Write your Fan Fiction</h3>
                                <textarea
                                    placeholder="What happens to them?"
                                    value={storyInput}
                                    onChange={(e) => setStoryInput(e.target.value)}
                                    className="w-full min-h-[120px] rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-white resize-none focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <button
                                className="w-full rounded-full bg-blue-500 py-3 font-bold text-white hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                onClick={handleGenerate}
                                disabled={!storyInput || !selectedCharacter}
                            >
                                <Sparkles size={20} />
                                Generate Comic
                            </button>
                        </div>
                    )}

                    {/* LOADING COMIC */}
                    {modalState === "loading-comic" && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-blue-500" />
                            <p className="text-zinc-400 font-medium tracking-wide">Drawing your comic...</p>
                        </div>
                    )}

                    {/* STEP 3: RESULT */}
                    {modalState === "result" && (
                        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                            <div className="flex items-center justify-center bg-zinc-900 rounded-xl aspect-video border border-zinc-800 relative overflow-hidden group">
                                <p className="text-zinc-500 font-mono">[Comic Image Generated for: {selectedCharacter}]</p>
                                <div className="absolute top-2 right-2 flex bg-black/60 backdrop-blur-md rounded-full px-3 py-1 items-center gap-1 text-xs text-green-400 font-medium">
                                    <CheckCircle2 size={14} /> Success
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    className="w-full rounded-full bg-blue-500 py-3 font-bold text-white hover:bg-blue-600 transition-colors"
                                    onClick={() => {
                                        console.log("Mock: Posted to feed");
                                        closeModal();
                                    }}
                                >
                                    Post to Feed
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        className="flex-1 rounded-full border border-zinc-800 bg-zinc-900 py-3 font-bold text-white hover:bg-zinc-800 transition-colors border-zinc-700"
                                        onClick={() => {
                                            console.log("Mock: Saved comic");
                                            closeModal();
                                        }}
                                    >
                                        Save Comic
                                    </button>
                                    <button
                                        className="flex-1 rounded-full border border-transparent hover:bg-red-500/10 py-3 font-bold text-red-500 transition-colors"
                                        onClick={closeModal}
                                    >
                                        Discard
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
