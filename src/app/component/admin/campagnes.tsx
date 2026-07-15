'use client';

import { Campagne } from '@/types/campagne';
import { Loader2, Plus, Save, X, Eye } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

interface AdminCampagnesComponentProps {
    campagnes: Campagne[];
    isLoading: boolean;
    fetchCampagnes: () => Promise<void>;
}

const ALLOWED_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];

const AdminCampagnesComponent: React.FC<AdminCampagnesComponentProps> = ({ campagnes, isLoading, fetchCampagnes }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ titre: '', description: '', userSaisie: '' });
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const openModal = () => {
        setFormData({ titre: '', description: '', userSaisie: '' });
        setVideoFile(null);
        setErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ titre: '', description: '', userSaisie: '' });
        setVideoFile(null);
        setErrors({});
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.titre.trim()) {
            newErrors.titre = 'Le titre est requis';
        }

        if (!formData.userSaisie.trim()) {
            newErrors.userSaisie = 'Votre email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userSaisie.trim())) {
            newErrors.userSaisie = 'Email invalide';
        }

        if (!videoFile) {
            newErrors.video = 'Le fichier vidéo est requis';
        } else {
            const ext = videoFile.name.slice(videoFile.name.lastIndexOf('.')).toLowerCase();
            if (!ALLOWED_EXTENSIONS.includes(ext)) {
                newErrors.video = `Format non supporté (${ALLOWED_EXTENSIONS.join(', ')})`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !videoFile) return;

        setIsSaving(true);

        try {
            const body = new FormData();
            body.append('titre', formData.titre.trim());
            body.append('description', formData.description.trim());
            body.append('userSaisie', formData.userSaisie.trim());
            body.append('video', videoFile);

            const response = await fetch('/api/campagnes', {
                method: 'POST',
                body,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de l\'envoi');
            }

            await fetchCampagnes();
            closeModal();
        } catch (error) {
            setErrors({ submit: error instanceof Error ? error.message : 'Erreur inconnue' });
        } finally {
            setIsSaving(false);
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
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Gestion des videos</h1>
                    <p className="mt-1 text-xl text-gray-600">
                        {campagnes.length} video{campagnes.length > 1 ? 's' : ''} au total
                    </p>
                </div>
                <button onClick={openModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors">
                    <Plus size={20} />
                    Ajouter une video
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ajoutée par</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vues</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {campagnes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    Aucune video trouvée. Cliquez sur &quot;Ajouter une video&quot; pour commencer.
                                </td>
                            </tr>
                        ) : (
                            campagnes.map((campagne) => (
                                <tr key={campagne.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{campagne.titre}</div>
                                        {campagne.description && (
                                            <div className="text-sm text-gray-500 truncate max-w-xs">{campagne.description}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{campagne.userSaisie}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {campagne.dateSaisie ? new Date(campagne.dateSaisie).toLocaleDateString('fr-FR') : ''}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{campagne.viewCount ?? 0}</td>
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/campagnes/${campagne.id}`}
                                            target="_blank"
                                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors inline-flex"
                                            title="Voir la video"
                                        >
                                            <Eye size={18} />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b flex items-center text-gray-700 justify-between bg-linear-to-r from-blue-50 to-white">
                            <h2 className="text-xl font-semibold">Nouvelle video</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors" disabled={isSaving}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-2">
                                        Titre <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" id="titre" value={formData.titre}
                                        onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                                        className={`w-full px-4 py-2.5 text-sm font-semibold text-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.titre ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                                        placeholder="Ex: Lancement du nouveau produit"
                                    />
                                    {errors.titre && <p className="mt-1 text-sm text-red-600">{errors.titre}</p>}
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea id="description" value={formData.description} rows={3}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Description courte de la campagne"
                                        className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="userSaisie" className="block text-sm font-medium text-gray-700 mb-2">
                                        Votre email <span className="text-red-500">*</span>
                                    </label>
                                    <input type="email" id="userSaisie" value={formData.userSaisie}
                                        onChange={(e) => setFormData({ ...formData, userSaisie: e.target.value })}
                                        className={`w-full px-4 py-2.5 text-sm font-semibold text-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.userSaisie ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                                        placeholder="prenom.nom@fidra.ci"
                                    />
                                    {errors.userSaisie && <p className="mt-1 text-sm text-red-600">{errors.userSaisie}</p>}
                                </div>

                                <div>
                                    <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-2">
                                        Fichier vidéo <span className="text-red-500">*</span>
                                    </label>
                                    <input type="file" id="video" accept="video/*"
                                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                        className={`w-full px-4 py-2.5 text-sm text-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.video ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Formats acceptés : {ALLOWED_EXTENSIONS.join(', ')}</p>
                                    {errors.video && <p className="mt-1 text-sm text-red-600">{errors.video}</p>}
                                </div>

                                {errors.submit && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-600">{errors.submit}</p>
                                    </div>
                                )}
                            </div>
                        </form>

                        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
                            <button type="button" onClick={closeModal} disabled={isSaving}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                Annuler
                            </button>
                            <button onClick={handleSubmit} disabled={isSaving}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2">
                                {isSaving ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Envoi...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Créer
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCampagnesComponent;
