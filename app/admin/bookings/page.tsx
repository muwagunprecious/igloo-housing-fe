"use client";

import { useState } from "react";
import {
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    MoreVertical,
    Download
} from "lucide-react";


// Mock Data
const MOCK_BOOKINGS = [
    {
        id: "BK-2024-001",
        property: "Sunset Villa Apt 4B",
        student: "Sarah Johnson",
        agent: "Michael Chen",
        date: "2024-03-15",
        amount: 450000,
        status: "PENDING",
        paymentStatus: "PAID"
    },
    {
        id: "BK-2024-002",
        property: "Greenwood Student Hub",
        student: "David Okon",
        agent: "Sarah Wilson",
        date: "2024-03-14",
        amount: 280000,
        status: "CONFIRMED",
        paymentStatus: "PAID"
    },
    {
        id: "BK-2024-003",
        property: "Lagos Campus Lodge",
        student: "Femi Adebayo",
        agent: "John Smith",
        date: "2024-03-12",
        amount: 150000,
        status: "CANCELLED",
        paymentStatus: "REFUNDED"
    },
    {
        id: "BK-2024-004",
        property: "University Heights",
        student: "Grace Peters",
        agent: "Michael Chen",
        date: "2024-03-10",
        amount: 600000,
        status: "COMPLETED",
        paymentStatus: "PAID"
    },
    {
        id: "BK-2024-005",
        property: "Modern Loft 12",
        student: "Samuel Etim",
        agent: "Sarah Wilson",
        date: "2024-03-08",
        amount: 350000,
        status: "PENDING",
        paymentStatus: "PENDING"
    }
];

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState(MOCK_BOOKINGS);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const handleAction = (id: string, action: 'CONFIRM' | 'CANCEL' | 'COMPLETE') => {
        setBookings(prev => prev.map(booking => {
            if (booking.id === id) {
                let newStatus = booking.status;
                if (action === 'CONFIRM') newStatus = 'CONFIRMED';
                if (action === 'CANCEL') newStatus = 'CANCELLED';
                if (action === 'COMPLETE') newStatus = 'COMPLETED';
                return { ...booking, status: newStatus };
            }
            return booking;
        }));
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesStatus = filterStatus === "ALL" || booking.status === filterStatus;
        const matchesSearch =
            booking.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
            case 'COMPLETED': return 'bg-green-100 text-green-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight">Booking Management</h1>
                    <p className="text-gray-500 font-medium">Monitor and manage accommodation reservations.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-sm shadow-sm hover:bg-gray-50 transition">
                        <Download size={18} />
                        Export Data
                    </button>
                    <div className="bg-black text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-black/20 flex items-center gap-2">
                        <Calendar size={18} />
                        <span>{filteredBookings.length} Records</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by ID, Property, or Student..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black/5 transition"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${filterStatus === status
                                ? "bg-black text-white shadow-lg"
                                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Booking Ref</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Property Info</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Parties</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Financials</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <span className="font-mono text-xs font-bold text-gray-500">{booking.id}</span>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                                            <Clock size={10} />
                                            {new Date(booking.date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="font-bold text-sm text-gray-900">{booking.property}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">S</div>
                                                <span className="text-xs font-medium">{booking.student}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-600">A</div>
                                                <span className="text-xs font-medium text-gray-500">{booking.agent}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="font-black text-sm">₦{booking.amount.toLocaleString()}</p>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${booking.paymentStatus === 'PAID' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {booking.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${getStatusColor(booking.status)}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full bg-current`}></div>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {booking.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(booking.id, 'CONFIRM')}
                                                        className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition"
                                                        title="Confirm Booking"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(booking.id, 'CANCEL')}
                                                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
                                                        title="Cancel Booking"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                            {booking.status === 'CONFIRMED' && (
                                                <button
                                                    onClick={() => handleAction(booking.id, 'COMPLETE')}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
                                                    title="Mark Completed"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}
                                            <button className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-black hover:text-white transition">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

