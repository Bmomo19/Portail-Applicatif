'use client';

import { ReportCategory } from '@/types/reports';
import { BarChart3 } from 'lucide-react';

interface CategoryFilterProps {
    categories: ReportCategory[];
    selected: string | null;
    onSelect: (categoryId: string | null) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
    return (
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-thin">
            <button
                onClick={() => onSelect(null)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${selected === null
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
            >
                <BarChart3 size={18} />
                Tous les rapports
            </button>

            {categories?.map((category) => {

                return (
                    <button
                        key={category.id}
                        onClick={() => onSelect(category.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${selected === category.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                    >
                        {category.name}
                    </button>
                );
            })}
        </div>
    );
}