"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
    label?: string;
    href?: string;
}

export default function BackButton({ label = "Back", href }: BackButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (href) {
            router.push(href);
        } else {
            router.back();
        }
    };

    return (
        <button
            onClick={handleClick}
            className="flex items-center gap-2 text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition font-medium"
        >
            <ArrowLeft size={20} />
            <span>{label}</span>
        </button>
    );
}
