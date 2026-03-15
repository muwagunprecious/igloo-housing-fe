"use client";

import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useFavoritesStore } from "@/app/stores/useFavoritesStore";
import { useViewHistoryStore } from "@/app/stores/useViewHistoryStore";

interface PropertyProps {
    id: string;
    images: string[];
    location: string | { // Backend sends string address or object? Backend Property model has 'location String'.
        lat?: number;
        lng?: number;
        address?: string;
    }; // Update to match backend
    distance?: string;
    period?: string;
    price: number;
    rating?: number;
    title: string;
}

import { getImageUrl } from "@/app/lib/imageUrl";

export default function PropertyCard({ property }: { property: PropertyProps }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const isFavorite = useFavoritesStore((state) => state.isFavorite(property.id));
    const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
    const addView = useViewHistoryStore((state) => state.addView);

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!property?.images?.length) return;
        setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!property?.images?.length) return;
        setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(property.id);
    };

    const handleCardClick = () => {
        addView(property.id);
    };

    return (
        <Link
            href={`/rooms/${property.id}`}
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
                            ? 'fill-primary text-primary'
                            : 'text-white fill-black/50 hover:fill-primary hover:text-primary'
                            }`}
                    />
                </button>

                {/* Carousel Navigation */}
                {isHovered && property.images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'none', height: '12px', width: '12px', stroke: 'currentcolor', strokeWidth: 4, overflow: 'visible' }}><path fill="none" d="M20 28 8.7 16.7a1 1 0 0 1 0-1.4L20 4"></path></svg>
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'none', height: '12px', width: '12px', stroke: 'currentcolor', strokeWidth: 4, overflow: 'visible' }}><path fill="none" d="m12 4 11.3 11.3a1 1 0 0 1 0 1.4L12 28"></path></svg>
                        </button>
                    </>
                )}

                {/* Dots Indicator */}
                {isHovered && property.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
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
                    <h3 className="font-semibold text-gray-900 truncate">
                        {typeof property.location === 'string' ? property.location : property.location?.address || 'Unknown Location'}
                    </h3>
                    {property.rating && (
                        <div className="flex items-center gap-1 text-sm">
                            <Star className="w-3 h-3 fill-black text-black" />
                            <span>{property.rating}</span>
                        </div>
                    )}
                </div>
                {property.distance && <p className="text-gray-500 text-sm">{property.distance}</p>}
                {property.period && <p className="text-gray-500 text-sm">{property.period}</p>}
                <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-semibold text-gray-900">₦{property.price.toLocaleString()}</span>
                    <span className="text-gray-900">night</span>
                </div>
            </div>
        </Link>
    );
}
