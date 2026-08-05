"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Users, CheckCircle, Clock, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import Button from "@/app/components/common/Button";
import { usePostUtmeStore } from "@/app/stores/usePostUtmeStore";
import { toast } from "@/app/stores/useToastStore";
import { useRouter } from "next/navigation";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    PAYMENT_SUCCESSFUL: { label: "New Booking", color: "bg-blue-100 text-blue-700" },
    BOOKING_CONFIRMED: { label: "Confirmed", color: "bg-indigo-100 text-indigo-700" },
    AWAITING_CHECKIN: { label: "Awaiting Guest", color: "bg-purple-100 text-purple-700" },
    STUDENT_ARRIVED: { label: "Student Arrived", color: "bg-cyan-100 text-cyan-700" },
    CHECKED_IN: { label: "Checked In", color: "bg-green-100 text-green-700" },
    CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

export default function RenterBookingsPage() {
    const router = useRouter();
    const { renterBookings, isLoading, fetchRenterBookings, confirmArrival, updateBookingStatus } = usePostUtmeStore();
    const [verifyModal, setVerifyModal] = useState<string | null>(null);
    const [verifyCode, setVerifyCode] = useState("");
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        fetchRenterBookings();
    }, [fetchRenterBookings]);

    const handleConfirmArrival = async (bookingId: string) => {
        if (!verifyCode.trim()) {
            toast.error("Please enter the booking code");
            return;
        }
        setVerifying(true);
        const success = await confirmArrival(bookingId, verifyCode.trim());
        if (success) {
            toast.success("Guest arrival confirmed! Funds released to your wallet.");
            setVerifyModal(null);
            setVerifyCode("");
            fetchRenterBookings();
        } else {
            toast.error("Invalid code or verification failed");
        }
        setVerifying(false);
    };

    const handleAdvanceStatus = async (bookingId: string, status: string) => {
        const success = await updateBookingStatus(bookingId, status);
        if (success) {
            toast.success("Status updated");
            fetchRenterBookings();
        } else {
            toast.error("Failed to update status");
        }
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

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mt-4">
                                        {booking.status === 'PAYMENT_SUCCESSFUL' && (
                                            <Button size="sm" className="bg-indigo-600 text-white border-none" onClick={() => handleAdvanceStatus(booking.id, 'BOOKING_CONFIRMED')}>
                                                Confirm Booking
                                            </Button>
                                        )}
                                        {booking.status === 'BOOKING_CONFIRMED' && (
                                            <Button size="sm" className="bg-purple-600 text-white border-none" onClick={() => handleAdvanceStatus(booking.id, 'AWAITING_CHECKIN')}>
                                                Mark Ready
                                            </Button>
                                        )}
                                        {booking.status === 'AWAITING_CHECKIN' && (
                                            <Button size="sm" className="bg-cyan-600 text-white border-none" onClick={() => handleAdvanceStatus(booking.id, 'STUDENT_ARRIVED')}>
                                                Student Has Arrived
                                            </Button>
                                        )}
                                        {booking.status === 'STUDENT_ARRIVED' && (
                                            <Button size="sm" className="bg-[#008489] text-white border-none" onClick={() => setVerifyModal(booking.id)}>
                                                <ShieldCheck size={14} className="mr-1" /> Verify Guest
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Verification Modal */}
            {verifyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
                        <h3 className="text-lg font-bold mb-2">Confirm Guest Arrival</h3>
                        <p className="text-sm text-gray-500 mb-4">Ask the student for their booking verification code and enter it below.</p>
                        <input
                            type="text"
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
                            placeholder="Enter 6-character code"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-lg font-mono font-bold tracking-[0.2em] outline-none focus:border-[#008489] mb-4"
                            maxLength={6}
                        />
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => { setVerifyModal(null); setVerifyCode(""); }}>Cancel</Button>
                            <Button className="flex-1 bg-[#008489] text-white border-none" onClick={() => handleConfirmArrival(verifyModal)} disabled={verifying}>
                                {verifying ? <Loader2 size={16} className="animate-spin" /> : "Confirm"}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
