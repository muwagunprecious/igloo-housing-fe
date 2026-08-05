"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Wallet, Calendar, ChevronRight, Plus, Eye, TrendingUp, User } from "lucide-react";
import { usePostUtmeStore } from "@/app/stores/usePostUtmeStore";
import { useAuthStore } from "@/app/stores/useAuthStore";

export default function RenterDashboard() {
    const { myProperties, wallet, renterBookings, fetchMyProperties, fetchWallet, fetchRenterBookings } = usePostUtmeStore();
    const { user } = useAuthStore();

    useEffect(() => {
        fetchMyProperties();
        fetchWallet();
        fetchRenterBookings();
    }, [fetchMyProperties, fetchWallet, fetchRenterBookings]);

    const stats = [
        { label: "My Listings", value: myProperties.length, icon: Home, color: "bg-blue-500", href: "/dashboard/renter/listings" },
        { label: "Wallet Balance", value: wallet ? `₦${wallet.walletBalance.toLocaleString()}` : "₦0", icon: Wallet, color: "bg-[#008489]", href: "/dashboard/renter/wallet" },
        { label: "Active Bookings", value: renterBookings.filter((b) => ['CHECKED_IN', 'AWAITING_CHECKIN'].includes(b.status)).length, icon: Calendar, color: "bg-purple-500", href: "/dashboard/renter/bookings" },
        { label: "Total Earnings", value: wallet ? `₦${wallet.totalEarnings.toLocaleString()}` : "₦0", icon: TrendingUp, color: "bg-green-500", href: "/dashboard/renter/wallet" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Renter Dashboard</h1>
                        <p className="text-gray-500 text-sm">Welcome back, {user?.name}</p>
                    </div>
                    <Link href="/post-utme/list-property" className="bg-[#008489] hover:bg-[#006b6e] text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition">
                        <Plus size={16} /> List New Property
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <Link key={stat.label} href={stat.href}>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition cursor-pointer"
                                >
                                    <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                                        <Icon size={20} className="text-white" />
                                    </div>
                                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                                    <p className="text-xl font-black text-gray-900">{stat.value}</p>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
                    {[
                        { label: "My Listings", desc: "Manage your property listings", href: "/dashboard/renter/listings", icon: Home },
                        { label: "My Wallet", desc: "View balance and transactions", href: "/dashboard/renter/wallet", icon: Wallet },
                        { label: "Booking Requests", desc: "View incoming bookings", href: "/dashboard/renter/bookings", icon: Calendar },
                        { label: "Payout History", desc: "Track your payout requests", href: "/dashboard/renter/payouts", icon: TrendingUp },
                        { label: "Account Settings", desc: "Edit your profile and contact number", href: "/settings", icon: User },
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link key={item.href} href={item.href} className="flex items-center justify-between p-5 hover:bg-gray-50 transition">
                                <div className="flex items-center gap-4">
                                    <Icon size={20} className="text-gray-400" />
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900">{item.label}</p>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-gray-300" />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
