"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    GraduationCap, Home, Calendar, CreditCard, RotateCcw, TrendingUp,
    ArrowRight, Users, Wallet, CheckCircle2, Clock, AlertCircle
} from "lucide-react";
import { usePostUtmeAdminStore } from "@/app/stores/usePostUtmeAdminStore";

export default function PostUtmeAdminOverviewPage() {
    const { stats, isLoading, fetchStats } = usePostUtmeAdminStore();

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (isLoading && !stats) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008489]"></div>
            </div>
        );
    }

    const statCards = [
        { label: "Total Properties", value: stats?.totalProperties || 0, icon: Home, color: "bg-teal-50 text-teal-600", href: "/admin/post-utme/properties" },
        { label: "Pending Approval", value: stats?.pendingApproval || 0, icon: Clock, color: "bg-yellow-50 text-yellow-600", href: "/admin/post-utme/properties?status=PENDING_REVIEW" },
        { label: "Active Bookings", value: stats?.activeBookings || 0, icon: Calendar, color: "bg-blue-50 text-blue-600", href: "/admin/post-utme/bookings" },
        { label: "Total Revenue", value: stats?.totalRevenue || 0, icon: Wallet, color: "bg-green-50 text-green-600", href: "/admin/post-utme/bookings", isCurrency: true },
        { label: "Pending Payouts", value: stats?.pendingPayouts || 0, icon: CreditCard, color: "bg-orange-50 text-orange-600", href: "/admin/post-utme/payouts" },
        { label: "Pending Refunds", value: stats?.pendingRefunds || 0, icon: RotateCcw, color: "bg-red-50 text-red-600", href: "/admin/post-utme/refunds" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <GraduationCap size={28} className="text-[#008489]" />
                    <h1 className="text-3xl font-black tracking-tight">Post-UTME Housing</h1>
                </div>
                <p className="text-gray-500 font-medium">Manage temporary housing for Post-UTME candidates near OOU.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((card) => (
                    <Link key={card.label} href={card.href}>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2.5 rounded-xl ${card.color}`}>
                                    <card.icon size={20} />
                                </div>
                                <ArrowRight size={16} className="text-gray-300" />
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                            <p className="text-2xl font-black tracking-tight">
                                {card.isCurrency ? `₦${card.value.toLocaleString()}` : card.value.toLocaleString()}
                            </p>
                        </motion.div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users size={18} className="text-[#008489]" />
                        User Breakdown
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: "Students", count: stats?.totalStudents || 0, color: "bg-blue-500" },
                            { label: "Renters", count: stats?.totalRenters || 0, color: "bg-[#008489]" },
                        ].map((item) => (
                            <div key={item.label}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-gray-600">{item.label}</span>
                                    <span className="font-bold">{item.count}</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${item.color}`}
                                        style={{ width: `${((item.count || 0) / Math.max((stats?.totalStudents || 0) + (stats?.totalRenters || 0), 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-[#008489]" />
                        Booking Status
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: "Active", count: stats?.activeBookings || 0, color: "bg-green-500" },
                            { label: "Completed", count: stats?.completedBookings || 0, color: "bg-blue-500" },
                            { label: "Total", count: stats?.totalBookings || 0, color: "bg-[#008489]" },
                        ].map((item) => (
                            <div key={item.label}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-gray-600">{item.label}</span>
                                    <span className="font-bold">{item.count}</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${item.color}`}
                                        style={{ width: `${((item.count || 0) / Math.max(stats?.totalBookings || 1, 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Link href="/admin/post-utme/properties?status=PENDING_REVIEW">
                    <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6 hover:shadow-md transition cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                            <AlertCircle size={20} className="text-yellow-600" />
                            <h3 className="font-bold text-yellow-800">Needs Attention</h3>
                        </div>
                        <p className="text-3xl font-black text-yellow-700">{stats?.pendingApproval || 0}</p>
                        <p className="text-sm text-yellow-600 mt-1">properties awaiting approval</p>
                    </div>
                </Link>
                <Link href="/admin/post-utme/refunds">
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 hover:shadow-md transition cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                            <RotateCcw size={20} className="text-red-600" />
                            <h3 className="font-bold text-red-800">Refund Requests</h3>
                        </div>
                        <p className="text-3xl font-black text-red-700">{stats?.pendingRefunds || 0}</p>
                        <p className="text-sm text-red-600 mt-1">pending refund requests</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
