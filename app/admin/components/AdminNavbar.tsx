"use client";

import { useState } from "react";
import {
    Search,
    Bell,
    LogOut,
    User,
    ChevronDown,
    Building2,
    Users,
    FileWarning
} from "lucide-react";
import { useAuthStore } from "@/app/stores/useAuthStore";
import Image from "next/image";
import { getImageUrl } from "@/app/lib/imageUrl";

export default function AdminNavbar() {
    const { user, logout } = useAuthStore();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const notifications = [
        { id: 1, text: "5 New listing approvals pending", icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
        { id: 2, text: "2 New agent verification requests", icon: Users, color: "text-green-600", bg: "bg-green-50" },
        { id: 3, text: "New report: Property ID #4321", icon: FileWarning, color: "text-red-600", bg: "bg-red-50" },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 h-[80px] bg-white/80 backdrop-blur-md border-b border-gray-100 z-[100] px-8">
            <div className="max-w-[2520px] mx-auto h-full flex items-center justify-between">
                {/* Search Bar */}
                <div className="flex-1 max-w-xl relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search houses, agents, or students..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border-none font-medium text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-black hover:bg-gray-100 transition-all relative"
                        >
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
                        </button>

                        {showNotifications && (
                            <div className="absolute top-full right-0 mt-4 w-80 bg-white border border-gray-100 rounded-3xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <h4 className="font-black text-sm uppercase tracking-widest">Notifications</h4>
                                    <button className="text-[10px] font-black text-primary uppercase">Mark all read</button>
                                </div>
                                <div className="space-y-2">
                                    {notifications.map((n) => (
                                        <div key={n.id} className="flex gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group">
                                            <div className={`p-2 rounded-xl h-fit ${n.bg} ${n.color}`}>
                                                <n.icon size={16} />
                                            </div>
                                            <p className="text-xs font-bold text-gray-600 leading-relaxed group-hover:text-black">{n.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                                    View All Activity
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Profile */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfile(!showProfile)}
                            className="flex items-center gap-3 pl-2 pr-4 py-2 bg-gray-50 rounded-2xl border border-gray-100 hover:border-black/10 transition-all"
                        >
                            <div className="w-8 h-8 rounded-xl bg-primary text-black flex items-center justify-center font-black text-xs relative overflow-hidden">
                                {user?.avatar ? (
                                    <Image src={getImageUrl(user.avatar)} alt={user.name} fill className="object-cover" />
                                ) : (
                                    user?.name.charAt(0) || "A"
                                )}
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-xs font-black tracking-tight">{user?.name || "Admin"}</p>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Super Admin</p>
                            </div>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
                        </button>

                        {showProfile && (
                            <div className="absolute top-full right-0 mt-4 w-64 bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                                    <p className="text-sm font-black truncate">{user?.email}</p>
                                </div>
                                <div className="p-2">
                                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-2xl text-xs font-bold text-gray-600 hover:text-black transition-all">
                                        <User size={18} />
                                        Profile Settings
                                    </button>
                                    <button
                                        onClick={() => logout()}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-2xl text-xs font-bold text-red-500 transition-all"
                                    >
                                        <LogOut size={18} />
                                        Sign Out Session
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
