"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/axios";
import {
    MessageSquare,
    Search,
    User,
    Clock,
    ShieldAlert,
    ArrowRightLeft,
    Eye
} from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/app/lib/imageUrl";

interface PlatformMessage {
    id: string;
    message: string;
    createdAt: string;
    sender: {
        id: string;
        fullName: string;
        avatar?: string;
    };
    receiver: {
        id: string;
        fullName: string;
        avatar?: string;
    };
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<PlatformMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await api.get('/admin/messages');
                setMessages(response.data.data);
            } catch (error) {
                console.error("Error fetching platform messages:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMessages();
    }, []);

    const filteredMessages = messages.filter(m =>
        m.message.toLowerCase().includes(search.toLowerCase()) ||
        m.sender.fullName.toLowerCase().includes(search.toLowerCase()) ||
        m.receiver.fullName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black mb-1 leading-tight tracking-tight text-black">Audit Logs</h1>
                    <p className="text-gray-500 font-medium">Platform-wide conversation monitoring for safety compliance.</p>
                </div>
                <div className="px-5 py-2.5 bg-black text-primary rounded-2xl flex items-center gap-2 border border-black shadow-lg shadow-black/10">
                    <ShieldAlert size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Real-time monitoring active</span>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
                <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search keywords, participants, or conversation IDs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black/5 focus:ring-[12px] focus:ring-black/5 rounded-[22px] py-5 pl-16 pr-6 transition-all duration-500 font-extrabold text-sm placeholder:text-gray-300"
                />
            </div>

            {/* Messages Feed */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="p-32 text-center">
                        <div className="animate-spin rounded-[14px] h-10 w-10 border-4 border-black/5 border-t-black mx-auto mb-6"></div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-300">Synchronizing Communication History...</p>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="p-32 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="text-gray-200" size={40} />
                        </div>
                        <h3 className="text-xl font-black mb-2 tracking-tight">Zero Activity Found</h3>
                        <p className="text-gray-400 font-bold text-sm max-w-xs mx-auto">Our monitoring system has found no communication logs matching your criteria.</p>
                    </div>
                ) : filteredMessages.map((msg) => (
                    <div key={msg.id} className="bg-white border border-gray-100 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-500 group">
                        <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                            {/* Identities */}
                            <div className="flex items-center gap-5 min-w-[340px] flex-shrink-0">
                                <div className="flex -space-x-4 items-center">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-100 border-4 border-white overflow-hidden relative shadow-sm group-hover:scale-110 transition-transform duration-500">
                                        {msg.sender.avatar ? (
                                            <Image src={getImageUrl(msg.sender.avatar)} alt={msg.sender.fullName} fill className="object-cover" />
                                        ) : (
                                            <div className="p-4 text-gray-300"><User size={24} /></div>
                                        )}
                                    </div>
                                    <div className="w-10 h-10 rounded-2xl bg-black border-4 border-white overflow-hidden relative shadow-lg flex items-center justify-center z-10 rotate-12">
                                        <ArrowRightLeft size={16} className="text-primary" />
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border-4 border-white overflow-hidden relative shadow-sm group-hover:scale-110 transition-transform duration-500 delay-75">
                                        {msg.receiver.avatar ? (
                                            <Image src={getImageUrl(msg.receiver.avatar)} alt={msg.receiver.fullName} fill className="object-cover" />
                                        ) : (
                                            <div className="p-4 text-gray-300"><User size={24} /></div>
                                        )}
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-col mb-1.5">
                                        <span className="font-black text-base truncate tracking-tight">{msg.sender.fullName}</span>
                                        <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest mt-0.5">Recipient: {msg.receiver.fullName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Clock size={12} className="text-primary" />
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest">{new Date(msg.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Message Content */}
                            <div className="flex-1 overflow-hidden">
                                <p className="text-gray-600 font-bold leading-relaxed bg-gray-50/50 p-6 rounded-3xl border border-gray-50 group-hover:bg-white group-hover:border-black/5 group-hover:text-black transition-all text-sm italic">
                                    &quot;{msg.message}&quot;
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                <button className="p-5 bg-black text-white rounded-2xl hover:bg-primary transition shadow-xl shadow-black/20 hover:scale-105">
                                    <Eye size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
