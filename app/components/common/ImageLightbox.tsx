"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageLightboxProps {
    images: string[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function ImageLightbox({ images, initialIndex = 0, isOpen, onClose }: ImageLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const thumbnailRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    useEffect(() => {
        if (!isOpen) return;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const goNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const goPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose, goNext, goPrev]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const delta = touchStartX.current - touchEndX.current;
        if (Math.abs(delta) > 50) {
            if (delta > 0) goNext();
            else goPrev();
        }
    };

    useEffect(() => {
        if (!isOpen || !thumbnailRef.current) return;
        const active = thumbnailRef.current.children[currentIndex] as HTMLElement;
        if (active) {
            active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
    }, [currentIndex, isOpen]);

    if (!isOpen || images.length === 0) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[200] flex flex-col bg-black"
                >
                    {/* Top bar */}
                    <div className="flex items-center justify-between px-4 py-3 shrink-0">
                        <span className="text-white text-sm font-semibold">
                            {currentIndex + 1} / {images.length}
                        </span>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    {/* Main image */}
                    <div
                        className="flex-1 relative min-h-0"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0.3 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0.3 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 flex items-center justify-center p-4"
                            >
                                <Image
                                    src={images[currentIndex]}
                                    alt={`Photo ${currentIndex + 1}`}
                                    fill
                                    className="object-contain"
                                    sizes="100vw"
                                    draggable={false}
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation arrows */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={goPrev}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-gray-800 shadow-lg transition md:flex hidden"
                                >
                                    <ChevronLeft size={22} />
                                </button>
                                <button
                                    onClick={goNext}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-gray-800 shadow-lg transition md:flex hidden"
                                >
                                    <ChevronRight size={22} />
                                </button>
                            </>
                        )}

                        {/* Mobile tap zones */}
                        <button
                            onClick={goPrev}
                            className="absolute left-0 top-0 bottom-0 w-1/4 md:hidden"
                            aria-label="Previous image"
                        />
                        <button
                            onClick={goNext}
                            className="absolute right-0 top-0 bottom-0 w-1/4 md:hidden"
                            aria-label="Next image"
                        />
                    </div>

                    {/* Thumbnail strip */}
                    {images.length > 1 && (
                        <div
                            ref={thumbnailRef}
                            className="flex gap-2 overflow-x-auto px-4 py-3 shrink-0 justify-center"
                        >
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                                        idx === currentIndex
                                            ? "border-white"
                                            : "border-transparent opacity-50 hover:opacity-80"
                                    }`}
                                >
                                    <Image
                                        src={img}
                                        alt={`Thumbnail ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="56px"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
