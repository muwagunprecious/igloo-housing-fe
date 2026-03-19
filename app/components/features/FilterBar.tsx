"use client";

import { categories } from "@/app/data/categories";
import { SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Clock } from "lucide-react";

// Updated type to handle both Price and Date
export type SortOrder = "price-asc" | "price-desc" | "date-newest" | "date-oldest" | null;

interface FilterBarProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    sortOrder: SortOrder;
    onSortChange: (order: SortOrder) => void;
    onOpenFilters?: () => void;
}

export default function FilterBar({
    selectedCategory,
    onCategoryChange,
    sortOrder,
    onSortChange,
    onOpenFilters = () => {},
}: FilterBarProps) {
    
    // Toggles Price Sort: null -> asc -> desc -> null
    const handlePriceToggle = () => {
        if (sortOrder === "price-asc") onSortChange("price-desc");
        else if (sortOrder === "price-desc") onSortChange(null);
        else onSortChange("price-asc");
    };

    // Toggles Date Sort: null -> newest -> oldest -> null
    const handleDateToggle = () => {
        if (sortOrder === "date-newest") onSortChange("date-oldest");
        else if (sortOrder === "date-oldest") onSortChange(null);
        else onSortChange("date-newest");
    };

    const isPriceActive = sortOrder?.startsWith("price");
    const isDateActive = sortOrder?.startsWith("date");

    const PriceIcon = sortOrder === "price-asc" ? ArrowUp : sortOrder === "price-desc" ? ArrowDown : ArrowUpDown;
    const DateIcon = sortOrder === "date-newest" ? ArrowDown : sortOrder === "date-oldest" ? ArrowUp : Clock;

    return (
        <div className="bg-white pt-4 pb-2 border-b border-gray-100">
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 flex flex-row items-center gap-2">
                
                {/* Advanced Filter Modal Trigger */}
                <button
                    onClick={onOpenFilters}
                    className="flex items-center justify-center p-2.5 text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100 shrink-0 border border-gray-200"
                    aria-label="Open filters"
                >
                    <SlidersHorizontal size={18} />
                </button>

                {/* Categories */}
                <div className="flex-1 flex flex-row items-center justify-start overflow-x-auto hide-scrollbar gap-4 md:gap-6 pb-2">
                    {categories.map((item) => (
                        <div
                            key={item.label}
                            onClick={() => onCategoryChange(item.label === selectedCategory ? "All" : item.label)}
                            className={`flex flex-col items-center justify-center gap-1 p-2 border-b-2 hover:text-gray-800 transition cursor-pointer min-w-fit
                                ${selectedCategory === item.label ? "border-black text-black" : "border-transparent text-gray-500"}`}
                        >
                            <item.icon size={20} />
                            <div className="font-medium text-[10px] sm:text-xs whitespace-nowrap">{item.label}</div>
                        </div>
                    ))}
                </div>

                {/* Sort Actions Container */}
                <div className="flex items-center gap-2 ml-2">
                    {/* Date Sort Button */}
                    <button
                        onClick={handleDateToggle}
                        className={`flex items-center gap-1.5 border rounded-full px-3 py-2 transition text-xs font-bold shrink-0
                            ${isDateActive ? "border-black bg-black text-white" : "border-gray-200 hover:border-black text-gray-600 bg-white"}`}
                    >
                        <DateIcon size={14} />
                        <span className="hidden sm:inline">
                            {sortOrder === "date-newest" ? "Newest" : sortOrder === "date-oldest" ? "Oldest" : "Latest"}
                        </span>
                    </button>

                    {/* Price Sort Button */}
                    <button
                        onClick={handlePriceToggle}
                        className={`flex items-center gap-1.5 border rounded-full px-3 py-2 transition text-xs font-bold shrink-0
                            ${isPriceActive ? "border-black bg-black text-white" : "border-gray-200 hover:border-black text-gray-600 bg-white"}`}
                    >
                        <PriceIcon size={14} />
                        <span className="hidden sm:inline">Price</span>
                    </button>
                </div>
            </div>
        </div>
    );
}