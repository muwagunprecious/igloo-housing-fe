"use client";

import { Search, Globe, Menu, User, LogOut, LayoutDashboard, Heart, Users } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageUrl } from "@/app/lib/imageUrl";

export default function Navbar() {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { user, isAuthenticated, logout } = useAuthStore();
    const router = useRouter();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setShowMenu(false);
        router.push("/");
    };

    const getDashboardLink = () => {
        if (!user) return "/login";
        if (user.role === "admin") return "/admin/dashboard";
        if (user.role === "agent") return "/agents/dashboard";
        return "/dashboard";
    };

    return (
        <header className="fixed top-0 w-full z-50 bg-white border-b border-gray-200">
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
                <div className="flex flex-row items-center justify-between gap-3 md:gap-0 py-4">
                    {/* Logo */}
                    <Link href="/" className="hidden md:block cursor-pointer">
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
                            IGLOO
                        </div>
                    </Link>

                    {/* Search Bar (Desktop) */}
                    <Link href="/search">
                        <div className="border border-gray-300 rounded-full shadow-sm hover:shadow-md transition cursor-pointer py-2.5 px-4 flex items-center justify-between min-w-[350px]">
                            <div className="text-sm font-semibold px-4 border-r border-gray-300">
                                Anywhere
                            </div>
                            <div className="text-sm font-semibold px-4 border-r border-gray-300">
                                Any week
                            </div>
                            <div className="text-sm text-gray-500 px-4 flex flex-row items-center gap-3">
                                <div className="hidden sm:block">Add guests</div>
                                <div className="p-2 bg-primary rounded-full text-white">
                                    <Search size={14} strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* User Menu */}
                    <div className="flex flex-row items-center gap-3">
                        {/* "Igloo your home" — only show for agents/non-authenticated */}
                        {(!isAuthenticated || user?.role === "agent") && (
                            <Link
                                href={isAuthenticated ? "/agents/dashboard" : "/signup/agent"}
                                className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-gray-100 transition cursor-pointer"
                            >
                                Igloo your home
                            </Link>
                        )}
                        <div className="hidden md:block p-3 rounded-full hover:bg-gray-100 transition cursor-pointer">
                            <Globe size={18} />
                        </div>
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-4 md:py-1 md:px-2 border border-gray-300 rounded-full flex flex-row items-center gap-3 hover:shadow-md transition cursor-pointer"
                            >
                                <Menu size={18} />
                                <div className="hidden md:block">
                                    {isAuthenticated && user?.avatar ? (
                                        <div className="w-8 h-8 rounded-full overflow-hidden relative">
                                            <Image
                                                src={getImageUrl(user.avatar)}
                                                alt={user.name}
                                                fill
                                                className="object-cover"
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
                                <div className="absolute right-0 top-14 w-60 bg-white rounded-2xl shadow-floating border border-gray-200 py-2 z-50">
                                    {isAuthenticated && user ? (
                                        <>
                                            {/* User Info */}
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block capitalize ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                        user.role === 'agent' ? 'bg-green-100 text-green-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </div>

                                            {/* Dashboard Link */}
                                            <Link
                                                href={getDashboardLink()}
                                                onClick={() => setShowMenu(false)}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-sm"
                                            >
                                                <LayoutDashboard size={16} className="text-gray-500" />
                                                Dashboard
                                            </Link>

                                            {/* Wishlists - only for students */}
                                            {user.role === "student" && (
                                                <Link
                                                    href="/favorites"
                                                    onClick={() => setShowMenu(false)}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-sm"
                                                >
                                                    <Heart size={16} className="text-gray-500" />
                                                    Wishlists
                                                </Link>
                                            )}

                                            {/* Find Roommates - for students */}
                                            {user.role === "student" && (
                                                <Link
                                                    href="/roommates"
                                                    onClick={() => setShowMenu(false)}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-sm"
                                                >
                                                    <Users size={16} className="text-gray-500" />
                                                    Find Roommates
                                                </Link>
                                            )}

                                            <div className="border-t border-gray-200 my-2"></div>

                                            {/* Logout */}
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 transition text-sm font-semibold"
                                            >
                                                <LogOut size={16} />
                                                Log out
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href="/login"
                                                onClick={() => setShowMenu(false)}
                                                className="block px-4 py-3 hover:bg-gray-50 transition font-semibold text-sm"
                                            >
                                                Log in
                                            </Link>
                                            <Link
                                                href="/signup"
                                                onClick={() => setShowMenu(false)}
                                                className="block px-4 py-3 hover:bg-gray-50 transition text-sm"
                                            >
                                                Sign up
                                            </Link>
                                            <div className="border-t border-gray-200 my-2"></div>
                                            <Link
                                                href="/favorites"
                                                onClick={() => setShowMenu(false)}
                                                className="block px-4 py-3 hover:bg-gray-50 transition text-sm"
                                            >
                                                Wishlists
                                            </Link>
                                            <Link
                                                href="/roommates"
                                                onClick={() => setShowMenu(false)}
                                                className="block px-4 py-3 hover:bg-gray-50 transition text-sm"
                                            >
                                                Find Roommates
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
