"use client";

import { useState } from "react";
import {
    FileWarning,
    AlertTriangle,
    CheckCircle,
    Trash2,
    UserX,
    Eye,
    Search,
    Filter,
    ShieldAlert
} from "lucide-react";

// Mock Data for Reports
const MOCK_REPORTS = [
    {
        id: "REP-001",
        targetType: "PROPERTY",
        targetName: "Luxury Apartment in Akoka",
        reporter: "John Doe",
        reason: "Misleading images",
        status: "PENDING",
        date: "2024-03-20",
        severity: "HIGH"
    },
    {
        id: "REP-002",
        targetType: "AGENT",
        targetName: "Michael Smith",
        reporter: "Jane Wilson",
        reason: "Unresponsive and rude",
        status: "RESOLVED",
        date: "2024-03-19",
        severity: "LOW"
    },
    {
        id: "REP-003",
        targetType: "PROPERTY",
        targetName: "Shared Room at UNILAG",
        reporter: "Samuel Levi",
        reason: "Inaccurate price",
        status: "PENDING",
        date: "2024-03-18",
        severity: "MEDIUM"
    },
    {
        id: "REP-004",
        targetType: "STUDENT",
        targetName: "Alice Grace",
        reporter: "Admin System",
        reason: "Suspicious activity detected",
        status: "UNDER_REVIEW",
        date: "2024-03-17",
        severity: "CRITICAL"
    }
];

export default function AdminReportsPage() {
    const [reports, setReports] = useState(MOCK_REPORTS);
    const [filterStatus, setFilterStatus] = useState("ALL");

    const handleAction = (id: string, newStatus: string) => {
        setReports(prev => prev.map(report =>
            report.id === id ? { ...report, status: newStatus } : report
        ));
    };

    const filteredReports = reports.filter(report =>
        filterStatus === "ALL" || report.status === filterStatus
    );

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-600 text-white';
            case 'HIGH': return 'bg-orange-500 text-white';
            case 'MEDIUM': return 'bg-yellow-500 text-white';
            default: return 'bg-blue-500 text-white';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'RESOLVED': return 'bg-green-100 text-green-700';
            case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight">Reports & Moderation</h1>
                    <p className="text-gray-500 font-medium">Handle reported properties, agents, or students to ensure platform safety.</p>
                </div>
                <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
                    {["ALL", "PENDING", "UNDER_REVIEW", "RESOLVED"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status
                                ? "bg-black text-white shadow-lg"
                                : "text-gray-400 hover:text-black"
                                }`}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredReports.map((report) => (
                    <div key={report.id} className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm hover:shadow-card-hover transition-all group relative overflow-hidden">
                        {/* Severity Indicator */}
                        <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest ${getSeverityColor(report.severity)}`}>
                            {report.severity} Severity
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div className="flex gap-6 items-start">
                                <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-primary group-hover:text-black transition-colors">
                                    <ShieldAlert size={32} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${getStatusBadge(report.status)}`}>
                                            {report.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs font-bold text-gray-400 font-mono">{report.id}</span>
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight">{report.targetName}</h3>
                                    <p className="text-sm text-gray-500">
                                        Reported by <span className="font-bold text-black">{report.reporter}</span> • {report.date}
                                    </p>
                                    <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm italic font-medium">
                                        <AlertTriangle size={16} />
                                        &quot;{report.reason}&quot;
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 lg:self-end">
                                <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-black hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                    <Eye size={16} />
                                    Review
                                </button>
                                {report.status !== 'RESOLVED' && (
                                    <>
                                        <button
                                            onClick={() => handleAction(report.id, 'RESOLVED')}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                        >
                                            <CheckCircle size={16} />
                                            Resolve
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                            {report.targetType === 'PROPERTY' ? <Trash2 size={16} /> : <UserX size={16} />}
                                            Suspend {report.targetType.toLowerCase()}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredReports.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                        <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-black text-gray-400">All reports resolved!</h3>
                        <p className="text-gray-400 text-sm">Nicely done, platform is currently clean.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
