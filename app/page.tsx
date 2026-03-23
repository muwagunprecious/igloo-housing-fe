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

        // Sort by price AND date
        if (sortOrder) {
            filtered = [...filtered].sort((a, b) => {
                switch (sortOrder) {
                    case "price-asc":
                        return (a.price || 0) - (b.price || 0);
                    case "price-desc":
                        return (b.price || 0) - (a.price || 0);
                    case "date-newest":
                        // Use createdAt timestamp to sort
                        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                    case "date-oldest":
                        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
                    default:
                        return 0;
                }
            });
        }

        return filtered;
    }, [properties, selectedUniversity, selectedLocation, selectedCategory, sortOrder]);

    return (
        <div className="relative bg-white">
            {/* RED HERO SECTION - Light soft red background */}
            <div className="relative bg-[#fef2f2] pt-32 pb-48 lg:pt-40 lg:pb-60 overflow-hidden">
                <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        
                        {/* Left Column: Text & Stats */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-xl"
                        >
                            {/* Updated title with bold leading and red highlighting */}
                            <h1 className="text-5xl lg:text-[4.5rem] font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
                                Find A House <br />
                                That Suits You
                            </h1>
                            <p className="text-gray-600 text-lg mb-8 max-w-md leading-relaxed font-medium">
                                Want to find a home? We are ready to help you find one that suits your student lifestyle and needs.
                            </p>
                            {/* Get Started Button - Changed to red */}
                            <button className="bg-[#dc2626] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#b91c1c] transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200">
                                Get Started
                            </button>

                            {/* Stats Row - '+' symbols changed to red */}
                            <div className="flex items-center gap-8 lg:gap-12 mt-12">
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900">1200<span className="text-[#dc2626]">+</span></h3>
                                    <p className="text-sm text-gray-500 font-semibold mt-1">Listed Properties</p>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900">4500<span className="text-[#dc2626]">+</span></h3>
                                    <p className="text-sm text-gray-500 font-semibold mt-1">Happy Students</p>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900">100<span className="text-[#dc2626]">+</span></h3>
                                    <p className="text-sm text-gray-500 font-semibold mt-1">Campuses</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column: Hero Image (hidden on small screens) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative w-full h-[400px] lg:h-[600px] hidden md:block"
                        >
                            {/* The floating image block from your screenshot */}
                            <div className="absolute inset-0 rounded-tl-[4rem] rounded-br-[4rem] overflow-hidden shadow-2xl border-8 border-white bg-gray-200 transform lg:-rotate-2 hover:rotate-0 transition-transform duration-700">
                                <Image
                                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
                                    alt="Modern Student Housing"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* OVERLAPPING SEARCH BOX - Search Now button in red */}
            <div className="relative max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 z-20 -mt-24 lg:-mt-32 mb-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] p-6 lg:p-10 border border-gray-100 max-w-5xl"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Search for available properties</h3>
                    {/* Assuming the 'Search Now' button inside is also styled red in its component */}
                    <SmartSearch
                        selectedUniversity={selectedUniversity}
                        selectedLocation={selectedLocation}
                        onSelectUniversity={setSelectedUniversity}
                        onSelectLocation={setSelectedLocation}
                    />
                </motion.div>
            </div>

            {/* Sticky Filter Bar */}
            <div className="sticky top-[80px] bg-white z-30 border-b border-gray-100 transition-all duration-300">
                <FilterBar
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    sortOrder={sortOrder}
                    onSortChange={setSortOrder}
                />
            </div>

            {/* Property Grid */}
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-10 pb-20">
                <div className="mb-8 flex justify-between items-center">
                    {/* Header from the Maison design */}
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase flex items-center gap-4">
                        <span className="w-10 h-1 bg-black hidden sm:block"></span>
                        Our Popular Homes
                    </h2>
                    
                    {isLoading ? (
                        <p className="text-sm font-semibold text-gray-500">Loading...</p>
                    ) : error ? (
                        <p className="text-sm text-red-600 font-semibold">Error loading properties</p>
                    ) : (
                        <p className="text-sm font-semibold text-gray-600 cursor-pointer hover:text-black hover:underline transition">
                            Explore All &rarr;
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                    {displayedProperties.map((property) => {
                        // Safe property check
                        if (!property) return null;

                        // Simplified image mapping as imageList is parsed in the store now
                        const mappedProperty = {
                            id: property.id,
                            title: property.title,
                            // Ensure images are mapped properly or use a placeholder
                            images: property.images.length > 0
                                ? property.images.map((img) => getImageUrl(img))
                                : ["/placeholder-property.jpg"],
                            location: {
                                lat: 0,
                                lng: 0,
                                address: property.location || "Location not available",
                            },
                            // Use static fallback values as discussed previously
                            distance: "N/A", 
                            period: property.category || "year", 
                            price: property.price || 0,
                            rating: 4.5, 
                            description: property.description || "",
                        };

                        return <PropertyCard key={property.id} property={mappedProperty} />;
                    })}
                </div>

                {/* Empty State with Red accented text and button */}
                {!isLoading && displayedProperties.length === 0 && !error && (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 mt-8">
                        <p className="text-xl font-bold text-gray-900 mb-2">No exact matches found</p>
                        <p className="text-gray-500 mb-6">Try adjusting your filters or searching a different area.</p>
                        <button 
                            onClick={() => {
                                setSelectedUniversity(null);
                                setSelectedLocation(null);
                                setSelectedCategory("All");
                            }}
                            className="bg-white border border-gray-200 text-[#dc2626] px-6 py-2 rounded-full font-semibold hover:bg-[#fef2f2] transition shadow-sm"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
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