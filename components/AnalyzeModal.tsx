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
    const [generatedComic, setGeneratedComic] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
            setGeneratedComic(null);
            setErrorMsg(null);
        }, 300);
    };

    const handleAnalyze = async () => {
        if (!url) return;
        setModalState("loading-analysis");
        setErrorMsg(null);
        try {
            const res = await fetch("/api/characters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ youtubeUrl: url })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to analyze characters");

            setCharacters(data.characters.map((c: any) => c.name));
            setModalState("story");
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message);
            setModalState("input"); // go back to input on error
        }
    };

    const handleGenerate = async () => {
        if (!storyInput || !selectedCharacter) return;
        setModalState("loading-comic");
        setErrorMsg(null);
        try {
            const res = await fetch("/api/comic", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    character: selectedCharacter,
                    userPrompt: storyInput,
                    youtubeUrl: url,
                    username: "moviebuff42" // mock logged-in user
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate comic");

            setGeneratedComic(data);
            setModalState("result");
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message);
            setModalState("story"); // go back to story input on error
        }
    };

    if (modalState === "closed") return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-[500px] rounded-2xl bg-white border border-zinc-200 shadow-2xl overflow-hidden min-h-[300px]">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
                    <button
                        onClick={closeModal}
                        className="rounded-full p-2 hover:bg-zinc-100 transition-colors"
                    >
                        <X size={20} className="text-black" />
                    </button>
                    <span className="font-bold text-black">
                        {modalState === "input" || modalState === "loading-analysis" ? "Analyze YouTube Video" : "Generate Comic"}
                    </span>
                    <div className="w-10" />
                </div>

                {/* Content Area */}
                <div className="p-6">

                    {/* STEP 1: INPUT */}
                    {modalState === "input" && (
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-4">
                                <p className="text-zinc-600 text-sm">Paste a YouTube link to extract characters and settings for your fan fiction.</p>
                                <input
                                    type="text"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    autoFocus
                                />
                                {errorMsg && <p className="text-red-500 text-sm font-medium">{errorMsg}</p>}
                            </div>
                            <button
                                className={`self-end rounded-full px-6 py-2 transition-colors cursor-pointer disabled:cursor-not-allowed ${!url
                                    ? "bg-gray-400 text-white font-bold"
                                    : "bg-black text-white font-bold hover:bg-zinc-800"
                                    }`}
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
                            <p className="text-zinc-600 font-medium">Extracting characters from video...</p>
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
                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all border ${selectedCharacter === char
                                                ? "bg-black border-black text-white"
                                                : "border-zinc-200 bg-white hover:bg-zinc-100 text-black"
                                                }`}
                                        >
                                            {char}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold mb-3 text-black">2. Write your Fan Fiction</h3>
                                <textarea
                                    placeholder="What happens to them?"
                                    value={storyInput}
                                    onChange={(e) => setStoryInput(e.target.value)}
                                    className="w-full min-h-[120px] rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-black resize-none focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                {errorMsg && <p className="text-red-500 text-sm font-medium">{errorMsg}</p>}
                            </div>

                            <button
                                className={`w-full rounded-full py-3 font-bold text-white transition-colors disabled:opacity-100 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed ${storyInput.trim() !== ""
                                    ? "bg-black hover:bg-zinc-800"
                                    : "bg-zinc-400"
                                    }`}
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
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-500" />
                            <p className="text-zinc-600 font-medium tracking-wide">Drawing your comic...</p>
                        </div>
                    )}

                    {/* STEP 3: RESULT */}
                    {modalState === "result" && (
                        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                            <div className="flex items-center justify-center bg-zinc-50 rounded-xl aspect-video border border-zinc-200 relative overflow-hidden group">
                                {generatedComic?.imageBase64 ? (
                                    <img
                                        src={`data:image/jpeg;base64,${generatedComic.imageBase64}`}
                                        alt="Generated Comic"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <p className="text-zinc-600 font-mono text-sm">[Comic Image Generated for: {selectedCharacter}]</p>
                                )}
                                <div className="absolute top-2 right-2 flex bg-black/60 backdrop-blur-md rounded-full px-3 py-1 items-center gap-1 text-xs text-green-400 font-medium">
                                    <CheckCircle2 size={14} /> Success
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    className="w-full rounded-full bg-black py-3 font-bold text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                                    onClick={() => {
                                        // Instead of mock log, ideally navigate to post or refresh feed
                                        // For now, reload window to show it in feed
                                        window.location.reload();
                                    }}
                                >
                                    Post to Feed
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        className="flex-1 rounded-full border border-zinc-200 bg-white py-3 font-bold text-black hover:bg-zinc-200 transition-colors cursor-pointer"
                                        onClick={() => {
                                            console.log("Mock: Saved comic");
                                            closeModal();
                                        }}
                                    >
                                        Save Comic
                                    </button>
                                    <button
                                        className="flex-1 rounded-full border border-transparent py-3 font-bold text-red-500 transition-colors hover:bg-red-50 cursor-pointer"
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
