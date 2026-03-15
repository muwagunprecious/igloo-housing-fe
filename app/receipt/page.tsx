"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Button from "@/app/components/common/Button";
import { usePaymentStore } from "@/app/stores/usePaymentStore";
import { CheckCircle, Download } from "lucide-react";
import { motion } from "framer-motion";

export default function ReceiptPage() {
    const router = useRouter();
    const { transactionId, amount, duration } = usePaymentStore();

    useEffect(() => {
        if (!transactionId) {
            router.push("/");
        }
    }, [transactionId, router]);

    if (!transactionId) {
        return null;
    }

    return (
        <div className="max-w-[600px] mx-auto px-4 pt-10 pb-20">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center mb-8"
            >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
                <p className="text-gray-500">Your booking has been confirmed</p>
            </motion.div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                <h2 className="font-semibold text-lg mb-4">Receipt</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Transaction ID</span>
                        <span className="font-mono font-semibold">{transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Date</span>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Duration</span>
                        <span>{duration}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold text-lg">
                        <span>Amount Paid</span>
                        <span>₦{amount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => alert('PDF download (mock)')}>
                    <Download size={18} className="mr-2" />
                    Download PDF
                </Button>
                <Button className="flex-1" onClick={() => router.push("/dashboard")}>
                    Go to Dashboard
                </Button>
            </div>
        </div>
    );
}
