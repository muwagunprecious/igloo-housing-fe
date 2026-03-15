"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getImageUrl } from "@/app/lib/imageUrl";
import { usePropertyStore } from "@/app/stores/usePropertyStore";

export default function GalleryPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { currentProperty, fetchProperty } = usePropertyStore();

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);

    const SLIDE_DURATION = 3500; // 3.5 seconds

    useEffect(() => {
        if (id) fetchProperty(id);
    }, [id, fetchProperty]);

    // Handle images array (stringified JSON or array)
    let images: string[] = [];
    if (currentProperty?.images) {
        try {
            images = typeof currentProperty.images === 'string'
                ? JSON.parse(currentProperty.images)
                : currentProperty.images;
        } catch (e) {
            console.error("Failed to parse images", e);
        }
    }

    const handleNext = useCallback(() => {
        if (images.length === 0) return;
        setSelectedIndex((prev) => (prev + 1) % images.length);
        setProgress(0);
    }, [images.length]);

    const handlePrev = useCallback(() => {
        if (images.length === 0) return;
        setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
        setProgress(0);
    }, [images.length]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        let progressInterval: NodeJS.Timeout;

        if (isPlaying && images.length > 1) {
            interval = setInterval(handleNext, SLIDE_DURATION);

            // Smoother progress bar update
            progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + (100 / (SLIDE_DURATION / 100)), 100));
            }, 100);
        }

        return () => {
            clearInterval(interval);
            clearInterval(progressInterval);
        };
    }, [isPlaying, images.length, handleNext]);

    if (!currentProperty || images.length === 0) {
        return <div className="fixed inset-0 bg-black flex items-center justify-center text-white">Loading Gallery...</div>;
    }

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center overflow-hidden font-sans">
            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-[110] bg-gradient-to-b from-black/80 to-transparent">
                <div className="text-white">
                    <h2 className="text-lg font-bold truncate max-w-[250px] md:max-w-md">{currentProperty.title}</h2>
                    <p className="text-sm text-white/60">{selectedIndex + 1} / {images.length}</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="text-white/80 hover:text-white transition p-2 bg-white/10 rounded-full"
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="text-white/80 hover:text-white transition p-2 bg-white/10 rounded-full"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Main Image View */}
            <div className="relative w-full h-full flex items-center justify-center group overflow-hidden">
                <div className="relative w-full h-[80vh] transition-all duration-700 ease-in-out">
                    <Image
                        src={getImageUrl(images[selectedIndex])}
                        alt={`Photo ${selectedIndex + 1}`}
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Left/Right Navigation */}
                <button
                    onClick={(e) => { e.stopPropagation(); handlePrev(); setIsPlaying(false); }}
                    className="absolute left-4 md:left-8 p-4 text-white bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
                >
                    <ChevronLeft size={32} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); setIsPlaying(false); }}
                    className="absolute right-4 md:right-8 p-4 text-white bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                >
                    <ChevronRight size={32} />
                </button>
            </div>

            {/* Progress Bar */}
            {isPlaying && (
                <div className="absolute bottom-24 left-0 right-0 h-1 bg-white/10">
                    <div
                        className="h-full bg-primary transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Thumbnail Strip */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-6 pb-8 px-6">
                <div className="flex gap-3 overflow-x-auto hide-scrollbar max-w-5xl mx-auto justify-start md:justify-center">
                    {images.map((img: string, idx: number) => (
                        <button
                            key={idx}
                            onClick={() => { setSelectedIndex(idx); setIsPlaying(false); setProgress(0); }}
                            className={`relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 transform ${idx === selectedIndex ? 'border-primary ring-4 ring-primary/20 scale-110 z-10' : 'border-transparent opacity-40 hover:opacity-100'}`}
                        >
                            <Image src={getImageUrl(img)} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
