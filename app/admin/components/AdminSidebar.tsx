"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Home,
    MessageSquare,
    Wallet,
    School,
    Plus,
    Settings,
    Calendar,
    FileWarning,
    Megaphone,
    AlertCircle,
    BadgeCheck
} from "lucide-react";

export default function AdminSidebar() {
    const pathname = usePathname();

    const navLinks = [
        { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Properties", href: "/admin/properties", icon: Home },
        { label: "Bookings", href: "/admin/bookings", icon: Calendar },
        { label: "Transactions", href: "/admin/transactions", icon: Wallet },
        { label: "Reports", href: "/admin/reports", icon: FileWarning },
        { label: "Ads Manager", href: "/admin/ads", icon: Megaphone },
        { label: "Universities", href: "/admin/universities", icon: School },
        { label: "Agent Verification", href: "/admin/agents", icon: BadgeCheck },
        { label: "Messages", href: "/admin/messages", icon: MessageSquare },
        { label: "Settings", href: "/admin/settings", icon: Settings },
    ];

    const isActive = (href: string) => {
        return pathname === href || pathname.startsWith(href + "/");
    };

    return (
        <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-6">
                {/* Admin Quick Action */}
                <div className="space-y-2">
                    <Link href="/admin/properties/new">
                        <button className="w-full bg-black text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-800 transition text-sm flex items-center justify-center gap-2">
                            <Plus size={18} />
                            List New Property
                        </button>
                    </Link>
                </div>

                {/* Navigation */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                        Platform Management
                    </h3>
                    <nav className="space-y-1">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href}>
                                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${isActive(link.href)
                                    ? 'bg-black text-white font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}>
                                    <link.icon size={20} />
                                    <span className="text-sm">{link.label}</span>
                                </div>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* System Alerts Preview */}
                <div className="border border-red-100 rounded-xl p-4 bg-red-50/50">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={16} className="text-red-500" />
                        <h4 className="font-semibold text-sm text-red-700">Urgent Tasks</h4>
                    </div>
                    <div className="space-y-2 text-xs text-red-600">
                        <div className="flex justify-between">
                            <span>Pending Agents</span>
                            <span className="font-bold">2</span>
                        </div>
                        <div className="flex justify-between">
                            <span>New Properties</span>
                            <span className="font-bold">5</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
