"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Send, MoreVertical } from "lucide-react";
import AuthGuard from "@/app/components/auth/AuthGuard";
import { useChatStore } from "@/app/stores/useChatStore";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { useSearchParams } from "next/navigation";
import { getImageUrl } from "@/app/lib/imageUrl";
import api from "@/app/lib/axios";

function ChatContent() {
    const searchParams = useSearchParams();
    const queryUserId = searchParams.get("userId");

    const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
    const [newChatUser, setNewChatUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const { messages, conversations, sendMessage, fetchHistory, fetchConversations, connect, disconnect } = useChatStore();
    const { user } = useAuthStore();
    const [inputText, setInputText] = useState("");
    const [isLoadingUser, setIsLoadingUser] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initialize socket connection and fetch conversations
    useEffect(() => {
        connect();
        fetchConversations();
        return () => disconnect();
    }, [connect, disconnect, fetchConversations]);

    // Handle URL query for direct chat
    useEffect(() => {
        const handleQueryUser = async () => {
            if (queryUserId) {
                setSelectedChatUserId(queryUserId);

                // If this user isn't in our conversations list yet, we need to fetch their info
                const existingConv = conversations.find(c => c.id === queryUserId);
                if (!existingConv) {
                    setIsLoadingUser(true);
                    try {
                        const response = await api.get(`/user/${queryUserId}`);
                        if (response.data.success) {
                            setNewChatUser(response.data.data);
                        }
                    } catch (error) {
                        console.error("Failed to fetch user for new chat", error);
                    } finally {
                        setIsLoadingUser(false);
                    }
                } else {
                    setNewChatUser(null);
                }
            }
        };
        handleQueryUser();
    }, [queryUserId, conversations]);

    // Fetch history when chat selected
    useEffect(() => {
        if (selectedChatUserId) {
            fetchHistory(selectedChatUserId);
        }
    }, [selectedChatUserId, fetchHistory]);

    const handleSend = async () => {
        if (!selectedChatUserId || !inputText.trim()) return;
        await sendMessage(selectedChatUserId, inputText);
        setInputText("");
        fetchConversations();
    };

    // Auto bottom scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const currentChatUser = conversations.find(c => c.id === selectedChatUserId);

    return (
        <AuthGuard>
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 h-[calc(100vh-112px)] pt-28 pb-8">
                <div className="flex h-full border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                    {/* Sidebar - Conversation List */}
                    <div className={`w-full md:w-[350px] lg:w-[400px] border-r border-gray-200 flex flex-col ${selectedChatUserId ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="font-bold text-xl">Messages</h2>
                            <div className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
                                <MoreVertical size={20} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {conversations.length === 0 && !newChatUser ? (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    No conversations yet.
                                </div>
                            ) : (
                                <>
                                    {/* Show the draft/new chat user at the top if they aren't in conversations yet */}
                                    {newChatUser && !conversations.find(c => c.id === newChatUser.id) && (
                                        <div
                                            onClick={() => setSelectedChatUserId(newChatUser.id)}
                                            className={`p-4 flex gap-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 ${selectedChatUserId === newChatUser.id ? 'bg-gray-50 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                                        >
                                            <div className="relative w-12 h-12 flex-shrink-0">
                                                {newChatUser.avatar ? (
                                                    <Image src={getImageUrl(newChatUser.avatar)} alt={newChatUser.fullName} width={48} height={48} className="rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                                        {newChatUser.fullName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold truncate">{newChatUser.fullName}</h3>
                                                <p className="text-sm text-primary font-medium truncate">New conversation</p>
                                            </div>
                                        </div>
                                    )}
                                    {conversations.map((conv) => (
                                        <div
                                            key={conv.id}
                                            onClick={() => setSelectedChatUserId(conv.id)}
                                            className={`p-4 flex gap-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 ${selectedChatUserId === conv.id ? 'bg-gray-50 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                                        >
                                            <div className="relative w-12 h-12 flex-shrink-0">
                                                {conv.avatar ? (
                                                    <Image src={getImageUrl(conv.avatar)} alt={conv.fullName} width={48} height={48} className="rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                                        {conv.fullName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold truncate">{conv.fullName}</h3>
                                                <p className="text-sm text-gray-500 truncate">{conv.lastMessage || 'Click to chat'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`flex-1 flex flex-col ${!selectedChatUserId ? 'hidden md:flex' : 'flex'}`}>
                        {selectedChatUserId ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedChatUserId(null)}
                                            className="md:hidden p-2 hover:bg-gray-100 rounded-full -ml-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                        </button>

                                        <div>
                                            <h3 className="font-semibold">
                                                {isLoadingUser
                                                    ? "Loading..."
                                                    : (currentChatUser?.fullName || newChatUser?.fullName || "Chat")}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div
                                    ref={scrollRef}
                                    className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4"
                                >
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id || Math.random().toString()}
                                            className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm text-sm ${msg.senderId === user?.id
                                                    ? 'bg-primary text-white rounded-tr-none'
                                                    : 'bg-white text-gray-900 rounded-tl-none'
                                                    }`}
                                            >
                                                <p>{msg.message}</p>
                                                <span className={`text-[10px] block mt-1 text-right ${msg.senderId === user?.id ? 'text-white/80' : 'text-gray-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-white border-t border-gray-200">
                                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                                        <input
                                            type="text"
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                            placeholder="Type a message..."
                                            className="flex-1 bg-transparent outline-none text-sm py-2"
                                        />
                                        <button
                                            onClick={handleSend}
                                            className="p-2 bg-primary text-white rounded-full hover:bg-primary-hover transition shadow-sm"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                <p className="text-lg font-medium">Select a conversation</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}

import { Suspense } from "react";

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}
