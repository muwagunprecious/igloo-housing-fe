"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAgentPropertiesStore } from "../../stores/useAgentPropertiesStore";
import AgentSidebar from "../../components/AgentSidebar";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import Button from "@/app/components/common/Button";
import ImageUploadField from "@/app/components/common/ImageUploadField";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { categories } from "@/app/data/categories";

const PROPERTY_CATEGORIES = categories.filter(c => c.label !== "All").map(c => c.label);

export default function AddPropertyPage() {
    const router = useRouter();
    const { addProperty, isLoading, error } = useAgentPropertiesStore();
    const { user } = useAuthStore();

    const [images, setImages] = useState<File[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        location: "",
        category: "Self-contained",
        bedrooms: "1",
        bathrooms: "1",
        rooms: "1",
        roommatesAllowed: false,
    });
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (images.length === 0) {
            setSubmitError("Please upload at least one property image");
            return;
        }

        // Create FormData for file upload
        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("location", formData.location);
        data.append("category", formData.category);
        data.append("bedrooms", formData.bedrooms);
        data.append("bathrooms", formData.bathrooms);
        data.append("rooms", formData.rooms);
        data.append("roommatesAllowed", formData.roommatesAllowed.toString());

        // Append all images
        images.forEach((image) => {
            data.append("images", image);
        });

        const success = await addProperty(data);
        if (success) {
            router.push("/agents/properties");
        } else {
            setSubmitError(error || "Failed to create property. Please try again.");
        }
    };

    return (
        <div className="max-w-[1920px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-[100px] pb-20">
            <div className="flex gap-8">
                <AgentSidebar />

                <div className="flex-1 min-w-0 max-w-3xl">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/agents/properties" className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-4">
                            <ArrowLeft size={20} />
                            Back to Properties
                        </Link>
                        <h1 className="text-3xl font-bold mb-2">Add New Property</h1>
                        <p className="text-gray-500">Fill in the details to list your property</p>
                    </div>

                    {/* Unverified Agent Warning */}
                    {user && !user.isVerified && (
                        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg flex items-center gap-2">
                            <AlertCircle size={20} />
                            <p>Your account must be verified by admin before you can upload properties.</p>
                        </div>
                    )}

                    {/* Error Display */}
                    {(submitError || error) && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
                            <AlertCircle size={20} />
                            <p>{submitError || error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <h2 className="font-semibold text-lg mb-4">Basic Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Property Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., Modern Studio Apartment near UNILAG"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Description *</label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe your property, its features, and amenities..."
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Address / Location *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g., 15 Akoka Road, Yaba, Lagos"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Price (₦ / Year) *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="120000"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Category *</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            {PROPERTY_CATEGORIES.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Bedrooms</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.bedrooms}
                                            onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Bathrooms</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.bathrooms}
                                            onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Available Rooms</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.rooms}
                                            onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="roommatesAllowed"
                                        checked={formData.roommatesAllowed}
                                        onChange={(e) => setFormData({ ...formData, roommatesAllowed: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                                    />
                                    <label htmlFor="roommatesAllowed" className="text-sm font-medium cursor-pointer">
                                        Allow roommate requests for this property
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <h2 className="font-semibold text-lg mb-4">Property Images *</h2>
                            <ImageUploadField
                                images={images}
                                onImagesChange={setImages}
                                maxImages={10}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Link href="/agents/properties" className="flex-1">
                                <Button variant="outline" className="w-full" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" className="flex-1" disabled={isLoading || !user?.isVerified}>
                                {isLoading ? "Creating..." : "Add Property"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
