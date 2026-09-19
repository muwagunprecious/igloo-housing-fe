"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminStore } from "@/app/stores/useAdminStore";
import { MapPin, User, Building2, Clock, Trash2, CheckCircle2, AlertCircle, Eye, Video } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/app/lib/imageUrl";
import PropertyPreviewModal from "@/app/admin/components/PropertyPreviewModal";

function AdminPropertiesContent() {
    const searchParams = useSearchParams();
    const statusParam = searchParams.get("status")?.toUpperCase();
    const initialStatus = ["PENDING", "APPROVED", "REJECTED"].includes(statusParam || "")
        ? (statusParam as string)
        : "PENDING";

    const { properties, isLoading, fetchProperties, approveProperty, rejectProperty, deleteProperty } = useAdminStore();
    const [filterStatus, setFilterStatus] = useState(initialStatus);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [previewProperty, setPreviewProperty] = useState<any | null>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    // Sync filterStatus if URL param changes
    useEffect(() => {
        if (statusParam && ["PENDING", "APPROVED", "REJECTED"].includes(statusParam)) {
            setFilterStatus(statusParam);
        }
    }, [statusParam]);

    useEffect(() => {
        fetchProperties(filterStatus);
    }, [fetchProperties, filterStatus]);

    const handleApprove = async (id: string) => {
        if (confirm("Execute approval for this apartment listing? It will be published for students.")) {
            setActionLoadingId(id);
            await approveProperty(id);
            setActionLoadingId(null);
        }
    };

    const handleRejectClick = (id: string) => {
        setRejectingId(id);
        setRejectReason("");
    };

    const handleRejectSubmit = async () => {
        if (rejectingId && rejectReason) {
            setActionLoadingId(rejectingId);
            await rejectProperty(rejectingId, rejectReason);
            setActionLoadingId(null);
            setRejectingId(null);
            setRejectReason("");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to PERMANENTLY delete this property? This action cannot be undone.")) {
            setActionLoadingId(id);
            await deleteProperty(id);
            setActionLoadingId(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight text-black">Inventory Control</h1>
                    <p className="text-gray-500 font-medium">Verify, preview all photos/video, and manage property listings submitted by agents.</p>
                </div>
                <div className="flex p-1.5 bg-gray-50 rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
                    {["PENDING", "APPROVED", "REJECTED"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-6 py-3.5 rounded-[22px] font-black text-[10px] uppercase tracking-widest transition-all duration-500 ${filterStatus === status
                                ? "bg-black text-white shadow-2xl shadow-black/20 scale-[1.05] z-10"
                                : "text-gray-400 hover:text-black"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 bg-white border border-gray-100 rounded-[48px] shadow-sm">
                    <div className="animate-spin rounded-[18px] h-12 w-12 border-4 border-black/5 border-t-black mb-6"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Synchronizing Asset Data...</p>
                </div>
            ) : properties.length === 0 ? (
                <div className="text-center py-40 bg-white border border-gray-100 rounded-[48px] shadow-sm">
                    <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 border-2 border-dashed border-gray-100">
                        <Building2 className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-2xl font-black mb-2 tracking-tight">Registry Empty</h3>
                    <p className="text-gray-400 font-bold text-sm max-w-xs mx-auto italic">No properties currently indexed under {filterStatus.toLowerCase()} status.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {properties.map((property) => {
                        const firstImage = Array.isArray(property.images) && property.images.length > 0 ? property.images[0] : null;
                        const isActionBusy = actionLoadingId === property.id;

                        return (
                            <div key={property.id} className="bg-white border border-gray-100 rounded-[40px] overflow-hidden flex flex-col lg:flex-row shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-700 group border-b-4 border-b-transparent hover:border-b-primary relative">
                                {/* Visual Asset with Preview Click */}
                                <div
                                    onClick={() => setPreviewProperty(property)}
                                    className="w-full lg:w-96 h-72 lg:h-auto bg-gray-100 lg:shrink-0 relative overflow-hidden cursor-pointer group/thumb"
                                >
                                    {firstImage ? (
                                        <Image
                                            src={getImageUrl(firstImage)}
                                            alt={property.title}
                                            fill
                                            unoptimized
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Building2 size={64} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="px-4 py-2 bg-white text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2">
                                            <Eye size={16} /> Click to Preview
                                        </span>
                                    </div>
                                    <div className="absolute top-6 left-6">
                                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md ${property.status === 'APPROVED' ? 'bg-green-500/90 text-white' :
                                            property.status === 'REJECTED' ? 'bg-red-500/90 text-white' :
                                                'bg-black/80 text-white'
                                            }`}>
                                            {property.status}
                                        </span>
                                    </div>
                                    {property.video && (
                                        <div className="absolute top-6 right-6">
                                            <span className="px-3.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md bg-purple-600 text-white flex items-center gap-1.5">
                                                <Video size={13} />
                                                Video Tour
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Metadata */}
                                <div className="p-8 lg:p-10 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                            <div>
                                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                                                    <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-black font-bold">{property.category || "Apartment"}</span>
                                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock size={12} className="text-primary" />
                                                        {new Date(property.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <h3
                                                    onClick={() => setPreviewProperty(property)}
                                                    className="text-2xl lg:text-3xl font-black tracking-tighter text-black group-hover:text-primary transition-colors duration-500 cursor-pointer"
                                                >
                                                    {property.title}
                                                </h3>
                                            </div>
                                            <div className="flex flex-col md:items-end">
                                                <p className="text-2xl lg:text-3xl font-black text-black tracking-tighter">₦{property.price.toLocaleString()}</p>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Annual Valuation</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <div className="p-4 bg-gray-50 rounded-[24px] border border-gray-100 flex items-center gap-4 group/item hover:bg-white transition-all">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover/item:text-primary shadow-sm transition-colors shrink-0">
                                                    <MapPin size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Physical Hub / Location</p>
                                                    <p className="text-sm font-black truncate">{property.location}</p>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-[24px] border border-gray-100 flex items-center gap-4 group/item hover:bg-white transition-all">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover/item:text-primary shadow-sm transition-colors overflow-hidden relative shrink-0">
                                                    {property.agent?.avatar ? (
                                                        <Image
                                                            src={getImageUrl(property.agent.avatar)}
                                                            alt={property.agent.fullName || "Agent"}
                                                            fill
                                                            unoptimized
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <User size={20} />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Agent Custodian</p>
                                                    <p className="text-sm font-black truncate flex items-center gap-2">
                                                        {property.agent?.fullName || "Agent"}
                                                        {property.agent?.isVerified && <CheckCircle2 size={16} className="text-blue-500 fill-blue-50 shrink-0" />}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {property.description && (
                                            <p className="text-gray-500 font-medium leading-relaxed text-sm line-clamp-2 italic border-l-4 border-primary/20 pl-4 mb-6">
                                                {property.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 mt-4 justify-end">
                                        {/* Preview Button */}
                                        <button
                                            onClick={() => setPreviewProperty(property)}
                                            className="px-6 py-4 bg-gray-50 border-2 border-gray-200 hover:border-black text-gray-800 rounded-[20px] hover:bg-gray-100 flex items-center justify-center gap-2.5 font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                                        >
                                            <Eye size={18} />
                                            Preview Listing
                                        </button>

                                        {property.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleRejectClick(property.id)}
                                                    disabled={isActionBusy}
                                                    className="px-8 py-4 bg-white border-2 border-red-100 text-red-600 rounded-[20px] hover:bg-red-50 flex items-center justify-center gap-2.5 font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                                >
                                                    <Trash2 size={18} />
                                                    Decline Asset
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(property.id)}
                                                    disabled={isActionBusy}
                                                    className="px-8 py-4 bg-black text-white rounded-[20px] hover:bg-primary hover:text-black flex items-center justify-center gap-2.5 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                                >
                                                    <CheckCircle2 size={18} />
                                                    {isActionBusy ? "Authorizing..." : "Authorize Listing"}
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleDelete(property.id)}
                                            disabled={isActionBusy}
                                            className="px-8 py-4 bg-white border-2 border-gray-100 text-gray-500 hover:text-red-600 hover:border-red-100 rounded-[20px] hover:bg-red-50 flex items-center justify-center gap-2.5 font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                        >
                                            <Trash2 size={18} />
                                            Delete Asset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Reject Modal */}
            {rejectingId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[48px] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2 text-red-600">
                                <AlertCircle size={28} />
                                <h3 className="text-3xl font-black tracking-tight text-black">Decline Listing</h3>
                            </div>
                            <p className="text-gray-500 font-medium mb-8 text-sm md:text-base">
                                Provide a concise reason for declining this apartment listing to inform the agent.
                            </p>

                            <div className="group mb-8">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-2 group-focus-within:text-black transition-colors">
                                    Reason for Rejection
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:border-black/20 focus:ring-4 focus:ring-black/5 rounded-[24px] py-5 px-6 transition-all font-medium text-sm md:text-base resize-none placeholder:text-gray-300 min-h-[160px]"
                                    placeholder="e.g. Pictures are blurry, incomplete address, price mismatch..."
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-4">
                                <button
                                    onClick={() => setRejectingId(null)}
                                    className="px-8 py-4 text-gray-400 font-black uppercase tracking-widest text-xs hover:text-black transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRejectSubmit}
                                    disabled={!rejectReason.trim()}
                                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-4 px-8 rounded-[20px] font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all outline-none"
                                >
                                    Confirm Decline
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Interactive Full Property Preview Modal */}
            <PropertyPreviewModal
                property={previewProperty}
                isOpen={!!previewProperty}
                onClose={() => setPreviewProperty(null)}
                onApprove={async (id) => {
                    await approveProperty(id);
                    setPreviewProperty(null);
                }}
                onReject={async (id, reason) => {
                    await rejectProperty(id, reason);
                    setPreviewProperty(null);
                }}
            />
        </div>
    );
}

export default function AdminPropertiesPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-40 bg-white border border-gray-100 rounded-[48px] shadow-sm">
                <div className="animate-spin rounded-[18px] h-12 w-12 border-4 border-black/5 border-t-black mb-6"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Loading Properties Registry...</p>
            </div>
        }>
            <AdminPropertiesContent />
        </Suspense>
    );
}
