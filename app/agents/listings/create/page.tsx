"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/useAuthStore";
import api from "@/app/lib/axios";
import { Upload, X, Home, MapPin, DollarSign, List, Bed, Bath } from "lucide-react";
import Image from "next/image";
import { categories } from "@/app/data/categories";

const PROPERTY_CATEGORIES = categories.filter(c => c.label !== "All").map(c => c.label);

export default function CreateListingPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        location: "",
        category: "Self-contained",
        bedrooms: "1",
        bathrooms: "1",
        roommatesAllowed: false
    });

    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target; // eslint-disable-line @typescript-eslint/no-unused-vars
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);

            // Create previews
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value.toString());
            });

            files.forEach(file => {
                data.append('images', file);
            });

            // Note: We don't append 'campus' or 'universityId' here because the backend 
            // automatically infers it from the logged-in agent's profile.

            const response = await api.post('/properties', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                router.push('/agents/dashboard');
            }
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error("Upload failed", err);
            setError(err.response?.data?.message || "Failed to create listing");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Post New Property</h1>
                <p className="text-gray-600">Share your available housing with students at your university.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-200">
                        {error}
                    </div>
                )}

                {/* Basic Info */}
                <section className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Property Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Listing Title</label>
                            <div className="relative">
                                <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Modern 2-Bedroom Apartment near Campus"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <div className="relative">
                                <List className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                >
                                    {PROPERTY_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price (per year)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    min="0"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 500000"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location/Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="location"
                                    required
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 15 University Road, Yaba"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                required
                                rows={4}
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe the property features, distance to campus, etc."
                                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            ></textarea>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Features & Amenities</h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                            <div className="relative">
                                <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    name="bedrooms"
                                    min="0"
                                    value={formData.bedrooms}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                            <div className="relative">
                                <Bath className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    name="bathrooms"
                                    min="0"
                                    value={formData.bathrooms}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex items-center h-full pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="roommatesAllowed"
                                    checked={formData.roommatesAllowed}
                                    onChange={handleCheckboxChange}
                                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-700">Roommates Allowed</span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Images */}
                <section className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Photos</h2>

                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                id="image-upload"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                    <Upload size={24} />
                                </div>
                                <span className="text-sm font-medium text-green-600">Click to upload photos</span>
                                <span className="text-xs text-gray-400">JPG, PNG, WebP up to 5MB each</span>
                            </label>
                        </div>

                        {/* Previews */}
                        {previews.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {previews.map((src, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                        <Image
                                            src={src}
                                            alt={`Preview ${index}`}
                                            fill
                                            className="object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <div className="pt-4 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? "Publishing..." : "Publish Listing"}
                    </button>
                </div>
            </form>
        </div>
    );
}
