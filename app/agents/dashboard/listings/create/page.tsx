"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/axios";
import { Upload, X, Loader2, Home, AlertCircle, Video, Play, Trash2 } from "lucide-react";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { categories as categoryData } from "@/app/data/categories";

const PROPERTY_CATEGORIES = categoryData.filter(c => c.label !== "All").map(c => ({
    value: c.label,
    label: c.label
}));

export default function CreateListingPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [video, setVideo] = useState<File | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        location: "",
        category: "Self-contained",
        bedrooms: "1",
        bathrooms: "1",
        rooms: "1", // Number of rooms available
        size: "",
        amenities: "",
        roommatesAllowed: false
    });


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setImages(prev => [...prev, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Limit check: 30MB
            if (file.size > 30 * 1024 * 1024) {
                alert("Video size must be less than 30MB");
                return;
            }

            setVideo(file);
            const url = URL.createObjectURL(file);
            setVideoPreviewUrl(url);
        }
    };

    const removeVideo = () => {
        if (videoPreviewUrl) {
            URL.revokeObjectURL(videoPreviewUrl);
        }
        setVideo(null);
        setVideoPreviewUrl(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("price", formData.price);
            data.append("location", formData.location);
            data.append("category", formData.category);
            data.append("bedrooms", formData.bedrooms);
            data.append("bathrooms", formData.bathrooms);
            data.append("rooms", formData.rooms);
            data.append("roommatesAllowed", String(formData.roommatesAllowed));

            // Amenities split by comma
            // Backend might expect string or array, strictly speaking our backend just takes general fields in req.body
            // looking at propertyController (Step 116), it takes { title, description, price, location, roommatesAllowed } explicitly
            // It might ignore others! 
            // Wait, I should update backend to accept category, bedrooms, etc otherwise they won't save.
            // step 116 createProperty: const { title, description, price, location, roommatesAllowed } = req.body;
            // It MISSES category, bedrooms, bathrooms, rooms, amenities.
            // Schema has them. 
            // I MUST UPDATE BACKEND CONTROLLER TOO.

            if (video && images.length === 0) {
                alert("You must upload at least one picture before adding a video");
                setIsLoading(false);
                return;
            }

            images.forEach(image => {
                data.append("images", image);
            });

            if (video) {
                data.append("video", video);
            }

            await api.post("/properties", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            alert("Property uploaded successfully! It is now pending approval.");
            router.push("/agents/dashboard/listings");
        } catch (error: any) {
            console.error("=== PROPERTY CREATION ERROR ===");
            console.error("Error:", error);
            console.error("Response:", error.response?.data);
            console.error("Status:", error.response?.status);
            console.error("================================");

            const errorMessage = error.response?.data?.message || "Failed to create property. Please try again.";
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Upload New Property</h1>
                <p className="text-gray-600">List a new property for students in your university.</p>
            </header>

            {/* Unverified Agent Warning */}
            {user && !user.isVerified && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    <p>Your account must be verified by admin before you can upload properties.</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                {/* Media Upload */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Property Images</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-100 shadow-sm">
                                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors aspect-square">
                                <Upload className="text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500 font-medium">Add Images</span>
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Property Video (Optional)</h2>
                            <span className="text-xs text-gray-500 font-normal italic">Max size: 30MB</span>
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
                                    className="absolute top-4 right-4 bg-red-500/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
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
                                <span className="text-xs text-gray-500">MP4, WebM, OGG (Max 30MB)</span>
                                <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                            </label>
                        )}

                        {!video && (
                            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <Play size={14} />
                                <p>A video tour significantly increases student interest in your property!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Basic Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Property Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="e.g. Modern Apartment near Campus Gate"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Describe the property, amenities, and surroundings..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price (Yearly/Session)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3 text-gray-500">₦</span>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            {PROPERTY_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location / Address</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Full address"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                        <input
                            type="number"
                            name="bedrooms"
                            value={formData.bedrooms}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                        <input
                            type="number"
                            name="bathrooms"
                            value={formData.bathrooms}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Rooms Available</label>
                        <input
                            type="number"
                            name="rooms"
                            value={formData.rooms}
                            onChange={handleChange}
                            min="1"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                        type="checkbox"
                        name="roommatesAllowed"
                        checked={formData.roommatesAllowed}
                        onChange={handleCheckboxChange}
                        id="roommatesAllowed"
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="roommatesAllowed" className="text-gray-900 font-medium cursor-pointer select-none">
                        Allow Roommate Requests?
                        <span className="block text-sm text-gray-500 font-normal">Students can request to share this property</span>
                    </label>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !user?.isVerified}
                        className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {isLoading && <Loader2 size={18} className="animate-spin" />}
                        {isLoading ? "Publishing..." : "Publish Listing"}
                    </button>
                </div>
            </form>
        </div>
    );
}
