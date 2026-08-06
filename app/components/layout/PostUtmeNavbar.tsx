"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/app/stores/useAuthStore";
import Image from "next/image";
import { igloo } from "@/app/assets";

export default function PostUtmeNavbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, user } = useAuthStore();
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/post-utme" className="flex items-center gap-2">
                    <div className="bg-[#008489] text-white text-xs font-black px-2 py-1 rounded-lg">POST-UTME</div>
                    <Image src={igloo} width={80} height={24} alt="Igloo" />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    <Link
                        href="/post-utme"
                        className={`text-sm font-medium transition ${pathname === '/post-utme' ? 'text-[#008489]' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        Browse Apartments
                    </Link>
                    <Link
                        href="/post-utme/list-property"
                        className={`text-sm font-medium transition ${pathname === '/post-utme/list-property' ? 'text-[#008489]' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        List Your Apartment
                    </Link>
                    {isAuthenticated ? (
                        <Link
                            href={user?.role === 'renter' ? '/dashboard/renter' : '/post-utme/bookings'}
                            className="bg-[#008489] hover:bg-[#006b6e] text-white px-4 py-2 rounded-full text-sm font-semibold transition"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            href="/post-utme/login"
                            className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-full text-sm font-semibold transition"
                        >
                            Sign In
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
                    <Link href="/post-utme" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-gray-700">Browse Apartments</Link>
                    <Link href="/post-utme/list-property" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-gray-700">List Your Apartment</Link>
                    {isAuthenticated ? (
                        <Link href={user?.role === 'renter' ? '/dashboard/renter' : '/post-utme/bookings'} onClick={() => setMobileOpen(false)} className="block bg-[#008489] text-white text-center py-2.5 rounded-xl text-sm font-semibold">Dashboard</Link>
                    ) : (
                        <Link href="/post-utme/login" onClick={() => setMobileOpen(false)} className="block bg-gray-900 text-white text-center py-2.5 rounded-xl text-sm font-semibold">Sign In</Link>
                    )}
                </div>
            )}
        </nav>
    );
}
