"use client";

import { useState } from "react";
import {
    Megaphone,
    Plus,
    Calendar,
    Power,
    Trash2,
    ArrowUp,
    Layout
} from "lucide-react";
import Image from "next/image";
import Button from "@/app/components/common/Button";

// Mock Data for Ads
const MOCK_ADS = [
    {
        id: "AD-001",
        title: "Flash Sale - 20% Off Bookings",
        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        startDate: "2024-03-01",
        endDate: "2024-03-31",
        active: true,
        priority: 1
    },
    {
        id: "AD-002",
        title: "Premium Agent Feature",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        startDate: "2024-03-15",
        endDate: "2024-04-15",
        active: true,
        priority: 2
    },
    {
        id: "AD-003",
        title: "New Hostels Near Unilag",
        image: "https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        startDate: "2024-01-01",
        endDate: "2024-02-01",
        active: false,
        priority: 3
    }
];

export default function AdminAdsPage() {
    const [ads, setAds] = useState(MOCK_ADS);

    const toggleActive = (id: string) => {
        setAds(prev => prev.map(ad =>
            ad.id === id ? { ...ad, active: !ad.active } : ad
        ));
    };

    const deleteAd = (id: string) => {
        if (confirm("Are you sure you want to delete this promotional banner?")) {
            setAds(prev => prev.filter(ad => ad.id !== id));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight">Ads Manager</h1>
                    <p className="text-gray-500 font-medium">Manage promotional banners and featured content on the landing page.</p>
                </div>
                <Button className="flex items-center gap-2 rounded-2xl px-6 py-3 font-black text-xs uppercase tracking-widest">
                    <Plus size={18} />
                    New Campaign
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {ads.map((ad) => (
                    <div key={ad.id} className="bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-sm hover:shadow-card-hover transition-all group flex flex-col">
                        <div className="relative h-48 overflow-hidden">
                            <Image src={ad.image} alt={ad.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${ad.active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                                {ad.active ? 'Active' : 'Inactive'}
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                                <h3 className="text-lg font-black tracking-tight leading-tight mb-2">{ad.title}</h3>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                                        <Calendar size={14} className="text-primary" />
                                        {ad.startDate} — {ad.endDate}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                                        <Layout size={14} className="text-primary" />
                                        Priority: {ad.priority}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleActive(ad.id)}
                                        className={`p-2 rounded-xl transition-all ${ad.active ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                        title={ad.active ? "Deactivate" : "Activate"}
                                    >
                                        <Power size={18} />
                                    </button>
                                    <button className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-black hover:text-white transition-all" title="Reorder">
                                        <ArrowUp size={18} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => deleteAd(ad.id)}
                                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Create New Placeholder */}
                <div className="border-4 border-dashed border-gray-100 rounded-[40px] flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-all cursor-pointer group">
                    <div className="p-4 bg-white rounded-2xl text-gray-300 group-hover:text-primary transition-colors shadow-sm mb-4">
                        <Megaphone size={32} />
                    </div>
                    <p className="font-black text-gray-400 text-sm uppercase tracking-widest">Start New Campaign</p>
                </div>
            </div>
        </div>
    );
}
