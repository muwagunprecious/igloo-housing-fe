"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/axios";
import { Upload, X, Loader2, Home, AlertCircle, Video, Play, Trash2 } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { categories as categoryData } from "@/app/data/categories";
import { uploadFilesDirectly } from "@/app/lib/upload";

const PROPERTY_CATEGORIES = categoryData.filter(c => c.label !== "All").map(c => ({
    value: c.label,
    label: c.label
}));

export default function CreateListingPage() {
    const router = useRouter();
    const { user, checkAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);

    useEffect(() => {
        if (checkAuth) {
            checkAuth();
        }
    }, [checkAuth]);
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
        distanceFromSchool: "5 mins from school",
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

            // Limit check: 100MB
            if (file.size > 100 * 1024 * 1024) {
                alert("Video size must be less than 100MB");
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

        if (images.length === 0) {
            alert("Please upload at least one property image before publishing");
            return;
        }

        if (video && images.length === 0) {
            alert("You must upload at least one picture before adding a video");
            return;
        }

        setIsLoading(true);
        setUploadStatus("Uploading photos...");

        try {
            // Step 1: Upload images directly to Supabase Storage (bypasses Vercel 4.5MB limit)
            const uploadedImageUrls = await uploadFilesDirectly(images, (msg) => setUploadStatus(msg));

            // Step 2: Upload video tour directly to Supabase if present
            let uploadedVideoUrl: string | null = null;
            if (video) {
                setUploadStatus("Uploading video walkthrough...");
                const videoUrls = await uploadFilesDirectly([video], (msg) => setUploadStatus(msg));
                if (videoUrls.length > 0) {
                    uploadedVideoUrl = videoUrls[0];
                }
            }

            // Step 3: Create property listing via clean JSON payload
            setUploadStatus("Publishing listing details...");
            const payload = {
                title: formData.title,
                description: formData.description,
                price: formData.price,
                location: formData.location,
                campus: user?.universityId || "e433530e-7e3d-4a70-b25b-fdc9db5d0600",
                category: formData.category,
                distanceFromSchool: formData.distanceFromSchool,
                bedrooms: formData.bedrooms,
                bathrooms: formData.bathrooms,
                rooms: formData.rooms,
                roommatesAllowed: formData.roommatesAllowed,
                images: uploadedImageUrls,
                video: uploadedVideoUrl,
            };

            await api.post("/properties", payload);

            alert("Property uploaded successfully! It is now pending approval.");
            router.push("/agents/dashboard/listings");
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error("Property upload error:", err);
            const errorMessage =
                err.response?.data?.message ||
                (err.response?.data?.errors && typeof err.response.data.errors === "object"
                    ? Object.values(err.response.data.errors).join(". ")
                    : null) ||
                err.message ||
                "Failed to create property. Please try again.";
            alert(errorMessage);
        } finally {
            setIsLoading(false);
            setUploadStatus(null);
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
                <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-start gap-3 shadow-xs">
                    <AlertCircle size={22} className="text-amber-600 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-bold text-sm">Agent Verification Under Review</h4>
                        <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                            Your agent account is currently pending administrator verification. You will be able to publish property listings as soon as an administrator approves your account.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 min-w-0">
                {/* Media Upload */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Property Images</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-100 shadow-sm">
                                    <Image src={url} alt={`Preview ${index}`} fill className="object-cover" />
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
                            <span className="text-xs text-gray-500 font-normal italic">Max size: 100MB</span>
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
                                <span className="text-xs text-gray-500">MP4, WebM, OGG (Max 100MB)</span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Property Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm"
                            placeholder="e.g. Modern Apartment near Campus Gate"
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm"
                            placeholder="Describe the property, amenities, and surroundings..."
                        />
                    </div>

                    {/* Price & Category */}
                    <div className="col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Price (Yearly/Session)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-gray-500 font-bold">₦</span>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm bg-white"
                        >
                            {PROPERTY_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Distance & Location */}
                    <div className="col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Distance from School / Campus</label>
                        <select
                            name="distanceFromSchool"
                            value={formData.distanceFromSchool}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm bg-white"
                        >
                            <option value="5 mins from school">5 mins from school</option>
                            <option value="10 mins from school">10 mins from school</option>
                            <option value="15 mins from school">15 mins from school</option>
                            <option value="20 mins from school">20 mins from school</option>
                            <option value="25 mins from school">25 mins from school</option>
                            <option value="30+ mins from school">30+ mins from school</option>
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location / Address</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm"
                            placeholder="Full address"
                        />
                    </div>

                    {/* Specifications: Bedrooms, Bathrooms, Total Rooms */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms</label>
                                <input
                                    type="number"
                                    name="bedrooms"
                                    value={formData.bedrooms}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm"
                                    placeholder="e.g. 1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Bathrooms</label>
                                <input
                                    type="number"
                                    name="bathrooms"
                                    value={formData.bathrooms}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm"
                                    placeholder="e.g. 1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Rooms Available</label>
                                <input
                                    type="number"
                                    name="rooms"
                                    value={formData.rooms}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm"
                                    placeholder="e.g. 1"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
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

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto px-6 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors text-center"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !user?.isVerified}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {isLoading && <Loader2 size={18} className="animate-spin" />}
                        {isLoading ? (uploadStatus || "Publishing...") : !user?.isVerified ? "Pending Admin Approval" : "Publish Listing"}
                    </button>
                </div>
            </form>
        </div>
    );
}
