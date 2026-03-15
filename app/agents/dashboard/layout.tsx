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
    CheckCircle,
    Menu // Added Menu icon for the mobile button
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
    
    // Existing state
    const [showWhatsappModal, setShowWhatsappModal] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New state for mobile menu & hydration fix
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Wait until component is mounted to check auth (fixes Zustand hydration flash)
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
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
        // Only run redirect logic AFTER the app has mounted to prevent local storage bugs
        if (isMounted) {
            if (!isAuthenticated || (user && user.role !== 'agent')) {
                router.push('/login');
            }
        }
    }, [isAuthenticated, user, router, isMounted]);

    // Prevent rendering the dashboard layout if not mounted or no user is present
    if (!isMounted || !user) return null;

    const navItems = [
        { name: "Overview", href: "/agents/dashboard", icon: LayoutDashboard },
        { name: "My Listings", href: "/agents/dashboard/listings", icon: List },
        { name: "Post New Property", href: "/agents/dashboard/listings/create", icon: PlusCircle },
        { name: "Roommate Requests", href: "/agents/dashboard/roommates", icon: Users },
        { name: "Messages", href: "/agents/dashboard/messages", icon: MessageSquare },
        { name: "Settings", href: "/agents/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header Top Bar */}
            <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
                        <Home size={18} />
                    </div>
                    <span className="text-xl font-bold text-gray-900">Igloo Agent</span>
                </Link>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                    <Menu size={24} className="text-gray-700" />
                </button>
            </div>

            {/* Dark Overlay for Mobile Sidebar */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                md:translate-x-0 md:block
            `}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
                                <Home size={18} />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Igloo Agent</span>
                        </Link>
                        {/* Close button inside sidebar for mobile */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="md:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="space-y-1 flex-1 overflow-y-auto pr-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)} // Closes menu when a link is clicked
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

                    {/* Bottom User Profile Section */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 px-4 py-3 mb-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold shrink-0">
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
                </div>
            </aside>

            {/* Main Content */}
            <main className="md:ml-64 p-4 md:p-8 w-full">
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