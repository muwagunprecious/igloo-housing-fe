"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/axios";
import { Plus, Edit2, Trash2, Home, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/app/lib/imageUrl";

export default function MyListingsPage() {
    const [properties, setProperties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this listing?")) return;

        try {
            await api.delete(`/properties/${id}`);
            // Remove from state
            setProperties(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            alert("Failed to delete property");
            console.error(error);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading listings...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
                <Link
                    href="/agents/dashboard/listings/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                    <Plus size={20} />
                    Post New
                </Link>
            </div>

            {properties.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
                        <Home size={32} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h2>
                    <p className="text-gray-500 mb-6">You haven't posted any properties yet. Start reaching students today.</p>
                    <Link
                        href="/agents/dashboard/listings/create"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        <Plus size={20} />
                        Create your first listing
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
                        const mainImage = Array.isArray(images) && images.length > 0 ? images[0] : "/placeholder-house.jpg";

                        return (
                            <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                                <div className="relative h-48 bg-gray-200">
                                    {images.length > 0 ? (
                                        <Image src={getImageUrl(mainImage)} alt={property.title} fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-semibold text-gray-700">
                                        {property.category}
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-gray-900 line-clamp-1">{property.title}</h3>
                                        <div className="font-bold text-green-600">₦{property.price.toLocaleString()}</div>
                                    </div>

                                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                                        <MapPin size={14} />
                                        <span className="truncate">{property.location}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4 border-t border-gray-100 pt-4">
                                        <div className="text-center">
                                            <div className="font-bold text-gray-900">{property.views || 0}</div>
                                            <div className="text-xs">Views</div>
                                        </div>
                                        <div className="text-center border-l border-gray-100">
                                            <div className="font-bold text-gray-900">{property._count?.roommateRequests || 0}</div>
                                            <div className="text-xs">Requests</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            href={`/agents/dashboard/listings/edit/${property.id}`}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                                        >
                                            <Edit2 size={16} />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(property.id)}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
