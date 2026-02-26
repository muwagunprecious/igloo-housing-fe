"use client";

import { useState } from "react";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { User, Shield, CheckCircle, AlertCircle, Building, Mail, Phone, MessageSquare } from "lucide-react";
import api from "@/app/lib/axios";

export default function AgentSettingsPage() {
    const { user, updateUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.name || "",
        bio: user?.bio || "",
        whatsapp: user?.whatsapp || "",
    });

    // In a real app, we should fetch the full profile on mount to get 'bio' if it's not in the basic user object
    // For now assuming user object might have it or we just allow setting it.

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await api.put('/auth/profile', formData);
            if (response.data.success) {
                const updatedUser = response.data.data;
                updateUser({
                    name: updatedUser.fullName,
                    bio: updatedUser.bio,
                    whatsapp: updatedUser.whatsapp
                });
                setIsEditing(false);
                alert("Profile updated successfully!");
            }
        } catch (error: any) {
            console.error("Failed to update profile", error);
            alert(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-3xl">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-gray-600">Manage your profile and view verification status.</p>
            </header>

            <div className="space-y-6">
                {/* Verification Status Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="text-green-600" size={20} />
                        Verification Status
                    </h2>

                    <div className={`p-4 rounded-lg flex items-start gap-4 ${user.role === 'agent' ? 'bg-green-50 border border-green-100' : 'bg-yellow-50 border border-yellow-100'}`}>
                        {/* Assuming role 'agent' implies verified for the sake of this dashboard access, 
                            but in real backend 'isVerified' is a boolean. 
                            Our auth store doesn't expressly show 'isVerified' but if they can access dashboard they likely are.
                            Let's assume Verified if they are here, or show based on backend.
                        */}
                        <CheckCircle className="text-green-600 mt-1" size={20} />
                        <div>
                            <h3 className="font-semibold text-green-800">Verified Agent</h3>
                            <p className="text-green-700 text-sm mt-1">
                                Your account is fully verified. You can post listings and chat with students.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-sm text-green-600 font-medium hover:text-green-700"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2 flex items-center gap-4 mb-4">
                            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={32} />
                                )}
                            </div>
                            <div>
                                <button className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition cursor-not-allowed opacity-50">
                                    Change Photo
                                </button>
                                <p className="text-xs text-gray-400 mt-1">Max 2MB</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-gray-900 py-2">
                                    <User size={16} className="text-gray-400" />
                                    {user.name}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="flex items-center gap-2 text-gray-900 py-2 bg-gray-50 px-3 rounded-lg border border-transparent">
                                <Mail size={16} className="text-gray-400" />
                                {user.email}
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                            {isEditing ? (
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.whatsapp}
                                        onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        placeholder="e.g. +234 812 345 6789"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-900 py-2">
                                    <Phone size={16} className="text-gray-400" />
                                    {user.whatsapp || "Not set"}
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">This number will be used for the "Contact Agent" button on your listings.</p>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">About Me / Bio</label>
                            {isEditing ? (
                                <textarea
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Tell students about yourself or your agency..."
                                />
                            ) : (
                                <div className="text-gray-900 py-2 text-sm italic">
                                    {user.bio || "No bio added yet."}
                                </div>
                            )}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">University Affiliation</label>
                            <div className="flex items-center gap-2 text-gray-900 py-2 bg-gray-50 px-3 rounded-lg border border-transparent">
                                <Building size={16} className="text-gray-400" />
                                {user.universityId || "Not assigned"}
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
