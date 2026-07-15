'use client'
import React, { useState } from 'react'
import AdminCampagnesComponent from '@/app/component/admin/campagnes'
import { Campagne } from '@/types/campagne'
import { SquareArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation';


const CampagnesAdminPage: React.FC = () => {
    const router = useRouter();
    const [campagnes, setCampagnes] = useState<Campagne[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCampagnes = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/admin/campagnes');
            const data = await res.json();
            setCampagnes(data.campagnes || []);
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchCampagnes();
    }, []);

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">

            <div className="container mx-auto px-4 py-8 gap-5">
                <button onClick={() => router.push('/campagnes')} className={`rounded transition-colors bg-blue-500 text-white`} aria-label="Retour à l'espace communication">
                    <SquareArrowLeft />
                </button>
                <AdminCampagnesComponent campagnes={campagnes} isLoading={isLoading} fetchCampagnes={fetchCampagnes} />
            </div>
        </div>
    )
}

export default CampagnesAdminPage
