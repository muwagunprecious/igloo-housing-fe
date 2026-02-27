"use client";

import { useEffect, useState } from "react";
import { User, Loader2, CheckCircle2, AlertCircle, School, Mail } from "lucide-react";
import Button from "@/app/components/common/Button";
import api from "@/app/lib/axios";
import { useAuthStore } from "@/app/stores/useAuthStore";

export default function PersonalInfoSection() {
    const { user, updateUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingUniversities, setIsFetchingUniversities] = useState(true);
    const [universities, setUniversities] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        fullName: user?.name || "",
        bio: user?.bio || "",
        universityId: user?.universityId || "",
    });

    useEffect(() => {
        if (user && !formData.fullName && !formData.bio) {
            setFormData(prev => ({
                ...prev,
                fullName: user.name || "",
                bio: user.bio || "",
                universityId: user.universityId || "",
            }));
        }
    }, [user, formData.fullName, formData.bio]);

    useEffect(() => {
        fetchUniversities();
    }, []);

    const fetchUniversities = async () => {
        try {
            const response = await api.get("/university");
            if (response.data.success) {
                setUniversities(response.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch universities", err);
        } finally {
            setIsFetchingUniversities(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            const response = await api.put("/auth/profile", formData);
            if (response.data.success) {
                setSuccess("Profile updated successfully");
                // Update local auth store
                updateUser({
                    name: response.data.data.fullName,
                    bio: response.data.data.bio,
                    universityId: response.data.data.universityId,
                });
            }
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(err.response?.data?.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="text-primary" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Personal Information</h2>
                    <p className="text-sm text-gray-500">Update your personal details and university</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-600 text-sm animate-in fade-in slide-in-from-top-1">
                        <CheckCircle2 size={18} />
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                                <Mail size={14} className="text-gray-400" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                disabled
                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed"
                                value={user?.email || ""}
                            />
                            <p className="text-[10px] text-gray-400 mt-1 italic">Email cannot be changed</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                                <School size={14} className="text-gray-400" />
                                University
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                value={formData.universityId}
                                onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                                disabled={isFetchingUniversities}
                            >
                                <option value="">Select your university</option>
                                {universities.map((uni) => (
                                    <option key={uni.id} value={uni.id}>
                                        {uni.name}
                                    </option>
                                ))}
                            </select>
                            {isFetchingUniversities && <p className="text-[10px] text-primary animate-pulse mt-1">Fetching universities...</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Bio</label>
                            <textarea
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                                placeholder="Tell us a bit about yourself..."
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-50">
                    <Button
                        type="submit"
                        className="px-8 py-4 rounded-xl flex items-center justify-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="animate-spin" size={20} />}
                        {isLoading ? "Saving changes..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </section>
    );
}
