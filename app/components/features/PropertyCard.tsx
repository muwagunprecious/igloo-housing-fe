"use client";

import Image from "next/image";
import { Heart, Star, Video } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFavoritesStore } from "@/app/stores/useFavoritesStore";
import { useViewHistoryStore } from "@/app/stores/useViewHistoryStore";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { getImageUrl } from "@/app/lib/imageUrl";

interface PropertyProps {
    id: string;
    images?: string[];
    video?: string;
    location: string | {
        lat?: number;
        lng?: number;
        address?: string;
    };
    distance?: string;
    distanceFromSchool?: string;
    period?: string;
    price: number;
    rating?: number;
    title: string;
}

export default function PropertyCard({ property }: { property: PropertyProps }) {
    const router = useRouter();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    
    // Auth and Global Stores
    const { isAuthenticated } = useAuthStore();
    const isFavorite = useFavoritesStore((state) => state.isFavorite(property.id));
    const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
    const addView = useViewHistoryStore((state) => state.addView);

    const imagesList = Array.isArray(property.images)
        ? property.images.filter((img) => typeof img === "string" && img.trim().length > 0 && !img.includes("placeholder-property.jpg"))
        : [];
    const hasImages = imagesList.length > 0;
    const hasVideo = !!property.video && typeof property.video === "string" && property.video.trim().length > 0;
    const videoUrl = hasVideo ? getImageUrl(property.video) : null;

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!hasImages) return;
        setCurrentImageIndex((prev) => (prev + 1) % imagesList.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!hasImages) return;
        setCurrentImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Option: You could also require login to favorite properties
        if (!isAuthenticated) {
            router.push(`/signup?callback=/rooms/${property.id}`);
            return;
        }
        toggleFavorite(property.id);
    };

    const handleCardClick = () => {
        if (isAuthenticated) {
            addView(property.id);
        }
        router.push(`/rooms/${property.id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="group cursor-pointer flex flex-col gap-2 w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-200">
                {hasImages ? (
                    <div className="relative w-full h-full">
                        <Image
                            src={getImageUrl(imagesList[currentImageIndex])}
                            alt={property.title}
                            fill
                            className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
                        />
                        {hasVideo && (
                            <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs uppercase tracking-wider flex items-center gap-1 shadow-sm pointer-events-none z-10">
                                <Video size={11} className="text-primary" /> Video
                            </div>
                        )}
                    </div>
                ) : hasVideo && videoUrl ? (
                    <div className="relative w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
                        <video
                            src={`${videoUrl}#t=0.001`}
                            className="object-cover h-full w-full opacity-90 group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                            autoPlay
                            muted
                            playsInline
                            loop
                            preload="metadata"
                            onLoadedMetadata={(e) => {
                                try {
                                    if (e.currentTarget.currentTime === 0) {
                                        e.currentTarget.currentTime = 0.001;
                                    }
                                } catch {}
                            }}
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none group-hover:opacity-75 transition-opacity">
                            <div className="w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center backdrop-blur-xs shadow-md">
                                <Video size={18} />
                            </div>
                        </div>
                        <div className="absolute top-3 left-3 bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <Video size={11} /> Video Tour
                        </div>
                    </div>
                ) : (
                    <Image
                        src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        alt={property.title}
                        fill
                        className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
                    />
                )}

                {/* Heart Button */}
                <button
                    onClick={handleFavoriteClick}
                    className="absolute top-3 right-3 z-10 p-2 hover:scale-110 transition-transform"
                >
                    <Heart
                        className={`w-6 h-6 transition-colors ${isFavorite
                            ? 'fill-[#dc2626] text-[#dc2626]'
                            : 'text-white fill-black/50 hover:fill-[#dc2626] hover:text-[#dc2626]'
                            }`}
                    />
                </button>

                {/* Carousel Navigation */}
                {isHovered && hasImages && imagesList.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-md transition-all z-20"
                        >
                            <svg viewBox="0 0 32 32" className="w-3 h-3 stroke-current fill-none stroke-[4px]"><path d="M20 28 8.7 16.7a1 1 0 0 1 0-1.4L20 4"></path></svg>
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-md transition-all z-20"
                        >
                            <svg viewBox="0 0 32 32" className="w-3 h-3 stroke-current fill-none stroke-[4px]"><path d="m12 4 11.3 11.3a1 1 0 0 1 0 1.4L12 28"></path></svg>
                        </button>
                    </>
                )}

                {/* Dots Indicator */}
                {isHovered && hasImages && imagesList.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {imagesList.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 truncate text-[15px]">
                        {typeof property.location === 'string' ? property.location : property.location?.address || 'Unknown Location'}
                    </h3>
                    {property.rating && (
                        <div className="flex items-center gap-1 text-sm font-medium">
                            <Star className="w-3.5 h-3.5 fill-black text-black" />
                            <span>{property.rating}</span>
                        </div>
                    )}
                </div>
                <p className="text-gray-500 text-[14px] leading-tight">
                    {property.distanceFromSchool || property.distance || "Near Campus"} • {property.period || "Yearly"}
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-extrabold text-gray-900">₦{property.price.toLocaleString()}</span>
                    <span className="text-gray-600 text-sm">/ {property.period?.includes('month') ? 'month' : 'year'}</span>
                </div>
            </div>
        </div>
    );
}