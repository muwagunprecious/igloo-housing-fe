"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/useAuthStore";
import AdminSidebar from "./components/AdminSidebar";
import AdminNavbar from "./components/AdminNavbar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();
    
    // Add state to control the mobile sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push("/login?callbackUrl=/admin/dashboard");
            } else if (user?.role !== "admin") {
                router.push("/dashboard"); 
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading || !user || user.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Accessing Admin Control Center...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Pass a function to the navbar so the hamburger button can open the sidebar */}
            <AdminNavbar onMenuClick={() => setIsSidebarOpen(true)} />
            
            <div className="pt-[100px] pb-20 max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
                <div className="flex gap-8">
                    {/* Pass the state to the sidebar so it knows when to slide in */}
                    <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                    
                    <main className="flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}