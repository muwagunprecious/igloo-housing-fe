"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/app/stores/useAdminStore";
import { useAgentPropertiesStore } from "@/app/stores/useAgentPropertiesStore";
import { ArrowLeft, AlertCircle, User, Building2, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/app/components/common/Button";
import ImageUploadField from "@/app/components/common/ImageUploadField";
import { categories } from "@/app/data/categories";

const PROPERTY_CATEGORIES = categories.filter(c => c.label !== "All").map(c => c.label);

export default function AdminAddPropertyPage() {
    const router = useRouter();
    const { fetchUsers, users } = useAdminStore();
    const { addProperty, isLoading, error } = useAgentPropertiesStore();

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
        agentId: "",
    });
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [agentSearch, setAgentSearch] = useState("");

    useEffect(() => {
        fetchUsers({ role: "AGENT" });
    }, [fetchUsers]);

    // Filter implementation
    const search = agentSearch;

    const filteredAgents = users.filter(u =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (images.length === 0) {
            setSubmitError("Please upload at least one property image");
            return;
        }

        if (!formData.agentId) {
            setSubmitError("Please select an agent for this property");
            return;
        }

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
        data.append("agentId", formData.agentId);

        images.forEach((image) => {
            data.append("images", image);
        });

        const success = await addProperty(data);
        if (success) {
            router.push("/admin/properties?status=APPROVED");
        } else {
            setSubmitError(error || "Failed to create property.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/properties" className="inline-flex items-center gap-2 text-gray-400 hover:text-black mb-4 font-bold text-[10px] uppercase tracking-[0.2em] transition-all">
                        <ArrowLeft size={16} />
                        Back to Control Center
                    </Link>
                    <h1 className="text-4xl font-black tracking-tight">Listing Deployment</h1>
                    <p className="text-gray-500 font-medium">Provision and assign property assets to registered agents.</p>
                </div>
                <div className="w-20 h-20 bg-black rounded-[28px] flex items-center justify-center text-primary shadow-2xl shadow-black/20">
                    <Building2 size={36} />
                </div>
            </div>

            {(submitError || error) && (
                <div className="bg-red-50 border-2 border-red-100 text-red-600 p-8 rounded-[32px] flex items-center gap-6 shadow-xl shadow-red-500/5">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle size={24} />
                    </div>
                    <p className="font-extrabold text-sm uppercase tracking-tight">{submitError || error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm space-y-8">
                        <h2 className="text-2xl font-black tracking-tighter">Asset Specification</h2>

                        <div className="space-y-6">
                            <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-3 ml-2 group-focus-within:text-black transition-colors">Property Designation</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black/5 focus:ring-[12px] focus:ring-black/5 rounded-2xl py-5 px-8 transition-all duration-500 font-black text-lg placeholder:text-gray-200"
                                    placeholder="Enter authoritative title..."
                                />
                            </div>

                            <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-3 ml-2 group-focus-within:text-black transition-colors">Strategic Description</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={6}
                                    className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black/5 focus:ring-[12px] focus:ring-black/5 rounded-[24px] py-6 px-8 transition-all duration-500 font-bold text-base resize-none placeholder:text-gray-200 leading-relaxed"
                                    placeholder="Provide high-level property narrative..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-3 ml-2">Market Valuation (₦)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black/5 focus:ring-[12px] focus:ring-black/5 rounded-2xl py-5 px-8 transition-all duration-500 font-black text-xl"
                                        placeholder="1,500,000"
                                    />
                                </div>
                                <div className="group text-black">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-3 ml-2">Category Matrix</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-black/5 focus:ring-[12px] focus:ring-black/5 rounded-2xl py-5 px-8 transition-all duration-500 font-black text-sm appearance-none cursor-pointer"
                                    >
                                        {PROPERTY_CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black tracking-tighter">Media Repository</h2>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Max 10 Assets</span>
                        </div>
                        <ImageUploadField
                            images={images}
                            onImagesChange={setImages}
                            maxImages={10}
                        />
                    </div>
                </div>

                {/* Right Column: Agent & Meta */}
                <div className="space-y-8">
                    <div className="bg-black text-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h2 className="text-xl font-black mb-8 tracking-tighter flex items-center gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                Assigned Custodian
                            </h2>

                            <div className="relative mb-8 group/search">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/search:text-primary transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search Registry..."
                                    value={agentSearch}
                                    onChange={(e) => setAgentSearch(e.target.value)}
                                    className="w-full bg-white/5 border-transparent focus:bg-white/10 focus:ring-0 rounded-[20px] py-4 pl-14 pr-6 transition-all duration-500 text-sm font-black placeholder:text-gray-600"
                                />
                            </div>

                            <div className="max-h-[360px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {filteredAgents.length === 0 ? (
                                    <p className="text-center py-10 text-gray-600 font-bold text-xs uppercase italic">No agents indexed.</p>
                                ) : filteredAgents.map(agent => (
                                    <div
                                        key={agent.id}
                                        onClick={() => setFormData({ ...formData, agentId: agent.id })}
                                        className={`p-4 rounded-[22px] border-4 transition-all duration-500 cursor-pointer flex items-center gap-4 ${formData.agentId === agent.id
                                            ? "bg-primary border-primary text-black scale-[1.05]"
                                            : "bg-white/5 border-transparent hover:bg-white/10"
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl relative overflow-hidden flex-shrink-0 shadow-lg ${formData.agentId === agent.id ? "bg-black/10" : "bg-white/10"}`}>
                                            {agent.avatar ? <Image src={agent.avatar} alt={agent.fullName} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User size={20} /></div>}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black truncate tracking-tight">{agent.fullName}</p>
                                            <p className={`text-[9px] font-black uppercase tracking-widest ${formData.agentId === agent.id ? "text-black/50" : "text-gray-500"}`}>
                                                {agent.email}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm space-y-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-black tracking-tighter">Logistics</h3>
                            <div className="space-y-4">
                                <div className="group">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2 ml-1">Precise Location</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-gray-50 border-transparent rounded-2xl py-4 px-6 font-bold text-xs focus:bg-white transition-all"
                                        placeholder="Physical Address..."
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Co-habitation</span>
                                    <input
                                        type="checkbox"
                                        checked={formData.roommatesAllowed}
                                        onChange={(e) => setFormData({ ...formData, roommatesAllowed: e.target.checked })}
                                        className="w-6 h-6 rounded-lg border-gray-200 text-black focus:ring-black/5"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full py-6 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all" disabled={isLoading}>
                            {isLoading ? "Provisioning..." : "Execute Listing"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
