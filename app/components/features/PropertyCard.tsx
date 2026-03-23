"use client";

import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFavoritesStore } from "@/app/stores/useFavoritesStore";
import { useViewHistoryStore } from "@/app/stores/useViewHistoryStore";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { getImageUrl } from "@/app/lib/imageUrl";

interface PropertyProps {
    id: string;
    images: string[];
    location: string | {
        lat?: number;
        lng?: number;
        address?: string;
    };
    distance?: string;
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

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!property?.images?.length) return;
        setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!property?.images?.length) return;
        setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
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
        if (!isAuthenticated) {
            // Redirect to signup if not logged in
            router.push(`/signup?callback=/rooms/${property.id}`);
        } else {
            // Proceed to property and track view
            addView(property.id);
            router.push(`/rooms/${property.id}`);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className="group cursor-pointer flex flex-col gap-2 w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-200">
                <Image
                    src={getImageUrl(property.images[currentImageIndex])}
                    alt={property.title}
                    fill
                    className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
                />

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
                {isHovered && property.images.length > 1 && (
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
                {isHovered && property.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {property.images.map((_, idx) => (
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
                    {property.distance || "Near Campus"} • {property.period || "Yearly"}
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-extrabold text-gray-900">₦{property.price.toLocaleString()}</span>
                    <span className="text-gray-600 text-sm">/ {property.period?.includes('month') ? 'month' : 'year'}</span>
                </div>
            </div>
        </div>
    );
}