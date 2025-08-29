import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Application } from '@/types/application';

interface ApplicationCardProps {
  application: Application;
  viewMode: 'grid' | 'list';
  onClick: (lien: string) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({application, viewMode, onClick}) => {
  const handleClick = () => {
    onClick(application.applink);
  };

  return (
    <div onClick={handleClick}
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-200 ${
        viewMode === 'list' ? 'flex items-center p-6' : 'p-6'
      }`}>
      {viewMode === 'grid' ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 truncate pr-2">
              {application.appname}
            </h3>
            <ExternalLink className="w-5 h-5 text-blue-500 flex-shrink-0" />
          </div>
          <p className="text-gray-600 mb-4 line-clamp-3">
            {application.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-600 font-medium truncate pr-2">
              {application.applink}
            </span>
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-2">
              <h3 className="text-xl font-semibold text-gray-800 mr-4 truncate">
                {application.appname}
              </h3>
              <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            </div>
            <p className="text-gray-600 mb-2 line-clamp-2">
              {application.description}
            </p>
            <span className="text-sm text-blue-600 font-medium truncate block">
              {application.applink}
            </span>
          </div>
          <ExternalLink className="w-5 h-5 text-blue-500 ml-4 flex-shrink-0" />
        </>
      )}
    </div>
  );
};

export default ApplicationCard;
