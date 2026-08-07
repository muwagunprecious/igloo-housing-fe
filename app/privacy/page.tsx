"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-[#008489]/10 rounded-2xl flex items-center justify-center">
                        <Shield size={24} className="text-[#008489]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
                        <p className="text-xs text-gray-500">Last updated: August 2026</p>
                    </div>
                </div>

                <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
                    <section>
                        <h2 className="font-bold text-gray-900 text-base mb-2">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us when creating an account, making a booking, listing a property, or communicating with us. This includes your name, email address, phone number, and transaction details.</p>
                    </section>

                    <section>
                        <h2 className="font-bold text-gray-900 text-base mb-2">2. How We Use Your Information</h2>
                        <p>We use your information to facilitate student accommodation bookings, process payments via secure gateways (such as Paystack), verify booking arrival codes, provide customer support, and maintain platform security.</p>
                    </section>

                    <section>
                        <h2 className="font-bold text-gray-900 text-base mb-2">3. Payment Security &amp; Escrow</h2>
                        <p>All payments are securely processed. Funds are held in escrow until the student verifies arrival at the property using their unique 6-character booking code.</p>
                    </section>

                    <section>
                        <h2 className="font-bold text-gray-900 text-base mb-2">4. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us at support@igloo.ng.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
