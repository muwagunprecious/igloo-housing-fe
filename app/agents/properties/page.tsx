"use client";

import { useAgentPropertiesStore } from "../stores/useAgentPropertiesStore";
import AgentSidebar from "../components/AgentSidebar";
import { Home, Plus, Edit, Trash2, Eye, Video } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/app/components/common/Button";
import { getImageUrl } from "@/app/lib/imageUrl";

export default function AgentPropertiesPage() {
    const properties = useAgentPropertiesStore((state) => state.properties);
    const deleteProperty = useAgentPropertiesStore((state) => state.deleteProperty);

    const handleDelete = (id: string, title: string) => {
        if (confirm(`Are you sure you want to delete "${title}"?`)) {
            deleteProperty(id);
        }
    };

    return (
        <div className="max-w-[1920px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-[100px] pb-20">
            <div className="flex gap-8">
                <AgentSidebar />

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">My Properties</h1>
                            <p className="text-gray-500">Manage your property listings</p>
                        </div>
                        <Link href="/agents/properties/new">
                            <Button className="flex items-center gap-2">
                                <Plus size={18} />
                                Add New Property
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Total Properties</p>
                            <p className="text-2xl font-bold">{properties.length}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Available</p>
                            <p className="text-2xl font-bold text-green-600">
                                {properties.filter((p) => p.status === "Available").length}
                            </p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Booked</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {properties.filter((p) => p.status === "Booked").length}
                            </p>
                        </div>
                    </div>

                    {/* Properties Grid */}
                    {properties.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {properties.map((property) => (
                                <div key={property.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-card-hover transition">
                                    <div className="relative h-48 bg-slate-900">
                                        {Array.isArray(property.images) && property.images.length > 0 ? (
                                            <Image
                                                src={getImageUrl(property.images[0])}
                                                alt={property.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : property.video ? (
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <video
                                                    src={getImageUrl(property.video)}
                                                    className="object-cover w-full h-full opacity-85"
                                                    muted
                                                    playsInline
                                                />
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                                                    <div className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center shadow-lg">
                                                        <Video size={18} />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow">
                                                    <Video size={12} /> Video Tour
                                                </div>
                                            </div>
                                        ) : (
                                            <Image
                                                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                                alt={property.title}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${property.status === "Available"
                                            ? 'bg-green-500 text-white'
                                            : 'bg-blue-500 text-white'
                                            }`}>
                                            {property.status}
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{property.title}</h3>
                                        <p className="text-sm text-gray-500 mb-3 line-clamp-1">{property.address || property.location}</p>

                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Price / Semester</p>
                                                <p className="text-lg font-bold">₦{property.price.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Type</p>
                                                <p className="text-sm font-semibold">{property.category}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {(property.amenities || []).slice(0, 3).map((amenity) => (
                                                <span key={amenity} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                    {amenity}
                                                </span>
                                            ))}
                                            {(property.amenities || []).length > 3 && (
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                    +{(property.amenities || []).length - 3} more
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <Link href={`/rooms/${property.id}`}>
                                                <button className="w-full p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-1 text-sm">
                                                    <Eye size={14} />
                                                    View
                                                </button>
                                            </Link>
                                            <Link href={`/agents/dashboard/listings/edit/${property.id}`}>
                                                <button className="w-full p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-1 text-sm">
                                                    <Edit size={14} />
                                                    Edit
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(property.id, property.title)}
                                                className="w-full p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-1 text-sm"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl">
                            <Home className="mx-auto mb-4 text-gray-400" size={64} />
                            <h3 className="text-xl font-semibold mb-2">No properties yet</h3>
                            <p className="text-gray-500 mb-6">Start by adding your first property listing.</p>
                            <Link href="/agents/properties/new">
                                <Button>
                                    <Plus size={18} className="mr-2" />
                                    Add New Property
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
