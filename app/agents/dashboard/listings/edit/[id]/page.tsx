"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/axios";
import { Upload, X, Home, MapPin, DollarSign, List, Bed, Bath, Video, Trash2, Play } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/app/lib/imageUrl";
import { categories } from "@/app/data/categories";

const PROPERTY_CATEGORIES = categories.filter(c => c.label !== "All").map(c => c.label);

export default function EditListingPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        location: "",
        category: "APARTMENT",
        bedrooms: "1",
        bathrooms: "1",
        roommatesAllowed: false
    });
    const [files, setFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [existingVideo, setExistingVideo] = useState<string | null>(null);
    const [newVideo, setNewVideo] = useState<File | null>(null);
    const [newVideoPreview, setNewVideoPreview] = useState<string | null>(null);
    const [previews, setPreviews] = useState<string[]>([]);

    useEffect(() => {
        fetchProperty();
    }, []);

    const fetchProperty = async () => {
        try {
            const response = await api.get(`/properties/${params.id}`);
            if (response.data.success) {
                const prop = response.data.data;
                setFormData({
                    title: prop.title,
                    description: prop.description,
                    price: prop.price,
                    location: prop.location,
                    category: prop.category,
                    bedrooms: prop.bedrooms,
                    bathrooms: prop.bathrooms,
                    roommatesAllowed: prop.roommatesAllowed
                });
                let imageList = [];
                try {
                    imageList = typeof prop.images === 'string'
                        ? JSON.parse(prop.images || '[]')
                        : (prop.images || []);
                } catch (e) {
                    console.error("Failed to parse images", e);
                }
                setExistingImages(imageList);
                setExistingVideo(prop.video || null);
            }
        } catch (err) {
            console.error("Failed to fetch property", err);
            setError("Failed to load property details");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
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

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 30 * 1024 * 1024) {
                alert("Video size must be less than 30MB");
                return;
            }
            setNewVideo(file);
            setNewVideoPreview(URL.createObjectURL(file));
        }
    };

    const removeNewVideo = () => {
        if (newVideoPreview) URL.revokeObjectURL(newVideoPreview);
        setNewVideo(null);
        setNewVideoPreview(null);
    };

    const removeExistingVideo = () => {
        setExistingVideo(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeNewImage = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value.toString());
            });

            files.forEach(file => {
                data.append('images', file);
            });

            if (newVideo) {
                data.append('video', newVideo);
            } else if (!existingVideo) {
                // If existing video was cleared and no new video provided
                data.append('video', '');
            }

            const response = await api.put(`/properties/${params.id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                router.push('/agents/dashboard/listings');
            }
        } catch (err: any) {
            console.error("Update failed", err);
            setError(err.response?.data?.message || "Failed to update listing");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
                    <p className="text-gray-600">Update property details.</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="text-gray-500 hover:text-gray-700 font-medium"
                >
                    Cancel
                </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>}

                {/* Simplified form fields (reusing layout from Create) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg bg-white"
                        >
                            {PROPERTY_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg"
                        />
                    </div>
                    <div className="col-span-2 space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Property Photos</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                            />

                            <div className="mt-6 flex flex-wrap gap-4">
                                {/* Existing Images */}
                                {existingImages.map((src, i) => (
                                    <div key={`existing-${i}`} className="relative w-28 h-28 group">
                                        <Image src={getImageUrl(src)} fill className="object-cover rounded-xl shadow-sm border border-gray-100" alt="Existing" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                            <span className="text-white text-[10px] font-bold uppercase tracking-wider">Kept</span>
                                        </div>
                                    </div>
                                ))}
                                {/* New Previews */}
                                {previews.map((src, i) => (
                                    <div key={`new-${i}`} className="relative w-28 h-28 group">
                                        <Image src={src} fill className="object-cover rounded-xl border-2 border-green-500 shadow-md" alt="New" />
                                        <button type="button" onClick={() => removeNewImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                <label className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all">
                                    <Upload size={20} className="text-gray-400 mb-1" />
                                    <span className="text-[10px] text-gray-500 font-bold uppercase">Add More</span>
                                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700">Virtual Tour Video</label>
                            <span className="text-xs text-gray-500 italic">Max size: 30MB</span>
                        </div>

                        {newVideoPreview || existingVideo ? (
                            <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-w-md border border-gray-200 shadow-lg group">
                                <video
                                    src={newVideoPreview || getImageUrl(existingVideo!)}
                                    controls
                                    className="w-full h-full"
                                />
                                <button
                                    type="button"
                                    onClick={newVideoPreview ? removeNewVideo : removeExistingVideo}
                                    className="absolute top-4 right-4 bg-red-500/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                                >
                                    <Trash2 size={18} />
                                </button>
                                {existingVideo && !newVideoPreview && (
                                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 uppercase tracking-widest">
                                        Current Video
                                    </div>
                                )}
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
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Save Changes</button>
                </div>
            </form>
        </div>
    );
}
