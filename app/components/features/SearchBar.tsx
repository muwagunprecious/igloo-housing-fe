"use client";

import { Search } from "lucide-react";

export default function SearchBar() {
    return (
        <div className="w-full max-w-[850px] mx-auto bg-white rounded-full border border-gray-200 shadow-floating flex flex-row items-center pl-6 pr-2 py-2">
            <div className="flex-1 flex flex-col border-r border-gray-200 px-4 hover:bg-gray-100 rounded-full cursor-pointer transition">
                <label className="text-xs font-bold tracking-wider text-gray-800">Where</label>
                <input
                    type="text"
                    placeholder="Search destinations"
                    className="w-full outline-none text-sm text-gray-600 bg-transparent placeholder-gray-400 truncate"
                />
            </div>

            <div className="flex-1 flex flex-col border-r border-gray-200 px-4 hover:bg-gray-100 rounded-full cursor-pointer transition">
                <label className="text-xs font-bold tracking-wider text-gray-800">Check in</label>
                <div className="text-sm text-gray-400 truncate">Add dates</div>
            </div>

            <div className="flex-1 flex flex-col border-r border-gray-200 px-4 hover:bg-gray-100 rounded-full cursor-pointer transition">
                <label className="text-xs font-bold tracking-wider text-gray-800">Check out</label>
                <div className="text-sm text-gray-400 truncate">Add dates</div>
            </div>

            <div className="flex-[1.2] flex flex-row items-center justify-between pl-4 hover:bg-gray-100 rounded-full cursor-pointer transition pr-2">
                <div className="flex flex-col">
                    <label className="text-xs font-bold tracking-wider text-gray-800">Who</label>
                    <div className="text-sm text-gray-400 truncate">Add guests</div>
                </div>
                <div className="bg-primary hover:bg-primary-hover transition p-3 rounded-full text-white flex items-center justify-center gap-2 min-w-[48px]">
                    <Search size={18} strokeWidth={3} />
                    <span className="font-bold hidden lg:block">Search</span>
                </div>
            </div>
        </div>
    );
}
