"use client";

import { useParams, useRouter } from "next/navigation";
import { properties } from "@/app/data/properties";
import BackButton from "@/app/components/common/BackButton";
import Button from "@/app/components/common/Button";
import AuthGuard from "@/app/components/auth/AuthGuard";
import { useState } from "react";
import { usePaymentStore } from "@/app/stores/usePaymentStore";

export default function BookingPage() {
    const params = useParams();
    const router = useRouter();
    const property = properties.find((p) => p.id === params.id) || properties[0];
    const [duration, setDuration] = useState("1 semester");

    const setPropertyId = usePaymentStore((state) => state.setPropertyId);
    const setAmount = usePaymentStore((state) => state.setAmount);
    const setDurationStore = usePaymentStore((state) => state.setDuration);

    const durations = [
        { label: "1 Semester", value: "1 semester", months: 6 },
        { label: "1 Year", value: "1 year", months: 12 },
        { label: "2 Years", value: "2 years", months: 24 },
    ];

    const selectedDuration = durations.find((d) => d.value === duration);
    const totalAmount = (property?.price || 0) * (selectedDuration?.months || 6);

    // Handle case when property is not found
    if (!property) {
        return (
            <AuthGuard>
                <div className="max-w-[800px] mx-auto px-4 pt-6 pb-20">
                    <BackButton />
                    <div className="text-center mt-20">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
                        <p className="text-gray-600 mb-6">The property you&apos;re looking for doesn&apos;t exist or is no longer available.</p>
                        <Button onClick={() => router.push("/search")} size="lg">
                            Browse Properties
                        </Button>
                    </div>
                </div>
            </AuthGuard>
        );
    }

    const handleProceedToPayment = () => {
        setPropertyId(property.id);
        setAmount(totalAmount);
        setDurationStore(duration);
        router.push("/payment");
    };

    return (
        <AuthGuard>
            <div className="max-w-[800px] mx-auto px-4 pt-6 pb-20">
                <BackButton />

                <h1 className="text-3xl font-bold mt-6 mb-8">Confirm your booking</h1>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                    <h2 className="font-semibold text-lg mb-4">Property Details</h2>
                    <p className="text-gray-700">{property.title}</p>
                    <p className="text-gray-500 text-sm">{property.location.address}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                    <h2 className="font-semibold text-lg mb-4">Select Duration</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {durations.map((d) => (
                            <button
                                key={d.value}
                                onClick={() => setDuration(d.value)}
                                className={`p-4 border-2 rounded-xl transition ${duration === d.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-400'
                                    }`}
                            >
                                <div className="font-semibold">{d.label}</div>
                                <div className="text-sm text-gray-500">{d.months} months</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                    <h2 className="font-semibold text-lg mb-4">Price Breakdown</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Monthly rent</span>
                            <span>₦{property.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Duration</span>
                            <span>{selectedDuration?.months} months</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Service fee (5%)</span>
                            <span>₦{(totalAmount * 0.05).toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>₦{(totalAmount * 1.05).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <Button onClick={handleProceedToPayment} className="w-full" size="lg">
                    Proceed to Payment
                </Button>
            </div>
        </AuthGuard>
    );
}
