import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import api from "@/app/lib/axios";
import { useAuthStore } from "./useAuthStore";
import { config } from "@/app/lib/config";

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    message: string;
    createdAt: string;
    sender: { // Optional if populated
        id: string;
        fullName: string;
        avatar?: string;
    };
}

interface Conversation {
    id: string; // UserId of the other person
    fullName: string;
    avatar?: string;
    lastMessage?: string;
    unreadCount?: number;
}

interface ChatStore {
    socket: Socket | null;
    messages: Message[];
    conversations: Conversation[];
    isLoading: boolean;
    connect: () => void;
    disconnect: () => void;
    joinRoom: (userId: string) => void;
    sendMessage: (receiverId: string, message: string) => Promise<void>;
    fetchHistory: (userId: string) => Promise<void>;
    fetchConversations: () => Promise<void>;
    addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    socket: null,
    messages: [],
    conversations: [],
    isLoading: false,

    connect: () => {
        const socket = io(config.socketUrl);

        socket.on("connect", () => {
            console.log("Connected to socket server");
            const user = useAuthStore.getState().user;
            if (user) {
                socket.emit("user:join", user.id);
            }
        });

        socket.on("message:receive", (message: Message) => {
            get().addMessage(message);
        });

        socket.on("message:read", (data: { userId: string }) => {
            // Handle read receipt if needed
            console.log("Messages read by", data.userId);
        });

        socket.on("notification:receive", (notification: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.log("🔔 Real-time notification:", notification);
            // This could trigger a toast or update a notification badge
        });

        set({ socket });
    },

    disconnect: () => {
        const socket = get().socket;
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    },

    joinRoom: (userId: string) => {
        const socket = get().socket;
        if (socket) {
            socket.emit("user:join", userId);
        }
    },

    sendMessage: async (receiverId: string, message: string) => {
        try {
            const response = await api.post('/chat/send', { receiverId, message });
            const newMessage = response.data.data;

            const socket = get().socket;
            if (socket) {
                // Emit the full message object including sender info and timestamp
                socket.emit("message:send", {
                    ...newMessage,
                    receiverId
                });
            }

            get().addMessage(newMessage);
        } catch (error) {
            console.error("Failed to send message", error);
        }
    },

    fetchHistory: async (userId: string) => {
        set({ isLoading: true });
        try {
            const response = await api.get(`/chat/conversation/${userId}`);
            set({ messages: response.data.data, isLoading: false });
        } catch (error) {
            console.error("Failed to fetch history", error);
            set({ isLoading: false });
        }
    },

    fetchConversations: async () => {
        try {
            const response = await api.get('/chat/conversations');
            const conversationsData = response.data.data;
            // Backend returns {user, lastMessage, unreadCount} - reshape for frontend
            const formattedConversations = conversationsData.map((conv: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                id: conv.user.id,
                fullName: conv.user.fullName,
                avatar: conv.user.avatar,
                lastMessage: conv.lastMessage?.message || '',
                unreadCount: conv.unreadCount
            }));
            set({ conversations: formattedConversations });
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        }
    },

    addMessage: (message: Message) => {
        set((state) => {
            // Avoid duplicates
            if (state.messages.find(m => m.id === message.id)) return state;
            return { messages: [...state.messages, message] };
        });
    }
}));
