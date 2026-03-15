"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/axios";
import {
    UserPlus,
    ArrowLeft,
    Mail,
    User,
    Shield,
    Lock,
    School,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import Button from "@/app/components/common/Button";

interface University {
    id: string;
    name: string;
}

export default function AdminCreateUserPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        role: "student" as "student" | "agent" | "admin",
        universityId: "",
    });

    const [universities, setUniversities] = useState<University[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const response = await api.get('/universities');
                setUniversities(response.data.data);
            } catch (error) {
                console.error("Error fetching universities:", error);
            }
        };
        fetchUniversities();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setIsLoading(true);

        try {
            const response = await api.post('/admin/users/create', formData);
            if (response.data.success) {
                setSuccess(true);
                setFormData({
                    fullName: "",
                    email: "",
                    password: "",
                    role: "student",
                    universityId: "",
                });
                setTimeout(() => router.push("/admin/users"), 2000);
            }
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(err.response?.data?.message || "Failed to create account");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/users" className="inline-flex items-center gap-2 text-gray-400 hover:text-black mb-4 font-bold text-[10px] uppercase tracking-[0.2em] transition-all">
                        <ArrowLeft size={16} />
                        Back to Registry
                    </Link>
                    <h1 className="text-4xl font-black tracking-tight">Identity Provisioning</h1>
                    <p className="text-gray-500 font-medium">Manually create secure access for students, agents, or staff.</p>
                </div>
                <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center text-primary shadow-2xl shadow-primary/5">
                    <UserPlus size={36} />
                </div>
            </div>

            {success && (
                <div className="bg-green-50 border-2 border-green-100 text-green-600 p-8 rounded-[32px] flex items-center gap-6 shadow-xl shadow-green-500/5 animate-in zoom-in duration-500">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-green-600">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="font-black text-lg tracking-tight">Account Provisioned Successfully</p>
                        <p className="font-bold text-sm text-green-500 italic text-center">Redirecting to registry management...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border-2 border-red-100 text-red-600 p-8 rounded-[32px] flex items-center gap-6 shadow-xl shadow-red-500/5 transition-all">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle size={24} />
                    </div>
                    <p className="font-extrabold text-sm uppercase tracking-tight">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-3 ml-2 group-focus-within:text-black transition-colors">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-black transition-colors" size={20} />
                            <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black/5 focus:ring-[12px] focus:ring-black/5 rounded-2xl py-5 pl-16 pr-8 transition-all duration-500 font-black text-base placeholder:text-gray-200"
                                placeholder="Legal full name"
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-3 ml-2 group-focus-within:text-black transition-colors">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-black transition-colors" size={20} />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black/5 focus:ring-[12px] focus:ring-black/5 rounded-2xl py-5 pl-16 pr-8 transition-all duration-500 font-black text-base placeholder:text-gray-200"
                                placeholder="user@example.com"
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-3 ml-2 group-focus-within:text-black transition-colors">Security Password</label>
                        <div className="relative">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-black transition-colors" size={20} />
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black/5 focus:ring-[12px] focus:ring-black/5 rounded-2xl py-5 pl-16 pr-8 transition-all duration-500 font-black text-base placeholder:text-gray-200"
                                placeholder="Min 8 chars"
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-3 ml-2">Access Level</label>
                        <div className="relative">
                            <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-black transition-colors" size={20} />
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })} // eslint-disable-line @typescript-eslint/no-explicit-any
                                className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black/5 focus:ring-[12px] focus:ring-black/5 rounded-2xl py-5 pl-16 pr-8 transition-all duration-500 font-black text-sm appearance-none cursor-pointer"
                            >
                                <option value="student">Student Account</option>
                                <option value="agent">Agent Account</option>
                                <option value="admin">Administrator Staff</option>
                            </select>
                        </div>
                    </div>
                </div>

                {formData.role === "student" && (
                    <div className="group animate-in slide-in-from-top-4 duration-500">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-3 ml-2 group-focus-within:text-black transition-colors">University Affiliation</label>
                        <div className="relative">
                            <School className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-black transition-colors" size={20} />
                            <select
                                value={formData.universityId}
                                onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                                className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black/5 focus:ring-[12px] focus:ring-black/5 rounded-2xl py-5 pl-16 pr-8 transition-all duration-500 font-black text-sm appearance-none cursor-pointer"
                            >
                                <option value="">Select University...</option>
                                {universities.map(uni => (
                                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-6 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                                Provisioning Identity...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={24} />
                                Confirm Deployment
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
