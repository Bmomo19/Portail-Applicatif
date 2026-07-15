// src/app/campagnes/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Campagne } from '@/types/campagne';
import { ArrowLeft, Loader2, AlertCircle, PlayCircle } from 'lucide-react';

export default function CampagneViewerPage() {
    const params = useParams();
    const router = useRouter();
    const [campagne, setCampagne] = useState<Campagne | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewId, setViewId] = useState<number | null>(null);

    useEffect(() => {
        fetchCampagne();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const fetchCampagne = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/campagnes/${params.id}`);
            if (!res.ok) {
                throw new Error('Campagne non trouvée');
            }
            const data = await res.json();
            setCampagne(data.campagne);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!nom.trim() || !prenom.trim() || !email.trim()) {
            setFormError('Nom, prénom et email sont requis');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/campagnes/${params.id}/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nomPrenom: `${nom.trim().toUpperCase()} ${prenom.trim()}`,
                    email: email.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erreur lors de l\'enregistrement');
            }

            setViewId(data.viewId);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 size={48} className="text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Chargement de la campagne...</p>
                </div>
            </div>
        );
    }

    if (error || !campagne) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'Campagne non trouvée'}</p>
                    <button
                        onClick={() => router.push('/campagnes')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retour aux campagnes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <div className="bg-white border-b shadow-sm px-6 py-3 flex items-center gap-4">
                <button onClick={() => router.push('/campagnes')} className="text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-lg" title="Retour">
                    <ArrowLeft size={20} />
                </button>
                <div className="border-l pl-4">
                    <h1 className="text-lg font-semibold text-gray-900">{campagne.titre}</h1>
                    {campagne.description && (
                        <p className="text-sm text-gray-500">{campagne.description}</p>
                    )}
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6">
                {viewId === null ? (
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Avant de visionner cette vidéo</h2>
                        <p className="text-gray-600 mb-6 text-sm">
                            Merci de renseigner vos coordonnées pour accéder à la campagne.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {formError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nom *
                                </label>
                                <input
                                    type="text"
                                    value={nom}
                                    required
                                    onChange={(e) => setNom(e.target.value)}
                                    className="w-full text-gray-800 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Prénom *
                                </label>
                                <input
                                    type="text"
                                    value={prenom}
                                    required
                                    onChange={(e) => setPrenom(e.target.value)}
                                    className="w-full text-gray-800 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    required
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full text-gray-800 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Envoi...</span>
                                    </>
                                ) : (
                                    <>
                                        <PlayCircle className="w-4 h-4" />
                                        <span>Regarder la vidéo</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                ) : (
                    <video
                        controls
                        autoPlay
                        className="w-full max-w-4xl max-h-[75vh] rounded-lg shadow-lg bg-black"
                        src={`/api/campagnes/${params.id}/stream?viewId=${viewId}`}
                    />
                )}
            </div>
        </div>
    );
}
