"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import PropertyCard from "@/app/components/features/PropertyCard";
import { useFavoritesStore } from "@/app/stores/useFavoritesStore";
import { usePropertyStore } from "@/app/stores/usePropertyStore";
import { getImageUrl } from "@/app/lib/imageUrl";

export default function FavoritesPage() {
    const favorites = useFavoritesStore((state) => state.favorites);
    const { properties, fetchProperties, isLoading } = usePropertyStore();

    // Fetch properties if the user lands directly on this page before visiting Home
    useEffect(() => {
        if (properties.length === 0) {
            fetchProperties({});
        }
    }, [properties.length, fetchProperties]);

    // Filter the dynamic properties using the saved favorite IDs
    const favoriteProperties = properties.filter((p) => favorites.includes(p.id));

    return (
        <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 min-h-screen">
            <h1 className="text-2xl font-bold mb-8 text-gray-900">Wishlists</h1>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : favoriteProperties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                    {favoriteProperties.map((property) => {
                        // 1. Safely map the backend data to the frontend PropertyCard format
                        let imageList: string[] = [];
                        try {
                            if (typeof property.images === 'string') {
                                imageList = JSON.parse(property.images);
                            } else if (Array.isArray(property.images)) {
                                imageList = property.images;
                            }
                        } catch (e) {
                            console.error("Failed to parse images for property", property.id);
                        }

                        const mappedProperty = {
                            id: property.id,
                            title: property.title,
                            images: imageList.length > 0 
                                ? imageList.map(img => getImageUrl(img)) 
                                : ["/placeholder-property.jpg"],
                            location: {
                                lat: 0,
                                lng: 0,
                                address: property.location || "Location not available"
                            },
                            distance: property.distance || "N/A",
                            period: property.period || "year",
                            price: property.price || 0,
                            rating: property.rating || 4.5,
                            description: property.description || ""
                        };

                        // 2. Render the card with the safely mapped data
                        return <PropertyCard key={property.id} property={mappedProperty} />;
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-32 h-32 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-6">
                        <Heart className="w-16 h-16 text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2 text-gray-900">No saved properties yet</h2>
                    <p className="text-gray-500 mb-8 max-w-md">
                        As you search, click the heart icon on any listing to save your favorite places to stay.
                    </p>
                    <Link
                        href="/"
                        className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-bold transition shadow-lg shadow-primary/20"
                    >
                        Start exploring
                    </Link>
                </div>
            )}
        </div>
    );
}