"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, MapPin, Star, Users, BedDouble, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePostUtmeStore } from "@/app/stores/usePostUtmeStore";

const AREAS = ["Iba", "Agunwoye", "Aiyede", "Olokinmi", "Mowe", "Ofada", "Sango", "Abeokuta Express"];

export default function PostUtmeLanding() {
    const { properties, propertiesTotal, propertiesPage, propertiesTotalPages, isLoading, fetchProperties } = usePostUtmeStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        area: "",
        minPrice: "",
        maxPrice: "",
        minGuests: "",
        maxRooms: "",
        isVerified: "",
        minRating: "",
        sortBy: "newest",
    });

    useEffect(() => {
        fetchProperties(filters);
    }, []);

    const applyFilters = useCallback(() => {
        const params: Record<string, string> = {};
        if (searchQuery) params.area = searchQuery;
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params[key] = value;
        });
        fetchProperties(params);
        setShowFilters(false);
    }, [searchQuery, filters, fetchProperties]);

    const clearFilters = () => {
        setSearchQuery("");
        setFilters({ area: "", minPrice: "", maxPrice: "", minGuests: "", maxRooms: "", isVerified: "", minRating: "", sortBy: "newest" });
        fetchProperties({});
    };

    const loadPage = (page: number) => {
        const params: Record<string, string> = { page: String(page) };
        if (searchQuery) params.area = searchQuery;
        Object.entries(filters).forEach(([key, value]) => { if (value) params[key] = value; });
        fetchProperties(params);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <div className="bg-gradient-to-br from-[#008489] to-[#006669] text-white">
                <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-black mb-4 leading-tight"
                    >
                        Find a Comfortable Place to Stay for Your OOU Post-UTME
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/80 text-sm md:text-lg max-w-2xl mx-auto mb-8"
                    >
                        Discover verified short-stay apartments near Olabisi Onabanjo University and book your accommodation before you arrive.
                    </motion.p>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="max-w-2xl mx-auto"
                    >
                        <div className="flex items-center bg-white rounded-full p-2 shadow-xl">
                            <div className="flex-1 flex items-center gap-2 px-4">
                                <Search size={20} className="text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by area (e.g. Iba, Mowe, Sango...)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    className="w-full py-2 text-gray-900 text-sm outline-none placeholder:text-gray-400"
                                />
                            </div>
                            <button
                                onClick={applyFilters}
                                className="bg-[#FF385C] hover:bg-[#D9324E] text-white px-6 py-3 rounded-full font-bold text-sm transition shrink-0"
                            >
                                Search
                            </button>
                        </div>
                    </motion.div>

                    {/* Quick area chips */}
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                        {AREAS.map((area) => (
                            <button
                                key={area}
                                onClick={() => { setSearchQuery(area); }}
                                className="bg-white/15 hover:bg-white/25 text-white text-xs px-4 py-2 rounded-full transition font-medium"
                            >
                                {area}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-900">
                            {propertiesTotal} {propertiesTotal === 1 ? 'apartment' : 'apartments'} available
                        </h2>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:border-gray-900 transition text-sm font-medium"
                        >
                            <SlidersHorizontal size={16} />
                            Filters
                        </button>
                    </div>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => { setFilters({ ...filters, sortBy: e.target.value }); }}
                        onBlur={applyFilters}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 outline-none"
                    >
                        <option value="newest">Newest</option>
                        <option value="price_asc">Lowest Price</option>
                        <option value="price_desc">Highest Price</option>
                        <option value="rating">Highest Rated</option>
                    </select>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Min Price (₦/night)</label>
                                <input type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" placeholder="0" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Max Price (₦/night)</label>
                                <input type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" placeholder="50000" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Min Guests</label>
                                <input type="number" value={filters.minGuests} onChange={(e) => setFilters({ ...filters, minGuests: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" placeholder="1" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Min Rating</label>
                                <input type="number" value={filters.minRating} onChange={(e) => setFilters({ ...filters, minRating: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" placeholder="4.0" step="0.5" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Verified Only</label>
                                <select value={filters.isVerified} onChange={(e) => setFilters({ ...filters, isVerified: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none bg-white">
                                    <option value="">All</option>
                                    <option value="true">Verified</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700">Clear all</button>
                            <button onClick={applyFilters} className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-black transition">Apply Filters</button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Property Grid */}
            <div className="max-w-6xl mx-auto px-4 pb-20">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
                        ))}
                    </div>
                ) : properties.length === 0 ? (
                    <div className="text-center py-24">
                        <p className="text-xl font-bold text-gray-900 mb-2">No apartments found</p>
                        <p className="text-gray-500 mb-6">Try adjusting your filters or search a different area</p>
                        <button onClick={clearFilters} className="bg-gray-900 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-black transition">
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {properties.map((property, idx) => (
                                <Link key={property.id} href={`/post-utme/${property.id}`}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group cursor-pointer"
                                    >
                                        <div className="relative h-56 rounded-2xl overflow-hidden bg-gray-100 mb-3">
                                            {property.images && property.images.length > 0 ? (
                                                <Image
                                                    src={property.images[0].url}
                                                    alt={property.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                            )}
                                            {property.isVerified && (
                                                <div className="absolute top-3 left-3 bg-[#008489] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                    Verified
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-gray-900 text-sm truncate group-hover:underline">{property.title}</h3>
                                                <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                                                    <MapPin size={12} />
                                                    <span className="truncate">{property.area}{property.distanceFromOOU ? ` · ${property.distanceFromOOU}` : ''}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-gray-500 text-xs mt-1">
                                                    <span className="flex items-center gap-0.5"><Users size={12} />{property.maxGuests}</span>
                                                    <span className="flex items-center gap-0.5"><BedDouble size={12} />{property.totalRooms} {property.totalRooms === 1 ? 'room' : 'rooms'}</span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="font-black text-gray-900">₦{property.pricePerNight.toLocaleString()}</span>
                                                <span className="text-gray-500 text-xs block">/night</span>
                                                {property.rating > 0 && (
                                                    <span className="flex items-center gap-0.5 text-xs text-gray-500 mt-1 justify-end">
                                                        <Star size={10} className="fill-black" />{property.rating.toFixed(1)} ({property.reviewCount})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {propertiesTotalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-12">
                                <button
                                    onClick={() => loadPage(propertiesPage - 1)}
                                    disabled={propertiesPage <= 1}
                                    className="p-2 rounded-full border border-gray-200 hover:border-gray-900 disabled:opacity-30 transition"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-sm font-semibold text-gray-700">
                                    Page {propertiesPage} of {propertiesTotalPages}
                                </span>
                                <button
                                    onClick={() => loadPage(propertiesPage + 1)}
                                    disabled={propertiesPage >= propertiesTotalPages}
                                    className="p-2 rounded-full border border-gray-200 hover:border-gray-900 disabled:opacity-30 transition"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
