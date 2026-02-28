"use client";

import { X, Eraser, Send, Undo2, Loader2, Paintbrush, Check } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";

interface ChatMessage {
    role: "user" | "assistant";
    text: string;
    imageBase64?: string;
}

interface EditModalProps {
    imageBase64: string;
    comicUid: string;
    onClose: () => void;
    onFinishAndPost?: (editedImageBase64: string) => void;
    onImageUpdated?: (newImageBase64: string) => void;
}

export default function EditModal({ imageBase64, comicUid, onClose, onFinishAndPost, onImageUpdated }: EditModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSize, setBrushSize] = useState(20);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [undoStack, setUndoStack] = useState<ImageData[]>([]);
    const [currentImage, setCurrentImage] = useState(imageBase64);
    // Track whether any edit has been made
    const hasEdited = currentImage !== imageBase64;

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fitCanvas = useCallback(() => {
        const img = imgRef.current;
        const container = containerRef.current;
        if (!img || !container) return;

        const containerRect = container.getBoundingClientRect();
        const imgAspect = img.naturalWidth / img.naturalHeight;
        let w = containerRect.width;
        let h = w / imgAspect;
        if (h > containerRect.height) {
            h = containerRect.height;
            w = h * imgAspect;
        }
        setCanvasSize({ width: Math.floor(w), height: Math.floor(h) });
    }, []);

    useEffect(() => {
        fitCanvas();
        window.addEventListener("resize", fitCanvas);
        return () => window.removeEventListener("resize", fitCanvas);
    }, [fitCanvas, currentImage]);

    // --- Drawing logic ---
    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const saveSnapshot = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setUndoStack(prev => [...prev, snap]);
    };

    const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        saveSnapshot();
        setIsDrawing(true);
        draw(e);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing && e.type !== "mousedown" && e.type !== "touchstart") return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const { x, y } = getPos(e);
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = "#ff3333";
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
    };

    const onMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        draw(e);
    };

    const endDraw = () => setIsDrawing(false);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        saveSnapshot();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const undo = () => {
        const canvas = canvasRef.current;
        if (!canvas || undoStack.length === 0) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const prev = undoStack[undoStack.length - 1];
        ctx.putImageData(prev, 0, 0);
        setUndoStack(s => s.slice(0, -1));
    };

    const buildCompositedImage = (): Promise<string> => {
        return new Promise((resolve) => {
            const canvas = canvasRef.current;
            if (!canvas) return resolve(currentImage);

            const offscreen = document.createElement("canvas");
            const img = imgRef.current;
            if (!img) return resolve(currentImage);

            offscreen.width = img.naturalWidth;
            offscreen.height = img.naturalHeight;
            const ctx = offscreen.getContext("2d")!;

            ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

            const scaleX = img.naturalWidth / canvas.width;
            const scaleY = img.naturalHeight / canvas.height;
            ctx.save();
            ctx.scale(scaleX, scaleY);
            ctx.drawImage(canvas, 0, 0);
            ctx.restore();

            const dataUrl = offscreen.toDataURL("image/png");
            resolve(dataUrl.replace(/^data:image\/\w+;base64,/, ""));
        });
    };

    const getMaskImage = (): string => {
        const canvas = canvasRef.current;
        if (!canvas) return "";
        const dataUrl = canvas.toDataURL("image/png");
        return dataUrl.replace(/^data:image\/\w+;base64,/, "");
    };

    const handleSend = async () => {
        if (!prompt.trim() || isLoading) return;
        const userPrompt = prompt.trim();
        setPrompt("");

        const maskB64 = getMaskImage();

        setMessages(prev => [...prev, { role: "user", text: userPrompt }]);
        setIsLoading(true);

        try {
            const compositedImage = await buildCompositedImage();

            const res = await fetch("/api/eidt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imageBase64: currentImage,
                    compositedImageBase64: compositedImage,
                    maskBase64: maskB64,
                    prompt: userPrompt,
                    comicUid,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to edit image");
            }

            const data = await res.json();
            const newImage = data.imageBase64;

            setMessages(prev => [
                ...prev,
                { role: "assistant", text: "Here's the edited image:", imageBase64: newImage },
            ]);

            setCurrentImage(newImage);
            setTimeout(() => {
                const c = canvasRef.current;
                if (c) {
                    const ctx = c.getContext("2d");
                    ctx?.clearRect(0, 0, c.width, c.height);
                }
                setUndoStack([]);
            }, 100);

            if (onImageUpdated) onImageUpdated(newImage);
        } catch (err: any) {
            setMessages(prev => [
                ...prev,
                { role: "assistant", text: `Error: ${err.message}` },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinishAndPost = () => {
        if (onFinishAndPost && hasEdited) {
            onFinishAndPost(currentImage);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 border-b border-zinc-200 bg-white">
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
                >
                    <X size={22} />
                </button>
                <h2 className="font-bold text-lg text-zinc-900">Edit with AI</h2>
                <button
                    onClick={handleFinishAndPost}
                    disabled={!hasEdited || isLoading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 text-white font-semibold px-5 py-2 rounded-full text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                    <Check size={16} />
                    Finish & Post
                </button>
            </div>

            <div className="flex w-full h-full max-w-[1600px] mx-auto pt-16 p-4 gap-4">
                {/* LEFT: Canvas Panel */}
                <div className="flex flex-col flex-1 min-w-0">
                    {/* Toolbar */}
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="flex items-center gap-2 bg-zinc-100 rounded-full px-4 py-2 border border-zinc-200">
                            <Paintbrush size={16} className="text-zinc-500" />
                            <input
                                type="range"
                                min={4}
                                max={60}
                                value={brushSize}
                                onChange={(e) => setBrushSize(Number(e.target.value))}
                                className="w-24 accent-red-500"
                            />
                            <span className="text-xs text-zinc-500 w-6 text-right">{brushSize}</span>
                        </div>
                        <button
                            onClick={undo}
                            disabled={undoStack.length === 0}
                            className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-600 px-3 py-2 rounded-full text-sm transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                        >
                            <Undo2 size={16} />
                            Undo
                        </button>
                        <button
                            onClick={clearCanvas}
                            className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-600 px-3 py-2 rounded-full text-sm transition-colors cursor-pointer"
                        >
                            <Eraser size={16} />
                            Clear
                        </button>
                    </div>

                    {/* Canvas Container */}
                    <div
                        ref={containerRef}
                        className="flex-1 flex items-center justify-center relative overflow-hidden rounded-xl bg-zinc-50 border border-zinc-200"
                    >
                        <img
                            ref={imgRef}
                            src={`data:image/jpeg;base64,${currentImage}`}
                            alt="Comic"
                            onLoad={fitCanvas}
                            className="absolute pointer-events-none"
                            style={{
                                width: canvasSize.width || "auto",
                                height: canvasSize.height || "auto",
                                maxWidth: "100%",
                                maxHeight: "100%",
                            }}
                        />
                        <canvas
                            ref={canvasRef}
                            width={canvasSize.width}
                            height={canvasSize.height}
                            onMouseDown={startDraw}
                            onMouseMove={onMove}
                            onMouseUp={endDraw}
                            onMouseLeave={endDraw}
                            onTouchStart={startDraw}
                            onTouchMove={onMove}
                            onTouchEnd={endDraw}
                            className="absolute z-10"
                            style={{
                                width: canvasSize.width,
                                height: canvasSize.height,
                                cursor: "crosshair",
                            }}
                        />
                    </div>
                    <p className="text-xs text-zinc-400 text-center mt-2">
                        Draw on the image to highlight areas you want to edit
                    </p>
                </div>

                {/* RIGHT: Chat Panel */}
                <div className="w-[380px] shrink-0 flex flex-col bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
                    {/* Chat Header */}
                    <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50">
                        <h3 className="text-zinc-900 font-bold text-base">Prompt</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">Circle an area, describe your edit</p>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50">
                        {messages.length === 0 && (
                            <div className="text-center text-zinc-400 text-sm py-8">
                                <p className="mb-2 text-zinc-600 font-medium">✨ How to use:</p>
                                <p>1. Draw/circle on the image</p>
                                <p>2. Describe what to change</p>
                                <p>3. Click Send</p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm ${
                                        msg.role === "user"
                                            ? "bg-blue-600 text-white rounded-br-md"
                                            : "bg-white text-zinc-700 rounded-bl-md border border-zinc-200 shadow-sm"
                                    }`}
                                >
                                    <p>{msg.text}</p>
                                    {msg.imageBase64 && (
                                        <img
                                            src={`data:image/png;base64,${msg.imageBase64}`}
                                            alt="Edited"
                                            className="mt-2 rounded-lg max-w-full border border-zinc-200"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 border border-zinc-200 shadow-sm">
                                    <Loader2 size={16} className="animate-spin text-blue-500" />
                                    <span className="text-sm text-zinc-500">Editing image...</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="border-t border-zinc-200 p-3 bg-white">
                        <div className="flex items-end gap-2">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Describe your edit..."
                                rows={2}
                                className="flex-1 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-200"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!prompt.trim() || isLoading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-200 disabled:text-zinc-400 text-white p-2.5 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
