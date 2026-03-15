"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/app/stores/useAdminStore";
import {
    Search,
    UserPlus,
    Mail,
    Calendar,
    BadgeCheck,
    Ban
} from "lucide-react";
import Button from "@/app/components/common/Button";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/app/lib/imageUrl";

export default function AdminUsersPage() {
    const { users, isLoading, fetchUsers, blockUser, unblockUser, verifyAgent } = useAdminStore();
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");

    useEffect(() => {
        fetchUsers({ role: roleFilter });
    }, [fetchUsers, roleFilter]);

    const filteredUsers = users.filter(u =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleBlock = async (id: string) => {
        const reason = prompt("Reason for blocking this user?");
        if (reason) {
            await blockUser(id, reason);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black mb-1 leading-tight tracking-tight">Access Control</h1>
                    <p className="text-gray-500 font-medium">Manage students, agents, and platform permissions.</p>
                </div>
                <Link href="/admin/users/new">
                    <Button className="rounded-2xl gap-2 font-black shadow-lg shadow-black/10">
                        <UserPlus size={20} />
                        New Staff Account
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 flex flex-col md:flex-row gap-4 items-center shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search identities by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black/10 focus:ring-8 focus:ring-black/5 rounded-2xl py-4 pl-14 pr-4 transition-all duration-300 font-bold"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto p-1 bg-gray-50 rounded-[20px] border border-gray-100">
                    {["ALL", "STUDENT", "AGENT", "ADMIN"].map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role === "ALL" ? "" : role)}
                            className={`px-6 py-3 rounded-[14px] font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${(roleFilter === role || (role === "ALL" && !roleFilter))
                                ? "bg-black text-white shadow-xl shadow-black/10 scale-[1.02]"
                                : "text-gray-400 hover:text-black"
                                }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Table / Grid */}
            <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">User Identity</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Security & Role</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Registration</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Moderation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="p-32 text-center text-gray-400">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto mb-4"></div>
                                        <p className="font-black uppercase tracking-widest text-xs">Decrypting User Registry...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-32 text-center">
                                        <p className="text-gray-400 font-extrabold italic text-sm">No identities matched your query.</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-100 relative overflow-hidden flex-shrink-0 border-4 border-white shadow-card transition-transform group-hover:scale-110 duration-500">
                                                {user.avatar ? (
                                                    <Image src={getImageUrl(user.avatar)} alt={user.fullName} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <Search size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 leading-tight text-lg mb-1 tracking-tight">{user.fullName}</h4>
                                                <p className="text-xs font-bold text-gray-400 flex items-center gap-2">
                                                    <Mail size={12} className="text-primary" />
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex flex-col gap-3">
                                            <span className={`w-fit px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'AGENT' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                            <div className="flex gap-2">
                                                {user.isVerified && (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-lg text-blue-600">
                                                        <BadgeCheck size={14} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                                    </div>
                                                )}
                                                {user.isBlocked && (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-lg text-red-600">
                                                        <Ban size={14} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Restricted</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <p className="text-sm font-black text-gray-700 flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-300" />
                                            {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="flex justify-end gap-3 transition-all duration-300">
                                            {user.role === 'AGENT' && !user.isVerified && (
                                                <button
                                                    onClick={() => verifyAgent(user.id)}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-black transition shadow-lg shadow-blue-500/20 font-black text-[10px] uppercase tracking-widest"
                                                >
                                                    Grant Access
                                                </button>
                                            )}
                                            {user.isBlocked ? (
                                                <button
                                                    onClick={() => unblockUser(user.id)}
                                                    className="px-4 py-2 bg-black text-white rounded-xl hover:bg-primary transition shadow-lg shadow-black/10 font-black text-[10px] uppercase tracking-widest"
                                                >
                                                    Restore
                                                </button>
                                            ) : user.role !== 'ADMIN' && (
                                                <button
                                                    onClick={() => handleBlock(user.id)}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-black transition shadow-lg shadow-red-500/20 font-black text-[10px] uppercase tracking-widest"
                                                >
                                                    Suspend
                                                </button>
                                            )}
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
