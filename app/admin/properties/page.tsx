"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/app/stores/useAdminStore";
import { MapPin, User, Building2, Clock, Trash2, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function AdminPropertiesPage() {
    const { properties, isLoading, fetchProperties, approveProperty, rejectProperty, deleteProperty } = useAdminStore();
    const [filterStatus, setFilterStatus] = useState("PENDING");
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        fetchProperties(filterStatus);
    }, [fetchProperties, filterStatus]);

    const handleApprove = async (id: string) => {
        if (confirm("Execute approval for this asset?")) {
            await approveProperty(id);
        }
    };

    const handleRejectClick = (id: string) => {
        setRejectingId(id);
        setRejectReason("");
    };

    const handleRejectSubmit = async () => {
        if (rejectingId && rejectReason) {
            await rejectProperty(rejectingId, rejectReason);
            setRejectingId(null);
            setRejectReason("");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to PERMANENTLY delete this property? This action cannot be undone.")) {
            await deleteProperty(id);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight text-black">Inventory Control</h1>
                    <p className="text-gray-500 font-medium">Verify and manage technical listing specifications.</p>
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
                    {properties.map((property) => (
                        <div key={property.id} className="bg-white border border-gray-50 rounded-[40px] overflow-hidden flex flex-col lg:flex-row shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-700 group border-b-4 border-b-transparent hover:border-b-primary relative">
                            {/* Visual Asset */}
                            <div className="w-full lg:w-96 h-72 lg:h-auto bg-gray-50 lg:shrink-0 relative overflow-hidden">
                                {Array.isArray(property.images) && property.images.length > 0 ? (
                                    <Image
                                        src={property.images[0]}
                                        alt={property.title}
                                        fill
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                                        <Building2 size={64} />
                                    </div>
                                )}
                                <div className="absolute top-6 left-6">
                                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md ${property.status === 'APPROVED' ? 'bg-green-500/90 text-white' :
                                        property.status === 'REJECTED' ? 'bg-red-500/90 text-white' :
                                            'bg-black/80 text-white'
                                        }`}>
                                        {property.status}
                                    </span>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="p-10 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                        <div>
                                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                                                <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-black">{property.category}</span>
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={12} className="text-primary" />
                                                    {new Date(property.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                            <h3 className="text-3xl font-black tracking-tighter text-black group-hover:text-primary transition-colors duration-500">{property.title}</h3>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <p className="text-3xl font-black text-black tracking-tighter">₦{property.price.toLocaleString()}</p>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Annual Valuation</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div className="p-5 bg-gray-50 rounded-[24px] border border-gray-100 flex items-center gap-4 group/item hover:bg-white transition-all">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-300 group-hover/item:text-primary shadow-sm transition-colors">
                                                <MapPin size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-300 mb-0.5">Physical Hub</p>
                                                <p className="text-sm font-black truncate">{property.location}</p>
                                            </div>
                                        </div>
                                        <div className="p-5 bg-gray-50 rounded-[24px] border border-gray-100 flex items-center gap-4 group/item hover:bg-white transition-all">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-300 group-hover/item:text-primary shadow-sm transition-colors overflow-hidden relative">
                                                {property.agent.avatar ? <Image src={property.agent.avatar} alt={property.agent.fullName} fill className="object-cover" /> : <User size={20} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-300 mb-0.5">Asset Custodian</p>
                                                <p className="text-sm font-black truncate flex items-center gap-2">
                                                    {property.agent.fullName}
                                                    {property.agent.isVerified && <CheckCircle2 size={16} className="text-blue-500 fill-blue-50" />}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-gray-500 font-medium leading-relaxed text-sm lg:text-base line-clamp-2 italic border-l-4 border-primary/20 pl-6 mb-8">{property.description}</p>
                                </div>
                                 <div className="flex flex-col md:flex-row gap-4 mt-4 justify-end">
                                     {property.status === 'PENDING' && (
                                         <>
                                             <button
                                                 onClick={() => handleRejectClick(property.id)}
                                                 className="px-10 py-5 bg-white border-2 border-red-50 text-red-600 rounded-[20px] hover:bg-red-50 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                                             >
                                                 <Trash2 size={20} />
                                                 Decline Asset
                                             </button>
                                             <button
                                                 onClick={() => handleApprove(property.id)}
                                                 className="px-10 py-5 bg-black text-white rounded-[20px] hover:bg-primary hover:text-black flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-95"
                                             >
                                                 <CheckCircle2 size={20} />
                                                 Authorize Listing
                                             </button>
                                         </>
                                     )}
                                     <button
                                         onClick={() => handleDelete(property.id)}
                                         className="px-10 py-5 bg-white border-2 border-red-50 text-red-600 rounded-[20px] hover:bg-red-50 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                                     >
                                         <Trash2 size={20} />
                                         Delete Asset
                                     </button>
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reject Interface */}
            {rejectingId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[48px] p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-4xl font-black mb-4 tracking-tight">Rejection Protocol</h3>
                            <p className="text-gray-500 font-medium mb-10 text-lg">Briefly articulate the reasoning for declining this asset deployment to inform the custodian.</p>

                            <div className="group mb-10">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-4 ml-2 group-focus-within:text-black transition-colors">Incident Narrative</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black/5 focus:ring-[16px] focus:ring-black/5 rounded-[32px] py-8 px-10 transition-all duration-500 font-bold text-lg resize-none placeholder:text-gray-200 min-h-[240px]"
                                    placeholder="e.g., Image resolution insufficient, Misrepresented amenities..."
                                />
                            </div>

                            <div className="flex flex-col md:flex-row justify-end gap-6">
                                <button
                                    onClick={() => setRejectingId(null)}
                                    className="px-10 py-6 text-gray-400 font-black uppercase tracking-widest text-xs hover:text-black transition-colors"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleRejectSubmit}
                                    disabled={!rejectReason}
                                    className="bg-red-600 hover:bg-red-700 text-white py-6 px-12 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all outline-none"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                        {/* Background decoration */}
                        <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-100 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
                    </div>
                </div>
            )}
        </div>
    );
}

