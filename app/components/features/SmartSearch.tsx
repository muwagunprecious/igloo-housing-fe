"use client";

import { universities } from "@/app/data/universities";
import { categories } from "@/app/data/categories";
import { MapPin, Search, Building2, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePropertyStore } from "@/app/stores/usePropertyStore";

interface SmartSearchProps {
    onSelectLocation: (location: string | null) => void;
    onSelectUniversity: (universityId: string | null) => void;
    selectedUniversity: string | null;
    selectedLocation: string | null;
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export default function SmartSearch({
    onSelectLocation,
    onSelectUniversity,
    selectedUniversity,
    selectedLocation,
    selectedCategory,
    onSelectCategory,
}: SmartSearchProps) {
    const [query, setQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { properties } = usePropertyStore();

    // Group properties by exact location value from DB
    const propertyLocations = useMemo(() => {
        const map = new Map<string, number>();
        properties.forEach((p) => {
            if (p.location) map.set(p.location, (map.get(p.location) ?? 0) + 1);
        });
        return Array.from(map.entries()).map(([address, count]) => ({ address, count }));
    }, [properties]);

    const selectedUni = universities.find((u) => u.id === selectedUniversity);
    const displayValue = selectedUni
        ? selectedUni.name
        : selectedLocation ?? query;

    const lowerQuery = query.toLowerCase();

    const filteredUniversities = query
        ? universities.filter(
              (u) =>
                  u.name.toLowerCase().includes(lowerQuery) ||
                  u.state.toLowerCase().includes(lowerQuery)
          )
        : universities; // show all when input is empty/focused

    const filteredLocations = propertyLocations.filter((l) =>
        l.address.toLowerCase().includes(lowerQuery)
    );

    const hasResults = filteredUniversities.length > 0 || filteredLocations.length > 0;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
                setShowCategoryDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSelectUniversity = (uni: (typeof universities)[0]) => {
        onSelectUniversity(uni.id);
        onSelectLocation(null);
        setQuery(uni.name);
        setShowDropdown(false);
    };

    const handleSelectLocation = (address: string) => {
        onSelectLocation(address);
        onSelectUniversity(null);
        setQuery(address);
        setShowDropdown(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectUniversity(null);
        onSelectLocation(null);
        setQuery("");
    };

    const isSelected = !!selectedUniversity || !!selectedLocation;

    return (
        <div className="relative w-full max-w-3xl mx-auto" ref={dropdownRef}>
            <div className="flex flex-col md:flex-row items-stretch bg-white border border-gray-200 rounded-2xl md:rounded-full shadow-lg hover:shadow-xl transition-all duration-300 p-2 md:p-1.5 relative gap-2 md:gap-0">
                
                {/* Segment 1: Where */}
                <div 
                    onClick={() => {
                        setShowCategoryDropdown(false);
                        setShowDropdown(true);
                        inputRef.current?.focus();
                    }}
                    className="flex-1 flex flex-col justify-center px-6 py-2.5 md:py-1.5 rounded-xl md:rounded-full hover:bg-gray-100/80 transition-colors cursor-pointer"
                >
                    <span className="text-[10px] font-black uppercase text-gray-800 tracking-wider mb-0.5">Where</span>
                    <div className="relative flex items-center w-full">
                        <input
                            ref={inputRef}
                            type="text"
                            value={displayValue}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setShowDropdown(true);
                                setShowCategoryDropdown(false);
                                if (selectedUniversity) onSelectUniversity(null);
                                if (selectedLocation) onSelectLocation(null);
                            }}
                            placeholder="Search university, street, or area..."
                            className="w-full bg-transparent border-none p-0 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-0 placeholder-gray-400"
                        />
                        {isSelected && (
                            <button
                                onClick={handleClear}
                                className="absolute right-0 text-xs font-bold text-gray-400 hover:text-gray-800 px-1 py-0.5 hover:bg-gray-200/50 rounded-full transition"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-[1px] bg-gray-200 my-2" />

                {/* Segment 2: Room Type */}
                <div 
                    onClick={() => {
                        setShowDropdown(false);
                        setShowCategoryDropdown(!showCategoryDropdown);
                    }}
                    className="flex-1 flex flex-col justify-center px-6 py-2.5 md:py-1.5 rounded-xl md:rounded-full hover:bg-gray-100/80 transition-colors cursor-pointer relative"
                >
                    <span className="text-[10px] font-black uppercase text-gray-800 tracking-wider mb-0.5">Room Type</span>
                    <div className="flex items-center justify-between w-full text-sm font-semibold text-gray-900">
                        <span className={selectedCategory === "All" ? "text-gray-400" : "text-gray-900"}>
                            {selectedCategory === "All" ? "Select Category" : selectedCategory}
                        </span>
                        <ChevronDown size={14} className="text-gray-400 ml-2" />
                    </div>

                    {/* Category Dropdown */}
                    <AnimatePresence>
                        {showCategoryDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full left-0 mt-3 w-full min-w-[240px] bg-white border border-gray-100 rounded-2xl shadow-2xl z-[60] py-2"
                            >
                                {categories.map((cat) => (
                                    <button
                                        key={cat.label}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectCategory(cat.label);
                                            setShowCategoryDropdown(false);
                                        }}
                                        className={`w-full px-5 py-3 hover:bg-gray-50 transition-colors text-left flex items-center gap-3 text-sm font-semibold
                                            ${selectedCategory === cat.label ? "text-[#FF385C] bg-red-50/50" : "text-gray-700"}`}
                                    >
                                        <cat.icon size={16} className={selectedCategory === cat.label ? "text-[#FF385C]" : "text-gray-400"} />
                                        <span>{cat.label}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Search Button Zone */}
                <div className="flex items-center justify-end pl-2 pr-1 pb-1 md:pb-0">
                    <button className="w-full md:w-auto px-6 py-3.5 bg-[#FF385C] hover:bg-[#D9324E] text-white rounded-xl md:rounded-full font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200">
                        <Search size={16} strokeWidth={3} />
                        <span className="md:hidden">Search</span>
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-3 w-full bg-white border border-gray-100 rounded-[2rem] shadow-2xl max-h-[420px] overflow-y-auto z-[60] py-3 hide-scrollbar"
                    >
                        {/* Locations from real properties */}
                        {filteredLocations.length > 0 && (
                            <>
                                <p className="px-8 pt-1 pb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Locations
                                </p>
                                {filteredLocations.map((loc) => (
                                    <button
                                        key={loc.address}
                                        onClick={() => handleSelectLocation(loc.address)}
                                        className="w-full px-8 py-4 hover:bg-gray-50 transition-colors text-left flex items-start gap-4"
                                    >
                                        <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                                            <MapPin size={18} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{loc.address}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {loc.count} {loc.count === 1 ? "property" : "properties"}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </>
                        )}

                        {filteredLocations.length > 0 && filteredUniversities.length > 0 && (
                            <div className="my-2 mx-8 border-t border-gray-100" />
                        )}

                        {/* Universities */}
                        {filteredUniversities.length > 0 && (
                            <>
                                <p className="px-8 pt-1 pb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Universities
                                </p>
                                {filteredUniversities.map((uni) => (
                                    <button
                                        key={uni.id}
                                        onClick={() => handleSelectUniversity(uni)}
                                        className="w-full px-8 py-4 hover:bg-gray-50 transition-colors text-left flex items-start gap-4"
                                    >
                                        <div className="w-9 h-9 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Building2 size={18} className="text-[#FF385C]" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{uni.name}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">{uni.state}</p>
                                        </div>
                                    </button>
                                ))}
                            </>
                        )}

                        {!hasResults && query && (
                            <div className="px-8 py-10 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search size={32} className="text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">
                                    No results for &quot;{query}&quot;
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}