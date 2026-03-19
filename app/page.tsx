"use client";

import PropertyCard from "./components/features/PropertyCard";
import FilterBar, { SortOrder } from "./components/features/FilterBar";
import SmartSearch from "./components/features/SmartSearch";
import { usePropertyStore } from "@/app/stores/usePropertyStore";
import { Map } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { getImageUrl } from "@/app/lib/imageUrl";

export default function Home() {
    const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortOrder, setSortOrder] = useState<SortOrder>(null);
    const { properties, fetchProperties, isLoading, error } = usePropertyStore();

    // Fetch all properties once on mount
    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    // Apply all filters and sorting client‑side
const displayedProperties = useMemo(() => {
        let filtered = properties;

        // Filter by university (Strict equality is fine here because IDs are exact)
        if (selectedUniversity) {
            filtered = filtered.filter(p => p.universityId === selectedUniversity);
        }

        // Filter by location (Use case-insensitive partial matching)
        if (selectedLocation && selectedLocation.trim() !== "") {
            const searchLower = selectedLocation.toLowerCase();
            filtered = filtered.filter(p => 
                p.location?.toLowerCase().includes(searchLower) || 
                p.address?.toLowerCase().includes(searchLower)
            );
        }

        // Filter by category
        if (selectedCategory !== "All") {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Sort by price
        if (sortOrder) {
            filtered = [...filtered].sort((a, b) =>
                sortOrder === "asc" ? a.price - b.price : b.price - a.price
            );
        }

        return filtered;
    }, [properties, selectedUniversity, selectedLocation, selectedCategory, sortOrder]);

    return (
        <div className="relative">
            {/* Hero Section */}
            <div className="relative py-12 md:h-[100dvh] flex items-center justify-center z-40">
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <Image
                        src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
                        alt="Student Housing"
                        fill
                        className="object-cover brightness-[0.7] scale-105"
                        priority
                    />
                </div>

                <div className="relative z-10 w-full max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl mx-auto"
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
                            Find Your Perfect{" "}
                            <span className="text-primary italic">Student Housing</span> in Nigeria
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 mb-8 font-medium drop-shadow-md">
                            Secure, verified, and close to your campus. Join thousands of students finding their next stay.
                        </p>

                        <div className="bg-white/10 backdrop-blur-xl p-2 rounded-full border border-white/20 shadow-2xl">
                            <SmartSearch
                                selectedUniversity={selectedUniversity}
                                selectedLocation={selectedLocation}
                                onSelectUniversity={setSelectedUniversity}
                                onSelectLocation={setSelectedLocation}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Sticky Filter Bar */}
            <div className="sticky top-[80px] glass z-30 border-b border-gray-100 transition-all duration-300">
                <FilterBar
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    sortOrder={sortOrder}
                    onSortChange={setSortOrder}
                />
            </div>

            {/* Property Grid */}
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-6 pb-20">
                <div className="mb-4">
                    {isLoading ? (
                        <p className="text-sm text-gray-600">Loading properties...</p>
                    ) : error ? (
                        <p className="text-sm text-red-600">Error loading properties: {error}</p>
                    ) : (
                        <p className="text-sm text-gray-600">
                            {displayedProperties.length} properties available
                            {selectedUniversity && " near selected university"}
                            {selectedLocation && ` in ${selectedLocation}`}
                            {selectedCategory !== "All" && ` · ${selectedCategory}`}
                            {sortOrder && ` · Price ${sortOrder === "asc" ? "↑" : "↓"}`}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                    {displayedProperties.map((property) => {
                        if (!property || !property.images) return null;

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
                            distance: "N/A", // Hardcode fallback since it's not in the DB yet
    period: property.category || "year", // Use category instead of period
    price: property.price || 0,
    rating: 4.5, // Hardcode fallback
    
    description: property.description || "",
                        };

                        return <PropertyCard key={property.id} property={mappedProperty} />;
                    })}
                </div>
            </div>

            {/* Mobile Map Button */}
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 md:hidden">
                <button className="bg-gray-900 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg font-semibold hover:scale-105 transition">
                    <span>Map</span>
                    <Map size={18} />
                </button>
            </div>
        </div>
    );
}