"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { usePropertyStore, Property } from "@/app/stores/usePropertyStore";
import { getImageUrl } from "@/app/lib/imageUrl";
import Link from "next/link";
import Image from "next/image";
import {
    Wallet,
    X,
    Home,
    Bed,
    MapPin,
    ArrowRight,
    ChevronRight,
    Search,
    Check,
    ArrowDownRight,
    Sparkles,
    RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_BUDGETS = [
    { label: "₦150k", value: 150000 },
    { label: "₦200k", value: 200000 },
    { label: "₦250k", value: 250000 },
    { label: "₦350k", value: 350000 },
    { label: "₦500k", value: 500000 },
];

const PROPERTY_TYPES = [
    "Any type",
    "Self-contained",
    "Room and Parlour",
    "Mini Flat",
    "1 Bedroom",
    "2 Bedrooms",
    "3+ Bedrooms",
    "Hostel",
    "Shared Apartment",
    "Luxury",
];

const BEDROOM_OPTIONS = [
    { label: "Any", value: "any" },
    { label: "1 Bedroom", value: "1" },
    { label: "2 Bedrooms", value: "2" },
    { label: "3+ Bedrooms", value: "3+" },
];

interface BudgetFinderSectionProps {
    onApplyBudget?: (maxBudget: number | null, category?: string | null, bedrooms?: string | null) => void;
    activeMaxBudget?: number | null;
}

export default function BudgetFinderSection({ onApplyBudget, activeMaxBudget }: BudgetFinderSectionProps) {
    const { properties, fetchProperties } = usePropertyStore();

    const [isOpen, setIsOpen] = useState(false);

    // Filter controls state
    const [budgetInput, setBudgetInput] = useState<string>("250000");
    const [selectedType, setSelectedType] = useState<string>("Any type");
    const [selectedBedrooms, setSelectedBedrooms] = useState<string>("any");

    // Applied filter state
    const [appliedBudget, setAppliedBudget] = useState<number>(250000);
    const [appliedType, setAppliedType] = useState<string>("Any type");
    const [appliedBedrooms, setAppliedBedrooms] = useState<string>("any");

    // Feedback state
    const [justApplied, setJustApplied] = useState(false);

    // Results navigation: "all" | "within" | "near"
    const [activeTab, setActiveTab] = useState<"all" | "within" | "near">("all");

    // Ensure properties are fetched if not yet loaded
    useEffect(() => {
        if (!properties || properties.length === 0) {
            fetchProperties();
        }
    }, [properties, fetchProperties]);

    // Sync external active budget if passed
    useEffect(() => {
        if (activeMaxBudget && activeMaxBudget > 0) {
            setBudgetInput(activeMaxBudget.toString());
            setAppliedBudget(activeMaxBudget);
        }
    }, [activeMaxBudget]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Helper to sanitize numeric input
    const parseBudget = useCallback((val: string | number): number => {
        if (typeof val === "number") return isNaN(val) ? 0 : val;
        const cleaned = val.replace(/[^0-9]/g, "");
        return cleaned ? parseInt(cleaned, 10) : 0;
    }, []);

    // Apply filters handler
    const handleApplyFilters = () => {
        const num = parseBudget(budgetInput) || 250000;
        setAppliedBudget(num);
        setAppliedType(selectedType);
        setAppliedBedrooms(selectedBedrooms);

        // Notify parent page if callback provided
        if (onApplyBudget) {
            onApplyBudget(num, selectedType !== "Any type" ? selectedType : null, selectedBedrooms !== "any" ? selectedBedrooms : null);
        }

        // Show brief confirmation badge
        setJustApplied(true);
        setTimeout(() => setJustApplied(false), 2200);
    };

    // Apply & view on homepage
    const handleApplyAndViewOnHomepage = () => {
        const num = parseBudget(budgetInput) || 250000;
        setAppliedBudget(num);
        setAppliedType(selectedType);
        setAppliedBedrooms(selectedBedrooms);

        if (onApplyBudget) {
            onApplyBudget(num, selectedType !== "Any type" ? selectedType : null, selectedBedrooms !== "any" ? selectedBedrooms : null);
        }

        setIsOpen(false);

        // Smooth scroll to properties grid on homepage
        setTimeout(() => {
            const section = document.getElementById("popular-homes");
            if (section) {
                section.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }, 150);
    };

    // Fast quick budget select: updates input and instantly applies
    const handleQuickBudgetSelect = (val: number) => {
        setBudgetInput(val.toString());
        setAppliedBudget(val);

        if (onApplyBudget) {
            onApplyBudget(val, appliedType !== "Any type" ? appliedType : null, appliedBedrooms !== "any" ? appliedBedrooms : null);
        }

        setJustApplied(true);
        setTimeout(() => setJustApplied(false), 1500);
    };

    // Filter properties based on applied budget, property type, and bedrooms
    const { withinBudget, nearBudget } = useMemo(() => {
        const currentProps = properties || [];
        if (!appliedBudget || appliedBudget <= 0) {
            return { withinBudget: currentProps, nearBudget: [] };
        }

        const filtered = currentProps.filter((p) => {
            // Property Type filter
            if (appliedType !== "Any type") {
                const pCategory = (p.category || "").toLowerCase();
                const pTitle = (p.title || "").toLowerCase();
                const pDesc = (p.description || "").toLowerCase();
                const target = appliedType.toLowerCase();

                const matchType =
                    pCategory.includes(target) ||
                    pTitle.includes(target) ||
                    pDesc.includes(target) ||
                    (target.includes("self") && (pCategory.includes("self") || pTitle.includes("self"))) ||
                    (target.includes("room and parlour") && (pCategory.includes("parlour") || pTitle.includes("parlor") || pTitle.includes("parlour") || pDesc.includes("parlor"))) ||
                    (target.includes("flat") && (pCategory.includes("flat") || pTitle.includes("flat")));

                if (!matchType) return false;
            }

            // Bedrooms filter
            if (appliedBedrooms !== "any") {
                const bedCount = typeof p.bedrooms === "number" ? p.bedrooms : 0;
                const roomCount = typeof p.rooms === "number" ? p.rooms : 1;

                if (appliedBedrooms === "3+") {
                    if (bedCount < 3 && roomCount < 3) return false;
                } else {
                    const target = Number(appliedBedrooms);
                    if (target === 1) {
                        // 1 bedroom also matches self-contained rooms
                        const isSingle = bedCount === 1 || bedCount === 0 || roomCount === 1;
                        if (!isSingle) return false;
                    } else if (bedCount !== target && roomCount !== target) {
                        return false;
                    }
                }
            }

            return true;
        });

        // Within Budget: price <= appliedBudget
        const within = filtered.filter((p) => (p.price || 0) <= appliedBudget);

        // Near Budget: appliedBudget < price <= appliedBudget * 1.30
        const near = filtered.filter(
            (p) => (p.price || 0) > appliedBudget && (p.price || 0) <= appliedBudget * 1.3
        );

        return {
            withinBudget: within,
            nearBudget: near,
        };
    }, [properties, appliedBudget, appliedType, appliedBedrooms]);

    // Active tab items
    const displayedProperties = useMemo(() => {
        if (activeTab === "within") return withinBudget;
        if (activeTab === "near") return nearBudget;

        // "all": within + near combined
        const setMap = new Map<string, Property>();
        withinBudget.forEach((p) => setMap.set(p.id, p));
        nearBudget.forEach((p) => setMap.set(p.id, p));
        return Array.from(setMap.values());
    }, [activeTab, withinBudget, nearBudget]);

    // Live preview count for currently selected form fields
    const liveMatchCount = useMemo(() => {
        const inputNum = parseBudget(budgetInput);
        if (!inputNum) return properties?.length || 0;

        return (properties || []).filter((p) => {
            if ((p.price || 0) > inputNum * 1.3) return false;

            if (selectedType !== "Any type") {
                const pCategory = (p.category || "").toLowerCase();
                const pTitle = (p.title || "").toLowerCase();
                const target = selectedType.toLowerCase();
                if (!pCategory.includes(target) && !pTitle.includes(target)) return false;
            }

            return true;
        }).length;
    }, [properties, budgetInput, selectedType, parseBudget]);

    return (
        <>
            {/* HOMEPAGE TRIGGER BUTTON */}
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-4 px-4 my-6">
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="w-full text-left group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-[#FF385C]/40 hover:shadow-md transition-all duration-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#FFF1F2] text-[#FF385C] flex items-center justify-center shrink-0">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF1F2] text-[#FF385C] text-[11px] font-bold uppercase tracking-wider mb-1">
                                Smart Budget Finder
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                <span>Find accommodation within your budget</span>
                                {appliedBudget > 0 && activeMaxBudget ? (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                                        Up to ₦{appliedBudget.toLocaleString()} active
                                    </span>
                                ) : null}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 max-w-2xl mt-0.5">
                                Tell us your housing budget and we&apos;ll show you verified properties within or close to your range.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center self-end sm:self-center shrink-0 gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white bg-[#FF385C] hover:bg-[#E0294B] px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-xs">
                            <span>Open Budget Finder</span>
                            <ChevronRight size={16} />
                        </span>
                    </div>
                </button>
            </div>

            {/* MODAL */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
                        {/* Dim Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Modal Dialog Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="relative w-full max-w-4xl bg-white border border-gray-100 rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer z-10"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>

                            {/* Scrollable Modal Content */}
                            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
                                {/* HEADER */}
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF1F2] text-[#FF385C] text-[10px] font-bold uppercase tracking-wider mb-2">
                                        <Wallet size={12} />
                                        <span>Smart Budget Finder</span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                                        Find accommodation within your budget
                                    </h2>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
                                        Tell us your housing budget. We&apos;ll show you verified properties within your range, close to your price, and in great locations.
                                    </p>
                                </div>

                                {/* BUDGET & FILTER CARD */}
                                <div className="p-5 rounded-2xl border border-gray-200 bg-white space-y-4">
                                    {/* Top Row: Budget Input & Quick Options */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                        {/* Your Budget */}
                                        <div className="md:col-span-5">
                                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                Your yearly / session budget
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-900 font-bold text-sm pointer-events-none">
                                                    ₦
                                                </span>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={budgetInput}
                                                    onChange={(e) => {
                                                        const clean = e.target.value.replace(/[^0-9]/g, "");
                                                        setBudgetInput(clean);
                                                    }}
                                                    placeholder="250000"
                                                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] transition"
                                                />
                                            </div>
                                        </div>

                                        {/* Quick Budget Options */}
                                        <div className="md:col-span-7">
                                            <span className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                Quick budget options
                                            </span>
                                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                                {QUICK_BUDGETS.map((qb) => {
                                                    const isSelected = parseBudget(budgetInput) === qb.value;
                                                    return (
                                                        <button
                                                            key={qb.value}
                                                            type="button"
                                                            onClick={() => handleQuickBudgetSelect(qb.value)}
                                                            className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap ${
                                                                isSelected
                                                                    ? "bg-[#FFF1F2] text-[#FF385C] border-[#FF385C]/40 ring-1 ring-[#FF385C]/30"
                                                                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                                                            }`}
                                                        >
                                                            {qb.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Row: Property Type, Bedrooms, Apply Filters */}
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-gray-100 items-end">
                                        {/* Property Type Select */}
                                        <div className="sm:col-span-5">
                                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                Property type
                                            </label>
                                            <div className="relative">
                                                <Home size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                <select
                                                    value={selectedType}
                                                    onChange={(e) => setSelectedType(e.target.value)}
                                                    className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] transition appearance-none cursor-pointer"
                                                >
                                                    {PROPERTY_TYPES.map((type) => (
                                                        <option key={type} value={type}>
                                                            {type}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                                                    ▼
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bedrooms Select */}
                                        <div className="sm:col-span-3">
                                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                Bedrooms
                                            </label>
                                            <div className="relative">
                                                <Bed size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                <select
                                                    value={selectedBedrooms}
                                                    onChange={(e) => setSelectedBedrooms(e.target.value)}
                                                    className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] transition appearance-none cursor-pointer"
                                                >
                                                    {BEDROOM_OPTIONS.map((b) => (
                                                        <option key={b.value} value={b.value}>
                                                            {b.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                                                    ▼
                                                </div>
                                            </div>
                                        </div>

                                        {/* Apply Filters Button */}
                                        <div className="sm:col-span-4 flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={handleApplyFilters}
                                                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 ${
                                                    justApplied
                                                        ? "bg-emerald-600 text-white"
                                                        : "bg-[#FF385C] hover:bg-[#E0294B] text-white"
                                                }`}
                                            >
                                                {justApplied ? (
                                                    <>
                                                        <Check size={16} />
                                                        <span>Filters Applied!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search size={15} />
                                                        <span>
                                                            Apply filters ({liveMatchCount})
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* RESULTS NAVIGATION BAR & HOMEPAGE LINK */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                                    <div className="inline-flex items-center p-1 bg-gray-100/80 rounded-xl border border-gray-200/60 self-start">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("all")}
                                            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                                activeTab === "all"
                                                    ? "bg-[#FF385C] text-white shadow-xs"
                                                    : "text-gray-600 hover:text-gray-900"
                                            }`}
                                        >
                                            <span>All Results</span>
                                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "all" ? "bg-white/25 text-white" : "bg-gray-200 text-gray-700"}`}>
                                                {withinBudget.length + nearBudget.length}
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("within")}
                                            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                                activeTab === "within"
                                                    ? "bg-[#FF385C] text-white shadow-xs"
                                                    : "text-gray-600 hover:text-gray-900"
                                            }`}
                                        >
                                            <span>Within Budget</span>
                                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "within" ? "bg-white/25 text-white" : "bg-gray-200 text-gray-700"}`}>
                                                {withinBudget.length}
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("near")}
                                            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                                activeTab === "near"
                                                    ? "bg-[#FF385C] text-white shadow-xs"
                                                    : "text-gray-600 hover:text-gray-900"
                                            }`}
                                        >
                                            <span>Near Budget</span>
                                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "near" ? "bg-white/25 text-white" : "bg-gray-200 text-gray-700"}`}>
                                                {nearBudget.length}
                                            </span>
                                        </button>
                                    </div>

                                    {/* Action to close and view on homepage */}
                                    <button
                                        type="button"
                                        onClick={handleApplyAndViewOnHomepage}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF385C] hover:text-[#E0294B] px-3 py-1.5 rounded-lg hover:bg-[#FFF1F2] transition cursor-pointer self-start sm:self-auto"
                                    >
                                        <span>Show {displayedProperties.length} on Homepage Listings</span>
                                        <ArrowDownRight size={14} />
                                    </button>
                                </div>

                                {/* PROPERTY RESULTS LIST */}
                                <div className="space-y-4">
                                    {displayedProperties.length > 0 ? (
                                        displayedProperties.map((property) => {
                                            let imageList: string[] = [];
                                            try {
                                                imageList = Array.isArray(property.images)
                                                    ? property.images
                                                    : typeof property.images === "string"
                                                    ? JSON.parse(property.images)
                                                    : [];
                                            } catch {
                                                imageList = [];
                                            }
                                            const firstImg = imageList[0] ? getImageUrl(imageList[0]) : "/placeholder-property.jpg";
                                            const isWithin = (property.price || 0) <= appliedBudget;

                                            return (
                                                <div
                                                    key={property.id}
                                                    className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition flex flex-col sm:flex-row gap-5 items-center justify-between"
                                                >
                                                    {/* Left: Property Image */}
                                                    <div className="relative w-full sm:w-64 aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                                        <Image
                                                            src={firstImg}
                                                            alt={property.title || "Property"}
                                                            fill
                                                            unoptimized
                                                            className="object-cover"
                                                        />
                                                        {/* Badge */}
                                                        <div className="absolute top-2.5 left-2.5">
                                                            {isWithin ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                                                                    <Sparkles size={11} />
                                                                    <span>Within Budget</span>
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                                                                    <span>Close Match</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Center: Property Details */}
                                                    <div className="flex-1 min-w-0 w-full">
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="text-xl sm:text-2xl font-black text-gray-900">
                                                                ₦{property.price?.toLocaleString() || "0"}
                                                            </span>
                                                            <span className="text-xs sm:text-sm text-gray-500 font-normal">
                                                                / {property.period || "session"}
                                                            </span>
                                                        </div>

                                                        <h4 className="text-sm sm:text-base font-bold text-gray-900 mt-1 truncate">
                                                            {property.title}
                                                        </h4>

                                                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 mt-1 font-medium">
                                                            <MapPin size={13} className="text-gray-400 shrink-0" />
                                                            <span className="truncate">{property.location || property.campus || "Near Campus"}</span>
                                                        </div>

                                                        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-800 mt-1.5">
                                                            <Home size={14} className="text-gray-400 shrink-0" />
                                                            <span>
                                                                {property.bedrooms ? `${property.bedrooms} Bedroom ` : ""}
                                                                {property.category || "Apartment"}
                                                            </span>
                                                        </div>

                                                        <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed max-w-xl">
                                                            {property.description ||
                                                                "Spacious and well-furnished accommodation with good security and close to campus."}
                                                        </p>
                                                    </div>

                                                    {/* Right: View Details Action */}
                                                    <div className="w-full sm:w-auto shrink-0 self-end sm:self-center">
                                                        <Link
                                                            href={`/rooms/${property.id}`}
                                                            onClick={() => setIsOpen(false)}
                                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-[#FF385C] hover:text-[#FF385C] text-xs font-bold text-gray-700 transition bg-white"
                                                        >
                                                            <span>View details</span>
                                                            <ArrowRight size={13} />
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12 px-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2 text-gray-400">
                                                <Search size={18} />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-1">
                                                No properties found within ₦{appliedBudget.toLocaleString()}
                                            </h4>
                                            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                                                Try increasing your budget or selecting &ldquo;Any type&rdquo; to view more verified student houses.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setBudgetInput("500000");
                                                    setSelectedType("Any type");
                                                    setSelectedBedrooms("any");
                                                    setAppliedBudget(500000);
                                                    setAppliedType("Any type");
                                                    setAppliedBedrooms("any");
                                                    setActiveTab("all");
                                                    if (onApplyBudget) onApplyBudget(null);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 text-xs font-semibold text-gray-700 transition cursor-pointer"
                                            >
                                                <RotateCcw size={13} />
                                                <span>Expand budget to ₦500k</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
