// src/app/campagnes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Campagne } from '@/types/campagne';
import { Search, Grid, List, RefreshCw, Settings } from 'lucide-react';
import { CampagneCard } from '../component/campagnes/CampagneCard';

export default function CampagnesPage() {
    const router = useRouter();
    const [campagnes, setCampagnes] = useState<Campagne[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCampagnes();
    }, []);

    const fetchCampagnes = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/campagnes');
            const data = await res.json();
            setCampagnes(data.campagnes || []);
        } catch (err) {
            console.error('Erreur lors du chargement des campagnes:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCampagne = (id: number) => {
        router.push(`/campagnes/${id}`);
    };

    const filteredCampagnes = campagnes.filter(campagne =>
        campagne.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campagne.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Espace Communication</h1>
                    <p className="text-xl text-gray-600 mb-6">
                        Consultez les vidéos de communication interne
                    </p>
                </div>

                {/* Filtres */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher une video..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 font-semibold text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="flex bg-white rounded-lg p-1 border">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded transition-colors ${viewMode === 'grid'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            aria-label="Vue en grille"
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded transition-colors ${viewMode === 'list'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            aria-label="Vue en liste"
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        onClick={fetchCampagnes}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                        disabled={isLoading}
                        aria-label="Actualiser les videos"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Actualiser</span>
                    </button>
                    <div className="flex bg-white rounded-lg p-1 border">
                        <button
                            onClick={() => router.push('/campagnes/admin')}
                            className={`p-2 rounded transition-colors bg-blue-500 text-white`}
                            aria-label="Administration des videos"
                        >
                            <Settings />
                        </button>
                    </div>
                </div>

                {/* Liste des campagnes */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse" />
                        ))}
                    </div>
                ) : filteredCampagnes.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Aucune video trouvée
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                        : 'grid-cols-1'
                        }`}>
                        {filteredCampagnes.map(campagne => (
                            <CampagneCard key={campagne.id} campagne={campagne} viewMode={viewMode} onOpen={() => handleOpenCampagne(campagne.id)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
