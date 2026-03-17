'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Report } from '@/types/reports';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';

export default function ReportViewerPage() {
    const params = useParams();
    const router = useRouter();
    const [report, setReport] = useState<Report | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [iframeLoading, setIframeLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const fetchReport = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/reports/${params.id}`);
            if (!res.ok) {
                throw new Error('Rapport non trouvé');
            }

            const data = await res.json();
            setReport(data.report);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Une erreur inconnue est survenue');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 size={48} className="text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Chargement du rapport...</p>
                </div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'Rapport non trouvé'}</p>
                    <button
                        onClick={() => router.push('/reports')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retour aux rapports
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/reports')} className="text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-800">{report.title}</h1>
                        {report.description && (
                            <p className="text-sm text-gray-600">{report.description}</p>
                        )}
                    </div>
                </div>


                <a href={report.jasperUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Ouvrir dans un nouvel onglet
                    <ExternalLink size={16} />
                </a>
            </div>

            {/* Iframe Container */}
            <div className="flex-1 relative bg-gray-100">
                {iframeLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                        <div className="text-center">
                            <Loader2 size={48} className="text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Chargement de JasperServer...</p>
                        </div>
                    </div>
                )}

                <iframe
                    src={report.jasperUrl}
                    className="w-full h-full border-0"
                    title={report.title}
                    onLoad={() => setIframeLoading(false)}
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
                />
            </div>
        </div>
    );
}