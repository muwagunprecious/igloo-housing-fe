"use client";

import { useParams } from "next/navigation";
import { roommates } from "@/app/data/roommates";
import BackButton from "@/app/components/common/BackButton";
import Button from "@/app/components/common/Button";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default function RoommateProfilePage() {
    const params = useParams();
    const roommate = roommates.find((r) => r.id === params.id) || roommates[0];

    return (
        <div className="max-w-[800px] mx-auto px-4 pt-6 pb-20">
            <BackButton />

            <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-8">
                <div className="flex items-center gap-6 mb-6">
                    <div className="relative w-24 h-24">
                        <Image
                            src={roommate.avatar}
                            alt={roommate.name}
                            fill
                            className="rounded-full object-cover"
                        />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{roommate.name}</h1>
                        <p className="text-gray-500">
                            {roommate.age && `${roommate.age} years old • `}
                            {roommate.department} • {roommate.year}
                        </p>
                        {roommate.gender && (
                            <p className="text-sm text-gray-500 mt-1">{roommate.gender}</p>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="font-semibold mb-2">About</h2>
                    <p className="text-gray-700">{roommate.bio}</p>
                </div>

                <div className="mb-6">
                    <h2 className="font-semibold mb-2">Budget Range</h2>
                    <p className="text-gray-700">₦{roommate.budget[0].toLocaleString()} - ₦{roommate.budget[1].toLocaleString()} / year</p>
                </div>

                <div className="mb-6">
                    <h2 className="font-semibold mb-2">Room Preference</h2>
                    <p className="text-gray-700">{roommate.roomPreference}</p>
                </div>

                <div className="mb-6">
                    <h2 className="font-semibold mb-2">Lifestyle</h2>
                    <div className="flex flex-wrap gap-2">
                        {roommate.lifestyle.map((tag) => (
                            <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="font-semibold mb-2">Interests</h2>
                    <div className="flex flex-wrap gap-2">
                        {roommate.interests.map((interest) => (
                            <span key={interest} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>

                <Link href="/chat">
                    <Button className="w-full" size="lg">
                        <MessageSquare size={18} className="mr-2" />
                        Chat with {roommate.name.split(' ')[0]}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
