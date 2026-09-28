"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/app/stores/useAdminStore";
import {
    Search,
    BadgeCheck,
    Mail,
    User,
    CheckCircle2,
    XCircle,
    Info,
    AlertTriangle,
    Phone,
    School,
    UserPlus,
    CreditCard,
    Lock,
    Edit3,
    Plus
} from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/app/lib/imageUrl";
import Link from "next/link";
import api from "@/app/lib/axios";

export default function AgentVerificationPage() {
    const { users, isLoading, fetchUsers, verifyAgent, rejectAgent, agentFee, fetchAgentFee, updateAgentFee, createAgent } = useAdminStore();
    const [search, setSearch] = useState("");
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Dynamic fee state
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const [feeInput, setFeeInput] = useState(String(agentFee));
    const [isSavingFee, setIsSavingFee] = useState(false);

    // Create Agent state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreatingAgent, setIsCreatingAgent] = useState(false);
    const [createError, setCreateError] = useState("");
    const [createSuccess, setCreateSuccess] = useState("");
    const [universities, setUniversities] = useState<{ id: string; name: string }[]>([]);
    const [agentForm, setAgentForm] = useState({
        fullName: "",
        email: "",
        password: "",
        whatsapp: "",
        nin: "",
        universityId: ""
    });

    useEffect(() => {
        fetchUsers({ role: "AGENT", isVerified: "false" });
        fetchAgentFee().then((fee) => setFeeInput(String(fee)));

        api.get("/university").then((res) => {
            if (res.data?.success && Array.isArray(res.data.data)) {
                setUniversities(res.data.data);
            }
        }).catch(() => {});
    }, [fetchUsers, fetchAgentFee]);

    const handleOpenFeeModal = () => {
        setFeeInput(String(agentFee));
        setIsFeeModalOpen(true);
    };

    const handleSaveFee = async (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseInt(feeInput, 10);
        if (isNaN(num) || num < 0) return;
        setIsSavingFee(true);
        const success = await updateAgentFee(num);
        setIsSavingFee(false);
        if (success) {
            setIsFeeModalOpen(false);
        }
    };

    const handleCreateAgentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError("");
        setCreateSuccess("");
        setIsCreatingAgent(true);

        const success = await createAgent({
            fullName: agentForm.fullName,
            email: agentForm.email,
            password: agentForm.password,
            whatsapp: agentForm.whatsapp,
            nin: agentForm.nin,
            universityId: agentForm.universityId
        });

        setIsCreatingAgent(false);

        if (success) {
            setCreateSuccess(`Agent ${agentForm.fullName} (${agentForm.email}) created and instantly verified!`);
            setAgentForm({
                fullName: "",
                email: "",
                password: "",
                whatsapp: "",
                nin: "",
                universityId: ""
            });
            fetchUsers({ role: "AGENT", isVerified: "false" });
            setTimeout(() => {
                setIsCreateModalOpen(false);
                setCreateSuccess("");
            }, 2500);
        } else {
            const err = useAdminStore.getState().error;
            setCreateError(err || "Failed to create agent account.");
        }
    };

    const unverifiedAgents = users
        .filter(u =>
            u.role?.toUpperCase() === "AGENT" &&
            !u.isVerified &&
            (u.verificationStatus === "PENDING" || u.verificationStatus === "PENDING_APPROVAL" || !u.verificationStatus || u.verificationFeePaid) &&
            ((u.fullName && u.fullName.toLowerCase().includes(search.toLowerCase())) ||
                (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
                (u.whatsapp && u.whatsapp.includes(search)) ||
                (u.nin && u.nin.includes(search)))
        )
        .sort((a, b) => {
            if (a.verificationFeePaid && !b.verificationFeePaid) return -1;
            if (!a.verificationFeePaid && b.verificationFeePaid) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    const handleVerify = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to verify ${name} as a platform agent?`)) {
            setProcessingId(id);
            await verifyAgent(id);
            setProcessingId(null);
        }
    };

    const handleRejectClick = (id: string) => {
        setRejectingId(id);
        setRejectReason("");
    };

    const handleRejectConfirm = async () => {
        if (!rejectingId) return;
        setProcessingId(rejectingId);
        await rejectAgent(rejectingId, rejectReason || "Application does not meet requirements");
        setRejectingId(null);
        setRejectReason("");
        setProcessingId(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black mb-1 leading-tight tracking-tight">Agent Verification &amp; Management</h1>
                    <p className="text-gray-500 font-medium">Verify credentials, provision free accounts, and manage agent fees.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Fee Pill */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                        <CreditCard size={15} className="text-emerald-700" />
                        <span className="text-xs font-black text-emerald-900">
                            Fee: ₦{agentFee.toLocaleString()}
                        </span>
                        <button
                            onClick={handleOpenFeeModal}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-950 underline ml-1 cursor-pointer"
                        >
                            Change
                        </button>
                    </div>

                    {/* Pending Pill */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 rounded-2xl border border-blue-100">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-xs font-black text-blue-700 uppercase tracking-widest">
                            {unverifiedAgents.length} Pending
                        </span>
                    </div>

                    {/* Create Agent Button */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black uppercase tracking-wider transition shadow-sm cursor-pointer"
                    >
                        <UserPlus size={16} />
                        <span>Create Agent (Free)</span>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 flex items-center shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search pending agents by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black/10 focus:ring-8 focus:ring-black/5 rounded-2xl py-4 pl-14 pr-4 transition-all duration-300 font-bold"
                    />
                </div>
            </div>

            {/* Content List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                        <p className="font-black uppercase tracking-widest text-xs text-gray-400">Accessing Agent Registry...</p>
                    </div>
                ) : unverifiedAgents.length === 0 ? (
                    <div className="col-span-full py-20 bg-white border border-gray-100 rounded-[32px] text-center shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-1">Queue Empty</h3>
                        <p className="text-gray-500 font-medium max-w-xs mx-auto">All agent accounts have been processed. Great work!</p>
                    </div>
                ) : unverifiedAgents.map((agent) => (
                    <div key={agent.id} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-card-hover transition-all duration-300 group relative overflow-hidden">
                        {/* Status Badge */}
                        <div className="absolute top-6 right-6 flex items-center gap-1.5">
                            {agent.verificationFeePaid && (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                                    Fee Paid ✓
                                </span>
                            )}
                            <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                Pending
                            </span>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 border-4 border-white shadow-card flex-shrink-0 relative overflow-hidden transition-transform group-hover:scale-105 duration-500">
                                {agent.avatar ? (
                                    <Image src={getImageUrl(agent.avatar)} alt={agent.fullName} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <User size={32} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-lg leading-tight tracking-tight mb-1">{agent.fullName}</h4>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Mail size={14} className="text-primary" />
                                    <span className="text-xs font-bold truncate max-w-[150px]">{agent.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined</span>
                                    <span className="text-xs font-black text-gray-700">
                                        {new Date(agent.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Role</span>
                                    <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded border border-gray-100">{agent.role}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">WhatsApp</span>
                                    {agent.whatsapp ? (
                                        <a
                                            href={`https://wa.me/${agent.whatsapp.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-green-700 hover:underline flex items-center gap-1"
                                        >
                                            <Phone size={12} className="text-green-600" />
                                            {agent.whatsapp}
                                        </a>
                                    ) : (
                                        <span className="text-red-400 text-[10px]">Not provided</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Campus</span>
                                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1 truncate max-w-[150px]">
                                        <School size={12} className="text-gray-400 shrink-0" />
                                        {agent.university?.name || (agent.universityId ? "Assigned" : "Not specified")}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">NIN</span>
                                    <span className="text-xs font-mono font-bold text-gray-700 tracking-widest">
                                        {agent.nin || <span className="text-red-400 text-[10px]">Not provided</span>}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">₦2,000 Fee</span>
                                    {agent.verificationFeePaid ? (
                                        <span className="text-[10px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Paid ✓</span>
                                    ) : (
                                        <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Not Paid</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                <p className="text-[10px] leading-relaxed text-blue-700 font-bold italic">
                                    Agent is awaiting verification to post and manage property listings on the platform.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleVerify(agent.id, agent.fullName)}
                                disabled={processingId === agent.id}
                                className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all duration-300 shadow-xl shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processingId === agent.id ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <BadgeCheck size={18} />
                                )}
                                Verify Agent
                            </button>
                            <button
                                onClick={() => handleRejectClick(agent.id)}
                                disabled={processingId === agent.id}
                                className="w-14 items-center justify-center flex bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all duration-300 disabled:opacity-50"
                                title="Reject application"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reject Confirmation Modal */}
            {rejectingId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <AlertTriangle size={24} className="text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Reject Application</h3>
                                <p className="text-gray-500 text-sm">This will revert the user back to a student account.</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                Reason for rejection (optional)
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="e.g. Insufficient documentation, unable to verify identity..."
                                className="w-full border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 h-28 resize-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setRejectingId(null)}
                                className="flex-1 py-4 rounded-2xl border border-gray-200 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectConfirm}
                                disabled={!!processingId}
                                className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black text-xs uppercase tracking-widest hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {processingId ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <XCircle size={16} />
                                )}
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Fee Adjustment Modal */}
            {isFeeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Change Agent Fee</h3>
                                    <p className="text-gray-500 text-xs">Set amount charged to new self-registering agents.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsFeeModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveFee} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1.5">
                                    Verification Fee Amount (₦)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₦</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="100"
                                        required
                                        value={feeInput}
                                        onChange={(e) => setFeeInput(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-black rounded-xl py-3 pl-10 pr-4 font-bold text-sm text-gray-900"
                                        placeholder="e.g. 2000"
                                    />
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1">Set to 0 to make registration free for all agents.</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsFeeModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingFee}
                                    className="flex-1 py-3 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer disabled:opacity-50"
                                >
                                    {isSavingFee ? "Saving..." : "Save Fee"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Agent (Free & Instant Verification) Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
                    <div className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-6 my-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                    <UserPlus size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Create Verified Agent</h3>
                                    <p className="text-gray-500 text-xs">Provision active account with ₦0 fee &amp; instant access.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        {createSuccess && (
                            <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                                <span>{createSuccess}</span>
                            </div>
                        )}

                        {createError && (
                            <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-2">
                                <AlertTriangle size={16} className="shrink-0 text-rose-600" />
                                <span>{createError}</span>
                            </div>
                        )}

                        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
                            <p className="font-bold flex items-center gap-1.5">
                                <BadgeCheck size={16} className="text-blue-700" />
                                100% Free &amp; Auto-Verified
                            </p>
                            <p className="text-blue-800 leading-relaxed text-[11px]">
                                Accounts created here do not pay any fee. The agent can immediately log in with their email and password to upload listings and manage student inquiries.
                            </p>
                        </div>

                        <form onSubmit={handleCreateAgentSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={agentForm.fullName}
                                    onChange={(e) => setAgentForm({ ...agentForm, fullName: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-black rounded-xl p-3 text-sm font-semibold"
                                    placeholder="e.g. John Doe Properties"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        value={agentForm.email}
                                        onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-black rounded-xl p-3 text-sm font-semibold"
                                        placeholder="agent@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Initial Password *</label>
                                    <input
                                        type="text"
                                        required
                                        minLength={6}
                                        value={agentForm.password}
                                        onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-black rounded-xl p-3 text-sm font-semibold"
                                        placeholder="Min 6 characters"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp / Phone</label>
                                    <input
                                        type="tel"
                                        value={agentForm.whatsapp}
                                        onChange={(e) => setAgentForm({ ...agentForm, whatsapp: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-black rounded-xl p-3 text-sm font-semibold"
                                        placeholder="08012345678"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">National ID (NIN - Optional)</label>
                                    <input
                                        type="text"
                                        maxLength={11}
                                        value={agentForm.nin}
                                        onChange={(e) => setAgentForm({ ...agentForm, nin: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-black rounded-xl p-3 text-sm font-semibold"
                                        placeholder="11 digits"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Campus Jurisdiction</label>
                                <select
                                    value={agentForm.universityId}
                                    onChange={(e) => setAgentForm({ ...agentForm, universityId: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-black rounded-xl p-3 text-sm font-semibold cursor-pointer"
                                >
                                    <option value="">Select Campus...</option>
                                    {universities.map(uni => (
                                        <option key={uni.id} value={uni.id}>{uni.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-3.5 rounded-xl border border-gray-200 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingAgent}
                                    className="flex-1 py-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isCreatingAgent ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Creating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <BadgeCheck size={16} />
                                            <span>Create &amp; Verify Agent</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Navigation back to User Control */}
            <div className="flex justify-center pt-8">
                <Link href="/admin/users">
                    <button className="text-sm font-black text-gray-400 hover:text-black transition uppercase tracking-widest flex items-center gap-2">
                        View Full User Registry →
                    </button>
                </Link>
            </div>
        </div>
    );
}
