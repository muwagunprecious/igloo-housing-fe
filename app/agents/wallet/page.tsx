"use client";

import { useState } from "react";
import { agentEarnings } from "../data/agentData";
import AgentSidebar from "../components/AgentSidebar";
import { Wallet, TrendingUp, Download, ArrowUpRight, ArrowDownRight, X, CheckCircle } from "lucide-react";
import Button from "@/app/components/common/Button";

export default function AgentWalletPage() {
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [bankAccount, setBankAccount] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            setShowWithdrawModal(false);
            setWithdrawAmount("");
            setBankAccount("");
        }, 2000);
    };
    return (
        <div className="max-w-[1920px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-[100px] pb-20">
            <div className="flex gap-8">
                <AgentSidebar />

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Wallet & Earnings</h1>
                        <p className="text-gray-500">Manage your earnings and payouts</p>
                    </div>

                    {/* Balance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Wallet size={24} />
                                <p className="text-sm opacity-90">Available Balance</p>
                            </div>
                            <h2 className="text-4xl font-bold mb-4">₦{(agentEarnings.availableBalance / 1000000).toFixed(2)}M</h2>
                            <Button
                                variant="outline"
                                className="w-full bg-white text-primary hover:bg-gray-100"
                                onClick={() => setShowWithdrawModal(true)}
                            >
                                Withdraw Funds
                            </Button>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="text-green-600" size={24} />
                                <p className="text-sm text-gray-500">Total Earnings</p>
                            </div>
                            <h2 className="text-4xl font-bold mb-2">₦{(agentEarnings.totalEarnings / 1000000).toFixed(2)}M</h2>
                            <p className="text-sm text-green-600 flex items-center gap-1">
                                <ArrowUpRight size={16} />
                                +12% from last month
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Download className="text-orange-600" size={24} />
                                <p className="text-sm text-gray-500">Pending Payouts</p>
                            </div>
                            <h2 className="text-4xl font-bold mb-2">₦{(agentEarnings.pendingPayouts / 1000000).toFixed(2)}M</h2>
                            <p className="text-sm text-gray-500">1 pending payment</p>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Transaction History</h2>
                            <button className="text-sm text-primary font-semibold hover:underline">
                                Download Report
                            </button>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                            {agentEarnings.transactions.map((txn, idx) => (
                                <div key={txn.id} className={`p-6 hover:bg-gray-50 transition ${idx !== agentEarnings.transactions.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${txn.status === "Completed" ? 'bg-green-100' : 'bg-yellow-100'
                                                }`}>
                                                {txn.status === "Completed" ? (
                                                    <ArrowDownRight className="text-green-600" size={24} />
                                                ) : (
                                                    <Download className="text-yellow-600" size={24} />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{txn.type}</h3>
                                                <p className="text-sm text-gray-500">{txn.propertyTitle}</p>
                                                <p className="text-xs text-gray-400 mt-1">{txn.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-green-600">+₦{txn.amount.toLocaleString()}</p>
                                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${txn.status === "Completed" ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {txn.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Withdraw Modal */}
                    {showWithdrawModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
                                <button
                                    onClick={() => setShowWithdrawModal(false)}
                                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
                                >
                                    <X size={20} />
                                </button>

                                {showSuccess ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="text-green-600" size={32} />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">Withdrawal Successful!</h3>
                                        <p className="text-gray-500">Your funds will be transferred within 24 hours.</p>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-2xl font-bold mb-2">Withdraw Funds</h3>
                                        <p className="text-gray-500 mb-6">Enter withdrawal details</p>

                                        <form onSubmit={handleWithdraw} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Amount (₦)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={withdrawAmount}
                                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                                    placeholder="Enter amount"
                                                    max={agentEarnings.availableBalance}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Available: ₦{agentEarnings.availableBalance.toLocaleString()}
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Bank Account Number</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={bankAccount}
                                                    onChange={(e) => setBankAccount(e.target.value)}
                                                    placeholder="0123456789"
                                                    pattern="[0-9]{10}"
                                                    maxLength={10}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Enter 10-digit account number</p>
                                            </div>

                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <p className="text-sm text-blue-800">
                                                    <strong>Note:</strong> This is a demo withdrawal. Funds will be transferred to your registered bank account within 24 hours.
                                                </p>
                                            </div>

                                            <div className="flex gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => setShowWithdrawModal(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" className="flex-1">
                                                    Confirm Withdrawal
                                                </Button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
