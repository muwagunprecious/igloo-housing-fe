"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, GraduationCap, Building2, ArrowRight, ShieldCheck, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccountTypeModal } from "@/app/stores/useAccountTypeModal";
import Link from "next/link";

export default function AccountTypeModal() {
    const { isOpen, closeModal } = useAccountTypeModal();
    const router = useRouter();

    if (!isOpen) return null;

    const handleSelectRole = (role: "student" | "agent") => {
        closeModal();
        if (typeof window !== "undefined") {
            sessionStorage.setItem("igloo_pending_role", role);
        }
        router.push(`/sign-up?role=${role}`);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={closeModal}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 z-10 p-6 sm:p-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                                Account Type
                            </span>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight mt-2.5">
                                How will you use Igloo?
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Choose how you want to join to tailor your experience.
                            </p>
                        </div>
                        <button
                            onClick={closeModal}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Role Options */}
                    <div className="space-y-4">
                        {/* Normal User Option */}
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectRole("student")}
                            className="group p-5 rounded-2xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-left flex items-start gap-4"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <GraduationCap size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900 text-base group-hover:text-primary transition-colors">
                                        Normal User / Student
                                    </h3>
                                    <ArrowRight size={18} className="text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    Looking for verified student apartments, rooms, or finding roommates near your campus.
                                </p>
                                <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-500 font-medium">
                                    <span className="flex items-center gap-1">
                                        <Search size={12} className="text-primary" /> Browse houses
                                    </span>
                                    <span>•</span>
                                    <span>Find roommates</span>
                                    <span>•</span>
                                    <span>Contact agents</span>
                                </div>
                            </div>
                        </div>

                        {/* Agent Option */}
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectRole("agent")}
                            className="group p-5 rounded-2xl border-2 border-gray-200 hover:border-green-600 hover:bg-green-50/50 transition-all cursor-pointer text-left flex items-start gap-4"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Building2 size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-900 text-base group-hover:text-green-700 transition-colors">
                                            Verified Agent / Host
                                        </h3>
                                        <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                            Host
                                        </span>
                                    </div>
                                    <ArrowRight size={18} className="text-gray-400 group-hover:text-green-700 group-hover:translate-x-1 transition-all" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    Property owner or real estate agent listing student housing and connecting with tenants.
                                </p>
                                <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-500 font-medium">
                                    <span className="flex items-center gap-1">
                                        <ShieldCheck size={12} className="text-green-600" /> NIN Verified
                                    </span>
                                    <span>•</span>
                                    <span>Upload listings</span>
                                    <span>•</span>
                                    <span>Manage inquiries</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-500">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                onClick={closeModal}
                                className="text-primary font-bold hover:underline"
                            >
                                Log in
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
