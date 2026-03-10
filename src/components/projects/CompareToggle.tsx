'use client';

import { useState, useEffect } from 'react';
import { Scale, Check } from 'lucide-react';

interface CompareToggleProps {
    project: {
        id: string;
        name: string;
    };
}

export default function CompareToggle({ project }: CompareToggleProps) {
    const [isSelected, setIsSelected] = useState(false);

    useEffect(() => {
        const checkSelection = () => {
            const saved = localStorage.getItem('preio_comparison_selection');
            if (saved) {
                try {
                    const selection = JSON.parse(saved);
                    setIsSelected(!!selection.find((p: any) => p.id === project.id));
                } catch (e) {}
            }
        };

        checkSelection();
        window.addEventListener('storage', checkSelection);
        // Custom event for same-window updates
        window.addEventListener('preio_selection_updated', checkSelection);

        return () => {
            window.removeEventListener('storage', checkSelection);
            window.removeEventListener('preio_selection_updated', checkSelection);
        };
    }, [project.id]);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Dispatch custom event to ComparisonManager
        const event = new CustomEvent('preio_toggle_compare', { detail: project });
        window.dispatchEvent(event);
        
        // Toggle local state (optimistic)
        setIsSelected(!isSelected);
        
        // Notify other toggles
        setTimeout(() => {
            window.dispatchEvent(new Event('preio_selection_updated'));
        }, 10);
    };

    return (
        <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                isSelected 
                    ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40' 
                    : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'
            }`}
        >
            <Scale size={12} className={isSelected ? 'text-yellow-500' : 'text-slate-600'} />
            <span className="text-[9px] font-black uppercase tracking-widest">
                {isSelected ? 'Ready for Comparison' : 'Select for Analysis'}
            </span>
        </button>
    );
}
