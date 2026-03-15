"use client";

import { useAuthStore } from "@/app/stores/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, LogOut, User as UserIcon, Shield, ChevronRight, Edit2 } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const router = useRouter();

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <UserIcon size={32} className="text-gray-400" />
                </div>
                <h1 className="text-xl font-bold mb-2">Login to your account</h1>
                <p className="text-gray-500 text-center mb-8">Log in to view your profile, manage listings, and chat with roommates.</p>
                <Link href="/login" className="w-full max-w-sm bg-primary text-white text-center py-3 rounded-xl font-semibold mb-3">
                    Log In
                </Link>
                <Link href="/signup" className="w-full max-w-sm bg-white border border-gray-300 text-gray-700 text-center py-3 rounded-xl font-semibold">
                    Sign Up
                </Link>
            </div>
        );
    }

    const getDashboardLink = () => {
        if (user?.role === 'admin') return "/admin/dashboard";
        if (user?.role === 'agent') return "/agents/dashboard";
        return "/dashboard"; 
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header Card with Stylish Edit Icon */}
            <div className="bg-white p-6 border-b border-gray-100 relative">
                
                {/* Stylish Edit Icon Button */}
                <Link 
                    href="/settings" 
                    className="absolute top-6 right-6 p-2.5 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 hover:text-primary transition shadow-sm border border-gray-100"
                >
                    <Edit2 size={18} />
                </Link>

                <div className="flex items-center gap-4">
                    {user?.avatar ? (
                        <div className="relative w-16 h-16">
                            <Image src={user.avatar} alt="Profile" fill className="rounded-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                            <UserIcon size={32} />
                        </div>
                    )}
                    <div className="pr-12"> {/* Added padding-right so long names don't overlap the icon */}
                        <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-xs rounded-md text-gray-600 capitalize">
                            {user?.role || 'Student'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Menu List */}
            <div className="mt-6 px-4 space-y-3">
                <Link href={getDashboardLink()} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <LayoutDashboard size={20} />
                        </div>
                        <span className="font-medium text-gray-900">Dashboard</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                </Link>

                {/* Optional: Add a verification link for agents to see their status */}
                {user?.role === 'agent' && (
                    <Link href="/settings" className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <Shield size={20} />
                            </div>
                            <span className="font-medium text-gray-900">Agent Verification</span>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                    </Link>
                )}

                {/* Logout Button */}
                <button 
                    onClick={() => {
                        logout();
                        router.push('/');
                    }}
                    className="w-full flex items-center justify-between bg-white p-4 rounded-xl shadow-sm mt-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <LogOut size={20} />
                        </div>
                        <span className="font-medium text-red-600">Log out</span>
                    </div>
                </button>
            </div>
        </div>
    );
}