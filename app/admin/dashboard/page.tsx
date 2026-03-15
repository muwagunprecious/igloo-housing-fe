"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/app/stores/useAdminStore";
import {
    Users,
    MessageSquare,
    AlertCircle,
    TrendingUp,
    Building2,
    ArrowRight,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
    const { stats, isLoading, fetchStats } = useAdminStore();

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (isLoading && !stats) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

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
            value: stats?.properties || 0,
            icon: Building2,
            colorClass: "bg-green-50 text-green-600",
            href: "/admin/properties"
        },
        {
            label: "Pending Approvals",
            value: stats?.agents.pending || 0,
            icon: AlertCircle,
            colorClass: "bg-orange-50 text-orange-600",
            href: "/admin/properties"
        },
        {
            label: "Total Bookings",
            value: 128, // Mock data
            icon: CheckCircle2,
            colorClass: "bg-pink-50 text-pink-600",
            href: "/admin/bookings"
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
            <div>
                <h1 className="text-4xl font-black mb-2 tracking-tight">System Control</h1>
                <p className="text-gray-500 font-medium">Monitoring platform health, user activity, and property verifications.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {statCards.map((card) => (
                    <Link key={card.label} href={card.href}>
                        <div className="p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm hover:shadow-card-hover hover:border-black/5 transition group cursor-pointer h-full">
                            <div className={`p-3 rounded-2xl w-fit mb-4 transition-colors group-hover:bg-black group-hover:text-white ${card.colorClass}`}>
                                <card.icon size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                                <h3 className="text-3xl font-black tracking-tight">{card.value.toLocaleString()}</h3>
                            </div>
                        </div>
                    </Link>
                ))}
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
                            { label: "Verify Pending Agents", href: "/admin/users?role=AGENT&isVerified=false", icon: CheckCircle2, sub: `${stats?.agents.pending || 0} waiting` },
                            { label: "Review New Listings", href: "/admin/properties?status=PENDING", icon: Building2, sub: "Queue review needed" },
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
        </div>
    );
}
