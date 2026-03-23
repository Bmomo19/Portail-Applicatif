// src/app/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Report, ReportCategory } from '@/types/reports';
import { Search, Grid, List, RefreshCw, Settings } from 'lucide-react';
import { ReportCard } from '../component/reports/ReportCard';
import { CategoryFilter } from '../component/reports/CategoryFilter';

export default function ReportsPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<ReportCategory[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
        fetchReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory]);

    const fetchCategories = async () => {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data.categories);
    };

    const fetchReports = async () => {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.append('categoryId', selectedCategory);

        const res = await fetch(`/api/reports?${params}`);
        const data = await res.json();
        setReports(data.reports);
        setIsLoading(false);
    };

    const handleOpenReport = (reportId: string) => {
        router.push(`/reports/${reportId}`);
    };

    const filteredReports = reports?.filter(report =>
        report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedReports = categories?.map(category => ({
        category,
        reports: filteredReports?.filter(r => r.categoryId === category.id),
    })).filter(group => group.reports?.length > 0);

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Espaces reporting</h1>
                    <p className="text-xl text-gray-600 mb-6">
                        Consultez vos rapports par catégorie
                    </p>
                </div>

                {/* Filtres */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher un rapport..."
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
                    {/* Bouton refresh */}

                    <button
                        onClick={fetchReports}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                        disabled={isLoading}
                        aria-label="Actualiser les rapports"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Actualiser</span>
                    </button>
                    <div className="flex bg-white rounded-lg p-1 border">
                        <button
                            onClick={() => router.push('admin')}
                            className={`p-2 rounded transition-colors bg-blue-500 text-white`}
                            aria-label="Administration des rapports"
                        >
                            <Settings />
                        </button>
                    </div>
                </div>

                {/* Catégories */}
                <CategoryFilter categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

                {/* Liste des rapports */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse" />
                        ))}
                    </div>
                ) : groupedReports?.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Aucun rapport trouvé
                    </div>
                ) : (
                    <div className="space-y-8">
                        {groupedReports?.map(({ category, reports }) => (
                            <div key={category.id}>
                                <h2 className="text-2xl font-semibold text-black mb-4 flex items-center gap-2">
                                    {category.name}
                                    <span className="text-sm text-gray-500 font-normal">
                                        ({reports.length})
                                    </span>
                                </h2>

                                <div className={`grid gap-6 ${viewMode === 'grid'
                                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                    : 'grid-cols-1'
                                    }`}>
                                    {reports.map(report => (
                                        <ReportCard key={report.id} report={report} viewMode={viewMode} onOpen={() => handleOpenReport(report.id)} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}