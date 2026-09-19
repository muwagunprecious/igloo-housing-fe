"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { igloo } from "@/app/assets";
import { motion } from "framer-motion";

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md flex flex-col items-center z-10"
            >
                {/* Logo & Header */}
                <div className="text-center mb-6">
                    <Link href="/" className="inline-flex items-center gap-2 mb-3 hover:opacity-90 transition">
                        <Image src={igloo} width={100} height={32} alt="Igloo logo" priority />
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Sign in to access your student or verified agent account
                    </p>
                </div>

                {/* Clerk SignIn */}
                <div className="w-full flex justify-center">
                    <SignIn
                        fallbackRedirectUrl="/auth/clerk-callback"
                        signUpUrl="/sign-up"
                    />
                </div>

                <div className="text-center mt-5">
                    <Link href="/" className="text-xs text-gray-500 hover:text-gray-900 transition font-medium">
                        ← Back to home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
