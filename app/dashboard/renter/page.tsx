"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Wallet, Calendar, ChevronRight, Plus, TrendingUp, User, ShieldCheck, Loader2 } from "lucide-react";
import { usePostUtmeStore } from "@/app/stores/usePostUtmeStore";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { toast } from "@/app/stores/useToastStore";
import Button from "@/app/components/common/Button";

const ACTIVE_STATUSES = ['PAYMENT_SUCCESSFUL', 'BOOKING_CONFIRMED', 'AWAITING_CHECKIN', 'STUDENT_ARRIVED', 'CHECKED_IN'];

export default function RenterDashboard() {
    const { myProperties, wallet, renterBookings, fetchMyProperties, fetchWallet, fetchRenterBookings, confirmArrival } = usePostUtmeStore();
    const { user } = useAuthStore();

    const [escrowModal, setEscrowModal] = useState<string | null>(null);
    const [escrowCode, setEscrowCode] = useState("");
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        fetchMyProperties();
        fetchWallet();
        fetchRenterBookings();
    }, [fetchMyProperties, fetchWallet, fetchRenterBookings]);

    const activeBookings = renterBookings.filter((b) => ACTIVE_STATUSES.includes(b.status));
    // Any paid booking that hasn't been checked in yet is eligible for escrow release
    const releasableBookings = renterBookings.filter((b) =>
        ['PAYMENT_SUCCESSFUL', 'BOOKING_CONFIRMED', 'AWAITING_CHECKIN', 'STUDENT_ARRIVED'].includes(b.status)
    );

    const stats = [
        { label: "My Listings", value: myProperties.length, icon: Home, color: "bg-blue-500", href: "/dashboard/renter/listings" },
        { label: "Wallet Balance", value: wallet ? `₦${wallet.walletBalance.toLocaleString()}` : "₦0", icon: Wallet, color: "bg-[#008489]", href: "/dashboard/renter/wallet" },
        { label: "Active Bookings", value: activeBookings.length, icon: Calendar, color: "bg-purple-500", href: "/dashboard/renter/bookings" },
        { label: "Total Earnings", value: wallet ? `₦${wallet.totalEarnings.toLocaleString()}` : "₦0", icon: TrendingUp, color: "bg-green-500", href: "/dashboard/renter/wallet" },
    ];

    const handleConfirmArrival = async (bookingId: string) => {
        if (!escrowCode.trim()) {
            toast.error("Please enter the booking verification code");
            return;
        }
        setVerifying(true);
        const success = await confirmArrival(bookingId, escrowCode.trim());
        if (success) {
            toast.success("Booking confirmed! Funds have been released to your wallet.");
            setEscrowModal(null);
            setEscrowCode("");
            fetchRenterBookings();
            fetchWallet();
        } else {
            toast.error("Invalid code. Please ask the student to share their correct booking code.");
        }
        setVerifying(false);
    };

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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

                {/* ── Confirm Booking & Release Funds Panel ── */}
                {releasableBookings.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-[#008489]/10 to-teal-50 border border-[#008489]/20 rounded-2xl p-5 mb-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-[#008489] rounded-xl flex items-center justify-center shrink-0">
                                <ShieldCheck size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Confirm Booking & Release Funds</p>
                                <p className="text-xs text-gray-500">
                                    Ask the student for their booking code to confirm arrival and release your payment.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {releasableBookings.map((booking) => (
                                <div key={booking.id} className="bg-white rounded-xl p-4 flex items-center justify-between gap-3 shadow-sm">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-gray-900 truncate">{booking.property?.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {booking.student?.fullName} · ₦{booking.totalPayable.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(booking.checkInDate).toLocaleDateString()} – {new Date(booking.checkOutDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => { setEscrowModal(booking.id); setEscrowCode(""); }}
                                        className="shrink-0 bg-[#008489] hover:bg-[#006b6e] text-white text-xs font-bold px-3 py-2.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap"
                                    >
                                        <ShieldCheck size={13} /> Confirm Booking
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Quick Links */}
                <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
                    {[
                        { label: "My Listings", desc: "Manage your property listings", href: "/dashboard/renter/listings", icon: Home },
                        { label: "My Wallet", desc: "View balance and transactions", href: "/dashboard/renter/wallet", icon: Wallet },
                        { label: "Booking Requests", desc: "View all incoming bookings", href: "/dashboard/renter/bookings", icon: Calendar },
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

            {/* ── Escrow Code Modal ── */}
            {escrowModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-[#008489]/10 rounded-2xl flex items-center justify-center">
                                <ShieldCheck size={24} className="text-[#008489]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Enter Student's Code</h3>
                                <p className="text-xs text-gray-500">6-character verification code</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mb-4">
                            Ask the student for the <span className="font-bold text-gray-900">booking code</span> they received after payment. Entering it confirms their arrival and <span className="font-bold text-[#008489]">releases your funds immediately</span>.
                        </p>

                        <input
                            type="text"
                            value={escrowCode}
                            onChange={(e) => setEscrowCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                            placeholder="A1B2C3"
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-center text-2xl font-mono font-bold tracking-[0.3em] outline-none focus:border-[#008489] mb-4 transition"
                            maxLength={6}
                            autoFocus
                        />

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => { setEscrowModal(null); setEscrowCode(""); }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-[#008489] text-white border-none"
                                onClick={() => handleConfirmArrival(escrowModal)}
                                disabled={verifying || escrowCode.length < 6}
                            >
                                {verifying ? <Loader2 size={16} className="animate-spin mr-1" /> : null}
                                {verifying ? "Verifying..." : "Confirm & Release"}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
