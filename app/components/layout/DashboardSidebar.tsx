"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Heart, MessageSquare, Receipt, User, Settings, Bell, CreditCard, Users, X } from "lucide-react";
import { useAuthStore } from "@/app/stores/useAuthStore";

// Add props to the component
export default function DashboardSidebar({ isOpen, setIsOpen }: { isOpen?: boolean; setIsOpen?: (val: boolean) => void }) {
    const { user } = useAuthStore();
    const pathname = usePathname();
    const [currentHash, setCurrentHash] = useState("");

    useEffect(() => {
        const handle = requestAnimationFrame(() => {
            setCurrentHash(window.location.hash);
        });
        const handleHashChange = () => setCurrentHash(window.location.hash);
        window.addEventListener("hashchange", handleHashChange);
        return () => {
            cancelAnimationFrame(handle);
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);

    const mainLinks = [
        { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { label: "My Houses", href: "/my-houses", icon: Building2, studentOnly: true },
        { label: "Find Roommates", href: "/roommates", icon: Users, studentOnly: true },
        { label: "Wishlists", href: "/favorites", icon: Heart, studentOnly: true },
        { label: "Messages", href: "/chat", icon: MessageSquare },
        { label: "Transactions", href: "/dashboard#payments", icon: Receipt },
    ];

    const settingsLinks = [
        { label: "Personal info", href: "/dashboard#personal", icon: User },
        { label: "Login & security", href: "/dashboard#security", icon: Settings },
        { label: "Payments", href: "/dashboard#payments", icon: CreditCard },
        { label: "Notifications", href: "/dashboard#notifications", icon: Bell },
    ];

    const filteredMainLinks = mainLinks.filter(link => !link.studentOnly || user?.role === 'student');

    const isActive = (href: string) => {
        if (href.includes("#")) {
            const [base, hash] = href.split("#");
            return pathname === base && currentHash === `#${hash}`;
        }
        return pathname === href && currentHash === "";
    };

    return (
        <>
            {/* Dark Overlay for Mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={() => setIsOpen?.(false)}
                />
            )}

            {/* Sidebar container with slide-in logic */}
            <aside className={`
                fixed lg:sticky top-0 lg:top-24 left-0 h-full lg:h-auto w-64 bg-white lg:bg-transparent z-50 lg:z-0
                transform transition-transform duration-300 ease-in-out border-r lg:border-none border-gray-200 overflow-y-auto lg:overflow-visible
                ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                flex-shrink-0
            `}>
                <div className="p-6 lg:p-0 space-y-8">
                    
                    {/* Mobile Close Button & Header */}
                    <div className="flex items-center justify-between lg:hidden pb-4 border-b border-gray-100">
                        <span className="font-bold text-lg">Menu</span>
                        <button onClick={() => setIsOpen?.(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Main Navigation */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Main</h3>
                        <nav className="space-y-1">
                            {filteredMainLinks.map((link) => (
                                <Link key={link.href} href={link.href} onClick={() => setIsOpen?.(false)}>
                                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${isActive(link.href) ? 'bg-gray-100 text-black font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                                        <link.icon size={20} />
                                        <span className="text-sm">{link.label}</span>
                                    </div>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Settings */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Settings</h3>
                        <nav className="space-y-1">
                            {settingsLinks.map((link) => (
                                <Link key={link.href} href={link.href} onClick={() => setIsOpen?.(false)}>
                                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${isActive(link.href) ? 'bg-gray-100 text-black font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                                        <link.icon size={20} />
                                        <span className="text-sm">{link.label}</span>
                                    </div>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Quick Actions */}
                    <div className="border-t border-gray-200 pt-6">
                        <Link href="/search" onClick={() => setIsOpen?.(false)}>
                            <button className="w-full bg-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition text-sm">
                                Browse Properties
                            </button>
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}