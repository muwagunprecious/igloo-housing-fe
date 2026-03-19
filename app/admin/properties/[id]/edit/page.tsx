"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePropertyStore } from "@/app/stores/usePropertyStore";
import { toast } from "@/app/stores/useToastStore";
import { ArrowLeft, Save, Building2, MapPin, DollarSign } from "lucide-react";
import Link from "next/link";
import Button from "@/app/components/common/Button";

export default function EditPropertyPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { currentProperty, fetchProperty, updateProperty, isLoading } = usePropertyStore();
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        location: "",
        category: "Self-contained",
        description: "",
        roommatesAllowed: false
    });

    // 1. Fetch the property when the page loads
    useEffect(() => {
        if (id) fetchProperty(id);
    }, [id, fetchProperty]);

    // 2. Pre-fill the form once the property data arrives
    useEffect(() => {
        if (currentProperty && currentProperty.id === id) {
            setFormData({
                title: currentProperty.title || "",
                price: currentProperty.price?.toString() || "",
                location: currentProperty.location || "",
                category: currentProperty.category || "Self-contained",
                description: currentProperty.description || "",
                roommatesAllowed: currentProperty.roommatesAllowed || false
            });
        }
    }, [currentProperty, id]);

    // 3. Handle the Save action
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const success = await updateProperty(id, {
            title: formData.title,
            price: Number(formData.price),
            location: formData.location,
            category: formData.category,
            description: formData.description,
            roommatesAllowed: formData.roommatesAllowed
        });

        setIsSaving(false);

        if (success) {
            toast.success("Property updated successfully!");
            router.push(`/rooms/${id}`); // Send them back to see their changes
        } else {
            toast.error("Failed to update property.");
        }
    };

    if (isLoading && !currentProperty) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href={`/rooms/${id}`}>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
                    <p className="text-sm text-gray-500">Update listing details for "{formData.title}"</p>
                </div>
            </div>

            {/* Form Container */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-sm">
                <form onSubmit={handleUpdate} className="space-y-6">
                    
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Building2 size={16} className="text-primary" /> Title
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                            placeholder="e.g. Luxury 2 Bedroom Apartment"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Price */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <DollarSign size={16} className="text-primary" /> Yearly Rent (₦)
                            </label>
                            <input
                                type="number"
                                required
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                placeholder="450000"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Property Type</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                            >
                                <option value="Self-contained">Self-contained</option>
                                <option value="Hostel">Hostel</option>
                                <option value="Flat">Flat / Apartment</option>
                                <option value="Luxury">Luxury</option>
                            </select>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <MapPin size={16} className="text-primary" /> Exact Location / Address
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                            placeholder="e.g. 12 University Road, Yaba"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                        <textarea
                            required
                            rows={5}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition resize-none"
                            placeholder="Describe the property, amenities, rules, etc..."
                        />
                    </div>

                    {/* Roommates Toggle */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <input
                            type="checkbox"
                            id="roommatesAllowed"
                            checked={formData.roommatesAllowed}
                            onChange={(e) => setFormData({ ...formData, roommatesAllowed: e.target.checked })}
                            className="w-5 h-5 accent-primary rounded border-gray-300"
                        />
                        <label htmlFor="roommatesAllowed" className="font-semibold text-gray-900 cursor-pointer select-none">
                            Allow students to send Roommate Requests for this property
                        </label>
                    </div>

                    {/* Submit Footer */}
                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                        <Link href={`/rooms/${id}`}>
                            <Button variant="outline" type="button">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={isSaving} className="min-w-[140px]">
                            {isSaving ? "Saving..." : <span className="flex items-center gap-2"><Save size={18} /> Save Changes</span>}
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
}