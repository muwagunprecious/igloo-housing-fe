"use client";

import { agentMessages } from "../data/agentData";
import AgentSidebar from "../components/AgentSidebar";
import { MessageSquare, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AgentMessagesPage() {
    const unreadCount = agentMessages.filter((m) => m.unread > 0).length;

    return (
        <div className="max-w-[1920px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-[100px] pb-20">
            <div className="flex gap-8">
                <AgentSidebar />

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Messages</h1>
                        <p className="text-gray-500">
                            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                        </p>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                        {agentMessages.map((message, idx) => (
                            <Link key={message.id} href="/agents/messages">
                                <div className={`p-6 hover:bg-gray-50 transition ${idx !== agentMessages.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-14 h-14 flex-shrink-0">
                                            <Image
                                                src={message.studentAvatar}
                                                alt={message.studentName}
                                                fill
                                                className="rounded-full object-cover"
                                            />
                                            {message.unread > 0 && (
                                                <div className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                                    {message.unread}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold">{message.studentName}</h3>
                                                <span className="text-xs text-gray-400">{message.timestamp}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-1 truncate">{message.propertyTitle}</p>
                                            <p className={`text-sm truncate ${message.unread > 0 ? 'font-semibold text-black' : 'text-gray-600'}`}>
                                                {message.lastMessage}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {agentMessages.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl">
                            <MessageSquare className="mx-auto mb-4 text-gray-400" size={64} />
                            <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
                            <p className="text-gray-500">Your student messages will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
