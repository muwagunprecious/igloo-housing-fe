"use client";

import { Map } from "lucide-react";

export default function MapPlaceholder() {
    return (
        <div className="relative w-full h-full min-h-[400px] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center group cursor-pointer">
            {/* Fake Map Background Pattern */}
            <div
                className="absolute inset-0 opacity-50"
                style={{
                    backgroundImage: "url('https://maps.googleapis.com/maps/api/staticmap?center=6.5244,3.3792&zoom=13&size=600x600&maptype=roadmap&key=YOUR_API_KEY')", // Using a static image or pattern would be better if no key
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'grayscale(100%) blur(1px)'
                }}
            >
                {/* Fallback pattern if image fails or for better aesthetic */}
                <div className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center opacity-20"></div>
            </div>

            <div className="z-10 bg-white px-6 py-3 rounded-full shadow-floating flex items-center gap-2 transform transition-transform group-hover:scale-105">
                <Map size={20} className="text-gray-900" />
                <span className="font-semibold text-gray-900">Show map</span>
            </div>
        </div>
    );
}
