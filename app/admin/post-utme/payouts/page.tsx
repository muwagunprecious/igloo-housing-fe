"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    CreditCard, Search, CheckCircle2, XCircle, Clock, Banknote, User
} from "lucide-react";
import { usePostUtmeAdminStore } from "@/app/stores/usePostUtmeAdminStore";
import { toast } from "@/app/stores/useToastStore";

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
};

export default function PostUtmeAdminPayoutsPage() {
    const { payouts, payoutsTotal, isLoading, fetchPayouts, processPayout } = usePostUtmeAdminStore();
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        const params: Record<string, string> = { page: page.toString() };
        if (statusFilter) params.status = statusFilter;
        fetchPayouts(params);
    }, [fetchPayouts, statusFilter, page]);

    const handleProcess = async (id: string, action: "approve" | "reject") => {
        const msg = action === "approve" ? "Approve this payout?" : "Reject this payout?";
        if (!confirm(msg)) return;
        const success = await processPayout(id, action);
        if (success) toast.success(`Payout ${action === "approve" ? "approved" : "rejected"}`);
        else toast.error("Failed to process payout");
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <CreditCard size={28} className="text-[#008489]" />
                    Payout Requests
                </h1>
                <p className="text-gray-500 mt-1">Process renter withdrawal requests.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#008489] bg-white"
                >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#008489]"></div>
                </div>
            ) : payouts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                    <CreditCard size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No payout requests found</p>
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-500 font-medium">{payoutsTotal} payout requests</div>
                    <div className="space-y-3">
                        {payouts.map((payout) => (
                            <motion.div
                                key={payout.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[payout.status] || "bg-gray-100 text-gray-700"}`}>
                                                {payout.status}
                                            </span>
                                            {payout.renter && (
                                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                                    <User size={14} /> {payout.renter.fullName}
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                            <div>
                                                <p className="text-xs text-gray-400">Amount</p>
                                                <p className="font-bold text-gray-900">₦{payout.amount.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Bank</p>
                                                <p className="font-medium text-gray-900">{payout.bankName}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Account</p>
                                                <p className="font-medium text-gray-900">{payout.accountNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Name</p>
                                                <p className="font-medium text-gray-900">{payout.accountName}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Requested {new Date(payout.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}
                                        </p>
                                    </div>

                                    {payout.status === "PENDING" && (
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => handleProcess(payout.id, "approve")}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-100 transition"
                                            >
                                                <CheckCircle2 size={14} /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleProcess(payout.id, "reject")}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-100 transition"
                                            >
                                                <XCircle size={14} /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {payoutsTotal > 20 && (
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
                                disabled={payouts.length < 20}
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
