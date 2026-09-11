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
import { useCampusStore, propertyMatchesCampus, CAMPUSES } from "@/app/stores/useCampusStore";

export default function Home() {
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(
    null,
  );
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const { properties, fetchProperties, isLoading, error } = usePropertyStore();
  const { selectedCampus, openCampusModal, setCampus } = useCampusStore();

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

    // Filter by MyCampus selection
    if (selectedCampus && selectedCampus !== "all") {
      filtered = filtered.filter((p) => propertyMatchesCampus(p, selectedCampus));
    }

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
    selectedCampus,
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
        {/* Popular Homes Header with Active Campus Pill */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
              <span className="w-2.5 h-8 bg-primary rounded-full" />
              <span>Our Popular Homes</span>
            </h2>
            <p className="text-gray-500 text-sm font-medium mt-1">
              {selectedCampus && selectedCampus !== "all" ? (
                <>
                  Showing houses & apartments in{" "}
                  <strong className="text-gray-900 font-bold">
                    {CAMPUSES.find((c) => c.id === selectedCampus)?.name || selectedCampus}
                  </strong>
                </>
              ) : (
                "Verified student accommodation across all campuses"
              )}
            </p>
          </div>

          {/* Active Campus Badge + Change Button */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={openCampusModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-gray-200 hover:border-primary text-gray-800 text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all group cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span>Campus:</span>
              <span className="text-primary font-black">
                {selectedCampus && selectedCampus !== "all"
                  ? CAMPUSES.find((c) => c.id === selectedCampus)?.name || selectedCampus
                  : "All Campuses"}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-gray-400 group-hover:text-primary font-bold ml-1">
                Change ▾
              </span>
            </button>

            {selectedCampus && selectedCampus !== "all" && (
              <button
                onClick={() => setCampus("all")}
                className="text-xs text-gray-400 hover:text-gray-700 font-semibold underline px-2 py-1 transition-colors"
              >
                View All Campuses
              </button>
            )}
          </div>
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
          <div className="text-center py-20 px-4 bg-gray-50 rounded-3xl border border-dashed border-gray-200 mt-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
              <Map size={26} className="text-gray-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
              No homes found in {selectedCampus && selectedCampus !== "all" ? CAMPUSES.find(c => c.id === selectedCampus)?.name : "this filter"}
            </p>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">
              We couldn&apos;t find any verified listings matching this campus or category right now.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={openCampusModal}
                className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition shadow-md text-xs sm:text-sm cursor-pointer"
              >
                Choose Another Campus
              </button>
              <button
                onClick={() => {
                  setCampus("all");
                  setSelectedUniversity(null);
                  setSelectedLocation(null);
                  setSelectedCategory("All");
                }}
                className="bg-white border border-gray-300 text-gray-800 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-sm text-xs sm:text-sm cursor-pointer"
              >
                Browse All Campuses
              </button>
            </div>
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
