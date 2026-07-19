"use client";

import PropertyCard from "./components/features/PropertyCard";
import FilterBar, { SortOrder } from "./components/features/FilterBar";
import UniversitySearch from "./components/features/UniversitySearch";
import { usePropertyStore } from "@/app/stores/usePropertyStore";
import { Map } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { getImageUrl } from "@/app/lib/imageUrl";
import SmartSearch from "./components/features/SmartSearch";
import { p } from "framer-motion/client";

export default function Home() {
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(
    null,
  );
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const { properties, fetchProperties, isLoading, error } = usePropertyStore();

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Handles the search from the UniversitySearch component
  const handleHeroSearch = useCallback(
    (searchData: { universityId: string; location: string }) => {
      setSelectedUniversity(searchData.universityId || null);
      setSelectedLocation(searchData.location || null);
    },
    [],
  );

  const displayedProperties = useMemo(() => {
    let filtered = properties;

    if (selectedUniversity) {
      filtered = filtered.filter((p) => p.universityId === selectedUniversity);
    }

    if (selectedLocation && selectedLocation.trim() !== "") {
      const searchLower = selectedLocation.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.location?.toLowerCase().includes(searchLower) ||
          p.address?.toLowerCase().includes(searchLower),
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (sortOrder) {
      filtered = [...filtered].sort((a, b) => {
        switch (sortOrder) {
          case "price-asc":
            return (a.price || 0) - (b.price || 0);
          case "price-desc":
            return (b.price || 0) - (a.price || 0);
          case "date-newest":
            return (
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
            );
          case "date-oldest":
            return (
              new Date(a.createdAt || 0).getTime() -
              new Date(b.createdAt || 0).getTime()
            );
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [
    properties,
    selectedUniversity,
    selectedLocation,
    selectedCategory,
    sortOrder,
  ]);

  return (
    <div className="relative bg-white">
      {/* IMMERSIVE AIRBNB-STYLE HERO BANNER */}
      <div className="relative max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-4 px-4 pt-6 md:pt-8">
        <div className="relative w-full h-[380px] md:h-[460px] lg:h-[540px] rounded-3xl overflow-hidden shadow-2xl bg-gray-950">
          <Image
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
            alt="Modern Student Housing"
            fill
            className="object-cover opacity-75"
            priority
          />
          {/* Dark gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/55" />
          
          {/* Centered Typography */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 md:px-12 z-10">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-4 max-w-4xl"
            >
              Find Your <span className="text-[#FF385C]">Perfect</span> Student Home
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-gray-200 text-sm md:text-lg lg:text-xl font-medium max-w-xl leading-relaxed"
            >
              Secure, verified student rooms and apartments close to campus.
            </motion.p>
          </div>
        </div>
      </div>

      {/* REDESIGNED SEARCH PILL OVERLAPPING THE BANNER */}
      <div className="relative max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-4 px-4 z-40 -mt-10 md:-mt-12 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <SmartSearch
            selectedUniversity={selectedUniversity}
            selectedLocation={selectedLocation}
            selectedCategory={selectedCategory}
            onSelectUniversity={setSelectedUniversity}
            onSelectLocation={setSelectedLocation}
            onSelectCategory={setSelectedCategory}
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
        {/* Cleaned up Popular Homes Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
            <span className="w-8 h-1 bg-[#dc2626] rounded-full"></span>
            Our Popular Homes
          </h2>

          {isLoading ? (
            <p className="text-sm font-semibold text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-sm text-red-600 font-semibold">
              Error loading properties
            </p>
          ) : (
            <p/>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
          {displayedProperties.map((property) => {
            if (!property) return null;

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
              images:
                imageList.length > 0
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

        {/* Empty State */}
        {!isLoading && displayedProperties.length === 0 && !error && (
          <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200 mt-4">
            <p className="text-2xl font-bold text-gray-900 mb-2">
              No exact matches found
            </p>
            <p className="text-gray-500 mb-8">
              Try adjusting your filters or searching a different area.
            </p>
            <button
              onClick={() => {
                setSelectedUniversity(null);
                setSelectedLocation(null);
                setSelectedCategory("All");
              }}
              className="bg-white border border-gray-200 text-[#dc2626] px-8 py-3 rounded-full font-bold hover:bg-[#fef2f2] transition shadow-sm"
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
