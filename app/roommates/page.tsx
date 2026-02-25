"use client";

import { useState, useEffect } from "react";
import { User, Plus, X, MessageSquare, AlertCircle, Trash2, Users, Link as LinkIcon, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/app/components/common/Button";
import ImageUploadField from "@/app/components/common/ImageUploadField";
import { useRoommateStore, RoommateRequest } from "@/app/stores/useRoommateStore";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { toast } from "@/app/stores/useToastStore";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "@/app/lib/imageUrl";

export default function RoommatesPage() {
    const { feed, fetchFeed, requests: myRequests, fetchMyRequests, createRequest, deleteRequest, isLoading, error } = useRoommateStore();
    const { user, isAuthenticated } = useAuthStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filterGender, setFilterGender] = useState("");

    // Form State
    const [budget, setBudget] = useState("");
    const [roomType, setRoomType] = useState("Self-contain");
    const [genderPref, setGenderPref] = useState("");
    const [bio, setBio] = useState("");
    const [houseLink, setHouseLink] = useState("");
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user?.universityId) {
            fetchFeed({ genderPref: filterGender || undefined });
            fetchMyRequests();
        }
    }, [isAuthenticated, user?.universityId, filterGender, fetchFeed, fetchMyRequests]);

    const handleDeleteRequest = async (id: string) => {
        if (!confirm("Are you sure you want to delete this request?")) return;

        const success = await deleteRequest(id);
        if (success) {
            toast.success("Request deleted successfully");
            fetchMyRequests();
        } else {
            toast.error("Failed to delete request");
        }
    };

    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('budget', budget);
            formData.append('roomType', roomType);
            formData.append('genderPref', genderPref);
            formData.append('bio', bio);
            if (houseLink) formData.append('houseLink', houseLink);

            mediaFiles.forEach((file) => {
                formData.append('media', file);
            });

            const success = await createRequest(formData);
            if (success) {
                toast.success("Request posted successfully!");
                setShowCreateModal(false);
                setBudget("");
                setRoomType("Self-contain");
                setGenderPref("");
                setBio("");
                setHouseLink("");
                setMediaFiles([]);
                fetchFeed({ genderPref: filterGender || undefined });
                fetchMyRequests();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to post request");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-28 pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Find a Roommate</h1>
                    <p className="text-gray-500">Connect with students at your university</p>
                </div>
                {isAuthenticated && (
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="mr-2" size={18} />
                        Post Request
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="mb-8 flex gap-4">
                <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </div>

            {/* My Active Request */}
            {myRequests.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-xl font-bold mb-4">My Active Request</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myRequests.map((request) => (
                            <div key={request.id} className="bg-green-50 border border-green-200 rounded-2xl p-6 relative">
                                <button
                                    onClick={() => handleDeleteRequest(request.id)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Delete Request"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-700 font-bold text-lg shadow-sm">
                                        Me
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">My Request</h3>
                                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">{request.status}</span>
                                    </div>
                                </div>

                                <p className="text-gray-700 text-sm mb-4 line-clamp-2">{request.bio}</p>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Budget:</span>
                                        <span className="font-medium">₦{request.budget?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Looking for:</span>
                                        <span className="font-medium capitalize">{request.genderPref || "Any"} - {request.roomType}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Feed Section */}
            {!isAuthenticated ? (
                <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                    <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <User className="text-primary" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Sign in to find roommates</h3>
                        <p className="text-gray-500 mb-8">
                            To protect student privacy, the roommate feed is only available to verified students at their respective universities.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/login">
                                <Button className="w-full sm:w-auto px-8">Sign In</Button>
                            </Link>
                            <Link href="/signup">
                                <Button variant="outline" className="w-full sm:w-auto px-8">Create Account</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            ) : !user?.universityId ? (
                <div className="text-center py-20 bg-amber-50 rounded-2xl border border-amber-200">
                    <AlertCircle className="mx-auto mb-4 text-amber-500" size={48} />
                    <h3 className="text-lg font-semibold mb-2 text-amber-900">University Profile Incomplete</h3>
                    <p className="text-amber-700 mb-6">You need to select a university in your profile to view the roommates feed.</p>
                    <Link href="/dashboard">
                        <Button variant="outline">Update Profile</Button>
                    </Link>
                </div>
            ) : isLoading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading potential roommates...</p>
                </div>
            ) : feed.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 rounded-3xl border border-gray-200">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No roommates found yet</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                        There are currently no active roommate requests at your university. Be the first to post one!
                    </p>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="mr-2" size={18} />
                        Post a Request
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {feed.map((request) => (
                        <div key={request.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-card-hover transition-all duration-300 flex flex-col group">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="relative w-14 h-14 ring-2 ring-gray-50 rounded-full overflow-hidden">
                                    <Image
                                        src={request.user.avatar || "/placeholder-avatar.png"}
                                        alt={request.user.fullName}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-tight">{request.user.fullName}</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded">Active</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-4 flex-1 italic text-gray-600 text-sm border-l-2 border-primary/30">
                                "{request.bio || "Looking for a compatible roommate!"}"
                            </div>

                            {request.houseLink && (
                                <div className="mb-4">
                                    <a
                                        href={request.houseLink.startsWith('http') ? request.houseLink : `https://${request.houseLink}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-full"
                                    >
                                        <ExternalLink size={14} />
                                        View House Link
                                    </a>
                                </div>
                            )}

                            {(() => {
                                try {
                                    const mediaItems = request.media ? JSON.parse(request.media) : [];
                                    if (mediaItems.length === 0) return null;

                                    return (
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            {mediaItems.slice(0, 4).map((m: string, idx: number) => {
                                                const isVideo = m.match(/\.(mp4|webm|ogg)$/i);
                                                return (
                                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                                                        {isVideo ? (
                                                            <video src={getImageUrl(m)} className="object-cover w-full h-full" />
                                                        ) : (
                                                            <Image src={getImageUrl(m)} alt="Roommate Media" fill className="object-cover" />
                                                        )}
                                                        {idx === 3 && mediaItems.length > 4 && (
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm">
                                                                +{mediaItems.length - 4}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                } catch (e) {
                                    console.error("Failed to parse media", e);
                                    return null;
                                }
                            })()}

                            {request.property && (
                                <Link href={`/rooms/${request.property.id}`} className="mb-4 block group/prop">
                                    <div className="bg-white border border-gray-100 rounded-xl p-2 flex items-center gap-3 hover:border-primary/30 transition shadow-sm">
                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                            <Image
                                                src={getImageUrl(JSON.parse(request.property.images)[0])}
                                                alt={request.property.title}
                                                fill
                                                className="object-cover group-hover/prop:scale-110 transition-transform"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Interested in</p>
                                            <p className="text-xs font-bold text-gray-800 truncate">{request.property.title}</p>
                                        </div>
                                    </div>
                                </Link>
                            )}

                            <div className="space-y-3 text-sm mb-6 border-t border-gray-100 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Budget</span>
                                    <span className="font-bold text-primary">₦{request.budget?.toLocaleString() || "N/A"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Seeking</span>
                                    <span className="font-semibold text-gray-700 capitalize">{request.genderPref || "Any"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Room</span>
                                    <span className="font-semibold text-gray-700 capitalize">{request.roomType}</span>
                                </div>
                            </div>

                            <Link href={`/chat?userId=${request.userId}`} className="mt-auto">
                                <Button className="w-full shadow-sm hover:shadow-md">
                                    <MessageSquare className="mr-2" size={16} />
                                    Send Message
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Request Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                            onClick={() => setShowCreateModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                        >
                            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl pointer-events-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">Find a Roommate</h2>
                                    <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateRequest} className="space-y-4">
                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            {error}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Budget (₦)</label>
                                        <input
                                            type="number"
                                            required
                                            value={budget}
                                            onChange={(e) => setBudget(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="e.g. 150000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Preferred Room Type</label>
                                        <select
                                            value={roomType}
                                            onChange={(e) => setRoomType(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="">Any</option>
                                            <option value="Self-contain">Self-contain</option>
                                            <option value="Shared">Shared</option>
                                            <option value="Flat">Flat</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Gender Preference</label>
                                        <select
                                            value={genderPref}
                                            onChange={(e) => setGenderPref(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="">Any</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Short Bio</label>
                                        <textarea
                                            required
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary h-24"
                                            placeholder="Tell potential roommates about yourself..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">House Link (Optional)</label>
                                        <div className="relative">
                                            <LinkIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={houseLink}
                                                onChange={(e) => setHouseLink(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="Link to property or virtual tour (e.g. drive link)"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">House Images/Videos (Max 5)</label>
                                        <ImageUploadField
                                            images={mediaFiles}
                                            onImagesChange={setMediaFiles}
                                            maxImages={5}
                                        />
                                    </div>

                                    <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
                                        {isSubmitting ? "Posting..." : "Post Request"}
                                    </Button>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
