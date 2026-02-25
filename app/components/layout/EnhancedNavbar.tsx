"use client";

import { Globe, Menu, User, Home, LayoutDashboard, Building2, MessageSquare, Users, X, LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/useAuthStore";
import Image from "next/image";

export default function EnhancedNavbar() {
    const [showMenu, setShowMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();

    // Public navigation links (shown when not authenticated)
    const publicLinks = [
        { label: "Find Housing", href: "/" },
    ];

    // Authenticated dropdown menu items
    const authenticatedMenuItems = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Messages", href: "/chat", icon: MessageSquare },
        { label: "My Houses", href: "/my-houses", icon: Building2, studentOnly: true },
        { label: "Find Roommate", href: "/roommates", icon: Users },
        { label: "Favorites", href: "/favorites", icon: Home },
    ];

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <header className="fixed top-0 w-full z-50 glass border-b border-gray-200">
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
                <div className="flex flex-row items-center justify-between gap-3 md:gap-0 py-4">
                    {/* Logo */}
                    <Link href="/" className="cursor-pointer">
                        <div className="text-primary font-bold text-2xl tracking-tighter flex items-center gap-1">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                                <svg
                                    viewBox="0 0 32 32"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                    role="presentation"
                                    focusable="false"
                                    style={{ display: "block", height: "16px", width: "16px", fill: "currentcolor" }}
                                >
                                    <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.709-3.386l-.257-.26-.177-.179-.177.179c-2.153 2.128-4.485 3.386-6.709 3.386-3.48 0-6.357-2.416-6.357-6.478l.001-.228.01-.415c.05-.924.293-1.805.96-3.396l.145-.353c.986-2.295 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.053.539-2.987 2.211C10.914 9.341 6.721 18.115 5.76 20.353c-.561 1.34-.763 2.001-.806 2.659l-.004.22c-.002.09-.002.181 0 .272.03.52.137 1.25 1.15 2.069 1.692 1.368 3.655 1.368 5.346.001l.256-.21.5-.42c.09-.076.18-.151.27-.225.357-.291.714-.582 1.071-.874l.457-.367.457.367c.357.292.714.583 1.071.874l.27.225.5.42.256.21c1.691 1.367 3.654 1.367 5.346-.001 1.013-.819 1.12-1.549 1.15-2.069.002-.091.002-.182 0-.272l-.004-.22c-.043-.658-.245-1.319-.806-2.659-.961-2.238-5.154-11.012-7.253-15.142C18.053 3.539 17.239 3 16 3zm0 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"></path>
                                </svg>
                            </div>
                            <span className="hidden md:block">IGLOO</span>
                        </div>
                    </Link>

                    {/* Desktop Public Navigation (shown when NOT authenticated) */}
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

                    {/* Right Side */}
                    <div className="flex flex-row items-center gap-3">
                        {/* Public Navigation - Login & Sign Up (shown when NOT authenticated) */}
                        {!isAuthenticated && (
                            <>
                                <Link href="/login" className="hidden md:block">
                                    <span className="text-sm font-medium text-gray-700 hover:text-gray-900 transition">
                                        Login
                                    </span>
                                </Link>
                                <Link href="/signup">
                                    <button className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition whitespace-nowrap">
                                        Sign Up
                                    </button>
                                </Link>
                            </>
                        )}

                        {/* Authenticated Navigation - User Avatar Dropdown */}
                        {isAuthenticated && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-4 md:py-1 md:px-2 border border-gray-300 rounded-full flex flex-row items-center gap-3 hover:shadow-md transition cursor-pointer"
                                >
                                    <Menu size={18} />
                                    <div className="hidden md:block">
                                        {user?.avatar ? (
                                            <div className="relative w-8 h-8">
                                                <Image
                                                    src={user.avatar}
                                                    alt={user.name || "User"}
                                                    fill
                                                    className="rounded-full object-cover"
                                                />
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
                                                // Skip student-only items for agents
                                                if (item.studentOnly && user?.role === 'agent') return null;

                                                let href = item.href;
                                                if (item.label === "Dashboard") {
                                                    if (user?.role === 'admin') href = "/admin/dashboard";
                                                    else if (user?.role === 'agent') href = "/agents/dashboard";
                                                }

                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={href}
                                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                                                        onClick={() => setShowMenu(false)}
                                                    >
                                                        {item.icon && <item.icon size={16} />}
                                                        {item.label}
                                                    </Link>
                                                );
                                            })}

                                            {/* Remainder of the secondary items border and logout button */}
                                            <div className="border-t border-gray-200 my-2"></div>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setShowMenu(false);
                                                    router.push("/");
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition text-red-600 flex items-center gap-2"
                                            >
                                                <LogOut size={16} />
                                                Log out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition"
                        >
                            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {showMobileMenu && (
                    <div className="lg:hidden border-t border-gray-200 py-4">
                        <nav className="flex flex-col gap-2">
                            {!isAuthenticated ? (
                                <>
                                    {publicLinks.map((link) => (
                                        <Link key={link.href} href={link.href} onClick={() => setShowMobileMenu(false)}>
                                            <div className="px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                                                {link.label}
                                            </div>
                                        </Link>
                                    ))}
                                    <Link href="/login" onClick={() => setShowMobileMenu(false)}>
                                        <div className="px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                                            Login
                                        </div>
                                    </Link>
                                    <Link href="/signup" onClick={() => setShowMobileMenu(false)}>
                                        <div className="px-4 py-3 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition">
                                            Sign Up
                                        </div>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    {authenticatedMenuItems.map((item) => {
                                        if (item.studentOnly && user?.role === 'agent') return null;

                                        let href = item.href;
                                        if (item.label === "Dashboard") {
                                            if (user?.role === 'admin') href = "/admin/dashboard";
                                            else if (user?.role === 'agent') href = "/agents/dashboard";
                                        }

                                        return (
                                            <Link key={item.href} href={href} onClick={() => setShowMobileMenu(false)}>
                                                <div className={`px-4 py-3 rounded-xl text-sm font-semibold transition flex items-center gap-3 ${isActive(href)
                                                    ? 'bg-gray-100 text-black'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                    }`}>
                                                    {item.icon && <item.icon size={20} />}
                                                    {item.label}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                    <div className="border-t border-gray-200 my-2"></div>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setShowMobileMenu(false);
                                            router.push("/");
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition flex items-center gap-3"
                                    >
                                        <LogOut size={20} />
                                        Log out
                                    </button>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
