"use client";

import { useState } from "react";
import {
    Settings,
    User,
    Bell,
    ShieldCheck,
    Database,
    Info,
    Smartphone,
    Languages
} from "lucide-react";
import Button from "@/app/components/common/Button";

export default function AdminSettingsPage() {
    const [toggles, setToggles] = useState({
        agentVerification: true,
        enableBookings: true,
        enablePayments: false,
        maintenanceMode: false,
    });

    const handleToggle = (key: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight">System Settings</h1>
                    <p className="text-gray-500 font-medium">Configure platform defaults and manage administrative preferences.</p>
                </div>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                    <Settings size={32} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Sidebar Menu */}
                <div className="space-y-2">
                    {[
                        { label: "General", icon: Settings, active: true },
                        { label: "Administrative", icon: ShieldCheck },
                        { label: "Notification Desk", icon: Bell },
                        { label: "Data & Storage", icon: Database },
                    ].map((item) => (
                        <button
                            key={item.label}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${item.active ? 'bg-black text-white shadow-xl shadow-black/20' : 'text-gray-400 hover:bg-gray-50 hover:text-black'
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="md:col-span-2 space-y-10">
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                            <Info size={14} />
                            Platform Toggles
                        </div>
                        <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm divide-y divide-gray-50">
                            {[
                                { id: 'agentVerification', label: 'Force Agent Verification', desc: 'Require manual document review for all new agents.' },
                                { id: 'enableBookings', label: 'Enable System Bookings', desc: 'Globally toggle accommodation reservation features.' },
                                { id: 'enablePayments', label: 'Process Financial Transactions', desc: 'Enable live payment gateways (currently demo mode).' },
                                { id: 'maintenanceMode', label: 'Static Maintenance Mode', desc: 'Suspend user access for deployment updates.' },
                            ].map((item) => (
                                <div key={item.id} className="p-8 flex items-center justify-between group">
                                    <div className="space-y-1">
                                        <h4 className="font-extrabold text-black tracking-tight">{item.label}</h4>
                                        <p className="text-gray-400 text-xs font-medium">{item.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => handleToggle(item.id as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
                                        className={`w-14 h-8 rounded-full transition-all relative ${toggles[item.id as keyof typeof toggles] ? 'bg-primary' : 'bg-gray-200'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${toggles[item.id as keyof typeof toggles] ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                            <User size={14} />
                            Identity & Presence
                        </div>
                        <div className="bg-white border border-gray-100 rounded-[32px] p-8 space-y-8 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">App Name</label>
                                    <input type="text" defaultValue="Igloo Estate Admin" className="w-full bg-gray-50 border-none px-6 py-4 rounded-2xl font-bold text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Support Email</label>
                                    <input type="email" defaultValue="admin@igloo.com" className="w-full bg-gray-50 border-none px-6 py-4 rounded-2xl font-bold text-sm" />
                                </div>
                            </div>
                            <Button className="w-full md:w-auto px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest">
                                Persist Changes
                            </Button>
                        </div>
                    </section>

                    <section className="bg-black rounded-[32px] p-10 text-white relative overflow-hidden group">
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-2xl font-black tracking-tighter">Diagnostic Utility</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/btn">
                                    <Smartphone className="text-gray-500 group-hover/btn:text-primary transition-colors" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Flush Cache</span>
                                </button>
                                <button className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/btn">
                                    <Languages className="text-gray-500 group-hover/btn:text-primary transition-colors" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sync Schema</span>
                                </button>
                            </div>
                            <div className="pt-6 border-t border-white/10 text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">
                                Version 1.2.0-stabilize
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[80px]" />
                    </section>
                </div>
            </div>
        </div>
    );
}
