"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, MapPin, Building, Cpu, Stethoscope, Sprout } from "lucide-react";
import { useCampusStore, CAMPUSES, CampusId } from "@/app/stores/useCampusStore";

const CAMPUS_ICONS: Record<string, any> = { // eslint-disable-line @typescript-eslint/no-explicit-any
    ago: Building,
    ibogun: Cpu,
    sagamu: Stethoscope,
    ayetoro: Sprout,
};

export default function MyCampusModal() {
    const { 
        selectedCampus, 
        isModalOpen, 
        setCampus, 
        closeCampusModal, 
        initFromStorage 
    } = useCampusStore();

    const [isMounted, setIsMounted] = useState(false);
    const [temporarySelected, setTemporarySelected] = useState<CampusId | null>(null);

    useEffect(() => {
        setIsMounted(true);
        initFromStorage();
    }, [initFromStorage]);

    useEffect(() => {
        if (selectedCampus) {
            setTemporarySelected(selectedCampus);
        }
    }, [selectedCampus]);

    if (!isMounted || !isModalOpen) return null;

    const handleConfirm = () => {
        if (temporarySelected) {
            setCampus(temporarySelected);
        } else {
            closeCampusModal();
        }
    };

    const handleSelectDirect = (campusId: CampusId) => {
        setTemporarySelected(campusId);
        setCampus(campusId);
    };

    const handleSelectAll = () => {
        setCampus("all");
    };

    return (
        <AnimatePresence>
            {isModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-[3px]"
                        onClick={closeCampusModal}
                    />

                    {/* Modal Window - Compact & Scrollable */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative bg-white rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100 z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header - Fixed */}
                        <div className="px-5 pt-5 pb-3 sm:px-6 sm:pt-5 sm:pb-3 border-b border-gray-100 shrink-0">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Campus Locator
                                </span>
                                <button
                                    onClick={closeCampusModal}
                                    className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight mt-1">
                                Where are you studying?
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Select your campus to view verified student houses nearby.
                            </p>
                        </div>

                        {/* Campus List - Smoothly Scrollable */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-3 space-y-2 overscroll-contain">
                            {CAMPUSES.map((campus) => {
                                const Icon = CAMPUS_ICONS[campus.id] || Building;
                                const isSelected = (temporarySelected || selectedCampus) === campus.id;

                                return (
                                    <div
                                        key={campus.id}
                                        onClick={() => handleSelectDirect(campus.id)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                handleSelectDirect(campus.id);
                                            }
                                        }}
                                        className={`w-full text-left p-3 sm:p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer select-none ${
                                            isSelected
                                                ? "border-gray-900 bg-gray-50 shadow-sm"
                                                : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50"
                                        }`}
                                    >
                                        {/* Minimal Monochrome Icon */}
                                        <div
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                                isSelected
                                                    ? "bg-gray-900 text-white"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            <Icon size={17} strokeWidth={2} />
                                        </div>

                                        {/* Text Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-bold text-gray-900 text-sm">
                                                    {campus.name}
                                                </h3>
                                                {/* Clean Radio Indicator */}
                                                <div
                                                    className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                                                        isSelected
                                                            ? "border-gray-900 bg-gray-900 text-white"
                                                            : "border-gray-300 bg-white"
                                                    }`}
                                                >
                                                    {isSelected && <Check size={10} strokeWidth={3} />}
                                                </div>
                                            </div>

                                            <p className="text-[11px] font-medium text-gray-500 line-clamp-1 mt-0.5">
                                                {campus.fullName}
                                            </p>

                                            <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                                                <MapPin size={11} className="shrink-0 text-gray-400" />
                                                <span className="truncate">{campus.landmarks}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer - Fixed at Bottom */}
                        <div className="px-5 py-3 sm:px-6 sm:py-3 bg-gray-50/90 border-t border-gray-100 flex items-center justify-between shrink-0">
                            <button
                                onClick={handleSelectAll}
                                className="text-xs font-semibold text-gray-600 hover:text-gray-900 underline underline-offset-4 transition-colors"
                            >
                                Browse all campuses
                            </button>

                            <button
                                onClick={handleConfirm}
                                className="px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors shadow-sm"
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
