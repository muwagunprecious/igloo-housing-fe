"use client";

import { Search, Heart, UserCircle, MessageSquare, LayoutDashboard, Home, Wallet, CreditCard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFavoritesStore } from "@/app/stores/useFavoritesStore";
import { useAuthStore } from "@/app/stores/useAuthStore";

export default function BottomNav() {
    const pathname = usePathname();
    const favoritesCount = useFavoritesStore((state) => state.favorites.length);
    const { user } = useAuthStore();

    const isActive = (path: string) => pathname === path;

    if (pathname.startsWith('/post-utme')) {
        return null;
    }

    if (user?.role === 'renter') {
        const renterLinks = [
            { label: "Dashboard", href: "/dashboard/renter", icon: LayoutDashboard },
            { label: "Listings", href: "/dashboard/renter/listings", icon: Home },
            { label: "Wallet", href: "/dashboard/renter/wallet", icon: Wallet },
            { label: "Profile", href: "/profile", icon: UserCircle },
        ];
        return (
            <div className="sticky bottom-0 w-full bg-white border-t border-gray-200 z-50 md:hidden pb-safe">
                <div className="grid grid-cols-4 h-16">
                    {renterLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex flex-col items-center justify-center gap-1 text-[10px] ${isActive(link.href) ? 'text-[#008489]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <link.icon size={24} strokeWidth={isActive(link.href) ? 2.5 : 2} />
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="sticky bottom-0 w-full bg-white border-t border-gray-200 z-50 md:hidden pb-safe">
            <div className="grid grid-cols-4 h-16">
                <Link
                    href="/"
                    className={`flex flex-col items-center justify-center gap-1 text-[10px] ${isActive('/') ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Search size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
                    <span className="font-medium">Explore</span>
                </Link>
                <Link
                    href="/favorites"
                    className={`flex flex-col items-center justify-center gap-1 text-[10px] relative ${isActive('/favorites') ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="relative">
                        <Heart size={24} strokeWidth={isActive('/favorites') ? 2.5 : 2} />
                        {favoritesCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {favoritesCount}
                            </div>
                        )}
                    </div>
                    <span className="font-medium">Wishlists</span>
                </Link>
                <Link
                    href="/chat"
                    className={`flex flex-col items-center justify-center gap-1 text-[10px] ${isActive('/chat') ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <MessageSquare size={24} strokeWidth={isActive('/chat') ? 2.5 : 2} />
                    <span className="font-medium">Inbox</span>
                </Link>
                <Link
                    href="/profile"
                    className={`flex flex-col items-center justify-center gap-1 text-[10px] ${isActive('/profile') ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <UserCircle size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
                    <span className="font-medium">Profile</span>
                </Link>
            </div>
        </div>
    );
}
