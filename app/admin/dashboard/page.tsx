"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/app/stores/useAdminStore";
import {
    Users,
    MessageSquare,
    AlertCircle,
    TrendingUp,
    Building2,
    ArrowRight,
    CheckCircle2,
    MapPin,
    Clock,
    UserCheck,
    Eye,
    Video
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/app/lib/imageUrl";
import PropertyPreviewModal from "@/app/admin/components/PropertyPreviewModal";

export default function AdminDashboardPage() {
    const { stats, properties, isLoading, fetchStats, fetchProperties, approveProperty, rejectProperty } = useAdminStore();
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [previewProperty, setPreviewProperty] = useState<any | null>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    useEffect(() => {
        fetchStats();
        fetchProperties("PENDING");
    }, [fetchStats, fetchProperties]);

    const handleApprove = async (id: string) => {
        if (confirm("Execute authorization for this apartment listing? It will become visible to all students.")) {
            setActionLoadingId(id);
            await approveProperty(id);
            setActionLoadingId(null);
        }
    };

    if (isLoading && !stats) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    const pendingApartments = properties.filter((p) => p.status === "PENDING");
    const pendingApartmentsCount = stats?.pendingProperties ?? pendingApartments.length;

    const statCards = [
        {
            label: "Total Users",
            value: stats?.users.total || 0,
            icon: Users,
            colorClass: "bg-blue-50 text-blue-600",
            href: "/admin/users"
        },
        {
            label: "Active Listings",
            value: stats?.approvedProperties ?? stats?.properties ?? 0,
            icon: Building2,
            colorClass: "bg-green-50 text-green-600",
            href: "/admin/properties?status=APPROVED"
        },
        {
            label: "Pending Apartments",
            value: pendingApartmentsCount,
            icon: AlertCircle,
            colorClass: "bg-orange-50 text-orange-600",
            href: "/admin/properties?status=PENDING",
            badge: pendingApartmentsCount > 0 ? "Action Required" : undefined
        },
        {
            label: "Pending Agents",
            value: stats?.agents.pending || 0,
            icon: UserCheck,
            colorClass: "bg-amber-50 text-amber-600",
            href: "/admin/agents",
            badge: (stats?.agents.pending || 0) > 0 ? "Review Needed" : undefined
        },
        {
            label: "Total Messages",
            value: stats?.messages || 0,
            icon: MessageSquare,
            colorClass: "bg-purple-50 text-purple-600",
            href: "/admin/messages"
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight">System Control</h1>
                    <p className="text-gray-500 font-medium">Monitoring platform health, property verifications, and agent onboarding.</p>
                </div>
                {pendingApartmentsCount > 0 && (
                    <Link
                        href="/admin/properties?status=PENDING"
                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-orange-100 transition shadow-sm w-fit"
                    >
                        <AlertCircle size={16} />
                        <span>{pendingApartmentsCount} Apartment{pendingApartmentsCount === 1 ? "" : "s"} Awaiting Approval</span>
                    </Link>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {statCards.map((card) => (
                    <Link key={card.label} href={card.href}>
                        <div className="p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm hover:shadow-card-hover hover:border-black/5 transition group cursor-pointer h-full relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl w-fit transition-colors group-hover:bg-black group-hover:text-white ${card.colorClass}`}>
                                    <card.icon size={24} />
                                </div>
                                {card.badge && (
                                    <span className="text-[9px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full animate-pulse">
                                        {card.badge}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                                <h3 className="text-3xl font-black tracking-tight">{card.value.toLocaleString()}</h3>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Pending Apartments Review Section */}
            <div className="bg-white border border-gray-100 rounded-[36px] p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-orange-100 text-orange-600 rounded-2xl">
                            <Building2 size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-black">Apartments Awaiting Approval</h2>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                                Click preview to inspect all photos, video, specifications and agent details before approving
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/admin/properties?status=PENDING"
                        className="text-xs font-black uppercase tracking-wider text-primary hover:underline flex items-center gap-1.5"
                    >
                        <span>View All in Inventory</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>

                {pendingApartments.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50/60 rounded-[28px] border border-dashed border-gray-200">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 size={24} />
                        </div>
                        <h4 className="text-base font-black text-black mb-1">Queue Clear</h4>
                        <p className="text-xs text-gray-500 font-medium">All apartment listings have been reviewed and approved.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingApartments.map((apt) => {
                            const firstImage = Array.isArray(apt.images) && apt.images.length > 0 ? apt.images[0] : null;
                            const isApproving = actionLoadingId === apt.id;

                            return (
                                <div
                                    key={apt.id}
                                    className="bg-gray-50/70 border border-gray-100 rounded-[28px] p-5 flex flex-col justify-between hover:border-black/10 hover:shadow-lg hover:shadow-black/5 transition-all group"
                                >
                                    <div>
                                        {/* Property Image & Status (clickable for preview) */}
                                        <div
                                            onClick={() => setPreviewProperty(apt)}
                                            className="relative w-full h-44 rounded-2xl overflow-hidden mb-4 bg-gray-200 cursor-pointer"
                                        >
                                            {firstImage ? (
                                                <Image
                                                    src={getImageUrl(firstImage)}
                                                    alt={apt.title}
                                                    fill
                                                    unoptimized
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Building2 size={40} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="px-3 py-1.5 bg-white text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-1.5">
                                                    <Eye size={14} /> Preview
                                                </span>
                                            </div>
                                            <div className="absolute top-3 left-3 bg-black/80 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-lg backdrop-blur-md">
                                                {apt.category || "Apartment"}
                                            </div>
                                            {apt.video && (
                                                <div className="absolute top-3 right-3 bg-purple-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-md">
                                                    <Video size={11} />
                                                    Video Tour
                                                </div>
                                            )}
                                            <div className="absolute bottom-3 right-3 bg-white text-black text-xs font-black px-3 py-1 rounded-lg shadow-md">
                                                ₦{apt.price.toLocaleString()}
                                            </div>
                                        </div>

                                        {/* Title & Location */}
                                        <h3
                                            onClick={() => setPreviewProperty(apt)}
                                            className="text-lg font-black tracking-tight text-black line-clamp-1 mb-1 cursor-pointer hover:text-primary transition-colors"
                                        >
                                            {apt.title}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-3">
                                            <MapPin size={13} className="text-primary shrink-0" />
                                            <span className="truncate">{apt.location}</span>
                                        </div>

                                        {/* Agent & Date info */}
                                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 mb-4">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-black overflow-hidden relative shrink-0">
                                                    {apt.agent?.avatar ? (
                                                        <Image
                                                            src={getImageUrl(apt.agent.avatar)}
                                                            alt={apt.agent.fullName || "Agent"}
                                                            fill
                                                            unoptimized
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        apt.agent?.fullName?.charAt(0) || "A"
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-black truncate">{apt.agent?.fullName || "Agent"}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium truncate">{apt.agent?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold shrink-0">
                                                <Clock size={11} />
                                                <span>{new Date(apt.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions with Preview Button */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={() => setPreviewProperty(apt)}
                                            className="py-2.5 px-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 hover:text-black transition flex items-center gap-1.5 text-xs font-bold"
                                            title="Inspect all photos, video & specs"
                                        >
                                            <Eye size={15} />
                                            <span>Preview</span>
                                        </button>
                                        <button
                                            onClick={() => handleApprove(apt.id)}
                                            disabled={isApproving}
                                            className="flex-1 py-2.5 px-4 bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-black/10 disabled:opacity-50"
                                        >
                                            <CheckCircle2 size={15} />
                                            <span>{isApproving ? "Approving..." : "Authorize"}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black flex items-center gap-3">
                            <TrendingUp size={24} className="text-primary" />
                            Activity Trends
                        </h3>
                        <select className="bg-gray-50 border-none text-sm font-bold rounded-xl px-4 py-2 cursor-pointer outline-none focus:ring-2 focus:ring-black/5">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>This Year</option>
                        </select>
                    </div>

                    {/* Mock Chart Area */}
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="w-full bg-gray-50 rounded-t-2xl relative group cursor-pointer hover:bg-black transition-colors duration-500" style={{ height: `${h}%` }}>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h * 12}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest px-2">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                    <h3 className="text-xl font-black mb-8">User Distribution</h3>
                    <div className="space-y-8">
                        {[
                            { label: "Students", count: stats?.users.students || 0, color: "bg-blue-500" },
                            { label: "Agents", count: stats?.users.agents || 0, color: "bg-green-500" },
                            { label: "Staff", count: stats?.users.admins || 0, color: "bg-purple-500" },
                        ].map((item) => (
                            <div key={item.label}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-extrabold text-gray-600 text-sm tracking-tight">{item.label}</span>
                                    <span className="font-black text-lg">{item.count}</span>
                                </div>
                                <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${item.color}`}
                                        style={{ width: `${(item.count / (stats?.users.total || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Critical Tasks */}
            <div className="bg-black text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 flex flex-col h-full">
                    <h3 className="text-2xl font-black mb-8 tracking-tight">Critical Oversight</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: "Verify Pending Agents", href: "/admin/agents", icon: CheckCircle2, sub: `${stats?.agents.pending || 0} waiting` },
                            { label: "Review New Listings", href: "/admin/properties?status=PENDING", icon: Building2, sub: `${pendingApartmentsCount} waiting approval` },
                            { label: "Platform Comms Log", href: "/admin/messages", icon: MessageSquare, sub: "Monitor interactions" },
                        ].map((action) => (
                            <Link key={action.label} href={action.href}>
                                <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition border border-white/5 group cursor-pointer hover:border-white/10 h-full">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-primary/20 rounded-xl text-primary font-bold">
                                            <action.icon size={20} />
                                        </div>
                                        <div>
                                            <span className="font-black block leading-tight">{action.label}</span>
                                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">{action.sub}</span>
                                        </div>
                                    </div>
                                    <ArrowRight size={20} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition" />
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest italic">
                        Igloo Estate Admin Controls v1.0
                    </div>
                </div>
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:bg-primary/30 transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-[80px]"></div>
            </div>

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
