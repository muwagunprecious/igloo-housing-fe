"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Home, MessageSquare, Wallet, BarChart3, Plus } from "lucide-react";

export default function AgentSidebar() {
    const pathname = usePathname();

    const navLinks = [
        { label: "Dashboard", href: "/agents/dashboard", icon: LayoutDashboard },
        { label: "Properties", href: "/agents/properties", icon: Home },
        { label: "Messages", href: "/agents/messages", icon: MessageSquare },
        { label: "Wallet", href: "/agents/wallet", icon: Wallet },
        { label: "Reports", href: "/agents/reports", icon: BarChart3 },
    ];

    const isActive = (href: string) => {
        return pathname === href || pathname.startsWith(href + "/");
    };

    return (
        <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-6">
                {/* Quick Action */}
                <Link href="/agents/properties/new">
                    <button className="w-full bg-primary text-white px-4 py-3 rounded-lg font-semibold hover:bg-primary/90 transition text-sm flex items-center justify-center gap-2">
                        <Plus size={18} />
                        Add New Property
                    </button>
                </Link>

                {/* Navigation */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                        Main
                    </h3>
                    <nav className="space-y-1">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href}>
                                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${isActive(link.href)
                                        ? 'bg-gray-100 text-black font-semibold'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}>
                                    <link.icon size={20} />
                                    <span className="text-sm">{link.label}</span>
                                </div>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Stats Card */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-primary/5 to-primary/10">
                    <h4 className="font-semibold mb-2 text-sm">Quick Stats</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Active Listings</span>
                            <span className="font-semibold">3</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Bookings</span>
                            <span className="font-semibold">3</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">This Month</span>
                            <span className="font-semibold text-green-600">₦2.76M</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
