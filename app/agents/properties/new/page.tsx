"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAgentPropertiesStore } from "../../stores/useAgentPropertiesStore";
import AgentSidebar from "../../components/AgentSidebar";
import { ArrowLeft, AlertCircle, Video, Trash2 } from "lucide-react";
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
    const [video, setVideo] = useState<File | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 100 * 1024 * 1024) {
                alert("Video size must be less than 100MB");
                return;
            }
            setVideo(file);
            setVideoPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeVideo = () => {
        if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
        setVideo(null);
        setVideoPreviewUrl(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (images.length === 0) {
            setSubmitError("Please upload at least one property image");
            return;
        }

        if (video && images.length === 0) {
            setSubmitError("You must upload at least one picture before adding a video");
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

        if (video) {
            data.append("video", video);
        }

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
                                maxImages={50}
                            />
                        </div>

                        {/* Video */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-lg">Property Video (Optional)</h2>
                                <span className="text-xs text-gray-500 italic">Max size: 100MB</span>
                            </div>
                            {videoPreviewUrl ? (
                                <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-w-md border border-gray-200 shadow-lg group">
                                    <video
                                        src={videoPreviewUrl}
                                        controls
                                        className="w-full h-full"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeVideo}
                                        className="absolute top-4 right-4 bg-red-500/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ) : (
                                <label className="border-2 border-dashed border-gray-300 rounded-xl py-12 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group max-w-md">
                                    <div className="bg-blue-50 p-3 rounded-full mb-3 group-hover:bg-blue-100 transition-colors">
                                        <Video className="text-blue-500" />
                                    </div>
                                    <span className="text-sm text-gray-700 font-semibold mb-1">Upload a virtual tour video</span>
                                    <span className="text-xs text-gray-500">MP4, WebM, OGG (Max 100MB)</span>
                                    <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                                </label>
                            )}
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
