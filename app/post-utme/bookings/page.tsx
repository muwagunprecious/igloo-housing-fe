"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, CheckCircle2, XCircle, AlertCircle, Eye } from "lucide-react";
import { usePostUtmeStore } from "@/app/stores/usePostUtmeStore";

const STATUS_TABS = [
    { key: "", label: "All" },
    { key: "PAYMENT_SUCCESSFUL", label: "Confirmed" },
    { key: "AWAITING_CHECKIN", label: "Awaiting" },
    { key: "CHECKED_IN", label: "Checked In" },
    { key: "CANCELLED", label: "Cancelled" },
];

const STATUS_COLORS: Record<string, string> = {
    PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
    PAYMENT_SUCCESSFUL: "bg-blue-100 text-blue-700",
    BOOKING_CONFIRMED: "bg-indigo-100 text-indigo-700",
    AWAITING_CHECKIN: "bg-purple-100 text-purple-700",
    STUDENT_ARRIVED: "bg-cyan-100 text-cyan-700",
    CHECKED_IN: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
};

export default function MyPostUtmeBookings() {
    const { studentBookings, isLoading, fetchMyBookings } = usePostUtmeStore();
    const [activeTab, setActiveTab] = useState("");

    useEffect(() => {
        fetchMyBookings(activeTab || undefined);
    }, [activeTab, fetchMyBookings]);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">My Post-UTME Bookings</h1>

                {/* Status Tabs */}
                <div className="flex gap-2 overflow-x-auto mb-6 hide-scrollbar pb-1">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                                activeTab === tab.key
                                    ? "bg-[#008489] text-white"
                                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-900"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Bookings List */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl h-40 animate-pulse" />)}
                    </div>
                ) : studentBookings.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl">
                        <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-bold text-gray-900 mb-2">No bookings yet</p>
                        <p className="text-gray-500 mb-6">Find a place to stay for your Post-UTME examination</p>
                        <Link href="/post-utme" className="bg-[#008489] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#006b6e] transition">
                            Browse Apartments
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {studentBookings.map((booking, idx) => {
                            const img = booking.property?.images?.[0]?.url;
                            return (
                                <Link key={booking.id} href={`/post-utme/bookings/${booking.id}`}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-white rounded-2xl p-4 flex gap-4 hover:shadow-md transition cursor-pointer"
                                    >
                                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                                            {img ? <Image src={img} alt="" fill className="object-cover" /> : <div className="w-full h-full" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-bold text-gray-900 text-sm truncate">{booking.property?.title}</h3>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {booking.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin size={12} />{booking.property?.area}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><Calendar size={12} />{new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}</span>
                                                <span className="font-bold text-gray-900">₦{booking.totalPayable.toLocaleString()}</span>
                                            </div>
                                            {booking.verificationCode && booking.status !== 'CHECKED_IN' && (
                                                <div className="mt-2 bg-[#008489]/10 text-[#008489] text-xs font-bold px-3 py-1 rounded-lg inline-block">
                                                    Booking Code: {booking.verificationCode}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
