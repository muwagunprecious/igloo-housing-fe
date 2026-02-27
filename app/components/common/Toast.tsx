"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@/app/stores/useToastStore';

const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    warning: <AlertCircle className="text-amber-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
};

const bgColors = {
    success: 'bg-green-50/90 border-green-200/50',
    error: 'bg-red-50/90 border-red-200/50',
    warning: 'bg-amber-50/90 border-amber-200/50',
    info: 'bg-blue-50/90 border-blue-200/50',
};

export default function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map((t) => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className={`
                            pointer-events-auto
                            flex items-center gap-3 px-4 py-3.5 rounded-2xl border shadow-xl backdrop-blur-md
                            min-w-[320px] max-w-[420px]
                            ${bgColors[t.type]}
                        `}
                    >
                        <div className="flex-shrink-0">
                            {icons[t.type]}
                        </div>
                        <p className="text-sm font-medium text-gray-800 flex-1">
                            {t.message}
                        </p>
                        <button
                            onClick={() => removeToast(t.id)}
                            className="p-1 hover:bg-black/5 rounded-full transition text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
