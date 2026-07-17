'use client';

import { Campagne, CampagneView } from '@/types/campagne';
import { Loader2, Plus, Save, X, Eye, Users, Download } from 'lucide-react';
import React, { useState } from 'react';
import ExcelJS from 'exceljs';

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

    const [viewsCampagne, setViewsCampagne] = useState<Campagne | null>(null);
    const [views, setViews] = useState<CampagneView[]>([]);
    const [isViewsLoading, setIsViewsLoading] = useState(false);
    const [viewsError, setViewsError] = useState<string | null>(null);

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

            const response = await fetch('/api/admin/campagnes', {
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

    const openViewsModal = async (campagne: Campagne) => {
        setViewsCampagne(campagne);
        setViews([]);
        setViewsError(null);
        setIsViewsLoading(true);

        try {
            const res = await fetch(`/api/campagnes/${campagne.id}/views`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erreur lors du chargement des visionnages');
            }

            setViews(data.views || []);
        } catch (error) {
            setViewsError(error instanceof Error ? error.message : 'Erreur inconnue');
        } finally {
            setIsViewsLoading(false);
        }
    };

    const closeViewsModal = () => {
        setViewsCampagne(null);
        setViews([]);
        setViewsError(null);
    };

    const handleToggleActive = async (campagne: Campagne) => {
        try {
            const response = await fetch(`/api/admin/campagnes/${campagne.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isactif: !(campagne.isactif ?? true) }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour');
            }

            await fetchCampagnes();
        } catch (error) {
            console.error('Error toggling active:', error);
        }
    };

    const handleToggleDownload = async (campagne: Campagne) => {
        try {
            const response = await fetch(`/api/admin/campagnes/${campagne.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telechargementAutorise: !(campagne.telechargementAutorise ?? true) }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour');
            }

            await fetchCampagnes();
        } catch (error) {
            console.error('Error toggling download:', error);
        }
    };

    const exportViewsToExcel = async () => {
        if (!viewsCampagne || views.length === 0) return;

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Visionnages');

        sheet.columns = [
            { header: 'Nom et prénom', key: 'nomPrenom', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Nb vues', key: 'nbVue', width: 10 },
            { header: 'Dernier visionnage', key: 'dateView', width: 22 },
        ];
        sheet.getRow(1).font = { bold: true };

        views.forEach((v) => {
            sheet.addRow({
                nomPrenom: v.nomPrenom,
                email: v.email,
                nbVue: v.nbVue ?? 1,
                dateView: v.dateView ? new Date(v.dateView).toLocaleString('fr-FR') : '',
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeTitle = viewsCampagne.titre.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
        link.download = `visionnages_${safeTitle}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléchargement</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {campagnes.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    Aucune video trouvée. Cliquez sur &quot;Ajouter une video&quot; pour commencer.
                                </td>
                            </tr>
                        ) : (
                            campagnes.map((campagne) => (
                                <tr
                                    key={campagne.id}
                                    onClick={() => openViewsModal(campagne)}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    title="Voir la liste des visionnages"
                                >
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
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Users size={14} />
                                            {campagne.viewCount ?? 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleToggleActive(campagne); }}
                                            title={!campagne.isactif ? 'Cliquer pour activer' : 'Cliquer pour désactiver'}
                                            className={`px-2 py-1 text-xs rounded-full ${!campagne.isactif
                                                ? 'bg-gray-100 text-gray-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}
                                        >
                                            {!campagne.isactif ? 'Inactif' : 'Actif'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleToggleDownload(campagne); }}
                                            title={!campagne.telechargementAutorise ? 'Cliquer pour autoriser le téléchargement' : 'Cliquer pour bloquer le téléchargement'}
                                            className={`px-2 py-1 text-xs rounded-full ${!campagne.telechargementAutorise
                                                ? 'bg-gray-100 text-gray-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}
                                        >
                                            {!campagne.telechargementAutorise ? 'Bloqué' : 'Autorisé'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openViewsModal(campagne); }}
                                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors inline-flex"
                                            title="Voir la liste des visionnages"
                                        >
                                            <Eye size={18} />
                                        </button>
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

            {viewsCampagne && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeViewsModal}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b flex items-center text-gray-700 justify-between bg-linear-to-r from-blue-50 to-white">
                            <div>
                                <h2 className="text-xl font-semibold">Visionnages</h2>
                                <p className="text-sm text-gray-500">{viewsCampagne.titre}</p>
                            </div>
                            <button onClick={closeViewsModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {isViewsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 size={32} className="text-blue-600 animate-spin" />
                                </div>
                            ) : viewsError ? (
                                <p className="text-sm text-red-600">{viewsError}</p>
                            ) : views.length === 0 ? (
                                <p className="text-center text-gray-500 py-12">Cette vidéo n&apos;a pas encore été visionnée.</p>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom et prénom</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nb vues</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernier visionnage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {views.map((view) => (
                                            <tr key={view.id}>
                                                <td className="px-4 py-2 text-sm text-gray-900">{view.nomPrenom}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">{view.email}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">{view.nbVue ?? 1}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">
                                                    {view.dateView ? new Date(view.dateView).toLocaleString('fr-FR') : ''}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                {views.length} visionnage{views.length > 1 ? 's' : ''}
                            </p>
                            <button
                                onClick={exportViewsToExcel}
                                disabled={views.length === 0}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Download size={16} />
                                Exporter en Excel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCampagnesComponent;
