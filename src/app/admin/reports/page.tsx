'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Loader2 } from 'lucide-react';
import { Report, ReportCategory } from '@/types/reports';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    jasper_url: '',
    display_order: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const [reportsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/reports'),
        fetch('/api/categories'),
      ]);

      const reportsData = await reportsRes.json();
      const categoriesData = await categoriesRes.json();

      setReports(reportsData.reports);
      setCategories(categoriesData.categories);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (report?: Report) => {
    if (report) {
      setEditingReport(report);
      setFormData({
        title: report.title,
        description: report.description || '',
        category_id: report.categoryId || '',
        jasper_url: report.jasperUrl,
        display_order: report.displayOrder,
      });
    } else {
      setEditingReport(null);
      setFormData({
        title: '',
        description: '',
        category_id: '',
        jasper_url: '',
        display_order: 0,
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReport(null);
    setFormData({
      title: '',
      description: '',
      category_id: '',
      jasper_url: '',
      display_order: 0,
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'La catégorie est requise';
    }

    if (!formData.jasper_url.trim()) {
      newErrors.jasper_url = 'L\'URL JasperServer est requise';
    } else {
      try {
        new URL(formData.jasper_url);
      } catch {
        newErrors.jasper_url = 'URL invalide';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const url = editingReport
        ? `/api/admin/reports/${editingReport.id}`
        : '/api/admin/reports';

      const method = editingReport ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }

      await fetchData();
      closeModal();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setErrors({ submit: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      await fetchData();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Erreur lors de la suppression du rapport');
    }
  };

  const handleToggleActive = async (report: Report) => {
    try {
      const response = await fetch(`/api/admin/reports/${report.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...report,
          is_active: !report.is_active,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      await fetchData();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={48} className="text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className="container mx-auto px-4 py-8">
        {JSON.stringify(reports[0].is_active)}
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Gestion des Rapports</h1>
            <p className="mt-1 text-xl text-gray-600">
              {reports.length} rapport{reports.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Ajouter un rapport
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL Jasper
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucun rapport trouvé. Cliquez sur &quot;Ajouter un rapport&quot; pour commencer.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{report.title}</div>
                        {report.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {report.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {categories.find(c => c.id === report.categoryId)?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-md">
                        {report.jasperUrl}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(report)}
                        className={`px-2 py-1 text-xs rounded-full ${report.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {report.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openModal(report)} title="Modifier" className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(report.id)} className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors" title="Supprimer">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b flex items-center text-gray-700 justify-between bg-gradient-to-r from-blue-50 to-white">
                <h2 className="text-xl font-semibold">
                  {editingReport ? 'Modifier le rapport' : 'Nouveau rapport'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSaving}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Titre */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Titre du rapport <span className="text-red-500">*</span>
                    </label>
                    <input type="text" id="title" value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full pl-4 pr-4 py-2.5 text-sm font-semibold text-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      placeholder="Ex: Rapport mensuel des ventes"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                      placeholder="Description courte du rapport"
                      className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  {/* Catégorie */}
                  <div>
                    <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category_id" value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className={`w-full px-4 py-2.5 text-sm font-semibold text-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                    >
                      <option value="">-- Sélectionner une catégorie --</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                    )}
                  </div>

                  {/* URL JasperServer */}
                  <div>
                    <label htmlFor="jasper_url" className="block text-sm font-medium text-gray-700 mb-2">
                      URL JasperServer <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="jasper_url"
                      value={formData.jasper_url}
                      onChange={(e) => setFormData({ ...formData, jasper_url: e.target.value })}
                      className={`w-full pl-4 pr-4 py-2.5 text-sm font-semibold text-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      placeholder="http://localhost:8080/jasperserver/flow.html?_flowId=viewReportFlow&reportUnit=/reports/..."
                    />
                    {errors.jasper_url && (
                      <p className="mt-1 text-sm text-red-600">{errors.jasper_url}</p>
                    )}
                  </div>

                  {/* Erreur globale */}
                  {errors.submit && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{errors.submit}</p>
                    </div>
                  )}
                </div>
              </form>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
                <button type="button" onClick={closeModal} disabled={isSaving}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button onClick={handleSubmit} disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2">
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingReport ? 'Mettre à jour' : 'Créer'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}