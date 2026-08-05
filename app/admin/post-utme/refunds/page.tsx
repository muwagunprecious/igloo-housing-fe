"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    RotateCcw, Search, CheckCircle2, XCircle, Clock, AlertTriangle, User, Home
} from "lucide-react";
import { usePostUtmeAdminStore } from "@/app/stores/usePostUtmeAdminStore";
import { toast } from "@/app/stores/useToastStore";

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    PROCESSED: "bg-blue-100 text-blue-700",
};

export default function PostUtmeAdminRefundsPage() {
    const { refunds, refundsTotal, isLoading, fetchRefunds, processRefund } = usePostUtmeAdminStore();
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        const params: Record<string, string> = { page: page.toString() };
        if (statusFilter) params.status = statusFilter;
        fetchRefunds(params);
    }, [fetchRefunds, statusFilter, page]);

    const handleProcess = async (id: string, action: "approve" | "reject") => {
        const msg = action === "approve" ? "Approve this refund?" : "Reject this refund?";
        if (!confirm(msg)) return;
        const success = await processRefund(id, action);
        if (success) toast.success(`Refund ${action === "approve" ? "approved" : "rejected"}`);
        else toast.error("Failed to process refund");
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <RotateCcw size={28} className="text-[#008489]" />
                    Refund Requests
                </h1>
                <p className="text-gray-500 mt-1">Review and process student refund requests.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#008489] bg-white"
                >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="PROCESSED">Processed</option>
                </select>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#008489]"></div>
                </div>
            ) : refunds.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                    <RotateCcw size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No refund requests found</p>
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-500 font-medium">{refundsTotal} refund requests</div>
                    <div className="space-y-3">
                        {refunds.map((refund) => (
                            <motion.div
                                key={refund.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[refund.status] || "bg-gray-100 text-gray-700"}`}>
                                                {refund.status}
                                            </span>
                                            <span className="font-bold text-gray-900">₦{refund.amount.toLocaleString()}</span>
                                        </div>

                                        {refund.student && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                                <User size={14} className="text-gray-400" />
                                                <span>{refund.student.fullName}</span>
                                            </div>
                                        )}

                                        {refund.booking?.property && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                                <Home size={14} className="text-gray-400" />
                                                <span>{refund.booking.property.title}</span>
                                            </div>
                                        )}

                                        <div className="mt-3 bg-gray-50 rounded-xl p-3">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Reason</p>
                                            <p className="text-sm font-medium text-gray-900">{refund.reason}</p>
                                            {refund.description && (
                                                <p className="text-sm text-gray-600 mt-1">{refund.description}</p>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-400 mt-2">
                                            Requested {new Date(refund.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}
                                        </p>
                                    </div>

                                    {refund.status === "PENDING" && (
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => handleProcess(refund.id, "approve")}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-100 transition"
                                            >
                                                <CheckCircle2 size={14} /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleProcess(refund.id, "reject")}
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

                    {refundsTotal > 20 && (
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
                                disabled={refunds.length < 20}
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
