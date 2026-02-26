"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2, Clock, Loader2, MessageSquare, Info, AlertTriangle } from "lucide-react";
import api from "@/app/lib/axios";

export default function NotificationsSection() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get("/notifications");
            if (response.data.success) {
                setNotifications(response.data.data.notifications);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        if (notifications.filter(n => !n.isRead).length === 0) return;

        setIsActionLoading(true);
        try {
            await api.put("/notifications/read-all");
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "MESSAGE": return <MessageSquare size={18} className="text-blue-500" />;
            case "ADMIN": return <AlertTriangle size={18} className="text-orange-500" />;
            default: return <Info size={18} className="text-primary" />;
        }
    };

    const formatTime = (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-2xl">
                <Loader2 className="animate-spin text-primary mb-4" size={32} />
                <p className="text-gray-500">Loading your notifications...</p>
            </div>
        );
    }

    return (
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bell className="text-primary" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Notifications</h2>
                        <p className="text-sm text-gray-500">Stay updated with your house search and messages</p>
                    </div>
                </div>

                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={markAllAsRead}
                        disabled={isActionLoading}
                        className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition disabled:opacity-50"
                    >
                        {isActionLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCheck size={18} />}
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="divide-y divide-gray-100">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                            <Bell size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">All caught up!</h3>
                        <p className="text-gray-500">You don&apos;t have any notifications right now.</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-5 flex gap-4 transition group ${notification.isRead ? 'bg-white opacity-80' : 'bg-primary/[0.02]'}`}
                        >
                            <div className="mt-1 flex-shrink-0">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${notification.isRead ? 'bg-gray-100' : 'bg-white shadow-sm border border-gray-100'}`}>
                                    {getIcon(notification.type)}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className={`text-sm font-bold truncate ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                                        {notification.title}
                                    </h4>
                                    <span className="text-[10px] text-gray-400 flex items-center gap-1 whitespace-nowrap">
                                        <Clock size={10} />
                                        {formatTime(notification.createdAt)}
                                    </span>
                                </div>
                                <p className={`text-sm leading-relaxed mb-3 ${notification.isRead ? 'text-gray-500' : 'text-gray-600'}`}>
                                    {notification.message}
                                </p>

                                <div className="flex items-center gap-4">
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="text-xs font-bold text-primary hover:underline"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition"
                                    >
                                        <Trash2 size={12} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
