'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    jasper_url: '',
  });

  // Fetch data, create, update, delete handlers...
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestion des Rapports</h1>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus size={20} />
          Ajouter un rapport
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL Jasper</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reports.map((report: any) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{report.title}</td>
                <td className="px-6 py-4">{report.category_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                  {report.jasper_url}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Edit size={18} />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}