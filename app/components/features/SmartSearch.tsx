"use client";

import { universities } from "@/app/data/universities";
import { MapPin, Search, Building2 } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePropertyStore } from "@/app/stores/usePropertyStore";

interface SmartSearchProps {
    onSelectUniversity: (universityId: string | null) => void;
    onSelectLocation: (location: string | null) => void;
    selectedUniversity: string | null;
    selectedLocation: string | null;
}

export default function SmartSearch({
    onSelectUniversity,
    onSelectLocation,
    selectedUniversity,
    selectedLocation,
}: SmartSearchProps) {
    const [query, setQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
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
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setShowDropdown(false);
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

    const handleClear = () => {
        onSelectUniversity(null);
        onSelectLocation(null);
        setQuery("");
    };

    const isSelected = !!selectedUniversity || !!selectedLocation;

    return (
        <div className="relative w-full max-w-2xl mx-auto" ref={dropdownRef}>
            <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                    <MapPin size={22} />
                </div>
                <input
                    type="text"
                    value={displayValue}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                        if (selectedUniversity) onSelectUniversity(null);
                        if (selectedLocation) onSelectLocation(null);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search university, street, or area..."
                    className="w-full pl-14 pr-28 py-5 border border-gray-200 rounded-full text-base focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    {isSelected && (
                        <button
                            onClick={handleClear}
                            className="text-sm font-semibold text-gray-500 hover:text-black px-4 py-2 rounded-full hover:bg-gray-100 transition"
                        >
                            Clear
                        </button>
                    )}
                    <button className="p-4 bg-primary text-white rounded-full hover:bg-primary-hover shadow-md hover:shadow-lg transition-all">
                        <Search size={20} strokeWidth={3} />
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
                        className="absolute top-full mt-3 w-full bg-white border border-gray-100 rounded-[2rem] shadow-2xl max-h-[420px] overflow-y-auto z-[60] py-3 hide-scrollbar"
                    >
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
                                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Building2 size={18} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{uni.name}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">{uni.state}</p>
                                        </div>
                                    </button>
                                ))}
                            </>
                        )}

                        {filteredUniversities.length > 0 && filteredLocations.length > 0 && (
                            <div className="my-2 mx-8 border-t border-gray-100" />
                        )}

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