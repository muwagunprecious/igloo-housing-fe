"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star, MapPin, Users, BedDouble, DollarSign, Calendar, CheckCircle2, XCircle, Pause, ChevronLeft, ChevronRight, Shield, Clock } from "lucide-react";
import { useState } from "react";
import Button from "@/app/components/common/Button";

interface PropertyImage {
    id: string;
    url: string;
    order: number;
}

interface PropertyOwner {
    id: string;
    fullName: string;
    email?: string;
    avatar?: string;
    whatsapp?: string;
}

interface Property {
    id: string;
    title: string;
    description: string;
    address: string;
    area: string;
    distanceFromOOU?: string;
    latitude?: number;
    longitude?: number;
    pricePerNight: number;
    fullBookingPrice?: number;
    totalRooms: number;
    availableRooms: number;
    totalBeds: number;
    maxGuests: number;
    checkInDate?: string;
    checkOutDate?: string;
    amenities: string;
    rules?: string;
    checkInInfo?: string;
    status: string;
    views: number;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    createdAt: string;
    owner?: PropertyOwner;
    images?: PropertyImage[];
    _count?: { bookings: number };
}

interface Props {
    property: Property | null;
    isOpen: boolean;
    onClose: () => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onSuspend: (id: string) => void;
    isProcessing: boolean;
}

