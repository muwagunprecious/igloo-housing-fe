"use client";

import { useEffect, useState } from "react";
import { useRoommateStore } from "@/app/stores/useRoommateStore";
import {
    CheckCircle2,
    XCircle,
    MessageSquare,
    Clock,
    MapPin,
    User,
    AlertCircle,
    Loader2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "@/app/stores/useToastStore";
import { getImageUrl } from "@/app/lib/imageUrl";
import api from "@/app/lib/axios";

export default function AgentRoommatesPage() {
    const { agentRequests, fetchAgentRequests, isLoading, error } = useRoommateStore();
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchAgentRequests();
    }, [fetchAgentRequests]);

    const handleUpdateStatus = async (requestId: string, status: "ACCEPTED" | "REJECTED") => {
        setActionLoading(requestId);
        try {
            const response = await api.put(`/roommate/request/${requestId}/status`, { status });
            if (response.data.success) {
                toast.success(`Request ${status.toLowerCase()}ed successfully`);
                fetchAgentRequests();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update status");
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-xl">
                <Loader2 className="animate-spin text-green-600 mb-4" size={32} />
                <p className="text-gray-500">Loading roommate requests...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-3">
                <AlertCircle size={24} />
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">Roommate Requests</h1>
                <p className="text-gray-600">Manage students looking to share your properties.</p>
            </header>

            {agentRequests.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                        <Clock size={32} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">No requests yet</h2>
                    <p className="text-gray-500">When students request a roommate spot on your properties, they will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {agentRequests.map((request) => (
                        <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                            {/* Property Info Sidebar */}
                            <div className="w-full md:w-64 bg-gray-50 p-6 border-b md:border-b-0 md:border-r border-gray-100">
                                {request.property && (
                                    <>
                                        <div className="relative h-32 rounded-lg overflow-hidden mb-4 shadow-sm">
                                            {(() => {
                                                try {
                                                    const images = typeof request.property.images === 'string'
                                                        ? JSON.parse(request.property.images)
                                                        : (request.property.images || []);
                                                    const firstImage = Array.isArray(images) ? images[0] : null;

                                                    return (
                                                        <Image
                                                            src={getImageUrl(firstImage || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267")}
                                                            alt={request.property.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    );
                                                } catch (e) {
                                                    return <div className="w-full h-full bg-gray-200" />;
                                                }
                                            })()}
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight">{request.property.title}</h3>
                                        <div className="flex items-center gap-1 text-gray-500 text-[10px] mb-4 uppercase tracking-wider font-bold">
                                            <MapPin size={10} />
                                            <span className="truncate">{request.property.location}</span>
                                        </div>
                                        <Link
                                            href={`/rooms/${request.property.id}`}
                                            className="text-xs text-green-600 font-bold hover:underline"
                                        >
                                            View Property
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Request Details */}
                            <div className="flex-1 p-6 flex flex-col">
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                                            <Image
                                                src={request.user.avatar || "/placeholder-avatar.png"}
                                                alt={request.user.fullName}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{request.user.fullName}</h4>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${request.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                            request.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {request.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl mb-6 relative">
                                    <div className="absolute top-0 left-4 -translate-y-1/2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">Student Note</div>
                                    <p className="text-gray-700 text-sm italic">&quot;{request.bio || "No specific note provided."}&quot;</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Student Budget</p>
                                        <p className="font-bold text-gray-900">₦{request.budget?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Prefered Gender</p>
                                        <p className="font-semibold text-gray-700 capitalize">{request.genderPref || "Any"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Room Type</p>
                                        <p className="font-semibold text-gray-700">{request.roomType || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="mt-auto flex flex-wrap gap-3 pt-6 border-t border-gray-100">
                                    {request.status === 'PENDING' ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdateStatus(request.id, 'ACCEPTED')}
                                                disabled={!!actionLoading}
                                                className="flex-1 min-w-[120px] bg-green-600 text-white py-2 px-4 rounded-lg font-bold text-sm hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {actionLoading === request.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={18} />}
                                                Accept Request
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(request.id, 'REJECTED')}
                                                disabled={!!actionLoading}
                                                className="flex-1 min-w-[120px] bg-white border border-red-200 text-red-600 py-2 px-4 rounded-lg font-bold text-sm hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <XCircle size={18} />
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            disabled
                                            className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-bold flex items-center gap-2"
                                        >
                                            <Clock size={18} />
                                            Request Handled
                                        </button>
                                    )}
                                    <Link
                                        href={`/agents/dashboard/messages?userId=${request.userId}`}
                                        className="flex-1 min-w-[120px] bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg font-bold text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare size={18} />
                                        Message Student
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
