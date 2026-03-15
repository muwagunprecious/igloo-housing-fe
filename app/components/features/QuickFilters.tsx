"use client";

import { useFilterStore } from "@/app/stores/useFilterStore";
import { Building2, Home } from "lucide-react";

const quickFilters = [
    { label: "All", value: "", icon: Home },
    { label: "Self Contain", value: "Self-contained", icon: Building2 },
    { label: "Hostel", value: "Hostel", icon: Building2 },
];

export default function QuickFilters() {
    const roomTypes = useFilterStore((state) => state.roomTypes);
    const setFilter = useFilterStore((state) => state.setFilter);

    const handleFilterClick = (value: string) => {
        if (value === "") {
            setFilter("roomTypes", []);
        } else {
            setFilter("roomTypes", [value]);
        }
    };

    const isActive = (value: string) => {
        if (value === "") return roomTypes.length === 0;
        return roomTypes.includes(value);
    };

    return (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {quickFilters.map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => handleFilterClick(filter.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition whitespace-nowrap ${isActive(filter.value)
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                        }`}
                >
                    <filter.icon size={16} />
                    <span className="text-sm font-medium">{filter.label}</span>
                </button>
            ))}
        </div>
    );
}
