"use client";

import { properties } from "@/app/data/properties";
import { Star, Shield, CheckCircle } from "lucide-react";
import Image from "next/image";
import PropertyCard from "@/app/components/features/PropertyCard";
import Button from "@/app/components/common/Button";
import { useParams } from "next/navigation";

export default function AgentProfile() {
    useParams(); // needed for Next.js routing context
    // In a real app, we'd fetch agent by ID. For demo, we use the first agent from properties.
    const agent = properties[0].agent;
    const agentProperties = properties; // Display all properties as if they belong to this agent for demo

    return (
        <div className="max-w-[1120px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-10 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Left Column: Agent Card */}
                <div className="md:col-span-1">
                    <div className="border border-gray-200 rounded-2xl p-6 shadow-card">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="relative w-32 h-32 mb-4">
                                <Image
                                    src={agent.avatar}
                                    alt={agent.name}
                                    fill
                                    className="rounded-full object-cover"
                                />
                                <div className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full border-4 border-white">
                                    <Shield size={16} />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold mb-1">{agent.name}</h1>
                            <div className="flex items-center gap-1 font-semibold text-sm">
                                <Star size={14} className="fill-black" />
                                <span>{agent.rating} Rating</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 py-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-green-600" />
                                <span>Identity verified</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-green-600" />
                                <span>Email confirmed</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="text-green-600" />
                                <span>Phone verified</span>
                            </div>
                        </div>

                        <Button className="w-full" variant="outline">Contact Agent</Button>
                    </div>
                </div>

                {/* Right Column: Listings */}
                <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold mb-6">{agent.name}&apos;s listings</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {agentProperties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
