"use client";

import { Menu, User, Home, LayoutDashboard, Building2, MessageSquare, Users, LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/useAuthStore";
import Image from "next/image";
import { igloo } from "@/app/assets";

export default function EnhancedNavbar() {
    const [showMenu, setShowMenu] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();

    // Hide this global navbar completely on dashboard pages
    if (pathname.startsWith('/agents/dashboard') || pathname.startsWith('/admin/dashboard')) {
        return null;
    }

    const publicLinks = [
        { label: "Find Housing", href: "/" },
    ];

    const authenticatedMenuItems = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Messages", href: "/chat", icon: MessageSquare },
        { label: "My Houses", href: "/my-houses", icon: Building2, studentOnly: true },
        { label: "Find Roommate", href: "/roommates", icon: Users },
        { label: "Favorites", href: "/favorites", icon: Home },
    ];

    return (
        <header className="sticky top-0 w-full z-50 glass border-b border-gray-200">
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
                <div className="flex flex-row items-center justify-between py-4">
                    {/* Logo - VISIBLE EVERYWHERE */}
                    <Link href="/" className="cursor-pointer">
                        <div className="flex items-center gap-1">
                            <Image src={igloo} width={60} height={30} alt="logo" />
                        </div>
                    </Link>

                    {/* Desktop Public Navigation */}
                    {!isAuthenticated && (
                        <nav className="hidden lg:flex items-center gap-6">
                            {publicLinks.map((link) => (
                                <Link key={link.href} href={link.href}>
                                    <span className="text-sm font-medium text-gray-700 hover:text-gray-900 transition">
                                        {link.label}
                                    </span>
                                </Link>
                            ))}
                        </nav>
                    )}

                    {/* Right Side Actions */}
                    <div className="flex flex-row items-center gap-3">
                        {!isAuthenticated ? (
                            // NOW VISIBLE ON MOBILE: Login and Sign Up buttons
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Link href="/login">
                                    <span className="text-sm font-medium text-gray-700 hover:text-gray-900 transition hidden sm:block">
                                        Login
                                    </span>
                                </Link>
                                <Link href="/signup">
                                    <button className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition whitespace-nowrap">
                                        Sign Up
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            // Authenticated Menu - Desktop Only (Mobile uses Bottom Nav & Profile Page)
                            <div className="relative hidden lg:block">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="py-1 px-2 border border-gray-300 rounded-full flex flex-row items-center gap-3 hover:shadow-md transition cursor-pointer"
                                >
                                    <Menu size={18} />
                                    <div>
                                        {user?.avatar ? (
                                            <div className="relative w-8 h-8">
                                                <Image src={user.avatar} alt="User" fill className="rounded-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="bg-gray-500 rounded-full p-1 text-white">
                                                <User size={18} className="fill-current relative top-[2px]" />
                                            </div>
                                        )}
                                    </div>
                                </button>

                                {showMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                        <div className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-floating border border-gray-200 py-2 z-50">
                                            <div className="px-4 py-3 border-b border-gray-200">
                                                <p className="font-semibold text-sm">{user?.name}</p>
                                                <p className="text-xs text-gray-500">{user?.email}</p>
                                            </div>

                                            {authenticatedMenuItems.map((item) => {
                                                if (item.studentOnly && user?.role === 'agent') return null;
                                                let href = item.href;
                                                if (item.label === "Dashboard") {
                                                    if (user?.role === 'admin') href = "/admin/dashboard";
                                                    else if (user?.role === 'agent') href = "/agents/dashboard";
                                                }
                                                return (
                                                    <Link key={item.href} href={href} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition" onClick={() => setShowMenu(false)}>
                                                        {item.icon && <item.icon size={16} />}
                                                        {item.label}
                                                    </Link>
                                                );
                                            })}

                                            <div className="border-t border-gray-200 my-2"></div>
                                            <button onClick={() => { logout(); setShowMenu(false); router.push("/"); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 transition text-red-600 flex items-center gap-2">
                                                <LogOut size={16} /> Log out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}