'use client'
import React, { useState } from 'react'
import AdminReportComponent from '../component/admin/reports'
import AdminCategoriesComponent from '../component/admin/categories'
import { Report, ReportCategory } from '@/types/reports'
import { SquareArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation';


const AdminPage: React.FC = () => {
    const router = useRouter();
    const [categories, setCategories] = useState<ReportCategory[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
    React.useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

            <div className="container mx-auto px-4 py-8 gap-5">
                <button onClick={() => router.back()} className={`rounded transition-colors bg-blue-500 text-white`} aria-label="Administration des rapports">
                    <SquareArrowLeft />
                </button>
                <AdminReportComponent categories={categories} reports={reports} isLoading={isLoading} fetchData={fetchData} />
                <AdminCategoriesComponent categories={categories} fetchCategories={fetchData} isLoading={isLoading} />
            </div>
        </div>
    )
}

export default AdminPage