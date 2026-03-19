"use client";

import PropertyCard from "@/app/components/features/PropertyCard";
import FilterBar from "@/app/components/features/FilterBar";
import QuickFilters from "@/app/components/features/QuickFilters";
import MapPlaceholder from "@/app/components/features/MapPlaceholder";
import { useFilterStore } from "@/app/stores/useFilterStore";
import { Map } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { usePropertyStore } from "@/app/stores/usePropertyStore";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { getImageUrl } from "@/app/lib/imageUrl"; // Needed for image mapping

export default function SearchPage() {
    const [showMap, setShowMap] = useState(false);
    const roomTypes = useFilterStore((state) => state.roomTypes);

    const { properties, fetchProperties } = usePropertyStore();
    const { user, isAuthenticated } = useAuthStore();

    // 1. Add the state required by your updated FilterBar
    const [filters, setFilters] = useState({
        category: "",
        minPrice: "",
        maxPrice: "",
    });

    const updateFilter = useCallback((key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    useEffect(() => {
        // Fetch properties filtered by university and category
        const apiFilters: any = { ...filters };
        
        if (isAuthenticated && user?.universityId) {
            apiFilters.universityId = user.universityId;
        }

        // Clean out empty filters
        const activeFilters = Object.fromEntries(
            Object.entries(apiFilters).filter(([_, value]) => value !== "" && value !== "All")
        );

        fetchProperties(activeFilters);
    }, [isAuthenticated, user?.universityId, fetchProperties, filters]);

    // Client-side quick filtering based on room types
    const filteredProperties = roomTypes.length > 0
        ? properties.filter((p) => roomTypes.includes(p.category || ""))
        : properties;

    return (
        <div className="pt-[80px]">
            <div className="sticky top-[80px] bg-white z-40 border-b border-gray-200">
                <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
                    
                    {/* 2. Provide the required props to FilterBar */}
                    <FilterBar 
                        currentFilters={filters}
                        onFilterChange={updateFilter}
                        onOpenFilters={() => console.log("Open Advanced Filters")} // Placeholder for your modal
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
                                // 3. MUST map the property safely just like on the Home and Favorites page
                                if (!property) return null;

                                let imageList: string[] = [];
                                try {
                                    imageList = Array.isArray(property.images)
                                        ? property.images
                                        : JSON.parse((property.images as unknown as string) || "[]");
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
                                    distance: "N/A",
                                    period: property.category || "year",
                                    price: property.price || 0,
                                    rating: 4.5,
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