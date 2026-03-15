"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/axios";
import {
    Wallet,
    Search,
    ArrowDownLeft,
    Clock,
    User,
    Download
} from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/app/lib/imageUrl";

interface Transaction {
    id: string;
    amount: number;
    currency: string;
    status: "SUCCESS" | "PENDING" | "FAILED";
    reference: string;
    provider: string;
    type: string;
    createdAt: string;
    user: {
        fullName: string;
        email: string;
        avatar?: string;
    };
    property?: {
        title: string;
        location: string;
    };
}

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await api.get(`/admin/transactions?status=${statusFilter}`);
                setTransactions(response.data.data);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, [statusFilter]);

    const filteredTransactions = transactions.filter(t =>
        t.reference.toLowerCase().includes(search.toLowerCase()) ||
        t.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        t.user.email.toLowerCase().includes(search.toLowerCase())
    );

    const totalVolume = transactions.filter(t => t.status === "SUCCESS").reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight text-black">Financial Integrity</h1>
                    <p className="text-gray-500 font-medium">Monitoring platform-wide settlements, payouts, and revenue streams.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="px-8 py-4 bg-black rounded-[24px] shadow-2xl shadow-black/20 flex flex-col items-end border border-white/5 relative overflow-hidden group">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 z-10">Total Inflow</span>
                        <span className="text-2xl font-black text-primary z-10 tracking-tight">₦{totalVolume.toLocaleString()}</span>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/20 transition-colors"></div>
                    </div>
                    <button className="p-5 bg-white border border-gray-100 rounded-[22px] hover:bg-black hover:text-white transition-all shadow-sm hover:shadow-xl group">
                        <Download size={24} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center overflow-hidden">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Filter by reference, participant identity..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black/5 focus:ring-[12px] focus:ring-black/5 rounded-[22px] py-5 pl-16 pr-8 transition-all duration-500 font-black text-sm placeholder:text-gray-300"
                    />
                </div>
                <div className="flex gap-2 w-full lg:w-auto p-1.5 bg-gray-50 rounded-[24px] border border-gray-100">
                    {["ALL", "SUCCESS", "PENDING", "FAILED"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status === "ALL" ? "" : status)}
                            className={`px-6 py-3.5 rounded-[18px] font-black text-[10px] uppercase tracking-widest transition-all duration-500 ${(statusFilter === status || (status === "ALL" && !statusFilter))
                                ? "bg-black text-white shadow-2xl shadow-black/20 scale-[1.05] z-10"
                                : "text-gray-400 hover:text-black"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Ledger Entry</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Payer Profile</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Settlement</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Audit Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-40 text-center">
                                        <div className="animate-spin rounded-[14px] h-10 w-10 border-4 border-black/5 border-t-black mx-auto mb-6"></div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Decrypting Financial Registry...</p>
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-40 text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-gray-200">
                                            <Wallet className="text-gray-200" size={32} />
                                        </div>
                                        <h3 className="text-xl font-black mb-2 tracking-tight">No Transactions Recorded</h3>
                                        <p className="text-gray-400 font-bold text-sm max-w-xs mx-auto italic">Our financial monitors have not logged any activity matching your current filter.</p>
                                    </td>
                                </tr>
                            ) : filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/80 transition-all duration-500 group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${tx.status === 'SUCCESS' ? 'bg-green-50 text-green-600' :
                                                tx.status === 'FAILED' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                {tx.status === 'SUCCESS' ? <ArrowDownLeft size={28} /> : <Clock size={24} />}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-base tracking-tighter text-gray-900 group-hover:text-black transition-colors">{tx.type}</h4>
                                                <p className="text-[10px] font-black text-gray-400 flex items-center gap-2 uppercase tracking-wide">
                                                    <Clock size={12} className="text-primary" />
                                                    {new Date(tx.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden relative border-2 border-white shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                                                {tx.user.avatar ? <Image src={getImageUrl(tx.user.avatar)} alt={tx.user.fullName} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><User size={20} /></div>}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-black truncate tracking-tight">{tx.user.fullName}</p>
                                                <p className="text-[10px] font-black uppercase text-gray-400 truncate tracking-widest mt-0.5">{tx.user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex flex-col">
                                            <span className="font-black text-lg tracking-tighter text-black">₦{tx.amount.toLocaleString()}</span>
                                            <span className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em]">{tx.currency}</span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg transition-colors ${tx.status === 'SUCCESS' ? 'bg-green-50 text-green-700 shadow-green-500/5' :
                                            tx.status === 'FAILED' ? 'bg-red-50 text-red-700 shadow-red-500/5' :
                                                'bg-orange-50 text-orange-700 shadow-orange-500/5'
                                            }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="p-8 text-right">
                                        <p className="font-black text-[11px] uppercase tracking-widest text-gray-400 group-hover:text-black transition-all mb-1">{tx.reference}</p>
                                        <div className="flex items-center justify-end gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">{tx.provider}</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
