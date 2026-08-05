"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Home, Search, CheckCircle2, XCircle, Pause, Eye, Star, ExternalLink
} from "lucide-react";
import { usePostUtmeAdminStore } from "@/app/stores/usePostUtmeAdminStore";
import { toast } from "@/app/stores/useToastStore";
import PropertyDetailModal from "../../components/PropertyDetailModal";

const STATUS_COLORS: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PENDING_REVIEW: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    SUSPENDED: "bg-orange-100 text-orange-700",
};

export default function PostUtmeAdminPropertiesPage() {
    const { properties, propertiesTotal, currentProperty, isLoading, fetchProperty, fetchProperties, approveProperty, rejectProperty, suspendProperty } = usePostUtmeAdminStore();
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const params: Record<string, string> = { page: page.toString() };
        if (statusFilter) params.status = statusFilter;
        if (search) params.search = search;
        fetchProperties(params);
    }, [fetchProperties, statusFilter, search, page]);

    useEffect(() => {
        if (selectedId) {
            fetchProperty(selectedId);
        }
    }, [selectedId, fetchProperty]);

    const handleViewProperty = (id: string) => {
        setSelectedId(id);
        setModalOpen(true);
    };

    const handleApprove = async (id: string) => {
        setIsProcessing(true);
        const success = await approveProperty(id);
        if (success) {
            toast.success("Property approved");
            fetchProperty(id);
            fetchProperties({ page: page.toString(), ...(statusFilter ? { status: statusFilter } : {}), ...(search ? { search } : {}) });
        } else {
            toast.error("Failed to approve property");
        }
        setIsProcessing(false);
    };

    const handleReject = async (id: string) => {
        setIsProcessing(true);
        const success = await rejectProperty(id);
        if (success) {
            toast.success("Property rejected");
            fetchProperty(id);
            fetchProperties({ page: page.toString(), ...(statusFilter ? { status: statusFilter } : {}), ...(search ? { search } : {}) });
        } else {
            toast.error("Failed to reject property");
        }
        setIsProcessing(false);
    };

    const handleSuspend = async (id: string) => {
        setIsProcessing(true);
        const success = await suspendProperty(id);
        if (success) {
            toast.success("Property suspended");
            fetchProperty(id);
            fetchProperties({ page: page.toString(), ...(statusFilter ? { status: statusFilter } : {}), ...(search ? { search } : {}) });
        } else {
            toast.error("Failed to suspend property");
        }
        setIsProcessing(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <Home size={28} className="text-[#008489]" />
                    Post-UTME Properties
                </h1>
                <p className="text-gray-500 mt-1">Review, approve, or manage temporary housing listings.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search properties..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#008489] transition"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#008489] bg-white"
                >
                    <option value="">All Status</option>
                    <option value="PENDING_REVIEW">Pending Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="DRAFT">Draft</option>
                </select>
            </div>

            {isLoading && !modalOpen ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#008489]"></div>
                </div>
            ) : properties.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                    <Home size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No properties found</p>
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-500 font-medium">{propertiesTotal} properties found</div>
                    <div className="space-y-3">
                        {properties.map((property) => (
                            <motion.div
                                key={property.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition cursor-pointer"
                                onClick={() => handleViewProperty(property.id)}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900 truncate">{property.title}</h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[property.status] || "bg-gray-100 text-gray-700"}`}>
                                                {property.status}
                                            </span>
                                            {property.isVerified && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Verified</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">{property.address}, {property.area}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                            <span className="flex items-center gap-1"><Star size={12} className="text-yellow-400" /> {property.rating.toFixed(1)} ({property.reviewCount})</span>
                                            <span className="flex items-center gap-1"><Eye size={12} /> {property.views} views</span>
                                            <span>₦{property.pricePerNight.toLocaleString()}/night</span>
                                            <span>{property.availableRooms}/{property.totalRooms} rooms</span>
                                            {property._count && <span>{property._count.bookings} bookings</span>}
                                            {property.owner && <span>by {property.owner.fullName}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                        {property.status === "PENDING_REVIEW" && (
                                            <>
                                                <button onClick={() => handleApprove(property.id)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition" title="Approve">
                                                    <CheckCircle2 size={16} />
                                                </button>
                                                <button onClick={() => handleViewProperty(property.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition" title="View & Reject">
                                                    <XCircle size={16} />
                                                </button>
                                            </>
                                        )}
                                        {property.status === "APPROVED" && (
                                            <button onClick={() => handleSuspend(property.id)} className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition" title="Suspend">
                                                <Pause size={16} />
                                            </button>
                                        )}
                                        <button onClick={() => handleViewProperty(property.id)} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition" title="View Details">
                                            <ExternalLink size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {propertiesTotal > 20 && (
                        <div className="flex justify-center gap-2 pt-4">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-sm text-gray-500 font-medium">Page {page}</span>
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={properties.length < 20}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            <PropertyDetailModal
                property={currentProperty}
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setSelectedId(null); }}
                onApprove={handleApprove}
                onReject={handleReject}
                onSuspend={handleSuspend}
                isProcessing={isProcessing}
            />
        </div>
    );
}
