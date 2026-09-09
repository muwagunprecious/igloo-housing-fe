"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/axios";
import { Plus, Home, Eye, CheckCircle2, XCircle, Trash2, Edit2, MapPin, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/app/lib/imageUrl";
import { toast } from "@/app/stores/useToastStore";

export default function AgentDashboard() {
    const [properties, setProperties] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [isLoading, setIsLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await api.get('/properties/agent/my-properties');
            if (response.data.success) {
                setProperties(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch properties", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStock = async (id: string, currentStatus: boolean) => {
        setTogglingId(id);
        try {
            const response = await api.put(`/properties/${id}`, {
                isAvailable: !currentStatus,
            });
            if (response.data.success) {
                toast.success(!currentStatus ? "House marked as IN STOCK" : "House marked as OUT OF STOCK");
                setProperties(prev => prev.map(p => p.id === id ? { ...p, isAvailable: !currentStatus } : p));
            }
        } catch {
            toast.error("Failed to update stock status");
        } finally {
            setTogglingId(null);
        }
    };

    const handleBringDown = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to bring down (delete) "${title}"? This cannot be undone.`)) return;

        try {
            await api.delete(`/properties/${id}`);
            toast.success("House brought down successfully");
            setProperties(prev => prev.filter(p => p.id !== id));
        } catch {
            toast.error("Failed to bring down house");
        }
    };

    const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
    const activeCount = properties.filter(p => p.isAvailable).length;
    const outOfStockCount = properties.filter(p => !p.isAvailable).length;

    const stats = [
        { label: "My Listings", value: properties.length, icon: Home, color: "bg-blue-500" },
        { label: "In Stock (Active)", value: activeCount, icon: CheckCircle2, color: "bg-green-500" },
        { label: "Out of Stock", value: outOfStockCount, icon: XCircle, color: "bg-orange-500" },
        { label: "Total Views", value: totalViews, icon: Eye, color: "bg-purple-500" },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
                    <p className="text-gray-500 text-sm">Upload new houses, manage stock availability, and bring down listings.</p>
                </div>
                <Link
                    href="/agents/dashboard/listings/create"
                    className="bg-[#008489] hover:bg-[#006b6e] text-white px-5 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition shadow-xs shrink-0"
                >
                    <Plus size={18} /> Upload New House
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
                            <div className={`w-10 h-10 ${stat.color} bg-opacity-10 rounded-xl flex items-center justify-center mb-3`}>
                                <Icon size={20} className={stat.color.replace('bg-', 'text-')} />
                            </div>
                            <p className="text-xs text-gray-500 mb-1 font-medium">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* House Listings & Operations */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">My Listed Houses</h2>
                    <span className="text-xs font-semibold text-gray-500">{properties.length} total</span>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : properties.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs">
                        <Home size={40} className="mx-auto text-gray-300 mb-3" />
                        <h3 className="text-base font-bold text-gray-900 mb-1">No houses uploaded yet</h3>
                        <p className="text-xs text-gray-500 mb-6">Upload your first property to start receiving student inquiries.</p>
                        <Link
                            href="/agents/dashboard/listings/create"
                            className="inline-flex items-center gap-2 bg-[#008489] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#006b6e] transition"
                        >
                            <Plus size={16} /> Upload New House
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => {
                            let images = [];
                            try {
                                images = typeof property.images === 'string'
                                    ? JSON.parse(property.images || '[]')
                                    : (property.images || []);
                            } catch (e) {
                                console.error("Failed to parse images", e);
                            }
                            const mainImage = Array.isArray(images) && images.length > 0 ? images[0] : null;

                            return (
                                <div key={property.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition">
                                    <div className="relative h-44 bg-gray-100">
                                        {mainImage ? (
                                            <Image src={getImageUrl(mainImage)} alt={property.title} fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                property.isAvailable
                                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                                    : 'bg-red-100 text-red-800 border border-red-200'
                                            }`}>
                                                {property.isAvailable ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-3">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm truncate">{property.title}</h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <MapPin size={12} /> {property.location}
                                            </p>
                                        </div>

                                        <div className="flex justify-between items-baseline border-t border-gray-50 pt-2">
                                            <span className="text-xs text-gray-400 font-medium">{property.views || 0} views</span>
                                            <span className="font-black text-gray-900 text-base">₦{property.price.toLocaleString()}</span>
                                        </div>

                                        {/* Operations */}
                                        <div className="space-y-2 pt-2 border-t border-gray-100">
                                            {/* Make Out of Stock / In Stock Toggle */}
                                            <button
                                                onClick={() => handleToggleStock(property.id, property.isAvailable)}
                                                disabled={togglingId === property.id}
                                                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                                    property.isAvailable
                                                        ? 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                                                        : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                                                }`}
                                            >
                                                <RefreshCw size={12} className={togglingId === property.id ? "animate-spin" : ""} />
                                                {property.isAvailable ? "Make Out of Stock" : "Make In Stock"}
                                            </button>

                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/agents/dashboard/listings/edit/${property.id}`}
                                                    className="flex-1 py-2 px-3 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                                                >
                                                    <Edit2 size={13} /> Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleBringDown(property.id, property.title)}
                                                    className="flex-1 py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                                                >
                                                    <Trash2 size={13} /> Bring Down
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
