"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, MapPin, Users, BedDouble, DollarSign, Camera, X, Plus, Loader2, CheckCircle } from "lucide-react";
import Button from "@/app/components/common/Button";
import { usePostUtmeStore } from "@/app/stores/usePostUtmeStore";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { toast } from "@/app/stores/useToastStore";

const AMENITY_OPTIONS = [
    "Electricity", "Water", "WiFi", "Kitchen", "Air Conditioning", "Fan",
    "Bed", "Mattress", "Wardrobe", "Bathroom", "Parking", "Security", "Generator"
];

const INITIAL_FORM = {
    title: "", description: "", address: "", area: "", distanceFromOOU: "",
    pricePerNight: "", fullBookingPrice: "", totalRooms: "1", availableRooms: "1",
    totalBeds: "1", maxGuests: "1", checkInDate: "", checkOutDate: "",
    amenities: [] as string[], rules: "", checkInInfo: "",
};

export default function ListPropertyPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const { createProperty, isLoading } = usePostUtmeStore();
    const [form, setForm] = useState(INITIAL_FORM);
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [agreed, setAgreed] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Auth check moved to submit handler — form is accessible to everyone
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (images.length + files.length > 15) {
            toast.error("Maximum 15 images allowed");
            return;
        }
        setImages((prev) => [...prev, ...files]);
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target?.result as string]);
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (idx: number) => {
        setImages((prev) => prev.filter((_, i) => i !== idx));
        setPreviews((prev) => prev.filter((_, i) => i !== idx));
    };

    const toggleAmenity = (amenity: string) => {
        setForm((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter((a) => a !== amenity)
                : [...prev.amenities, amenity],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.info("Please sign in to submit your listing");
            router.push("/post-utme/signup");
            return;
        }
        if (images.length < 3) {
            toast.error("Please upload at least 3 images");
            return;
        }
        if (!agreed) {
            toast.error("Please confirm the listing information");
            return;
        }

        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("address", form.address);
        formData.append("area", form.area);
        formData.append("distanceFromOOU", form.distanceFromOOU);
        formData.append("pricePerNight", form.pricePerNight);
        formData.append("fullBookingPrice", form.fullBookingPrice);
        formData.append("totalRooms", form.totalRooms);
        formData.append("availableRooms", form.availableRooms);
        formData.append("totalBeds", form.totalBeds);
        formData.append("maxGuests", form.maxGuests);
        formData.append("checkInDate", form.checkInDate);
        formData.append("checkOutDate", form.checkOutDate);
        formData.append("amenities", JSON.stringify(form.amenities));
        formData.append("rules", form.rules);
        formData.append("checkInInfo", form.checkInInfo);
        images.forEach((img) => formData.append("images", img));

        const result = await createProperty(formData);
        if (result.success) {
            setSubmitted(true);
        } else {
            toast.error("Failed to submit property. Please try again.");
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Submitted!</h2>
                    <p className="text-gray-500 mb-6">Your listing has been submitted for review. Our team will verify it and you&apos;ll be notified once it&apos;s approved.</p>
                    <Button onClick={() => router.push("/dashboard/renter")} className="w-full" size="lg">Go to Dashboard</Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">List Your Apartment</h1>
                <p className="text-gray-500 text-sm mb-8">Fill in the details below to list your apartment for Post-UTME students.</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Property Info */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Home size={20} /> Property Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">House/Apartment Name *</label>
                                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#008489]/20 focus:border-[#008489]" placeholder="e.g. Sunshine Apartment" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Description *</label>
                                <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-[#008489]/20 focus:border-[#008489]" placeholder="Describe your apartment..." />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Full Address *</label>
                                <input type="text" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#008489]/20 focus:border-[#008489]" placeholder="e.g. 123 Lagos Road, Iba" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Area/Location *</label>
                                    <input type="text" required value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#008489]/20 focus:border-[#008489]" placeholder="e.g. Iba" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Distance from OOU</label>
                                    <input type="text" value={form.distanceFromOOU} onChange={(e) => setForm({ ...form, distanceFromOOU: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#008489]/20 focus:border-[#008489]" placeholder="e.g. 10 mins walk" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Room & Pricing */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Users size={20} /> Rooms & Pricing</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Total Rooms</label>
                                    <input type="number" min="1" value={form.totalRooms} onChange={(e) => setForm({ ...form, totalRooms: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Available Rooms</label>
                                    <input type="number" min="1" value={form.availableRooms} onChange={(e) => setForm({ ...form, availableRooms: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Total Beds</label>
                                    <input type="number" min="1" value={form.totalBeds} onChange={(e) => setForm({ ...form, totalBeds: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Max Guests</label>
                                    <input type="number" min="1" value={form.maxGuests} onChange={(e) => setForm({ ...form, maxGuests: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Price per Night (₦) *</label>
                                    <input type="number" required min="0" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none" placeholder="e.g. 5000" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Full Booking Price (₦)</label>
                                    <input type="number" min="0" value={form.fullBookingPrice} onChange={(e) => setForm({ ...form, fullBookingPrice: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none" placeholder="Optional" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Available Check-in Date</label>
                                    <input type="date" value={form.checkInDate} onChange={(e) => setForm({ ...form, checkInDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Available Check-out Date</label>
                                    <input type="date" value={form.checkOutDate} onChange={(e) => setForm({ ...form, checkOutDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100">
                        <h2 className="font-bold text-lg mb-4">Amenities</h2>
                        <div className="flex flex-wrap gap-2">
                            {AMENITY_OPTIONS.map((amenity) => (
                                <button
                                    key={amenity}
                                    type="button"
                                    onClick={() => toggleAmenity(amenity)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                                        form.amenities.includes(amenity)
                                            ? "bg-[#008489] text-white border-[#008489]"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-900"
                                    }`}
                                >
                                    {amenity}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rules & Check-in Info */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
                        <h2 className="font-bold text-lg">Rules & Check-in Info</h2>
                        <div>
                            <label className="block text-sm font-semibold mb-1">House Rules</label>
                            <textarea rows={3} value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none resize-none" placeholder="e.g. No smoking, quiet hours after 10pm..." />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Check-in Instructions</label>
                            <textarea rows={3} value={form.checkInInfo} onChange={(e) => setForm({ ...form, checkInInfo: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none resize-none" placeholder="e.g. Self check-in with lockbox, key under the mat..." />
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100">
                        <h2 className="font-bold text-lg mb-2 flex items-center gap-2"><Camera size={20} /> Property Images</h2>
                        <p className="text-gray-500 text-xs mb-4">Upload 3-15 high-quality images. Include exterior, living room, bedroom, bathroom, kitchen.</p>

                        {/* Preview Grid */}
                        {previews.length > 0 && (
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                                {previews.map((preview, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                                        <img src={preview} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <X size={14} className="text-white" />
                                        </button>
                                        {idx === 0 && (
                                            <span className="absolute bottom-1 left-1 bg-[#008489] text-white text-[9px] font-bold px-2 py-0.5 rounded">Main</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <label className="flex items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#008489] transition">
                            <Plus size={24} className="text-gray-400" />
                            <span className="text-sm text-gray-500 font-medium">Add Images ({images.length}/15)</span>
                            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                    </div>

                    {/* Agreement & Submit */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-4 h-4 rounded border-gray-300 text-[#008489] focus:ring-[#008489]" />
                            <span className="text-sm text-gray-600">
                                I confirm that I have permission to list this apartment and that all information provided is accurate.
                            </span>
                        </label>

                        <Button
                            type="submit"
                            disabled={isLoading || !agreed}
                            className="w-full mt-4 bg-[#008489] hover:bg-[#006b6e] text-white border-none"
                            size="lg"
                        >
                            {isLoading ? <><Loader2 size={18} className="animate-spin mr-2" /> Submitting...</> : "Submit Apartment for Review"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
