'use client';
import React from 'react';
import { Headphones } from 'lucide-react';

interface AssistanceCardProps {
  onClick: () => void;
  viewMode: 'grid' | 'list';
}

const AssistanceCard: React.FC<AssistanceCardProps> = ({ onClick, viewMode }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 border-purple-400 ${
        viewMode === 'list' ? 'flex items-center p-6' : 'p-6'
      }`}
    >
      {viewMode === 'grid' ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold truncate pr-2">
              Assistance
            </h3>
            <Headphones className="w-6 h-6 flex-shrink-0" />
          </div>
          <p className="mb-4 opacity-90">
            Besoin d&apos;aide ? Déclarez un incident ou demandez de l&apos;assistance à la DSI.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400 bg-white bg-opacity-20 px-3 py-1 rounded-full">
              Disponible 24/7
            </span>
            <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0 animate-pulse"></div>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-2">
              <h3 className="text-xl font-semibold mr-4 truncate">
                Assistance
              </h3>
              <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0 animate-pulse"></div>
            </div>
            <p className="opacity-90 mb-2">
              Besoin d&apos;aide ? Déclarez un incident ou demandez de l&apos;assistance.
            </p>
            <span className="text-sm text-gray-400 font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full inline-block">
              Disponible 24/7
            </span>
          </div>
          <Headphones className="w-6 h-6 ml-4 flex-shrink-0" />
        </>
      )}
    </div>
  );
};

export default AssistanceCard;