"use client";

import PropertyCard from "@/app/components/features/PropertyCard";
import { properties } from "@/app/data/properties";
import { useFavoritesStore } from "@/app/stores/useFavoritesStore";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
    const favorites = useFavoritesStore((state) => state.favorites);
    const favoriteProperties = properties.filter((p) => favorites.includes(p.id));

    return (
        <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-28 pb-20">
            <h1 className="text-3xl font-bold mb-8">Wishlists</h1>

            {favoriteProperties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                    {favoriteProperties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <Heart className="w-16 h-16 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">No saved properties yet</h2>
                    <p className="text-gray-500 mb-8 max-w-md">
                        As you search, click the heart icon to save your favorite places to stay.
                    </p>
                    <Link
                        href="/"
                        className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-semibold transition"
                    >
                        Start exploring
                    </Link>
                </div>
            )}
        </div>
    );
}
