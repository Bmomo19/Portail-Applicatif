// src/app/reports/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Report } from '@/types/reports';
import { ArrowLeft, ExternalLink, Loader2, RefreshCw } from 'lucide-react';

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

    const handleRefresh = () => {
        setIframeLoading(true);
        const iframe = document.getElementById('jasper-iframe') as HTMLIFrameElement;
        if (iframe) {
            iframe.src = iframe.src;
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

    const url = new URL(report.jasperUrl);
    if (!url.searchParams.has('decor')) {
        url.searchParams.set('decor', 'no');
    }
    url.searchParams.set('j_username', process.env.JASPER_USERNAME || 'jasperadmin');
    url.searchParams.set('j_password', process.env.JASPER_PASSWORD || 'jasperadmin');

    const viewerUrl = url.toString();

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <div className="bg-white border-b shadow-sm px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/reports')} className="text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-lg" title="Retour">
                        <ArrowLeft size={20} />
                    </button>

                    <div className="border-l pl-4">
                        <h1 className="text-lg font-semibold text-gray-900">{report.title}</h1>
                        {report.description && (
                            <p className="text-sm text-gray-500">{report.description}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={handleRefresh} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Actualiser">
                        <RefreshCw size={20} />
                    </button>

                    <a href={viewerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm" >
                        <ExternalLink size={16} />
                        Nouvel onglet
                    </a>
                </div>
            </div>

            {/* Iframe Container */}
            <div className="flex-1 relative">
                {iframeLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                        <div className="text-center">
                            <Loader2 size={48} className="text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Chargement de JasperServer...</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Si le rapport ne s&apos;affiche pas, il faudra peut-être vous connecter à JasperServer
                            </p>
                        </div>
                    </div>
                )}

                <iframe id="jasper-iframe" src={viewerUrl} className="w-full h-full border-0" title={report.title} onLoad={() => setIframeLoading(false)} sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-popups-to-escape-sandbox allow-modals allow-top-navigation"/>
            </div>
        </div>
    );
}