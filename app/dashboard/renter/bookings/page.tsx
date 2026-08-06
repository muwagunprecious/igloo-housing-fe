"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import Button from "@/app/components/common/Button";
import { usePostUtmeStore } from "@/app/stores/usePostUtmeStore";
import { toast } from "@/app/stores/useToastStore";
import { useRouter } from "next/navigation";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    PENDING_PAYMENT: { label: "Awaiting Payment", color: "bg-yellow-100 text-yellow-700" },
    PAYMENT_SUCCESSFUL: { label: "Paid", color: "bg-blue-100 text-blue-700" },
    BOOKING_CONFIRMED: { label: "Confirmed", color: "bg-indigo-100 text-indigo-700" },
    AWAITING_CHECKIN: { label: "Awaiting Guest", color: "bg-purple-100 text-purple-700" },
    STUDENT_ARRIVED: { label: "Student Arrived", color: "bg-cyan-100 text-cyan-700" },
    CHECKED_IN: { label: "Checked In ✓", color: "bg-green-100 text-green-700" },
    COMPLETED: { label: "Completed", color: "bg-gray-100 text-gray-600" },
    CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

const RELEASABLE_STATUSES = ['PAYMENT_SUCCESSFUL', 'BOOKING_CONFIRMED', 'AWAITING_CHECKIN', 'STUDENT_ARRIVED'];

export default function RenterBookingsPage() {
    const router = useRouter();
    const { renterBookings, isLoading, fetchRenterBookings, confirmArrival } = usePostUtmeStore();
    const [escrowModal, setEscrowModal] = useState<string | null>(null);
    const [escrowCode, setEscrowCode] = useState("");
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        fetchRenterBookings();
    }, [fetchRenterBookings]);

    const handleConfirmBooking = async (bookingId: string) => {
        if (!escrowCode.trim()) {
            toast.error("Please enter the booking code");
            return;
        }
        setVerifying(true);
        const success = await confirmArrival(bookingId, escrowCode.trim());
        if (success) {
            toast.success("Booking confirmed! Funds released to your wallet.");
            setEscrowModal(null);
            setEscrowCode("");
            fetchRenterBookings();
        } else {
            toast.error("Invalid code. Ask the student for their correct booking code.");
        }
        setVerifying(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft size={16} /> Back
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-6">Booking Requests</h1>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />)}
                    </div>
                ) : renterBookings.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <Calendar size={32} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No bookings yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {renterBookings.map((booking, idx) => {
                            const img = booking.property?.images?.[0]?.url;
                            const status = STATUS_LABELS[booking.status] || { label: booking.status, color: "bg-gray-100 text-gray-600" };
                            const canConfirm = RELEASABLE_STATUSES.includes(booking.status);
                            return (
                                <motion.div
                                    key={booking.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white rounded-2xl p-5 shadow-sm"
                                >
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                                            {img ? <Image src={img} alt="" fill className="object-cover" /> : null}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-bold text-sm truncate">{booking.property?.title}</h3>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Student: {booking.student?.fullName} · {booking.numberOfGuests} guests · {booking.numberOfNights} nights
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                                            </p>
                                            <p className="font-bold text-sm mt-1">₦{booking.totalPayable.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Single action button */}
                                    {canConfirm && (
                                        <div className="mt-4">
                                            <button
                                                onClick={() => { setEscrowModal(booking.id); setEscrowCode(""); }}
                                                className="w-full flex items-center justify-center gap-2 bg-[#008489] hover:bg-[#006b6e] text-white font-semibold text-sm py-2.5 rounded-xl transition"
                                            >
                                                <ShieldCheck size={16} />
                                                Confirm Booking &amp; Release Funds
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Code Input Modal */}
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
                                <p className="text-xs text-gray-500">6-character booking code</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mb-4">
                            Ask the student for the <span className="font-bold text-gray-900">booking code</span> they received after payment. Entering it confirms their booking and <span className="font-bold text-[#008489]">releases your funds immediately</span>.
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
                            <Button variant="outline" className="flex-1" onClick={() => { setEscrowModal(null); setEscrowCode(""); }}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-[#008489] text-white border-none"
                                onClick={() => handleConfirmBooking(escrowModal)}
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
