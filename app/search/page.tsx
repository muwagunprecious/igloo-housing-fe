"use client";

import PropertyCard from "@/app/components/features/PropertyCard";
import FilterBar, { SortOrder } from "@/app/components/features/FilterBar";
import QuickFilters from "@/app/components/features/QuickFilters";
import MapPlaceholder from "@/app/components/features/MapPlaceholder";
// import { properties } from "@/app/data/properties"; // Mock data removed
import { useFilterStore } from "@/app/stores/useFilterStore";
import { Map } from "lucide-react";
import { useState, useEffect } from "react";
import { usePropertyStore } from "@/app/stores/usePropertyStore";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { useMemo } from "react";
import { getImageUrl } from "@/app/lib/imageUrl";

export default function SearchPage() {
    const [showMap, setShowMap] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortOrder, setSortOrder] = useState<SortOrder>(null);
    const roomTypes = useFilterStore((state) => state.roomTypes);

    const { properties, fetchProperties } = usePropertyStore();
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        // Fetch properties filtered by university if user is logged in
        const filters: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
        if (isAuthenticated && user?.universityId) {
            filters.universityId = user.universityId;
        }

        fetchProperties(filters);
    }, [isAuthenticated, user?.universityId, fetchProperties]);

    // Apply all filters and sorting client-side
    const filteredProperties = useMemo(() => {
        let filtered = properties;

        // Filter by room type (from store)
        if (roomTypes.length > 0) {
            filtered = filtered.filter((p) => roomTypes.includes(p.category || ""));
        }

        // Filter by category (from FilterBar)
        if (selectedCategory !== "All") {
            filtered = filtered.filter((p) => p.category === selectedCategory);
        }

        // Sort by price
        if (sortOrder) {
            filtered = [...filtered].sort((a, b) =>
                sortOrder === "asc" ? a.price - b.price : b.price - a.price
            );
        }

        return filtered;
    }, [properties, roomTypes, selectedCategory, sortOrder]);

    return (
        <div className="pt-[80px]">
            <div className="sticky top-[80px] bg-white z-40 border-b border-gray-200">
                <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
                    <FilterBar 
                        selectedCategory={selectedCategory} 
                        onCategoryChange={setSelectedCategory} 
                        sortOrder={sortOrder} 
                        onSortChange={setSortOrder} 
                    />
                    <div className="py-4">
                        <QuickFilters />
                    </div>
                </div>
            </div>

            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-6">
                <p className="text-sm text-gray-600 mb-6">{filteredProperties.length} properties available</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {filteredProperties.map((property) => {
                                let imageList: string[] = [];
                                try {
                                    imageList = Array.isArray(property.images)
                                        ? property.images
                                        : JSON.parse(property.images as unknown as string);
                                } catch {
                                    console.error("Failed to parse images for property", property.id);
                                }

                                const mappedProperty = {
                                    id: property.id,
                                    title: property.title,
                                    images: imageList.length > 0
                                        ? imageList.map((img) => getImageUrl(img))
                                        : ["/placeholder-property.jpg"],
                                    location: {
                                        lat: 0,
                                        lng: 0,
                                        address: property.location || "Location not available",
                                    },
                                    distance: property.distance || "N/A",
                                    period: property.period || "year",
                                    price: property.price || 0,
                                    rating: property.rating || 4.5,
                                    description: property.description || "",
                                };

                                return <PropertyCard key={property.id} property={mappedProperty} />;
                            })}
                        </div>
                    </div>

                    <div className="hidden lg:block sticky top-[200px] h-[calc(100vh-220px)]">
                        <MapPlaceholder />
                    </div>
                </div>

                <button
                    onClick={() => setShowMap(!showMap)}
                    className="lg:hidden fixed bottom-24 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-floating flex items-center gap-2 font-semibold z-50"
                >
                    <Map size={18} />
                    {showMap ? 'Show list' : 'Show map'}
                </button>
            </div>
        </div>
    );
}
