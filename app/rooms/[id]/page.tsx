"use client";

import { Star, Share, Heart, Wifi, Shield, Zap, Car, Camera, Users, X, Video, Phone, Edit, Trash2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Button from "@/app/components/common/Button";
import BackButton from "@/app/components/common/BackButton";
import MapPlaceholder from "@/app/components/features/MapPlaceholder";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "@/app/stores/useToastStore";
import { usePropertyStore } from "@/app/stores/usePropertyStore";
import { useRoommateStore } from "@/app/stores/useRoommateStore";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { useAdminStore } from "@/app/stores/useAdminStore";
import { getImageUrl } from "@/app/lib/imageUrl";
import ImageLightbox from "@/app/components/common/ImageLightbox";

export default function PropertyDetails() {
    const params = useParams();
    const id = params.id as string;
    
    const { currentProperty, fetchProperty, isLoading, error } = usePropertyStore();
    const { createRequest, isLoading: isRequesting } = useRoommateStore();
    const { isAuthenticated, user } = useAuthStore();
    const { deleteProperty } = useAdminStore();
    const router = useRouter();
    const [requestSent, setRequestSent] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({
        budget: "",
        bio: ""
    });
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    useEffect(() => {
        if (id) {
            fetchProperty(id);
        }
    }, [id, fetchProperty]);

    const isAdmin = user?.role === 'admin';
    const isOwner = user?.id === currentProperty?.agentId;
    const canManage = isAdmin || isOwner;

    const handleRoommateRequest = () => {
        if (!isAuthenticated) {
            toast.info("Please login to request a roommate spot");
            return;
        }
        setIsModalOpen(true);
    };

    const submitRoommateRequest = async () => {
        const success = await createRequest({
            propertyId: id,
            budget: modalData.budget || currentProperty?.price,
            bio: modalData.bio || `I am interested in sharing ${currentProperty?.title}`
        });

        if (success) {
            setRequestSent(true);
            setIsModalOpen(false);
            toast.success("Roommate request sent!");
        } else {
            toast.error("Failed to send request or request already exists");
        }
    };

    const handleDelete = async () => {
        if (!confirm("ADMIN ACTION: Are you sure you want to PERMANENTLY delete this property? This cannot be undone.")) return;
        
        const success = await deleteProperty(id);
        if (success) {
            toast.success("Property deleted successfully");
            router.push("/admin/properties");
        } else {
            toast.error("Failed to delete property");
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: property.title,
            text: `Check out this property on Igloo Estate: ${property.title}`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard!");
            } catch (err) {
                console.error("Failed to copy link:", err);
                toast.error("Failed to copy link");
            }
        }
    };

    // --- NEW: Handle WhatsApp Click with Page Link ---
    const handleWhatsAppClick = () => {
        if (!property?.agent?.whatsapp) return;
        
        // Formats the message with double line breaks for readability
        const message = `Hello, I'm interested in your property: ${property.title}\n\nProperty Link: ${window.location.href}`;
        const whatsappUrl = `https://wa.me/${property.agent.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        
        // Opens WhatsApp in a new tab securely
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    if (isLoading || !currentProperty) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                {error ? <p className="text-red-500">Error: {error}</p> : <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>}
            </div>
        );
    }

    const property = {
        ...currentProperty,
        rating: 4.8, 
        reviews: 124, 
        specs: { guests: 2, beds: 1, baths: 1 }, 
        amenities: ["WiFi", "24/7 Security", "Water"], 
        period: "year", 
        distance: "5 mins walk" 
    };

    let imageList: string[] = [];
    if (typeof property.images === 'string') {
        try {
            imageList = JSON.parse(property.images);
        } catch (e) {
            console.error("Failed to parse property images:", e);
            imageList = [];
        }
    } else if (Array.isArray(property.images)) {
        imageList = property.images;
    }

    const images = imageList.length > 0
        ? imageList.map(img => getImageUrl(img))
        : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"];


    return (
        <div className="relative bg-white min-h-screen pb-24 md:pb-12">
            {/* MOBILE ONLY: Full-width Swipable Image Carousel */}
            <div className="block md:hidden relative w-full h-[380px] bg-gray-150 overflow-hidden">
                <div 
                    onScroll={(e) => {
                        const scrollLeft = e.currentTarget.scrollLeft;
                        const width = e.currentTarget.clientWidth;
                        const index = Math.round(scrollLeft / width);
                        setCurrentImageIndex(index);
                    }}
                    className="flex w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar"
                    style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
                >
                    {images.map((img, idx) => (
                        <div
                            key={idx}
                            className="w-full h-full flex-shrink-0 snap-start snap-always relative cursor-pointer"
                            onClick={() => openLightbox(idx)}
                        >
                            <Image src={img} alt={`Apartment image ${idx + 1}`} fill className="object-cover" />
                        </div>
                    ))}
                </div>

                {/* Floating Back Button */}
                <div className="absolute top-4 left-4 z-30">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-gray-100 flex items-center justify-center text-gray-700 shadow-md hover:bg-gray-50 active:scale-95 transition"
                    >
                        <ArrowLeft size={18} />
                    </button>
                </div>

                {/* Floating Action Buttons */}
                <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
                    <button 
                        onClick={handleShare}
                        className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-gray-100 flex items-center justify-center text-gray-700 shadow-md hover:bg-gray-50 active:scale-95 transition"
                    >
                        <Share size={18} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-gray-100 flex items-center justify-center text-gray-700 shadow-md hover:bg-gray-50 active:scale-95 transition">
                        <Heart size={18} />
                    </button>
                </div>

                {/* Image counter */}
                <div className="absolute bottom-12 right-6 z-30 px-3 py-1 bg-black/60 backdrop-blur-xs rounded-md text-white text-xs font-semibold">
                    {currentImageIndex + 1} / {images.length}
                </div>
            </div>

            {/* Main Content Container */}
            <div className="max-w-[1120px] mx-auto xl:px-20 md:px-10 sm:px-4 px-4 relative z-20">
                
                {/* Mobile Overlapping Header Card */}
                <div className="md:hidden -mt-8 pt-8 pb-6 px-6 bg-white rounded-t-[2.5rem] border-t border-gray-100 -mx-4 relative z-20 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-snug">{property.title}</h1>
                    <p className="text-gray-500 text-sm font-semibold mb-6 leading-relaxed">
                        Entire rental unit in {property.location}
                        <br />
                        {property.specs.guests} guests · {property.specs.beds} bedroom · {property.specs.baths} bath
                    </p>

                    {/* Stats row with Custom Guest Favorite Badge */}
                    <div className="flex items-center justify-between border border-gray-200/80 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                        <div className="flex-1 flex flex-col items-center justify-center border-r border-gray-200">
                            <span className="text-lg font-extrabold text-gray-900 flex items-baseline gap-1">
                                {property.rating}
                            </span>
                            <div className="flex items-center gap-0.5 mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} className="fill-black stroke-none" />
                                ))}
                            </div>
                        </div>
                        <div className="flex-grow flex-shrink-0 px-2 flex flex-col items-center justify-center border-r border-gray-200">
                            <div className="flex items-center gap-1.5 text-gray-900">
                                <svg className="w-5 h-5 text-yellow-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"/>
                                    <path d="M12,6c-1.5,1.5-2.5,3.5-2.5,5.5s1,4,2.5,5.5c1.5-1.5,2.5-3.5,2.5-5.5S13.5,7.5,12,6Z"/>
                                </svg>
                            </div>
                            <span className="text-[9px] font-extrabold uppercase text-gray-800 tracking-wider mt-1 text-center">Guest Favorite</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <span className="text-lg font-extrabold text-gray-900">{property.reviews}</span>
                            <span className="text-[10px] font-bold text-gray-500 mt-0.5 underline">Reviews</span>
                        </div>
                    </div>
                </div>

                {/* DESKTOP ONLY Back Button */}
                <div className="hidden md:block">
                    <BackButton />
                </div>

                {/* DESKTOP ONLY Header */}
                <div className="hidden md:block mb-6 mt-4">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">{property.title}</h1>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-sm">
                        <div className="flex flex-wrap items-center gap-2 font-medium underline cursor-pointer">
                            <Star size={14} className="fill-black" />
                            <span>{property.rating}</span>
                            <span>·</span>
                            <span>{property.reviews} reviews</span>
                            <span>·</span>
                            <span>{property.location}</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition underline font-medium"
                            >
                                <Share size={16} />
                                Share
                            </button>
                            <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition underline font-medium">
                                <Heart size={16} />
                                Save
                            </button>
                        </div>
                    </div>
                    
                    {user?.role === 'admin' && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3 text-red-700">
                                <Trash2 size={20} />
                                <div>
                                    <p className="font-bold text-sm">Administrative Controls</p>
                                    <p className="text-xs opacity-80">You have authority to remove this listing from the platform.</p>
                                </div>
                            </div>
                            <Button 
                                variant="outline" 
                                className="bg-white border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all font-bold text-xs uppercase tracking-widest px-6"
                                onClick={handleDelete}
                            >
                                Delete Property
                            </Button>
                        </div>
                    )}
                </div>

                {/* DESKTOP ONLY Image Grid */}
                <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 relative">
                    <div className="col-span-2 row-span-2 relative cursor-pointer hover:opacity-95 transition" onClick={() => openLightbox(0)}>
                        <Image src={images[0]} alt="Main" fill className="object-cover" />
                    </div>
                    <div className="relative cursor-pointer hover:opacity-95 transition" onClick={() => openLightbox(1)}>
                        <Image src={images[1] || images[0]} alt="Image 2" fill className="object-cover" />
                    </div>
                    <div className="relative cursor-pointer hover:opacity-95 transition" onClick={() => openLightbox(2)}>
                        <Image src={images[2] || images[0]} alt="Image 3" fill className="object-cover" />
                    </div>
                    <div className="relative cursor-pointer hover:opacity-95 transition" onClick={() => openLightbox(3)}>
                        <Image src={images[3] || images[0]} alt="Image 4" fill className="object-cover" />
                    </div>
                    <div className="relative cursor-pointer hover:opacity-95 transition" onClick={() => openLightbox(4)}>
                        <Image src={images[0]} alt="Image 5" fill className="object-cover" />
                        <button
                            onClick={(e) => { e.stopPropagation(); openLightbox(0); }}
                            className="absolute bottom-4 right-4 bg-white border border-black px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-100 transition shadow-sm flex items-center gap-2 z-10"
                        >
                            <Camera size={16} />
                            Show all photos
                        </button>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    {/* Left Column: Details */}
                    <div className="md:col-span-2 animate-fade-in">
                        <div className="border-b border-gray-200 pb-6 mb-6">
                            <h2 className="text-xl font-semibold mb-1">Hosted by {property.agent?.fullName || 'Agent'}</h2>
                            <p className="text-gray-500 text-sm mb-4">
                                {property.specs.guests} guests · {property.specs.beds} bedroom · {property.specs.baths} bath
                            </p>
                        </div>

                        {/* Roommate Request Inline for Mobile */}
                        {property.roommatesAllowed && (
                            <div className="md:hidden border-b border-gray-200 pb-6 mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Looking for a Roommate?</h3>
                                <p className="text-gray-500 text-sm mb-4">You can request to share this property and divide the rent with other students.</p>
                                <Button
                                    onClick={handleRoommateRequest}
                                    disabled={isRequesting || requestSent}
                                    className={`w-full ${requestSent ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white border-none`}
                                    size="lg"
                                >
                                    <Users size={18} className="mr-2" />
                                    {requestSent ? "Request Sent" : (isRequesting ? "Sending..." : "Request to Roommate")}
                                </Button>
                            </div>
                        )}

                        {/* Contact Agent Inline for Mobile */}
                        <div className="md:hidden border-b border-gray-200 pb-6 mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Have questions about this stay?</h3>
                            <p className="text-gray-500 text-sm mb-4">Chat directly with the verified agent to clear any doubts or schedule a visit.</p>
                            {property.agent?.whatsapp ? (
                                <Button 
                                    onClick={handleWhatsAppClick}
                                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white border-none" 
                                    size="lg"
                                >
                                    <Phone size={18} className="mr-2" />
                                    Contact Agent
                                </Button>
                            ) : (
                                <Link href={`/chat?userId=${property.agent?.id || property.agentId}`} className="block w-full">
                                    <Button className="w-full" size="lg">
                                        Contact Agent
                                    </Button>
                                </Link>
                            )}
                        </div>

                        <div className="border-b border-gray-200 pb-6 mb-6">
                            <h3 className="text-xl font-semibold mb-4">About this place</h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                                {property.description}
                            </p>
                        </div>

                        {property.video && (
                            <div className="border-b border-gray-200 pb-8 mb-8">
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <Video className="text-blue-600" size={24} />
                                    Virtual Tour
                                </h3>
                                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl group border border-gray-100">
                                    <video
                                        src={getImageUrl(property.video)}
                                        controls
                                        className="w-full h-full"
                                        poster={images[0]}
                                    />
                                    <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                        Property Highlight
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-4">Where you'll be</h3>
                            <div className="h-[400px] w-full">
                                <MapPlaceholder />
                            </div>
                            <div className="mt-4">
                                <h4 className="font-semibold">{property.location}</h4>
                                <p className="text-gray-500 text-sm">{property.distance} from campus</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sticky Agent Card (Desktop Only) */}
                    <div className="relative hidden md:block">
                        <div className="sticky top-32 border border-gray-200 rounded-2xl p-6 shadow-floating bg-white">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-2xl font-bold">₦{property.price.toLocaleString()}</span>
                                    <span className="text-gray-500"> / {property.period}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm font-semibold">
                                    <Star size={14} className="fill-black" />
                                    <span>{property.rating}</span>
                                </div>
                            </div>

                            {property.agent?.whatsapp ? (
                                <Button 
                                    onClick={handleWhatsAppClick}
                                    className="w-full mb-4 bg-[#25D366] hover:bg-[#128C7E] text-white border-none" 
                                    size="lg"
                                >
                                    <Phone size={18} className="mr-2" />
                                    Contact Agent
                                </Button>
                            ) : (
                                <Link href={`/chat?userId=${property.agent?.id || property.agentId}`} className="block w-full">
                                    <Button className="w-full mb-4" size="lg">
                                        Contact Agent
                                    </Button>
                                </Link>
                            )}

                            <div className="text-center text-sm text-gray-500 mb-4 px-2">
                                Secure your stay by chatting directly with the verified agent.
                            </div>
                            {property.roommatesAllowed && (
                                <Button
                                    onClick={handleRoommateRequest}
                                    disabled={isRequesting || requestSent}
                                    className={`w-full mb-4 ${requestSent ? 'bg-green-600 hover:bg-green-700' : 'bg-[#FF385C] hover:bg-[#D9324E]'} text-white border-none`}
                                    size="lg"
                                    variant="outline"
                                >
                                    <Users size={18} className="mr-2" />
                                    {requestSent ? "Request Sent" : (isRequesting ? "Sending..." : "Request to Roommate")}
                                </Button>
                            )}

                            <div className="text-center text-sm text-gray-500 mb-4">
                                You won't be charged yet
                            </div>

                            <div className="flex justify-between text-gray-600 mb-2">
                                <span className="underline">Rent</span>
                                <span>₦{property.price.toLocaleString()}</span>
                            </div>

                            <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>₦{property.price.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Bottom Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200/80 p-4 z-50 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.06)] pb-6">
                <div className="flex flex-col">
                    <div>
                        <span className="text-lg font-black text-gray-900">₦{property.price.toLocaleString()}</span>
                        <span className="text-gray-500 text-[10px]"> / {property.period}</span>
                    </div>
                    <span className="text-[10px] text-green-600 font-bold mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Free cancellation
                    </span>
                </div>
                
                {property.agent?.whatsapp ? (
                    <button
                        onClick={handleWhatsAppClick}
                        className="bg-[#FF385C] hover:bg-[#D9324E] text-white font-extrabold py-3 px-8 rounded-xl text-sm transition active:scale-95 shadow-md flex items-center gap-2"
                    >
                        <Phone size={14} />
                        Reserve
                    </button>
                ) : (
                    <Link href={`/chat?userId=${property.agent?.id || property.agentId}`}>
                        <button className="bg-[#FF385C] hover:bg-[#D9324E] text-white font-extrabold py-3 px-8 rounded-xl text-sm transition active:scale-95 shadow-md">
                            Reserve
                        </button>
                    </Link>
                )}
            </div>

            {/* Roommate Request Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Roommate Request</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <p className="text-gray-500 text-sm">
                                Let others know what your budget is and a little bit about yourself to find the perfect roommate for this property.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">My Budget (₦)</label>
                                    <input
                                        type="number"
                                        value={modalData.budget}
                                        onChange={(e) => setModalData({ ...modalData, budget: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                        placeholder={`Default: ₦${property.price.toLocaleString()}`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">Short Bio / Preference</label>
                                    <textarea
                                        value={modalData.bio}
                                        onChange={(e) => setModalData({ ...modalData, bio: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                                        placeholder="E.g. I'm a quiet student looking for someone who shares similar values..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-none"
                                onClick={submitRoommateRequest}
                                disabled={isRequesting}
                            >
                                {isRequesting ? "Sending..." : "Send Request"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <ImageLightbox
                images={images}
                initialIndex={lightboxIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
            />
        </div>
    );
}