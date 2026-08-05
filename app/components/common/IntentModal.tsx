"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Home, KeyRound, Building2, X } from "lucide-react";
import { useRouter } from "next/navigation";

const INTENT_KEY = "igloo-intent-selected";

export default function IntentModal() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsOpen(true);
    }, []);

    const handleSelect = (intent: string, path: string) => {
        localStorage.setItem(INTENT_KEY, intent);
        setIsOpen(false);
        router.push(path);
    };

    const handleClose = () => {
        localStorage.setItem(INTENT_KEY, "browse");
        setIsOpen(false);
    };

    if (!isOpen) return null;

    const options = [
        {
            icon: GraduationCap,
            title: "I'm a Post-UTME Student",
            description: "I'm coming to OOU for Post-UTME and I'm looking for a temporary apartment.",
            intent: "post-utme-student",
            path: "/post-utme",
            color: "bg-[#008489]",
        },
        {
            icon: Home,
            title: "I'm a Student Looking for an Apartment",
            description: "I'm an OOU student looking for a regular apartment.",
            intent: "student",
            path: "/",
            color: "bg-[#FF385C]",
        },
        {
            icon: KeyRound,
            title: "I'm a Student Renting Out My Apartment",
            description: "I have an apartment and I want to list it for Post-UTME students.",
            intent: "renter",
            path: "/post-utme/signup",
            color: "bg-gray-900",
        },
        {
            icon: Building2,
            title: "I'm a Housing Agent",
            description: "I want to access the regular housing agent portal.",
            intent: "agent",
            path: "/agents/dashboard",
            color: "bg-[#008489]",
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 pb-2">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">What are you looking for?</h2>
                                <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-gray-500 text-sm mb-6">Choose an option to get started on Igloo</p>
                        </div>

                        <div className="px-8 pb-8 space-y-3">
                            {options.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <button
                                        key={option.intent}
                                        onClick={() => handleSelect(option.intent, option.path)}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 hover:border-gray-900 hover:shadow-md transition-all text-left group"
                                    >
                                        <div className={`w-12 h-12 ${option.color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition`}>
                                            <Icon size={22} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm">{option.title}</h3>
                                            <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{option.description}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="px-8 pb-6 text-center">
                            <button onClick={handleClose} className="text-sm text-gray-400 hover:text-gray-600 transition">
                                Skip for now, continue browsing
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
