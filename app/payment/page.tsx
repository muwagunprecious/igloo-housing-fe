"use client";

import { useRouter } from "next/navigation";
import BackButton from "@/app/components/common/BackButton";
import Button from "@/app/components/common/Button";
import { useState } from "react";
import { usePaymentStore } from "@/app/stores/usePaymentStore";
import { CreditCard, Building2, Wallet } from "lucide-react";

export default function PaymentPage() {
    const router = useRouter();
    const { amount, paymentMethod, setPaymentMethod, setCardDetails, completePayment } = usePaymentStore();
    const [cardData, setCardData] = useState({ name: '', number: '', expiry: '', cvv: '' });

    const handlePayment = () => {
        setCardDetails(cardData);
        completePayment();
        router.push("/receipt");
    };

    const methods = [
        { id: 'card', label: 'Card', icon: CreditCard },
        { id: 'bank', label: 'Bank Transfer', icon: Building2 },
        { id: 'wallet', label: 'Wallet', icon: Wallet },
    ];

    return (
        <div className="max-w-[600px] mx-auto px-4 pt-6 pb-20">
            <BackButton />

            <h1 className="text-3xl font-bold mt-6 mb-8">Payment</h1>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                <h2 className="font-semibold text-lg mb-4">Select Payment Method</h2>
                <div className="grid grid-cols-3 gap-4">
                    {methods.map((method) => (
                        <button
                            key={method.id}
                            onClick={() => setPaymentMethod(method.id as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
                            className={`p-4 border-2 rounded-xl transition flex flex-col items-center gap-2 ${paymentMethod === method.id
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-400'
                                }`}
                        >
                            <method.icon size={24} />
                            <span className="text-sm font-medium">{method.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {paymentMethod === 'card' && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                    <h2 className="font-semibold text-lg mb-4">Card Details</h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Cardholder Name"
                            value={cardData.name}
                            onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                        />
                        <input
                            type="text"
                            placeholder="Card Number"
                            value={cardData.number}
                            onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="MM/YY"
                                value={cardData.expiry}
                                onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                            />
                            <input
                                type="text"
                                placeholder="CVV"
                                value={cardData.cvv}
                                onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold">₦{amount.toLocaleString()}</span>
                </div>
            </div>

            <Button onClick={handlePayment} className="w-full" size="lg" disabled={!paymentMethod}>
                Complete Payment
            </Button>
        </div>
    );
}
