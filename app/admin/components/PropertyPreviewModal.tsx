"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    X,
    ChevronLeft,
    ChevronRight,
    Building2,
    MapPin,
    User,
    CheckCircle2,
    AlertCircle,
    Trash2,
    ExternalLink,
    Clock,
    Video,
    ImageIcon,
    Phone,
    Bed,
    Bath,
    Home,
    Users,
    Play
} from "lucide-react";
import { getImageUrl } from "@/app/lib/imageUrl";

interface PropertyPreviewModalProps {
    property: any | null; // eslint-disable-line @typescript-eslint/no-explicit-any
    isOpen: boolean;
    onClose: () => void;
    onApprove?: (id: string) => Promise<void>;
    onReject?: (id: string, reason: string) => Promise<void>;
}

export default function PropertyPreviewModal({
    property,
    isOpen,
    onClose,
    onApprove,
    onReject
}: PropertyPreviewModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<"photos" | "video">("photos");
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    if (!isOpen || !property) return null;

    // Normalise images array
    let images: string[] = [];
    if (Array.isArray(property.images)) {
        images = property.images;
    } else if (typeof property.images === "string") {
        try {
            const parsed = JSON.parse(property.images);
            images = Array.isArray(parsed) ? parsed : [property.images];
        } catch {
            images = [property.images];
        }
    }

    const hasVideo = !!property.video && typeof property.video === "string" && property.video.trim().length > 0;
    const isPending = property.status === "PENDING";
    const videoUrl = hasVideo ? getImageUrl(property.video) : null;

    const handleNextImage = () => {
        if (images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const handlePrevImage = () => {
        if (images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    const handleApproveAction = async () => {
        if (!onApprove) return;
        if (confirm("Execute approval for this apartment? It will be published immediately for students.")) {
            setIsApproving(true);
            try {
                await onApprove(property.id);
                onClose();
            } finally {
                setIsApproving(false);
            }
        }
    };

    const handleRejectSubmit = async () => {
        if (!onReject || !rejectReason.trim()) return;
        setIsRejecting(true);
        try {
            await onReject(property.id, rejectReason.trim());
            setShowRejectForm(false);
            setRejectReason("");
            onClose();
        } finally {
            setIsRejecting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300">
            <div
                className="bg-white rounded-[36px] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 bg-white sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <span
                            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                                property.status === "APPROVED"
                                    ? "bg-green-100 text-green-700"
                                    : property.status === "REJECTED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-orange-100 text-orange-700"
                            }`}
                        >
                            {property.status || "PENDING"}
                        </span>
                        {hasVideo && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-purple-200">
                                <Video size={12} />
                                Video Tour Included
                            </span>
                        )}
                        <div className="hidden sm:block text-xs font-bold text-gray-400">
                            ID: <span className="font-mono text-gray-600">{property.id.slice(0, 8)}...</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            href={`/rooms/${property.id}`}
                            target="_blank"
                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition"
                            title="Open full page in new tab"
                        >
                            <ExternalLink size={14} />
                            <span className="hidden sm:inline">Public Preview</span>
                        </Link>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content Body */}
                <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-8">
                    {/* Media Tabs & Hero Display */}
                    <div>
                        {hasVideo && (
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setActiveTab("photos")}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
                                            activeTab === "photos"
                                                ? "bg-black text-white shadow-md"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                    >
                                        <ImageIcon size={16} />
                                        Photos ({images.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("video")}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
                                            activeTab === "video"
                                                ? "bg-black text-white shadow-md"
                                                : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                                        }`}
                                    >
                                        <Video size={16} className="text-purple-600 animate-pulse" />
                                        Video Tour Available
                                    </button>
                                </div>
                                {activeTab === "video" && videoUrl && (
                                    <a
                                        href={videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary font-bold hover:underline flex items-center gap-1.5"
                                    >
                                        <ExternalLink size={13} />
                                        Open video direct link
                                    </a>
                                )}
                            </div>
                        )}

                        {activeTab === "photos" ? (
                            <div>
                                {/* Main Image View */}
                                <div className="relative w-full h-80 sm:h-[460px] bg-gray-900 rounded-[28px] overflow-hidden group">
                                    {images.length > 0 ? (
                                        <Image
                                            src={getImageUrl(images[currentImageIndex])}
                                            alt={`${property.title} image ${currentImageIndex + 1}`}
                                            fill
                                            unoptimized
                                            className="object-contain sm:object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                            <Building2 size={48} className="mb-2" />
                                            <p className="text-xs font-bold">No images available</p>
                                        </div>
                                    )}

                                    {/* Image Counter Badge */}
                                    {images.length > 0 && (
                                        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-xs font-black">
                                            {currentImageIndex + 1} / {images.length}
                                        </div>
                                    )}

                                    {/* Video Quick Play Button Overlay */}
                                    {hasVideo && (
                                        <button
                                            onClick={() => setActiveTab("video")}
                                            className="absolute bottom-4 left-4 z-10 px-4 py-2.5 bg-black/85 hover:bg-black text-white rounded-2xl text-xs font-black uppercase tracking-wider backdrop-blur-md flex items-center gap-2 shadow-2xl hover:scale-105 transition"
                                        >
                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-black">
                                                <Play size={11} className="fill-black ml-0.5" />
                                            </div>
                                            <span>Watch Video Tour</span>
                                        </button>
                                    )}

                                    {/* Prev/Next Navigation Controls */}
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={handlePrevImage}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-black shadow-lg flex items-center justify-center transition active:scale-95"
                                            >
                                                <ChevronLeft size={22} />
                                            </button>
                                            <button
                                                onClick={handleNextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-black shadow-lg flex items-center justify-center transition active:scale-95"
                                            >
                                                <ChevronRight size={22} />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Thumbnail Reel (including Video button) */}
                                <div className="flex gap-2.5 mt-3 overflow-x-auto pb-2 scrollbar-none items-center">
                                    {hasVideo && (
                                        <button
                                            onClick={() => setActiveTab("video")}
                                            className="relative w-22 h-16 rounded-xl overflow-hidden shrink-0 border-2 border-purple-400 bg-purple-950 flex flex-col items-center justify-center text-white transition hover:scale-105 shadow-sm"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-black mb-1">
                                                <Play size={12} className="fill-black ml-0.5" />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-wider text-purple-200">Video</span>
                                        </button>
                                    )}

                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                                                currentImageIndex === idx
                                                    ? "border-black scale-105 shadow-md"
                                                    : "border-transparent opacity-60 hover:opacity-100"
                                            }`}
                                        >
                                            <Image
                                                src={getImageUrl(img)}
                                                alt={`Thumb ${idx + 1}`}
                                                fill
                                                unoptimized
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Video Player View */
                            <div className="space-y-4">
                                <div className="w-full h-80 sm:h-[460px] bg-black rounded-[28px] overflow-hidden flex items-center justify-center relative shadow-2xl">
                                    {videoUrl ? (
                                        <video
                                            key={videoUrl}
                                            controls
                                            playsInline
                                            preload="metadata"
                                            className="w-full h-full object-contain"
                                            poster={images[0] ? getImageUrl(images[0]) : undefined}
                                        >
                                            <source src={videoUrl} type="video/mp4" />
                                            Your browser does not support playing this video directly.
                                        </video>
                                    ) : (
                                        <p className="text-white text-sm">No video tour available</p>
                                    )}
                                </div>
                                <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-purple-900">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <Video size={16} className="text-purple-600 shrink-0" />
                                        <span>Agent uploaded video tour ({property.video?.split("/").pop() || "tour.mp4"})</span>
                                    </div>
                                    {videoUrl && (
                                        <a
                                            href={videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-1.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition shrink-0"
                                        >
                                            Download / Open Video
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dedicated Video Section if user stays on photos tab */}
                    {hasVideo && activeTab === "photos" && videoUrl && (
                        <div className="bg-gray-900 text-white rounded-[28px] p-6 sm:p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/20 text-primary rounded-xl">
                                        <Video size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black tracking-tight">Property Video Walkthrough</h3>
                                        <p className="text-xs text-gray-400">Recorded and uploaded by the agent for verification</p>
                                    </div>
                                </div>
                                <a
                                    href={videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1.5"
                                >
                                    <ExternalLink size={13} />
                                    <span>Open Full Window</span>
                                </a>
                            </div>
                            <div className="relative w-full aspect-video max-h-[380px] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
                                <video
                                    src={videoUrl}
                                    controls
                                    playsInline
                                    preload="metadata"
                                    className="w-full h-full object-contain"
                                    poster={images[0] ? getImageUrl(images[0]) : undefined}
                                >
                                    <source src={videoUrl} type="video/mp4" />
                                    Your browser does not support HTML5 video.
                                </video>
                            </div>
                        </div>
                    )}

                    {/* Core Information Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Specs Column (2 cols) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary mb-2">
                                    <span>{property.category || "Apartment"}</span>
                                    <span>•</span>
                                    <span>{property.distanceFromSchool || "Near Campus"}</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight mb-2">
                                    {property.title}
                                </h2>
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <MapPin size={16} className="text-primary shrink-0" />
                                    <span>{property.location}</span>
                                    {property.university?.name && (
                                        <span className="text-gray-400">({property.university.name})</span>
                                    )}
                                </div>
                            </div>

                            {/* Key Highlights Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                    <Bed size={18} className="mx-auto mb-1 text-gray-400" />
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Bedrooms</p>
                                    <p className="text-sm font-black text-black">{property.bedrooms ?? 1}</p>
                                </div>
                                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                    <Bath size={18} className="mx-auto mb-1 text-gray-400" />
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Bathrooms</p>
                                    <p className="text-sm font-black text-black">{property.bathrooms ?? 1}</p>
                                </div>
                                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                    <Home size={18} className="mx-auto mb-1 text-gray-400" />
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total Rooms</p>
                                    <p className="text-sm font-black text-black">{property.rooms ?? 1}</p>
                                </div>
                                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                    <Users size={18} className="mx-auto mb-1 text-gray-400" />
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Roommates</p>
                                    <p className="text-sm font-black text-black">
                                        {property.roommatesAllowed ? "Allowed" : "No"}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-gray-50 rounded-[24px] p-6 border border-gray-100">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                                    Property Description
                                </h3>
                                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                    {property.description || "No description provided by the agent."}
                                </p>
                            </div>
                        </div>

                        {/* Pricing & Agent Sidebar (1 col) */}
                        <div className="space-y-6">
                            {/* Pricing Box */}
                            <div className="bg-black text-white p-6 rounded-[28px] shadow-lg">
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Annual Rent</p>
                                <h3 className="text-3xl font-black tracking-tight text-white mb-1">
                                    ₦{property.price?.toLocaleString()}
                                </h3>
                                <p className="text-xs text-gray-400">Per session / year</p>
                            </div>

                            {/* Agent / Custodian Card */}
                            <div className="bg-gray-50 p-6 rounded-[28px] border border-gray-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        Submitting Agent
                                    </span>
                                    {property.agent?.isVerified && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                            <CheckCircle2 size={12} /> Verified
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-200 overflow-hidden relative shrink-0">
                                        {property.agent?.avatar ? (
                                            <Image
                                                src={getImageUrl(property.agent.avatar)}
                                                alt={property.agent.fullName || "Agent"}
                                                fill
                                                unoptimized
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <User size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-black text-black truncate">
                                            {property.agent?.fullName || "Unknown Agent"}
                                        </h4>
                                        <p className="text-xs text-gray-500 truncate">{property.agent?.email}</p>
                                    </div>
                                </div>

                                {property.agent?.whatsapp && (
                                    <a
                                        href={`https://wa.me/${property.agent.whatsapp.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-black transition"
                                    >
                                        <Phone size={14} />
                                        <span>Chat via WhatsApp ({property.agent.whatsapp})</span>
                                    </a>
                                )}

                                <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        Submitted
                                    </span>
                                    <span className="font-bold text-gray-600">
                                        {new Date(property.createdAt).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reject Form Collapse */}
                    {showRejectForm && (
                        <div className="p-6 bg-red-50 border border-red-200 rounded-[28px] space-y-4 animate-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center gap-2 text-red-700">
                                <AlertCircle size={20} />
                                <h4 className="text-base font-black">Reason for Rejection</h4>
                            </div>
                            <p className="text-xs text-red-600 font-medium">
                                Describe why this listing cannot be approved. This note will be recorded to notify the agent.
                            </p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="e.g. Incomplete photos, unclear address, invalid pricing..."
                                className="w-full p-4 bg-white border border-red-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-red-500 resize-none min-h-[100px]"
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowRejectForm(false)}
                                    className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-black transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRejectSubmit}
                                    disabled={!rejectReason.trim() || isRejecting}
                                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition"
                                >
                                    {isRejecting ? "Declining..." : "Confirm Rejection"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer / Action Bar */}
                <div className="px-6 sm:px-8 py-5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-20">
                    <button
                        onClick={onClose}
                        className="text-xs font-black uppercase tracking-wider text-gray-400 hover:text-black transition order-2 sm:order-1"
                    >
                        Close Preview
                    </button>

                    <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                        {isPending && onReject && !showRejectForm && (
                            <button
                                onClick={() => setShowRejectForm(true)}
                                className="flex-1 sm:flex-none px-6 py-3.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-2xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} />
                                <span>Decline</span>
                            </button>
                        )}

                        {isPending && onApprove && (
                            <button
                                onClick={handleApproveAction}
                                disabled={isApproving}
                                className="flex-1 sm:flex-none px-8 py-3.5 bg-black hover:bg-primary hover:text-black text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <CheckCircle2 size={16} />
                                <span>{isApproving ? "Approving..." : "Authorize Listing"}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
