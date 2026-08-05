"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Eye, Edit, Trash2, ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import Button from "@/app/components/common/Button";
import { usePostUtmeStore } from "@/app/stores/usePostUtmeStore";
import { toast } from "@/app/stores/useToastStore";
import { useRouter } from "next/navigation";

const STATUS_BADGES: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-600", icon: Edit },
    PENDING_REVIEW: { label: "Pending Review", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    APPROVED: { label: "Approved", color: "bg-green-100 text-green-700", icon: CheckCircle },
    REJECTED: { label: "Rejected", color: "bg-red-100 text-red-600", icon: XCircle },
    SUSPENDED: { label: "Suspended", color: "bg-orange-100 text-orange-600", icon: AlertCircle },
    UNAVAILABLE: { label: "Unavailable", color: "bg-gray-100 text-gray-500", icon: XCircle },
};

export default function RenterListingsPage() {
    const router = useRouter();
    const { myProperties, isLoading, fetchMyProperties, deleteProperty, submitForReview } = usePostUtmeStore();

    useEffect(() => {
        fetchMyProperties();
    }, [fetchMyProperties]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this listing?")) return;
        const success = await deleteProperty(id);
        if (success) {
            toast.success("Listing deleted");
            fetchMyProperties();
        } else {
            toast.error("Failed to delete listing");
        }
    };

    const handleSubmit = async (id: string) => {
        const success = await submitForReview(id);
        if (success) {
            toast.success("Submitted for review!");
            fetchMyProperties();
        } else {
            toast.error("Failed to submit");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
                    <Link href="/post-utme/list-property" className="bg-[#008489] hover:bg-[#006b6e] text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition">
                        <Plus size={16} /> New Listing
                    </Link>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />)}
                    </div>
                ) : myProperties.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center">
                        <p className="text-xl font-bold text-gray-900 mb-2">No listings yet</p>
                        <p className="text-gray-500 mb-6">Start earning by listing your apartment for Post-UTME students</p>
                        <Link href="/post-utme/list-property" className="bg-[#008489] text-white px-6 py-3 rounded-full font-semibold text-sm inline-block hover:bg-[#006b6e] transition">
                            List Your First Property
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myProperties.map((property, idx) => {
                            const badge = STATUS_BADGES[property.status] || STATUS_BADGES.DRAFT;
                            const BadgeIcon = badge.icon;
                            const img = property.images?.[0]?.url;
                            return (
                                <motion.div
                                    key={property.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm"
                                >
                                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                                        {img ? <Image src={img} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-bold text-sm truncate">{property.title}</h3>
                                            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badge.color}`}>
                                                <BadgeIcon size={10} />{badge.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">{property.area} · ₦{property.pricePerNight.toLocaleString()}/night</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                            <span>{property.availableRooms} rooms</span>
                                            <span>{property.views} views</span>
                                            <span>{property._count?.bookings || 0} bookings</span>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            {(property.status === 'DRAFT' || property.status === 'REJECTED') && (
                                                <Button size="sm" className="bg-[#008489] text-white border-none text-xs" onClick={() => handleSubmit(property.id)}>
                                                    Submit for Review
                                                </Button>
                                            )}
                                            <Link href={`/post-utme/${property.id}`} className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 transition">
                                                <Eye size={12} /> View
                                            </Link>
                                            <button onClick={() => handleDelete(property.id)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition">
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
