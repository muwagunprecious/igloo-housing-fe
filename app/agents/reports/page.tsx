"use client";

import { agentBookings, agentEarnings } from "../data/agentData";
import { useAgentPropertiesStore } from "../stores/useAgentPropertiesStore";
import AgentSidebar from "../components/AgentSidebar";
import { BarChart3, TrendingUp, Home, Users, DollarSign } from "lucide-react";

export default function AgentReportsPage() {
    const properties = useAgentPropertiesStore((state) => state.properties);
    const totalBookings = agentBookings.length;
    const paidBookings = agentBookings.filter((b) => b.status === "Paid").length;
    const propertiesCount = properties.length;
    const occupancyRate = propertiesCount > 0
        ? ((properties.filter((p) => (p.status || "").toLowerCase() === "booked").length / propertiesCount) * 100).toFixed(0)
        : "0";

    return (
        <div className="max-w-[1920px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-[100px] pb-20">
            <div className="flex gap-8">
                <AgentSidebar />

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
                        <p className="text-gray-500">Overview of your property performance</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Home className="text-blue-600" size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold mb-1">{properties.length}</h3>
                            <p className="text-sm text-gray-500">Total Properties</p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <Users className="text-green-600" size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold mb-1">{totalBookings}</h3>
                            <p className="text-sm text-gray-500">Total Bookings</p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <TrendingUp className="text-purple-600" size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold mb-1">{occupancyRate}%</h3>
                            <p className="text-sm text-gray-500">Occupancy Rate</p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <DollarSign className="text-orange-600" size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold mb-1">₦{(agentEarnings.totalEarnings / 1000000).toFixed(1)}M</h3>
                            <p className="text-sm text-gray-500">Total Revenue</p>
                        </div>
                    </div>

                    {/* Performance Summary */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
                        <h2 className="text-xl font-bold mb-6">Performance Summary</h2>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-600">Booking Conversion Rate</span>
                                    <span className="text-sm font-semibold">{((paidBookings / totalBookings) * 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(paidBookings / totalBookings) * 100}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-600">Property Occupancy</span>
                                    <span className="text-sm font-semibold">{occupancyRate}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${occupancyRate}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-600">Average Property Rating</span>
                                    <span className="text-sm font-semibold">4.8 / 5.0</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart Placeholder */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-6">Revenue Trend</h2>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <BarChart3 className="mx-auto mb-4 text-gray-400" size={48} />
                                <p className="text-gray-500">Chart visualization coming soon</p>
                                <p className="text-sm text-gray-400 mt-2">Will be implemented with Chart.js or Recharts</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
