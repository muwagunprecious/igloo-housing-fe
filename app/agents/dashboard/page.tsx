"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/axios";
import { Eye, MessageSquare, TrendingUp, Home } from "lucide-react";
import Link from "next/link";

export default function AgentDashboard() {
    const [stats, setStats] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/agents/dashboard/stats');
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
    }

    if (!stats) {
        return <div className="p-8 text-center text-red-500">Failed to load dashboard data.</div>;
    }

    const statCards = [
        { label: "Total Properties", value: stats.totalProperties, icon: Home, color: "bg-blue-500" },
        { label: "Total Views", value: stats.totalViews, icon: Eye, color: "bg-green-500" },
        { label: "Lease Requests", value: stats.totalRequests, icon: TrendingUp, color: "bg-purple-500" },
        { label: "Unread Messages", value: stats.unreadMessages, icon: MessageSquare, color: "bg-orange-500" },
    ];

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back, here&apos;s what&apos;s happening with your listings.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 ${stat.color} bg-opacity-10 rounded-lg flex items-center justify-center text-${stat.color.split('-')[1]}-600`}>
                                    <Icon size={24} className={stat.color.replace('bg-', 'text-')} />
                                </div>
                                <span className={`text-2xl font-bold text-gray-900`}>{stat.value}</span>
                            </div>
                            <h3 className="text-gray-500 font-medium text-sm">{stat.label}</h3>
                        </div>
                    );
                })}
            </div>

            {/* Recent Listings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Recent Listings</h2>
                    <Link href="/agents/dashboard/listings" className="text-sm text-green-600 hover:text-green-700 font-medium">
                        View All
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">Property</th>
                                <th className="px-6 py-4 font-medium">Price</th>
                                <th className="px-6 py-4 font-medium">Views</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.recentProperties.map((prop: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                <tr key={prop.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{prop.title}</div>
                                        <div className="text-xs text-gray-500">{prop.location}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">₦{prop.price.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-600">{prop.views || 0}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${prop.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {prop.isAvailable ? 'Active' : 'Rented'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {stats.recentProperties.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No properties found. <Link href="/agents/dashboard/listings/create" className="text-green-600 font-medium">Create one now</Link>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
