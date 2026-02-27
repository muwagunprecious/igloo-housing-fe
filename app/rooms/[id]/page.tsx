"use client";

import { Star, Share, Heart, Wifi, Shield, Zap, Car, Camera, Users, X, Video, Phone } from "lucide-react";
import Image from "next/image";
import Button from "@/app/components/common/Button";
import BackButton from "@/app/components/common/BackButton";
import MapPlaceholder from "@/app/components/features/MapPlaceholder";
import { useParams } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "@/app/stores/useToastStore";
import { usePropertyStore } from "@/app/stores/usePropertyStore";
import { useRoommateStore } from "@/app/stores/useRoommateStore";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { getImageUrl } from "@/app/lib/imageUrl";

export default function PropertyDetails() {
    const params = useParams();
    const id = params.id as string;
    const { currentProperty, fetchProperty, isLoading, error } = usePropertyStore();
    const { createRequest, isLoading: isRequesting } = useRoommateStore();
    const { isAuthenticated } = useAuthStore();
    const [requestSent, setRequestSent] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({
        budget: "",
        bio: ""
    });

    useEffect(() => {
        if (id) {
            fetchProperty(id);
        }
    }, [id, fetchProperty]);

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

    if (isLoading || !currentProperty) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                {error ? <p className="text-red-500">Error: {error}</p> : <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>}
            </div>
        );
    }

    const property = {
        ...currentProperty,
        rating: 4.8, // Mock
        reviews: 124, // Mock
        specs: { guests: 2, beds: 1, baths: 1 }, // Mock
        amenities: ["WiFi", "24/7 Security", "Water"], // Mock
        period: "year", // Mock
        distance: "5 mins walk" // Mock
    };

    // Ensure images has fallback
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

    const iconMap: Record<string, React.ElementType> = {
        "WiFi": Wifi,
        "24/7 Security": Shield,
        "Water": Zap,
        "Generator": Zap,
        "Parking": Car,
        "Furnished": HomeIcon,
    };

    function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
        return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    }

    return (
        <div className="max-w-[1120px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-28">
            <BackButton />
            {/* Header */}
            <div className="mb-6 mt-4">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">{property.title}</h1>
                <div className="flex flex-row justify-between items-center text-sm">
                    <div className="flex items-center gap-2 font-medium underline cursor-pointer">
                        <Star size={14} className="fill-black" />
                        <span>{property.rating}</span>
                        <span>·</span>
                        <span>{property.reviews} reviews</span>
                        <span>·</span>
                        <span>{property.location}</span>
                    </div>
                    <div className="flex items-center gap-4">
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
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 relative">
                <div className="col-span-2 row-span-2 relative cursor-pointer hover:opacity-95 transition">
                    <Image src={images[0]} alt="Main" fill className="object-cover" />
                </div>
                {/* Simplified Grid for dynamic images, checking bounds */}
                <div className="relative cursor-pointer hover:opacity-95 transition">
                    <Image src={images[1] || images[0]} alt="Image 2" fill className="object-cover" />
                </div>
                <div className="relative cursor-pointer hover:opacity-95 transition">
                    <Image src={images[2] || images[0]} alt="Image 3" fill className="object-cover" />
                </div>
                <div className="relative cursor-pointer hover:opacity-95 transition">
                    <Image src={images[3] || images[0]} alt="Image 4" fill className="object-cover" />
                </div>
                <div className="relative cursor-pointer hover:opacity-95 transition">
                    <Image src={images[0]} alt="Image 5" fill className="object-cover" />
                    <Link href={`/rooms/${property.id}/gallery`}>
                        <button className="absolute bottom-4 right-4 bg-white border border-black px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-100 transition shadow-sm flex items-center gap-2">
                            <Camera size={16} />
                            Show all photos
                        </button>
                    </Link>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                {/* Left Column: Details */}
                <div className="md:col-span-2">
                    <div className="border-b border-gray-200 pb-6 mb-6">
                        <h2 className="text-xl font-semibold mb-1">Hosted by {property.agent?.fullName || 'Agent'}</h2>
                        <p className="text-gray-500 text-sm mb-4">
                            {property.specs.guests} guests · {property.specs.beds} bedroom · {property.specs.baths} bath
                        </p>
                    </div>

                    <div className="border-b border-gray-200 pb-6 mb-6">
                        <h3 className="text-xl font-semibold mb-4">About this place</h3>
                        <p className="text-gray-700 leading-relaxed">
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

                    <div className="border-b border-gray-200 pb-6 mb-6">
                        <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {property.amenities.map((amenity) => {
                                const Icon = iconMap[amenity] || Star;
                                return (
                                    <div key={amenity} className="flex items-center gap-3 text-gray-700">
                                        <Icon size={20} className="text-gray-500" />
                                        <span>{amenity}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-4">Where you&apos;ll be</h3>
                        <div className="h-[400px] w-full">
                            <MapPlaceholder />
                        </div>
                        <div className="mt-4">
                            <h4 className="font-semibold">{property.location}</h4>
                            <p className="text-gray-500 text-sm">{property.distance} from campus</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sticky Agent Card */}
                <div className="relative">
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
                            <a
                                href={`https://wa.me/${property.agent.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, I'm interested in your property: ${property.title}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full"
                            >
                                <Button className="w-full mb-4 bg-[#25D366] hover:bg-[#128C7E] text-white border-none" size="lg">
                                    <Phone size={18} className="mr-2" />
                                    Contact Agent
                                </Button>
                            </a>
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
                                className={`w-full mb-4 ${requestSent ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white border-none`}
                                size="lg"
                                variant="outline"
                            >
                                <Users size={18} className="mr-2" />
                                {requestSent ? "Request Sent" : (isRequesting ? "Sending..." : "Request to Roommate")}
                            </Button>
                        )}

                        <div className="text-center text-sm text-gray-500 mb-4">
                            You won&apos;t be charged yet
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
        </div>
    );
}
