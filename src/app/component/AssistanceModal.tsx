'use client';
import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader, HelpCircle, AlertTriangle } from 'lucide-react';
import { DemandeAssistance } from '@/types/assistance';
import Modal from 'antd/es/modal/Modal';
import { Application } from '@/types/application';
import { fetchApplications } from '../services/ApplicationService';

interface AssistanceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AssistanceModal: React.FC<AssistanceModalProps> = ({ isOpen, onClose }) => {
    const [application, setApplication] = useState<Application[]>([]);
    const [formData, setFormData] = useState<DemandeAssistance>({
        type: 'assistance',
        nom: '',
        app: { id: 0, appname: '', description: '', applink: '' },
        sujet: '',
        description: '',
        priorite: 'normale'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {        
        fetchApplications(setLoading, setError, setApplication);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/assistance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'envoi de la demande');
            }

            setSuccess(true);
            setTimeout(() => {
                handleClose();
            }, 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            type: 'assistance',
            nom: '',
            app: { id: 0, appname: '', description: '', applink: '' },
            sujet: '',
            description: '',
            priorite: 'normale'
        });
        setError(null);
        setSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    if (success) {
        return (
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Demande envoyée !</h3>
                <p className="text-gray-600">
                    Votre demande a été enregistrée avec succès. Vous recevrez une confirmation par email.
                </p>
            </div>
        );
    }

    return (
        <Modal open={isOpen} centered closeIcon={false} onCancel={handleClose} footer={() => <>
            <div className="flex justify-end space-x-4 pt-4">
                <button onClick={handleSubmit} type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50">
                    {loading ? (
                        <>
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Envoi...</span>
                        </>
                    ) : (
                        <span>Envoyer la demande</span>
                    )}
                </button>
            </div>
        </>} className="p-0" title={<div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl flex justify-between items-center">
            <h2 className="text-2xl font-bold">Demande d&apos;assistance</h2>
            <button
                onClick={handleClose}
                className="text-white hover:bg-white hover:text-red-500 hover:bg-opacity-20 rounded-full p-2 transition-colors"
                aria-label="Fermer"
            >
                <X className="w-6 h-6" />
            </button>
        </div>}>
            <form className="space-y-3">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Type de demande */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Type de demande *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button type="button"
                            onClick={() => setFormData({ ...formData, type: 'assistance' })}
                            className={`p-4 rounded-lg border-2 transition-all ${formData.type === 'assistance'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            <HelpCircle className="w-8 h-8 mx-auto mb-2" />
                            <div className="font-semibold">Assistance</div>
                            <div className="text-xs text-gray-600">Besoin d&apos;aide</div>
                        </button>
                        <button type="button" onClick={() => setFormData({ ...formData, type: 'incident' })}
                            className={`p-4 rounded-lg border-2 transition-all ${formData.type === 'incident'
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                            <div className="font-semibold">Incident</div>
                            <div className="text-xs text-gray-700">Signaler un problème</div>
                        </button>
                    </div>
                </div>

                {/* Priorité */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Priorité *
                    </label>
                    <select value={formData.priorite} required
                        onChange={(e) => setFormData({ ...formData, priorite: e.target.value as 'basse' | 'normale' | 'haute' | 'urgente' })}
                        className="w-full text-gray-800 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        <option value="basse">Basse</option>
                        <option value="normale">Normale</option>
                        <option value="haute">Haute</option>
                        <option value="urgente">Urgente</option>
                    </select>
                </div>

                {/* Nom */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom complet *
                    </label>
                    <input type="text" value={formData.nom.toUpperCase()} required
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        className="w-full text-gray-800 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Application concernée *
                    </label>
                    <select value={JSON.stringify(formData.app)} required
                        onChange={(e) => setFormData({ ...formData, app: JSON.parse(e.target.value)})}
                        className="w-full text-gray-800 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        {
                            application.map((app) => (
                                <option key={app.id} value={JSON.stringify(app)}>{app.appname}</option>
                            ))
                        }
                    </select>
                </div>

                {/* Sujet */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sujet *
                    </label>
                    <input type="text" value={formData.sujet} required placeholder="Résumé de votre demande"
                        onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description *
                    </label>
                    <textarea value={formData.description} rows={5} required placeholder="Décrivez votre demande en détail..."
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    />
                </div>
            </form>
        </Modal>

    );
};

export default AssistanceModal;
