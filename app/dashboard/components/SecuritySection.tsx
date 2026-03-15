"use client";

import { useState } from "react";
import { Shield, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "@/app/components/common/Button";
import api from "@/app/lib/axios";

export default function SecuritySection() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (formData.newPassword !== formData.confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (formData.newPassword.length < 8) {
            setError("New password must be at least 8 characters long");
            return;
        }

        setIsLoading(true);
        try {
            await api.put("/auth/password", {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setSuccess("Password updated successfully");
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(err.response?.data?.message || "Failed to update password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="text-primary" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Login & Security</h2>
                    <p className="text-sm text-gray-500">Manage your password and protect your account</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md space-y-6">
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

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Current Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                            placeholder="Enter current password"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">New Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                            placeholder="Min 8 characters"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                            placeholder="Repeat new password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full py-4 rounded-xl flex items-center justify-center gap-2"
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="animate-spin" size={20} />}
                    {isLoading ? "Updating..." : "Update Password"}
                </Button>
            </form>
        </section>
    );
}
