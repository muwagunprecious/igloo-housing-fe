"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/app/lib/axios";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { io, Socket } from "socket.io-client";
import { Send, Search, Loader2, MessageSquare } from "lucide-react";
import Image from "next/image";

type Message = {
    id?: string;
    senderId: string;
    receiverId: string;
    message: string;
    createdAt: string;
    isRead?: boolean;
};

type Conversation = {
    partner: {
        id: string;
        fullName: string;
        avatar?: string;
    };
    lastMessage: string;
    timestamp: string;
    read: boolean;
};

export default function AgentMessagesPage() {
    const { user } = useAuthStore();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize Socket
    useEffect(() => {
        if (!user) return;

        // Assuming backend runs on port 5000
        socketRef.current = io("http://localhost:5000");

        socketRef.current.emit("user:join", user.id);

        socketRef.current.on("message:receive", (message: Message) => {
            // Update messages if chat is open
            if (activeConversation && (message.senderId === activeConversation.partner.id || message.receiverId === activeConversation.partner.id)) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }

            // Refresh conversations list to show new last message/unread status
            fetchConversations();
        });

        socketRef.current.on("message:sent", (message: Message) => {
            if (activeConversation && (message.receiverId === activeConversation.partner.id || message.senderId === activeConversation.partner.id)) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }
            fetchConversations();
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [user, activeConversation]);

    // Fetch Conversations
    const fetchConversations = async () => {
        try {
            const response = await api.get('/agents/messages'); // Correct route for agent conversations
            setConversations(response.data);
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    // Fetch Messages for active conversation
    useEffect(() => {
        if (activeConversation) {
            const fetchMessages = async () => {
                try {
                    const response = await api.get(`/chat/${activeConversation.partner.id}`);
                    setMessages(response.data);
                    scrollToBottom();
                } catch (error) {
                    console.error("Failed to fetch messages", error);
                }
            };
            fetchMessages();
        }
    }, [activeConversation]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || !socketRef.current) return;

        setIsSending(true);
        try {
            const messageData = {
                receiverId: activeConversation.partner.id,
                message: newMessage.trim()
            };

            socketRef.current.emit("message:send", messageData);
            setNewMessage("");
            // Optimistically update handled by socket event "message:sent"
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading messages...</div>;

    return (
        <div className="h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex">
            {/* Sidebar List */}
            <div className="w-1/3 border-r border-gray-100 flex flex-col">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">No messages yet.</div>
                    ) : (
                        conversations.map((conv, idx) => (
                            <div
                                key={idx}
                                onClick={() => setActiveConversation(conv)}
                                className={`p-4 flex items-start gap-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 ${activeConversation?.partner.id === conv.partner.id ? 'bg-green-50 border-green-100' : ''}`}
                            >
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 flex-shrink-0 relative overflow-hidden">
                                    {conv.partner.avatar && (
                                        <Image src={conv.partner.avatar} alt={conv.partner.fullName} fill className="object-cover" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="text-sm font-semibold text-gray-900 truncate">{conv.partner.fullName}</h3>
                                        <span className="text-xs text-gray-400">{new Date(conv.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className={`text-sm truncate ${conv.read ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                                        {conv.lastMessage}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50/50">
                {activeConversation ? (
                    <>
                        <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                                {activeConversation.partner.fullName[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{activeConversation.partner.fullName}</h3>
                                <p className="text-xs text-green-600">Student</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, index) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-green-600 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none shadow-sm'}`}>
                                            {msg.message}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                                type="submit"
                                disabled={isSending || !newMessage.trim()}
                                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={32} className="opacity-50" />
                        </div>
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
