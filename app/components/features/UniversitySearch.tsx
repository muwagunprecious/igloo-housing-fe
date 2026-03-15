"use client";

import { universities } from "@/app/data/universities";
import { MapPin, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface UniversitySearchProps {
    onSelect: (universityId: string | null) => void;
    selectedUniversity: string | null;
}

export default function UniversitySearch({ onSelect, selectedUniversity }: UniversitySearchProps) {
    const [query, setQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedUni = universities.find((u) => u.id === selectedUniversity);
    const displayValue = selectedUni ? selectedUni.name : query;

    const filteredUniversities = universities.filter((uni) =>
        uni.name.toLowerCase().includes(query.toLowerCase()) ||
        uni.location.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (uni: typeof universities[0]) => {
        onSelect(uni.id);
        setQuery(uni.name);
        setShowDropdown(false);
    };

    const handleClear = () => {
        onSelect(null);
        setQuery("");
        setShowDropdown(false);
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto" ref={dropdownRef}>
            <div className="relative group transition-premium">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                    <MapPin size={22} />
                </div>
                <input
                    type="text"
                    value={displayValue}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                        if (selectedUniversity) onSelect(null);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search by university or location..."
                    className="w-full pl-14 pr-28 py-5 border border-gray-200 rounded-full text-base focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    {selectedUniversity && (
                        <button
                            onClick={handleClear}
                            className="text-sm font-semibold text-gray-500 hover:text-black px-4 py-2 rounded-full hover:bg-gray-100 transition"
                        >
                            Clear
                        </button>
                    )}
                    <button className="p-4 bg-primary text-white rounded-full hover:bg-primary-hover shadow-md hover:shadow-lg transition-premium">
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
                        className="absolute top-full mt-3 w-full bg-white border border-gray-100 rounded-[2rem] shadow-2xl max-h-[400px] overflow-y-auto z-[60] py-2 hide-scrollbar"
                    >
                        {filteredUniversities.length > 0 ? (
                            filteredUniversities.map((uni) => (
                                <button
                                    key={uni.id}
                                    onClick={() => handleSelect(uni)}
                                    className="w-full px-8 py-5 hover:bg-gray-50 transition-colors text-left flex items-start gap-4 active:bg-gray-100"
                                >
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MapPin size={20} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{uni.name}</p>
                                        <p className="text-sm text-gray-500 mt-0.5">{uni.location}</p>
                                    </div>
                                </button>
                            ))
                        ) : query && (
                            <div className="px-8 py-10 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search size={32} className="text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">No universities found matching &quot;{query}&quot;</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
