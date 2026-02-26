"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    PlusCircle,
    List,
    Settings,
    LogOut,
    Home,
    Users,
    Phone,
    MessageSquare,
    X,
    CheckCircle
} from "lucide-react";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { useEffect, useState } from "react";
import api from "@/app/lib/axios";

export default function AgentDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isAuthenticated, updateUser } = useAuthStore();
    const [showWhatsappModal, setShowWhatsappModal] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Show modal if verified agent is missing whatsapp
        if (user && user.role === 'agent' && user.isVerified && !user.whatsapp) {
            setShowWhatsappModal(true);
        }
    }, [user]);

    const handleSaveWhatsapp = async () => {
        if (!whatsappNumber) return;
        setIsSubmitting(true);
        try {
            const response = await api.put('/auth/profile', { whatsapp: whatsappNumber });
            if (response.data.success) {
                updateUser({ whatsapp: response.data.data.whatsapp });
                setShowWhatsappModal(false);
                alert("WhatsApp number saved successfully!");
            }
        } catch (error) {
            console.error("Failed to save whatsapp number", error);
            alert("Failed to save contact details. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated || (user && user.role !== 'agent')) {
            router.push('/login');
        }
    }, [isAuthenticated, user, router]);

    if (!user) return null;

    const navItems = [
        { name: "Overview", href: "/agents/dashboard", icon: LayoutDashboard },
        { name: "My Listings", href: "/agents/dashboard/listings", icon: List },
        { name: "Post New Property", href: "/agents/dashboard/listings/create", icon: PlusCircle },
        { name: "Roommate Requests", href: "/agents/dashboard/roommates", icon: Users },
        { name: "Messages", href: "/agents/dashboard/messages", icon: MessageSquare },
        { name: "Settings", href: "/agents/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:block">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
                            <Home size={18} />
                        </div>
                        <span className="text-xl font-bold text-gray-900">Igloo Agent</span>
                    </Link>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? "bg-green-50 text-green-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    <Icon size={20} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                            {user.name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); router.push('/login'); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                {children}
            </main>

            {/* WhatsApp Prompt Modal */}
            {showWhatsappModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="relative h-32 bg-green-600 flex items-center justify-center">
                            <div className="absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer transition" onClick={() => setShowWhatsappModal(false)}>
                                <X size={24} />
                            </div>
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <Phone size={32} className="text-green-600" />
                            </div>
                        </div>

                        <div className="p-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Contact</h3>
                            <p className="text-gray-600 text-sm mb-6">
                                Congratulations on being verified! Add your WhatsApp number so students can contact you directly for bookings.
                            </p>

                            <div className="space-y-4">
                                <div className="relative">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="+234 000 000 0000"
                                        value={whatsappNumber}
                                        onChange={(e) => setWhatsappNumber(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
                                    />
                                </div>

                                <button
                                    onClick={handleSaveWhatsapp}
                                    disabled={isSubmitting || !whatsappNumber}
                                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle size={20} />
                                            Update Contact Info
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => setShowWhatsappModal(false)}
                                    className="text-sm text-gray-400 hover:text-gray-600 font-medium transition"
                                >
                                    Maybe later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
