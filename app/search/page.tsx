"use client";

import PropertyCard from "@/app/components/features/PropertyCard";
import FilterBar, { SortOrder } from "@/app/components/features/FilterBar";
import QuickFilters from "@/app/components/features/QuickFilters";
import MapPlaceholder from "@/app/components/features/MapPlaceholder";
import { useFilterStore } from "@/app/stores/useFilterStore";
import { Map } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { usePropertyStore } from "@/app/stores/usePropertyStore";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { getImageUrl } from "@/app/lib/imageUrl";

export default function SearchPage() {
    const [showMap, setShowMap] = useState(false);
    const roomTypes = useFilterStore((state) => state.roomTypes);

    const { properties, fetchProperties } = usePropertyStore();
    const { user, isAuthenticated } = useAuthStore();

    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortOrder, setSortOrder] = useState<SortOrder>(null);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    useEffect(() => {
        // Fetch base properties from API
        const apiFilters: any = {};
        if (isAuthenticated && user?.universityId) {
            apiFilters.universityId = user.universityId;
        }
        fetchProperties(apiFilters);
    }, [isAuthenticated, user?.universityId, fetchProperties]);

    // Apply all filters and sorting client‑side
    const displayedProperties = useMemo(() => {
        let filtered = properties;

        // 1. Filter by QuickFilters (from Zustand store)
        if (roomTypes.length > 0) {
            filtered = filtered.filter((p) => roomTypes.includes(p.category || ""));
        }

        // 2. Filter by Top FilterBar Category
        if (selectedCategory !== "All") {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // 3. FIXED: Sort by price AND date
        if (sortOrder) {
            filtered = [...filtered].sort((a, b) => {
                switch (sortOrder) {
                    case "price-asc":
                        return (a.price || 0) - (b.price || 0);
                    case "price-desc":
                        return (b.price || 0) - (a.price || 0);
                    case "date-newest":
                        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                    case "date-oldest":
                        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
                    default:
                        return 0;
                }
            });
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
                        onOpenFilters={() => setIsFilterModalOpen(true)}
                    />
                    <div className="py-4">
                        <QuickFilters />
                    </div>
                </div>
            </div>

            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {displayedProperties.map((property) => {
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