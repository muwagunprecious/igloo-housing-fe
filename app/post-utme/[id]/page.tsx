"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Star, Users, BedDouble, DoorOpen, Calendar, Shield, ChevronLeft, Phone, MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import Button from "@/app/components/common/Button";
import { usePostUtmeStore } from "@/app/stores/usePostUtmeStore";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { toast } from "@/app/stores/useToastStore";
import { loadPaystackScript } from "@/app/utils/paystack";

const AMENITY_ICONS: Record<string, string> = {
    electricity: "⚡", water: "💧", wifi: "📶", kitchen: "🍳",
    air_conditioning: "❄️", fan: "🌀", bed: "🛏️", mattress: "🛏️",
    wardrobe: "👔", bathroom: "🚿", parking: "🅿️", security: "🔒", generator: "🔋"
};

export default function PostUtmePropertyDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { currentProperty, fetchProperty } = usePostUtmeStore();
    const { isAuthenticated, user } = useAuthStore();
    const [selectedImage, setSelectedImage] = useState(0);
    const [showBooking, setShowBooking] = useState(false);
    const [bookingData, setBookingData] = useState({ checkInDate: "", checkOutDate: "", numberOfGuests: 1 });
    const [isBooking, setIsBooking] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchProperty(id).then(() => setInitialLoading(false));
        }
    }, [id, fetchProperty]);

    if (initialLoading || !currentProperty) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008489]" />
            </div>
        );
    }

    const p = currentProperty;
    const images = p.images?.sort((a, b) => a.order - b.order) || [];
    const amenities: string[] = (() => { try { return JSON.parse(p.amenities); } catch { return []; } })();

    const nights = bookingData.checkInDate && bookingData.checkOutDate
        ? Math.max(1, Math.ceil((new Date(bookingData.checkOutDate).getTime() - new Date(bookingData.checkInDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 1;
    const totalPrice = p.pricePerNight * nights;
    const serviceFee = Math.round(totalPrice * 0.05);

    const handleBook = async () => {
        if (!isAuthenticated) {
            toast.info("Please sign in to book this apartment");
            router.push("/post-utme/login?redirect=" + encodeURIComponent(window.location.pathname));
            return;
        }
        if (!bookingData.checkInDate || !bookingData.checkOutDate) {
            toast.error("Please select check-in and check-out dates");
            return;
        }
        setShowBooking(true);
    };

    const confirmBooking = async () => {
        const { createBooking, payBooking } = usePostUtmeStore.getState();
        const { user } = useAuthStore.getState();
        setIsBooking(true);

        const booking = await createBooking({
            propertyId: id,
            checkInDate: bookingData.checkInDate,
            checkOutDate: bookingData.checkOutDate,
            numberOfGuests: bookingData.numberOfGuests,
        });

        if (booking.success && booking.booking) {
            const bookingObj = booking.booking;
            const amountInKobo = Math.round(bookingObj.totalPayable * 100);
            const userEmail = user?.email || "student@igloo.ng";

            const isLoaded = await loadPaystackScript();
            if (isLoaded && (window as any).PaystackPop) {
                const handler = (window as any).PaystackPop.setup({
                    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_5416765eee4770e59472cf1f9a7190f4352fcb8e",
                    email: userEmail,
                    amount: amountInKobo,
                    currency: "NGN",
                    ref: `PTME-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    metadata: {
                        bookingId: bookingObj.id,
                        custom_fields: [
                            {
                                display_name: "Booking ID",
                                variable_name: "booking_id",
                                value: bookingObj.id
                            }
                        ]
                    },
                    callback: async function () {
                        const paid = await payBooking(bookingObj.id);
                        if (paid) {
                            toast.success("Payment successful! Booking confirmed.");
                            router.push(`/post-utme/bookings/${bookingObj.id}`);
                        } else {
                            toast.error("Payment verification failed. Please try again.");
                            setIsBooking(false);
                        }
                    },
                    onClose: function () {
                        toast.info("Payment window closed.");
                        setIsBooking(false);
                    }
                });
                handler.openIframe();
            } else {
                const paid = await payBooking(bookingObj.id);
                if (paid) {
                    toast.success("Booking confirmed! Redirecting...");
                    router.push(`/post-utme/bookings/${bookingObj.id}`);
                } else {
                    toast.error("Payment failed. Please try again.");
                    setIsBooking(false);
                }
            }
        } else {
            setIsBooking(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-24 md:pb-12">
            {/* Image Gallery */}
            <div className="relative">
                {/* Mobile: Full-width image */}
                <div className="md:hidden w-full h-[350px] relative bg-gray-100">
                    {images.length > 0 ? (
                        <Image src={images[selectedImage]?.url || images[0].url} alt={p.title} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No images</div>
                    )}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-semibold">
                            {selectedImage + 1} / {images.length}
                        </div>
                    )}
                </div>
                {/* Desktop: Grid */}
                <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[500px] rounded-none overflow-hidden">
                    <div className="col-span-2 row-span-2 relative bg-gray-100">
                        {images[0] ? <Image src={images[0].url} alt="Main" fill className="object-cover" /> : <div className="w-full h-full" />}
                    </div>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="relative bg-gray-100">
                            {images[i] ? <Image src={images[i].url} alt={`Image ${i + 1}`} fill className="object-cover" /> : <div className="w-full h-full" />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Left Column */}
                    <div className="md:col-span-2">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">{p.title}</h1>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><MapPin size={14} />{p.area}{p.distanceFromOOU ? ` · ${p.distanceFromOOU} from OOU` : ''}</span>
                                    {p.rating > 0 && <span className="flex items-center gap-1"><Star size={14} className="fill-black" />{p.rating.toFixed(1)} ({p.reviewCount} reviews)</span>}
                                </div>
                            </div>
                            {p.isVerified && (
                                <span className="flex items-center gap-1 bg-[#008489]/10 text-[#008489] text-xs font-bold px-3 py-1.5 rounded-full">
                                    <Shield size={14} /> Verified
                                </span>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-6 py-4 border-y border-gray-100 mb-6">
                            <span className="flex items-center gap-1.5 text-sm"><Users size={16} className="text-gray-400" /> Up to {p.maxGuests} guests</span>
                            <span className="flex items-center gap-1.5 text-sm"><DoorOpen size={16} className="text-gray-400" /> {p.availableRooms} rooms available</span>
                            <span className="flex items-center gap-1.5 text-sm"><BedDouble size={16} className="text-gray-400" /> {p.totalBeds} beds</span>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h2 className="text-lg font-bold mb-3">About this place</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{p.description}</p>
                        </div>

                        {/* Amenities */}
                        {amenities.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-lg font-bold mb-3">What this place offers</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {amenities.map((a: string) => (
                                        <div key={a} className="flex items-center gap-2 text-sm text-gray-700 py-2">
                                            <span>{AMENITY_ICONS[a.toLowerCase()] || "✓"}</span>
                                            <span className="capitalize">{a.replace(/_/g, ' ')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Rules */}
                        {p.rules && (
                            <div className="mb-8">
                                <h2 className="text-lg font-bold mb-3">House Rules</h2>
                                <p className="text-gray-700 whitespace-pre-wrap">{p.rules}</p>
                            </div>
                        )}

                        {/* Check-in Info */}
                        {p.checkInInfo && (
                            <div className="mb-8">
                                <h2 className="text-lg font-bold mb-3">Check-in Information</h2>
                                <p className="text-gray-700 whitespace-pre-wrap">{p.checkInInfo}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Booking Card */}
                    <div className="relative">
                        <div className="sticky top-32 border border-gray-200 rounded-2xl p-6 shadow-lg bg-white">
                            <div className="mb-4">
                                <span className="text-2xl font-black">₦{p.pricePerNight.toLocaleString()}</span>
                                <span className="text-gray-500"> / night</span>
                            </div>

                            {/* Date Inputs */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                                <div className="grid grid-cols-2 divide-x divide-gray-200">
                                    <div className="p-3">
                                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Check-in</label>
                                        <input
                                            type="date"
                                            value={bookingData.checkInDate}
                                            onChange={(e) => setBookingData({ ...bookingData, checkInDate: e.target.value })}
                                            min={p.checkInDate ? new Date(p.checkInDate).toISOString().split('T')[0] : undefined}
                                            className="w-full text-sm font-semibold outline-none"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Check-out</label>
                                        <input
                                            type="date"
                                            value={bookingData.checkOutDate}
                                            onChange={(e) => setBookingData({ ...bookingData, checkOutDate: e.target.value })}
                                            min={bookingData.checkInDate || undefined}
                                            className="w-full text-sm font-semibold outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 p-3">
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Guests</label>
                                    <select
                                        value={bookingData.numberOfGuests}
                                        onChange={(e) => setBookingData({ ...bookingData, numberOfGuests: parseInt(e.target.value) })}
                                        className="w-full text-sm font-semibold outline-none bg-transparent"
                                    >
                                        {Array.from({ length: p.maxGuests }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'guest' : 'guests'}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <Button onClick={handleBook} className="w-full bg-[#FF385C] hover:bg-[#D9324E] text-white border-none mb-3" size="lg">
                                Book This Apartment
                            </Button>

                            <p className="text-center text-xs text-gray-400">Contact information will be available after booking confirmation.</p>

                            {/* Price Breakdown */}
                            {(bookingData.checkInDate && bookingData.checkOutDate) && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>₦{p.pricePerNight.toLocaleString()} × {nights} nights</span>
                                        <span>₦{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Service fee (5%)</span>
                                        <span>₦{serviceFee.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                                        <span>Total</span>
                                        <span>₦{(totalPrice + serviceFee).toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Confirmation Modal */}
            {showBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
                    >
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-4">Confirm Booking</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-gray-500">Property</span><span className="font-semibold">{p.title}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-semibold">{p.area}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Check-in</span><span className="font-semibold">{bookingData.checkInDate}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Check-out</span><span className="font-semibold">{bookingData.checkOutDate}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Guests</span><span className="font-semibold">{bookingData.numberOfGuests}</span></div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>₦{(totalPrice + serviceFee).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setShowBooking(false)} disabled={isBooking}>Cancel</Button>
                            <Button className="flex-1 bg-[#008489] hover:bg-[#006b6e] text-white border-none" onClick={confirmBooking} disabled={isBooking}>
                                {isBooking ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                                {isBooking ? "Processing..." : "Confirm & Pay"}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
