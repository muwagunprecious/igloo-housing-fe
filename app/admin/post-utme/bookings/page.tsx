"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Calendar, Search, User, Home, Clock, CheckCircle2, XCircle, Eye
} from "lucide-react";
import { usePostUtmeAdminStore } from "@/app/stores/usePostUtmeAdminStore";

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    ACTIVE: "bg-green-100 text-green-700",
    COMPLETED: "bg-gray-100 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_ICONS: Record<string, typeof Clock> = {
    PENDING: Clock,
    CONFIRMED: CheckCircle2,
    ACTIVE: CheckCircle2,
    COMPLETED: CheckCircle2,
    CANCELLED: XCircle,
};

export default function PostUtmeAdminBookingsPage() {
    const { bookings, bookingsTotal, isLoading, fetchBookings } = usePostUtmeAdminStore();
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        const params: Record<string, string> = { page: page.toString() };
        if (statusFilter) params.status = statusFilter;
        if (search) params.search = search;
        fetchBookings(params);
    }, [fetchBookings, statusFilter, search, page]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <Calendar size={28} className="text-[#008489]" />
                    Post-UTME Bookings
                </h1>
                <p className="text-gray-500 mt-1">View and manage all Post-UTME bookings.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by student, renter, property..."
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
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#008489]"></div>
                </div>
            ) : bookings.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                    <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No bookings found</p>
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-500 font-medium">{bookingsTotal} bookings found</div>
                    <div className="space-y-3">
                        {bookings.map((booking) => {
                            const StatusIcon = STATUS_ICONS[booking.status] || Clock;
                            return (
                                <motion.div
                                    key={booking.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-700"}`}>
                                                    <StatusIcon size={12} />
                                                    {booking.status}
                                                </span>
                                                {booking.payment && (
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${booking.payment.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                        Paid: {booking.payment.status}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                {booking.property && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Home size={14} className="text-gray-400 shrink-0" />
                                                        <span className="truncate font-medium text-gray-900">{booking.property.title}</span>
                                                    </div>
                                                )}
                                                {booking.student && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <User size={14} className="text-gray-400 shrink-0" />
                                                        <span className="truncate">{booking.student.fullName}</span>
                                                    </div>
                                                )}
                                                {booking.renter && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <User size={14} className="text-gray-400 shrink-0" />
                                                        <span className="truncate">Renter: {booking.renter.fullName}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                                <span>Check-in: {new Date(booking.checkInDate).toLocaleDateString()}</span>
                                                <span>Check-out: {new Date(booking.checkOutDate).toLocaleDateString()}</span>
                                                <span>{booking.numberOfNights} nights</span>
                                                <span className="font-bold text-gray-900">₦{booking.totalPayable.toLocaleString()}</span>
                                                {booking.verificationCode && (
                                                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">Code: {booking.verificationCode}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {bookingsTotal > 20 && (
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
                                disabled={bookings.length < 20}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
