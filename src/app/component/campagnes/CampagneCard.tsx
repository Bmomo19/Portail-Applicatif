'use client';

import { Campagne } from '@/types/campagne';
import { Video, PlayCircle, Eye } from 'lucide-react';

interface CampagneCardProps {
  campagne: Campagne;
  viewMode: 'grid' | 'list';
  onOpen: () => void;
}

export function CampagneCard({ campagne, viewMode, onOpen }: CampagneCardProps) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow flex items-center gap-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
            <Video size={32} className="text-purple-600" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">{campagne.titre}</h3>
          <p className="text-gray-600">{campagne.description}</p>
          {typeof campagne.viewCount === 'number' && (
            <p className="text-sm text-gray-400 flex items-center gap-1 mt-2">
              <Eye size={14} />
              {campagne.viewCount} vue{campagne.viewCount > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <button onClick={onOpen} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
          Voir la vidéo
          <PlayCircle size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
        <Video size={24} className="text-purple-600" />
      </div>

      <h3 className="text-lg font-semibold mb-2 text-gray-800">{campagne.titre}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {campagne.description}
      </p>
      {typeof campagne.viewCount === 'number' && (
        <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
          <Eye size={12} />
          {campagne.viewCount} vue{campagne.viewCount > 1 ? 's' : ''}
        </p>
      )}

      <button onClick={onOpen} className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
        Voir la vidéo
        <PlayCircle size={16} />
      </button>
    </div>
  );
}
