'use client';

import { Report } from '@/types/reports';
import { FileText, ExternalLink } from 'lucide-react';

interface ReportCardProps {
  report: Report;
  viewMode: 'grid' | 'list';
  onOpen: () => void;
}

export function ReportCard({ report, viewMode, onOpen }: ReportCardProps) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow flex items-center gap-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText size={32} className="text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">{report.title}</h3>
          <p className="text-gray-600">{report.description}</p>
        </div>
        
        <button onClick={onOpen} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          Consulter
          <ExternalLink size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
        <FileText size={24} className="text-blue-600" />
      </div>

      <h3 className="text-lg font-semibold mb-2 text-gray-800">{report.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {report.description}
      </p>

      <button onClick={onOpen} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
        Consulter
        <ExternalLink size={16} />
      </button>
    </div>
  );
}