"use client";

import { useEffect, useState } from "react";
import { useUniversityStore, University } from "@/app/stores/useUniversityStore";
import Button from "@/app/components/common/Button";
import { Edit2, Trash2, Plus, X } from "lucide-react";
import AuthGuard from "@/app/components/auth/AuthGuard";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminUniversitiesPage() {
    const { universities, fetchUniversities, createUniversity, updateUniversity, deleteUniversity, isLoading } = useUniversityStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUniversity, setEditingUniversity] = useState<University | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [abbr, setAbbr] = useState("");
    const [location, setLocation] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchUniversities();
    }, [fetchUniversities]);

    const openCreateModal = () => {
        setEditingUniversity(null);
        setName("");
        setAbbr("");
        setLocation("");
        setIsModalOpen(true);
    };

    const openEditModal = (uni: University) => {
        setEditingUniversity(uni);
        setName(uni.name);
        setAbbr(uni.abbr);
        setLocation(uni.location);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        let success = false;
        if (editingUniversity) {
            success = await updateUniversity(editingUniversity.id, { name, abbr, location });
        } else {
            success = await createUniversity({ name, abbr, location });
        }

        setIsSubmitting(false);
        if (success) {
            setIsModalOpen(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this university?")) {
            await deleteUniversity(id);
        }
    };

    return (
        <AuthGuard>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Manage Universities</h1>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2" size={18} />
                        Add University
                    </Button>
                </div>

                {isLoading && universities.length === 0 ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Abbreviation</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Location</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {universities.map((uni) => (
                                    <tr key={uni.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{uni.name}</td>
                                        <td className="px-6 py-4">{uni.abbr}</td>
                                        <td className="px-6 py-4">{uni.location}</td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(uni)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(uni.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {universities.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No universities found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <AnimatePresence>
                    {isModalOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                                onClick={() => setIsModalOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                            >
                                <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl pointer-events-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold">
                                            {editingUniversity ? "Edit University" : "Add University"}
                                        </h2>
                                        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">University Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="e.g. University of Lagos"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Abbreviation</label>
                                            <input
                                                type="text"
                                                required
                                                value={abbr}
                                                onChange={(e) => setAbbr(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="e.g. UNILAG"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Location</label>
                                            <input
                                                type="text"
                                                required
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="e.g. Akoka, Yaba"
                                            />
                                        </div>

                                        <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
                                            {isSubmitting ? "Saving..." : (editingUniversity ? "Update" : "Create")}
                                        </Button>
                                    </form>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </AuthGuard>
    );
}
