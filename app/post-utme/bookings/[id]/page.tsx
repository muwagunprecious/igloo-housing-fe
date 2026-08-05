"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Copy, CheckCircle, Clock, Shield, AlertTriangle, MessageCircle, RotateCcw, X } from "lucide-react";
import Button from "@/app/components/common/Button";
import { usePostUtmeStore } from "@/app/stores/usePostUtmeStore";
import { toast } from "@/app/stores/useToastStore";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    PENDING_PAYMENT: { label: "Awaiting Payment", color: "text-yellow-600 bg-yellow-50" },
    PAYMENT_SUCCESSFUL: { label: "Payment Confirmed", color: "text-blue-600 bg-blue-50" },
    BOOKING_CONFIRMED: { label: "Booking Confirmed", color: "text-indigo-600 bg-indigo-50" },
    AWAITING_CHECKIN: { label: "Awaiting Check-in", color: "text-purple-600 bg-purple-50" },
    STUDENT_ARRIVED: { label: "Student Arrived", color: "text-cyan-600 bg-cyan-50" },
    CHECKED_IN: { label: "Checked In", color: "text-green-600 bg-green-50" },
    CANCELLED: { label: "Cancelled", color: "text-red-600 bg-red-50" },
};

const REFUND_REASONS = [
    "Change of plans",
    "Found a better option",
    "Property doesn't match description",
    "Safety concerns",
    "Owner unresponsive",
    "Other",
];

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { currentBooking, fetchBooking, cancelBooking, requestRefund } = usePostUtmeStore();
    const [initialLoading, setInitialLoading] = useState(true);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundReason, setRefundReason] = useState("");
    const [refundDescription, setRefundDescription] = useState("");
    const [submittingRefund, setSubmittingRefund] = useState(false);

    useEffect(() => {
        if (id) {
            fetchBooking(id).then(() => setInitialLoading(false));
        }
    }, [id, fetchBooking]);

    if (initialLoading || !currentBooking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008489]" />
            </div>
        );
    }

    const b = currentBooking;
    const statusInfo = STATUS_LABELS[b.status] || { label: b.status, color: "text-gray-600 bg-gray-50" };
    const img = b.property?.images?.[0]?.url;
    const renter = b.renter;

    const canRequestRefund = b.payment?.status === 'COMPLETED' && !b.renterConfirmed && b.status !== 'CHECKED_IN' && b.status !== 'CANCELLED';
    const canCancel = ['PENDING_PAYMENT', 'PAYMENT_SUCCESSFUL', 'BOOKING_CONFIRMED'].includes(b.status);

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;
        const success = await cancelBooking(b.id);
        if (success) {
            toast.success("Booking cancelled");
            fetchBooking(id);
        } else {
            toast.error("Failed to cancel booking");
        }
    };

    const handleRefund = async () => {
        if (!refundReason) {
            toast.error("Please select a reason");
            return;
        }
        setSubmittingRefund(true);
        const success = await requestRefund({
            bookingId: b.id,
            reason: refundReason,
            description: refundDescription,
        });
        if (success) {
            toast.success("Refund request submitted successfully");
            setShowRefundModal(false);
            setRefundReason("");
            setRefundDescription("");
            fetchBooking(id);
        } else {
            toast.error("Failed to submit refund request");
        }
        setSubmittingRefund(false);
    };

    const copyCode = () => {
        if (b.verificationCode) {
            navigator.clipboard.writeText(b.verificationCode);
            toast.success("Code copied!");
        }
    };

    const copyPhone = () => {
        if (renter?.whatsapp) {
            navigator.clipboard.writeText(renter.whatsapp);
            toast.success("Phone number copied!");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft size={16} /> Back
                </button>

                {/* Status Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl p-4 mb-6 ${statusInfo.color}`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold">{statusInfo.label}</p>
                            <p className="text-xs opacity-70 mt-0.5">Booking ID: {b.id.slice(0, 8)}...</p>
                        </div>
                        <Clock size={24} />
                    </div>
                </motion.div>

                {/* Property Info */}
                <div className="bg-white rounded-2xl overflow-hidden mb-4 shadow-sm">
                    {img && (
                        <div className="h-48 relative">
                            <Image src={img} alt="" fill className="object-cover" />
                        </div>
                    )}
                    <div className="p-5">
                        <h1 className="text-lg font-bold text-gray-900">{b.property?.title}</h1>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin size={14} /> {b.property?.area}
                        </p>
                    </div>
                </div>

                {/* Booking Details */}
                <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                    <h2 className="font-bold text-gray-900 mb-3">Booking Details</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Check-in</span>
                            <span className="font-semibold">{new Date(b.checkInDate).toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Check-out</span>
                            <span className="font-semibold">{new Date(b.checkOutDate).toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Guests</span>
                            <span className="font-semibold">{b.numberOfGuests}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Nights</span>
                            <span className="font-semibold">{b.numberOfNights}</span>
                        </div>
                        <div className="border-t border-gray-100 pt-3 space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₦{b.totalPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Service fee</span>
                                <span>₦{b.serviceFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-2">
                                <span>Total Paid</span>
                                <span>₦{b.totalPayable.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Verification Code */}
                {b.verificationCode && !b.renterConfirmed && b.status !== 'CHECKED_IN' && b.status !== 'CANCELLED' && (
                    <div className="bg-[#008489]/5 border border-[#008489]/20 rounded-2xl p-5 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield size={18} className="text-[#008489]" />
                            <h3 className="font-bold text-[#008489]">Your Booking Code</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Give this code to the renter when you get to the house and you like the house.</p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-white rounded-xl px-4 py-3 text-center">
                                <span className="text-2xl font-black tracking-[0.3em] text-gray-900">{b.verificationCode}</span>
                            </div>
                            <button onClick={copyCode} className="p-3 bg-white rounded-xl hover:bg-gray-50 transition">
                                <Copy size={20} className="text-[#008489]" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Code used confirmation */}
                {b.renterConfirmed && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle size={18} className="text-green-600" />
                            <h3 className="font-bold text-green-700">Booking Confirmed</h3>
                        </div>
                        <p className="text-xs text-green-600">The renter has verified your booking code. You are checked in.</p>
                    </div>
                )}

                {/* Renter Contact (post-payment) */}
                {renter && b.payment?.status === 'COMPLETED' && b.status !== 'CANCELLED' && (
                    <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-600" /> Renter Contact Information
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500">Full Name</p>
                                <p className="font-semibold text-sm">{renter.fullName}</p>
                            </div>
                            {renter.whatsapp && (
                                <div>
                                    <p className="text-xs text-gray-500">Phone Number</p>
                                    <p className="font-semibold text-sm">{renter.whatsapp}</p>
                                </div>
                            )}
                            <div className="flex gap-3">
                                {renter.whatsapp && (
                                    <a href={`https://wa.me/${renter.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                                        <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white border-none" size="md">
                                            <MessageCircle size={16} className="mr-2" /> WhatsApp
                                        </Button>
                                    </a>
                                )}
                                {renter.whatsapp && (
                                    <Button variant="outline" className="flex-1" size="md" onClick={copyPhone}>
                                        <Copy size={16} className="mr-2" /> Copy Number
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact hidden notice */}
                {(!renter?.whatsapp || b.payment?.status !== 'COMPLETED') && b.status !== 'CANCELLED' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-4 text-center">
                        <AlertTriangle size={24} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Contact information will be available after booking confirmation.</p>
                    </div>
                )}

                {/* Request Refund */}
                {canRequestRefund && (
                    <button
                        onClick={() => setShowRefundModal(true)}
                        className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-2xl p-4 mb-4 flex items-center justify-center gap-2 transition font-semibold text-sm"
                    >
                        <RotateCcw size={16} /> Request Refund
                    </button>
                )}

                {/* Cancel Booking */}
                {canCancel && (
                    <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50" onClick={handleCancel}>
                        Cancel Booking
                    </Button>
                )}

                {/* Refund not available notice (after code confirmed) */}
                {b.renterConfirmed && b.status === 'CHECKED_IN' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
                        <p className="text-xs text-gray-500">Refund is no longer available after the booking code has been confirmed.</p>
                    </div>
                )}
            </div>

            {/* Refund Modal */}
            {showRefundModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">Request Refund</h3>
                                <button onClick={() => setShowRefundModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                                <p className="text-xs text-yellow-700">
                                    Refund is available before the renter confirms your booking code. Once the code is verified at check-in, refunds are no longer available.
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for refund</label>
                                <select
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#008489]"
                                >
                                    <option value="">Select a reason</option>
                                    {REFUND_REASONS.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional details (optional)</label>
                                <textarea
                                    value={refundDescription}
                                    onChange={(e) => setRefundDescription(e.target.value)}
                                    placeholder="Tell us more about why you need a refund..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#008489] resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setShowRefundModal(false)} disabled={submittingRefund}>
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none"
                                    onClick={handleRefund}
                                    disabled={submittingRefund || !refundReason}
                                >
                                    {submittingRefund ? "Submitting..." : "Submit Request"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