export default function PropertyDetailModal({ property, isOpen, onClose, onApprove, onReject, onSuspend, isProcessing }: Props) {
    const [currentImage, setCurrentImage] = useState(0);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);

    if (!property) return null;

    let parsedAmenities: string[] = [];
    try {
        parsedAmenities = JSON.parse(property.amenities);
    } catch {
        parsedAmenities = [];
    }

    const images = property.images?.sort((a, b) => a.order - b.order) || [];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-10 bg-black/50 backdrop-blur-sm overflow-y-auto"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl mb-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-black text-gray-900">{property.title}</h2>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                    <MapPin size={14} /> {property.address}, {property.area}
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Image Gallery */}
                        {images.length > 0 && (
                            <div className="relative h-72 bg-gray-100">
                                <img
                                    src={images[currentImage]?.url}
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                />
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setCurrentImage((p) => (p === 0 ? images.length - 1 : p - 1))}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button
                                            onClick={() => setCurrentImage((p) => (p === images.length - 1 ? 0 : p + 1))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full">
                                            {currentImage + 1} / {images.length}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Status & Stats */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    property.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                    property.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                                    property.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                    property.status === 'SUSPENDED' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {property.status === 'PENDING_REVIEW' ? 'Pending Review' : property.status}
                                </span>
                                {property.isVerified && (
                                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                        <Shield size={12} /> Verified
                                    </span>
                                )}
                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                    <Star size={12} className="text-yellow-400" /> {property.rating.toFixed(1)} ({property.reviewCount} reviews)
                                </span>
                                <span className="text-xs text-gray-400">{property.views} views</span>
                                {property._count && <span className="text-xs text-gray-400">{property._count.bookings} bookings</span>}
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Description</h3>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
                            </div>

                            {/* Quick Info Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <DollarSign size={18} className="mx-auto text-[#008489] mb-1" />
                                    <p className="text-xs text-gray-400">Per Night</p>
                                    <p className="font-bold text-gray-900">₦{property.pricePerNight.toLocaleString()}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <BedDouble size={18} className="mx-auto text-[#008489] mb-1" />
                                    <p className="text-xs text-gray-400">Rooms</p>
                                    <p className="font-bold text-gray-900">{property.totalRooms} ({property.availableRooms} available)</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <Users size={18} className="mx-auto text-[#008489] mb-1" />
                                    <p className="text-xs text-gray-400">Max Guests</p>
                                    <p className="font-bold text-gray-900">{property.maxGuests}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <BedDouble size={18} className="mx-auto text-[#008489] mb-1" />
                                    <p className="text-xs text-gray-400">Total Beds</p>
                                    <p className="font-bold text-gray-900">{property.totalBeds}</p>
                                </div>
                            </div>

                            {/* Distance */}
                            {property.distanceFromOOU && (
                                <div className="bg-blue-50 rounded-xl p-3 text-sm">
                                    <span className="font-semibold text-blue-800">Distance from OOU:</span>{' '}
                                    <span className="text-blue-700">{property.distanceFromOOU}</span>
                                </div>
                            )}

                            {/* Dates */}
                            {(property.checkInDate || property.checkOutDate) && (
                                <div className="flex gap-4">
                                    {property.checkInDate && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar size={14} className="text-gray-400" />
                                            Check-in: {new Date(property.checkInDate).toLocaleDateString()}
                                        </div>
                                    )}
                                    {property.checkOutDate && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar size={14} className="text-gray-400" />
                                            Check-out: {new Date(property.checkOutDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Amenities */}
                            {parsedAmenities.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Amenities</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {parsedAmenities.map((a) => (
                                            <span key={a} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{a}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Rules */}
                            {property.rules && (
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">House Rules</h3>
                                    <p className="text-sm text-gray-600 whitespace-pre-line">{property.rules}</p>
                                </div>
                            )}

                            {/* Check-in Info */}
                            {property.checkInInfo && (
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Check-in Instructions</h3>
                                    <p className="text-sm text-gray-600 whitespace-pre-line">{property.checkInInfo}</p>
                                </div>
                            )}

                            {/* Owner */}
                            {property.owner && (
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-bold text-gray-900 mb-2">Listed by</h3>
                                    <p className="text-sm font-medium text-gray-800">{property.owner.fullName}</p>
                                    {property.owner.email && <p className="text-xs text-gray-500">{property.owner.email}</p>}
                                    {property.owner.whatsapp && <p className="text-xs text-gray-500">WhatsApp: {property.owner.whatsapp}</p>}
                                </div>
                            )}

                            {/* Reject Form */}
                            {showRejectForm && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <label className="block text-sm font-semibold text-red-800 mb-2">Rejection Reason</label>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        rows={3}
                                        placeholder="Enter reason for rejection (optional)..."
                                        className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm outline-none resize-none"
                                    />
                                    <div className="flex gap-2 mt-3">
                                        <Button variant="outline" className="flex-1" onClick={() => { setShowRejectForm(false); setRejectReason(""); }}>
                                            Cancel
                                        </Button>
                                        <Button
                                            className="flex-1 bg-red-600 text-white border-none hover:bg-red-700"
                                            onClick={() => { onReject(property.id); setShowRejectForm(false); setRejectReason(""); }}
                                            disabled={isProcessing}
                                        >
                                            Confirm Reject
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        {!showRejectForm && (
                            <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
                                {property.status === "PENDING_REVIEW" && (
                                    <>
                                        <Button
                                            className="flex-1 bg-green-600 text-white border-none hover:bg-green-700 flex items-center justify-center gap-2"
                                            onClick={() => onApprove(property.id)}
                                            disabled={isProcessing}
                                        >
                                            <CheckCircle2 size={18} /> Approve
                                        </Button>
                                        <Button
                                            className="flex-1 bg-red-600 text-white border-none hover:bg-red-700 flex items-center justify-center gap-2"
                                            onClick={() => setShowRejectForm(true)}
                                            disabled={isProcessing}
                                        >
                                            <XCircle size={18} /> Reject
                                        </Button>
                                    </>
                                )}
                                {property.status === "APPROVED" && (
                                    <Button
                                        className="flex-1 bg-orange-500 text-white border-none hover:bg-orange-600 flex items-center justify-center gap-2"
                                        onClick={() => onSuspend(property.id)}
                                        disabled={isProcessing}
                                    >
                                        <Pause size={18} /> Suspend
                                    </Button>
                                )}
                                {property.status === "REJECTED" && (
                                    <>
                                        <Button
                                            className="flex-1 bg-green-600 text-white border-none hover:bg-green-700 flex items-center justify-center gap-2"
                                            onClick={() => onApprove(property.id)}
                                            disabled={isProcessing}
                                        >
                                            <CheckCircle2 size={18} /> Approve Anyway
                                        </Button>
                                        <Button
                                            className="flex-1 bg-orange-500 text-white border-none hover:bg-orange-600 flex items-center justify-center gap-2"
                                            onClick={() => onSuspend(property.id)}
                                            disabled={isProcessing}
                                        >
                                            <Pause size={18} /> Suspend
                                        </Button>
                                    </>
                                )}
                                {property.status === "SUSPENDED" && (
                                    <Button
                                        className="flex-1 bg-green-600 text-white border-none hover:bg-green-700 flex items-center justify-center gap-2"
                                        onClick={() => onApprove(property.id)}
                                        disabled={isProcessing}
                                    >
                                        <CheckCircle2 size={18} /> Reactivate
                                    </Button>
                                )}
                                <Button variant="outline" className="flex-1" onClick={onClose}>
                                    Close
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
