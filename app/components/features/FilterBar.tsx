"use client";

import { categories } from "@/app/data/categories";
import { SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export type SortOrder = "asc" | "desc" | null;

interface FilterBarProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    sortOrder: SortOrder;
    onSortChange: (order: SortOrder) => void;
}

export default function FilterBar({
    selectedCategory,
    onCategoryChange,
    sortOrder,
    onSortChange,
}: FilterBarProps) {
    const handleSortToggle = () => {
        if (sortOrder === null) onSortChange("asc");
        else if (sortOrder === "asc") onSortChange("desc");
        else onSortChange(null);
    };

    const SortIcon = sortOrder === "asc" ? ArrowUp : sortOrder === "desc" ? ArrowDown : ArrowUpDown;

    return (
        <div className="bg-white pt-4 pb-2">
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 flex flex-row items-center gap-2 sm:gap-4">
                {/* Filter Icon - always leftmost */}
                <button
                    onClick={() => {/* TODO: open filter modal */}}
                    className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100 shrink-0"
                    aria-label="Open filters"
                >
                    <SlidersHorizontal size={20} />
                </button>

                {/* Categories - flex and shrink to fit */}
                <div className="flex-1 flex flex-row items-center justify-start overflow-x-auto hide-scrollbar gap-2 sm:gap-4 md:gap-6 pb-2">
                    {categories.map((item) => (
                        <div
                            key={item.label}
                            onClick={() =>
                                onCategoryChange(
                                    item.label === selectedCategory ? "All" : item.label
                                )
                            }
                            className={`
                                flex flex-col items-center justify-center gap-1 p-2 border-b-2
                                hover:text-gray-800 transition cursor-pointer
                                ${selectedCategory === item.label
                                    ? "border-black text-black"
                                    : "border-transparent text-gray-500"
                                }
                            `}
                        >
                            <item.icon size={20} className="sm:size-[22px]" />
                            <div className="font-medium text-[10px] sm:text-xs whitespace-nowrap">
                                {item.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sort Button - visible on all screens, compact on mobile */}
                <button
                    onClick={handleSortToggle}
                    className={`
                        flex items-center gap-1 sm:gap-2 border rounded-xl px-2 sm:px-4 py-2 transition text-xs sm:text-sm font-semibold shrink-0
                        ${sortOrder
                            ? "border-black bg-black text-white"
                            : "border-gray-300 hover:border-black text-gray-700"
                        }
                    `}
                >
                    <SortIcon size={14} className="sm:size-4" />
                    <span className="hidden xs:inline">
                        {sortOrder === "asc"
                            ? "Price: Low to High"
                            : sortOrder === "desc"
                            ? "Price: High to Low"
                            : "Sort by Price"}
                    </span>
                    {/* On very small screens, show only icon + short label */}
                    <span className="xs:hidden">
                        {sortOrder === "asc"
                            ? "Low"
                            : sortOrder === "desc"
                            ? "High"
                            : "Sort"}
                    </span>
                </button>
            </div>
        </div>
    );
}