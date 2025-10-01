'use client';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { RefreshCw, Search, Grid, List, AlertCircle, Loader } from 'lucide-react';
import { Application } from '@/types/application';
import ApplicationCard from '@/app/component/ApplicationCard';
import ScrollingMessages from '@/app/component/ScrollingMessages';
import Image from 'next/image';
import AssistanceCard from './component/AssistanceCard';
import AssistanceModal from './component/AssistanceModal';
import { fetchApplications } from './services/ApplicationService';


const HomePage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAssistanceModal, setShowAssistanceModal] = useState(false);



  useEffect(() => {
    fetchApplications(setLoading, setError, setApplications);
  }, []);

  const filteredApplications = applications.filter(app =>
    app.appname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAppClick = (lien: string) => {
    window.open(lien, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Portail d&apos;Applications - Chargement...</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg text-gray-600">Chargement des applications...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Portail d&apos;Applications Phoenix</title>
        <meta name="description" content="Portail centralisé pour accéder à toutes vos applications" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className='justify-items-center mb-4'>
              <Image alt='fidra' src='/logo_fidra.png' width={200} height={100} />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Portail Applicatif Phoenix
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Accédez rapidement à toutes les plateformes
            </p>

            {/* Messages défilants */}
            <ScrollingMessages className="mb-6 max-w-full mx-auto" />

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 max-w-2xl mx-auto flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Contrôles */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
            {/* Barre de recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une application..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 font-semibold text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="flex items-center space-x-4">
              {/* Toggle vue */}
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
              <button aria-label="Actualiser les applications" disabled={loading} onClick={()=>fetchApplications(setLoading, setError, setApplications)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
            </div>
          </div>

          {/* Liste des applications */}
          {filteredApplications.length === 0 && !loading ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">
                {searchTerm ? 'Aucune application trouvée pour cette recherche' : 'Aucune application disponible'}
              </p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              <AssistanceCard
                onClick={() => setShowAssistanceModal(true)}
                viewMode={viewMode}
              />
              {filteredApplications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  viewMode={viewMode}
                  onClick={handleAppClick}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-16 text-center text-gray-500">
            <p>
              {filteredApplications.length} application(s)
              {searchTerm && ` trouvée(s) pour "${searchTerm}"`}
            </p>
          </div>
        </div>
      </div>
      <AssistanceModal
        isOpen={showAssistanceModal}
        onClose={() => setShowAssistanceModal(false)}
      />
    </>
  );
};

export default HomePage;