"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-[#008489]/10 rounded-2xl flex items-center justify-center">
                        <FileText size={24} className="text-[#008489]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
                        <p className="text-xs text-gray-500">Last updated: August 2026</p>
                    </div>
                </div>

                <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
                    <section>
                        <h2 className="font-bold text-gray-900 text-base mb-2">1. Acceptance of Terms</h2>
                        <p>By accessing or using Igloo Estate, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
                    </section>

                    <section>
                        <h2 className="font-bold text-gray-900 text-base mb-2">2. Student Accommodation &amp; Post-UTME Stays</h2>
                        <p>Students must provide accurate registration details. Property owners must ensure listings accurately reflect the condition, amenities, and location of the property.</p>
                    </section>

                    <section>
                        <h2 className="font-bold text-gray-900 text-base mb-2">3. Escrow Verification Code Policy</h2>
                        <p>Payments for Post-UTME shortlet stays are held in escrow. Once a student inspects and confirms the property, providing their 6-character code to the landlord releases the funds. Refunds cannot be requested after the verification code is confirmed.</p>
                    </section>

                    <section>
                        <h2 className="font-bold text-gray-900 text-base mb-2">4. Cancellations &amp; Refunds</h2>
                        <p>Students may request a refund prior to arrival code verification. Approved refunds are credited back to the student's designated payment method.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
