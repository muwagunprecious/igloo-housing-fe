"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowDownLeft, ArrowUpRight, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import Button from "@/app/components/common/Button";
import { usePostUtmeStore } from "@/app/stores/usePostUtmeStore";
import { toast } from "@/app/stores/useToastStore";
import { useRouter } from "next/navigation";

const TXN_ICONS: Record<string, { icon: typeof ArrowDownLeft; color: string }> = {
    BOOKING_PAYMENT: { icon: ArrowDownLeft, color: "text-green-600 bg-green-50" },
    PENDING_WITHDRAWAL: { icon: ArrowUpRight, color: "text-yellow-600 bg-yellow-50" },
    WITHDRAWAL_REVERSAL: { icon: ArrowDownLeft, color: "text-blue-600 bg-blue-50" },
    REFUND_DEDUCTION: { icon: ArrowUpRight, color: "text-red-600 bg-red-50" },
};

export default function RenterWalletPage() {
    const router = useRouter();
    const { wallet, walletTransactions, fetchWallet, fetchWalletTransactions, requestPayout, isLoading } = usePostUtmeStore();
    const [showPayout, setShowPayout] = useState(false);
    const [payoutForm, setPayoutForm] = useState({ bankName: "", accountNumber: "", accountName: "", amount: "" });

    useEffect(() => {
        fetchWallet();
        fetchWalletTransactions();
    }, [fetchWallet, fetchWalletTransactions]);

    const handlePayout = async () => {
        if (!payoutForm.bankName || !payoutForm.accountNumber || !payoutForm.accountName || !payoutForm.amount) {
            toast.error("Please fill in all fields");
            return;
        }
        const amount = parseFloat(payoutForm.amount);
        if (amount <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }
        if (wallet && amount > wallet.walletBalance) {
            toast.error("Insufficient balance");
            return;
        }
        const success = await requestPayout({ ...payoutForm, amount });
        if (success) {
            toast.success("Payout request submitted!");
            setShowPayout(false);
            setPayoutForm({ bankName: "", accountNumber: "", accountName: "", amount: "" });
            fetchWallet();
            fetchWalletTransactions();
        } else {
            toast.error("Failed to submit payout request");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft size={16} /> Back
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wallet</h1>

                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#008489] text-white rounded-2xl p-6">
                        <p className="text-sm opacity-80 mb-1">Available Balance</p>
                        <p className="text-3xl font-black">₦{(wallet?.walletBalance || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
                        <p className="text-2xl font-black text-gray-900">₦{(wallet?.totalEarnings || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
                        <p className="text-2xl font-black text-gray-900">{wallet?.totalBookings || 0}</p>
                    </div>
                </div>

                {/* Request Payout */}
                {!showPayout ? (
                    <Button onClick={() => setShowPayout(true)} className="w-full mb-8 bg-[#008489] hover:bg-[#006b6e] text-white border-none" size="lg">
                        <CreditCard size={18} className="mr-2" /> Request Payout
                    </Button>
                ) : (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-white rounded-2xl p-6 mb-8 border border-gray-100">
                        <h3 className="font-bold mb-4">Request Payout</h3>
                        <div className="space-y-3">
                            <input type="text" placeholder="Bank Name" value={payoutForm.bankName} onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none" />
                            <input type="text" placeholder="Account Number" value={payoutForm.accountNumber} onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none" />
                            <input type="text" placeholder="Account Name" value={payoutForm.accountName} onChange={(e) => setPayoutForm({ ...payoutForm, accountName: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none" />
                            <input type="number" placeholder="Amount (₦)" value={payoutForm.amount} onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none" max={wallet?.walletBalance} />
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setShowPayout(false)}>Cancel</Button>
                                <Button className="flex-1 bg-[#008489] text-white border-none" onClick={handlePayout} disabled={isLoading}>
                                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Submit Request"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Transaction History */}
                <h2 className="font-bold text-gray-900 mb-4">Transaction History</h2>
                {walletTransactions.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <Wallet size={32} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm">No transactions yet</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {walletTransactions.map((txn) => {
                            const iconInfo = TXN_ICONS[txn.type] || TXN_ICONS.BOOKING_PAYMENT;
                            const Icon = iconInfo.icon;
                            return (
                                <div key={txn.id} className="bg-white rounded-xl p-4 flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconInfo.color}`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{txn.description}</p>
                                        <p className="text-xs text-gray-400">{new Date(txn.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`text-sm font-bold ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {txn.amount >= 0 ? '+' : ''}₦{Math.abs(txn.amount).toLocaleString()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
