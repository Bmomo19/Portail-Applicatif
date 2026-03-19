'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Loader2 } from 'lucide-react';
import { ReportCategory } from '@/types/reports';

interface AdminCategoriesComponentProps {
    categories: ReportCategory[];
    fetchCategories: () => Promise<void>;
    isLoading: boolean;
}

const AdminCategoriesComponent: React.FC<AdminCategoriesComponentProps> = ({ categories, fetchCategories, isLoading }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ReportCategory | null>(null);
    const [formData, setFormData] = useState({ name: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);



    const openModal = (category?: ReportCategory) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: ''
            });
        }
        setErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '' });
        setErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setErrors({ name: 'Le nom est requis' });
            return;
        }

        setIsSaving(true);

        try {
            const url = editingCategory
                ? `/api/admin/categories/${editingCategory.id}`
                : '/api/admin/categories';

            const method = editingCategory ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
            }

            await fetchCategories();
            closeModal();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setErrors({ submit: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (categoryId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/categories/${categoryId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error);
            }

            await fetchCategories();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            alert(error.message || 'Erreur lors de la suppression');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 size={48} className="text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Gestion des Catégories</h1>
                    <p className="mt-1 text-xl text-gray-600">
                        {categories.length} catégorie{categories.length > 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Ajouter une catégorie
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Nom
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Rapports
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                                <td className="px-6 py-4 text-gray-500">
                                    {category.report_count} - rapports
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <button onClick={() => openModal(category)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal similaire au modal des rapports */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                        <div className="px-6 py-4 border-b flex items-center text-gray-700 justify-between bg-gradient-to-r from-blue-50 to-white">
                            <h2 className="text-xl font-semibold">
                                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                            </h2>
                            <button onClick={closeModal} disabled={isSaving} className='text-gray-400 hover:text-gray-600 transition-colors'>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nom <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Ex: Caisses"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            {errors.submit && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{errors.submit}</p>
                                </div>
                            )}
                        </form>

                        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
                            <button onClick={closeModal} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" disabled={isSaving}>
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {editingCategory ? 'Mettre à jour' : 'Créer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCategoriesComponent;