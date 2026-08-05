"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, ArrowLeft, Clock, CheckCircle2, XCircle, Wallet, Loader2 } from "lucide-react";
import Button from "@/app/components/common/Button";
import { usePostUtmeStore } from "@/app/stores/usePostUtmeStore";
import { toast } from "@/app/stores/useToastStore";
import { useRouter } from "next/navigation";

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: typeof Clock }> = {
    PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", icon: Clock },
    PROCESSING: { bg: "bg-blue-50", text: "text-blue-700", icon: Clock },
    COMPLETED: { bg: "bg-green-50", text: "text-green-700", icon: CheckCircle2 },
    REJECTED: { bg: "bg-red-50", text: "text-red-700", icon: XCircle },
};

export default function RenterPayoutsPage() {
    const router = useRouter();
    const { wallet, payoutRequests, fetchWallet, fetchMyPayouts, requestPayout, isLoading } = usePostUtmeStore();
    const [showRequest, setShowRequest] = useState(false);
    const [form, setForm] = useState({ bankName: "", accountNumber: "", accountName: "", amount: "" });

    useEffect(() => {
        fetchWallet();
        fetchMyPayouts();
    }, [fetchWallet, fetchMyPayouts]);

    const handleRequest = async () => {
        if (!form.bankName || !form.accountNumber || !form.accountName || !form.amount) {
            toast.error("Please fill in all fields");
            return;
        }
        const amount = parseFloat(form.amount);
        if (amount <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }
        if (wallet && amount > wallet.walletBalance) {
            toast.error("Insufficient balance");
            return;
        }
        const success = await requestPayout({ ...form, amount });
        if (success) {
            toast.success("Payout request submitted!");
            setShowRequest(false);
            setForm({ bankName: "", accountNumber: "", accountName: "", amount: "" });
            fetchWallet();
            fetchMyPayouts();
        } else {
            toast.error("Failed to submit payout request");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-6">Payout Requests</h1>

                {/* Available Balance */}
                <div className="bg-[#008489] text-white rounded-2xl p-6 mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-sm opacity-80 mb-1">Available for Payout</p>
                        <p className="text-3xl font-black">₦{(wallet?.walletBalance || 0).toLocaleString()}</p>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Wallet size={28} />
                    </div>
                </div>

                {/* Request Button / Form */}
                {!showRequest ? (
                    <Button
                        onClick={() => setShowRequest(true)}
                        className="w-full mb-8 bg-[#008489] hover:bg-[#006b6e] text-white border-none"
                        size="lg"
                        disabled={!wallet || wallet.walletBalance <= 0}
                    >
                        <CreditCard size={18} className="mr-2" /> Request New Payout
                    </Button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-white rounded-2xl p-6 mb-8 border border-gray-100 shadow-sm"
                    >
                        <h3 className="font-bold text-gray-900 mb-4">New Payout Request</h3>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Bank Name"
                                value={form.bankName}
                                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#008489] transition"
                            />
                            <input
                                type="text"
                                placeholder="Account Number"
                                value={form.accountNumber}
                                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#008489] transition"
                            />
                            <input
                                type="text"
                                placeholder="Account Name"
                                value={form.accountName}
                                onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#008489] transition"
                            />
                            <input
                                type="number"
                                placeholder="Amount (₦)"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#008489] transition"
                                max={wallet?.walletBalance}
                            />
                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" className="flex-1" onClick={() => setShowRequest(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-[#008489] text-white border-none"
                                    onClick={handleRequest}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Submit Request"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Payout History */}
                <h2 className="font-bold text-gray-900 mb-4">Payout History</h2>
                {payoutRequests.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <CreditCard size={32} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm">No payout requests yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {payoutRequests.map((payout) => {
                            const style = STATUS_STYLES[payout.status] || STATUS_STYLES.PENDING;
                            const StatusIcon = style.icon;
                            return (
                                <motion.div
                                    key={payout.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl p-5 border border-gray-100"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-bold text-gray-900">₦{payout.amount.toLocaleString()}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {new Date(payout.createdAt).toLocaleDateString("en-NG", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                                            <StatusIcon size={12} />
                                            {payout.status}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 text-sm">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Bank</span>
                                            <span className="font-medium text-gray-900">{payout.bankName}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 mt-1">
                                            <span>Account</span>
                                            <span className="font-medium text-gray-900">{payout.accountNumber}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 mt-1">
                                            <span>Name</span>
                                            <span className="font-medium text-gray-900">{payout.accountName}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
