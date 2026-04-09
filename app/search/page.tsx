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

export default function SearchPage() {
    const [showMap, setShowMap] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortOrder, setSortOrder] = useState<SortOrder>(null);
    const roomTypes = useFilterStore((state) => state.roomTypes);
    const [category, setCategory] = useState("All");
const [sort, setSort] = useState<SortOrder>(null);

const [Open, setOpen] = useState(false);

    const { properties, fetchProperties } = usePropertyStore();
    const { user, isAuthenticated } = useAuthStore();
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    useEffect(() => {
        // Fetch base properties from API
        const apiFilters: any = {};
        if (isAuthenticated && user?.universityId) {
            apiFilters.universityId = user.universityId;
        }
        fetchProperties(apiFilters);
    }, [isAuthenticated, user?.universityId, fetchProperties]);

    // Filter properties based on room type (Client side for now)
    const filteredProperties = roomTypes.length > 0
        ? properties.filter((p) => roomTypes.includes(p.category || "")) // Note: Property interface has 'category', Mock had 'type'
        : properties;

    return (
        <div className="pt-[80px]">
            <div className="sticky top-[80px] bg-white z-40 border-b border-gray-200">
                <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
                    <FilterBar 
  selectedCategory={category} 
  onCategoryChange={setCategory}
  sortOrder={sort}
  onSortChange={setSort}
  onOpenFilters={() => setOpen(true)}
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
                            {filteredProperties.map((property) => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
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