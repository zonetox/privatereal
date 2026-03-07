'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, X, ArrowRight, MousePointer2 } from 'lucide-react';

interface ProjectCompact {
    id: string;
    name: string;
}

export default function ComparisonManager() {
    const [selectedProjects, setSelectedProjects] = useState<ProjectCompact[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const saved = localStorage.getItem('preio_comparison_selection');
        if (saved) {
            try {
                setSelectedProjects(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse comparison selection');
            }
        }

        const handleSetSelection = (e: Event) => {
            const project = (e as CustomEvent<ProjectCompact>).detail;
            setSelectedProjects(prev => {
                const isAlreadySelected = prev.find(p => p.id === project.id);
                let next;
                if (isAlreadySelected) {
                    next = prev.filter(p => p.id !== project.id);
                } else {
                    if (prev.length >= 3) return prev;
                    next = [...prev, project];
                }
                localStorage.setItem('preio_comparison_selection', JSON.stringify(next));
                return next;
            });
        };

        window.addEventListener('preio_toggle_compare', handleSetSelection);
        return () => window.removeEventListener('preio_toggle_compare', handleSetSelection);
    }, []);

    const removeProject = (id: string) => {
        setSelectedProjects(prev => {
            const next = prev.filter(p => p.id !== id);
            localStorage.setItem('preio_comparison_selection', JSON.stringify(next));
            return next;
        });
    };

    const handleCompare = () => {
        const ids = selectedProjects.map(p => p.id).join(',');
        router.push(`/dashboard/compare?ids=${ids}`);
        setIsOpen(false);
    };

    if (selectedProjects.length === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-500">
            <div className="glass rounded-[2rem] border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl p-2 flex items-center gap-4">
                <div className="flex items-center gap-2 pl-4 pr-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-slate-950">
                        <Scale size={16} />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {selectedProjects.map(project => (
                        <div key={project.id} className="h-12 px-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 group animate-in zoom-in duration-300">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 truncate max-w-[120px]">
                                {project.name}
                            </span>
                            <button 
                                onClick={() => removeProject(project.id)}
                                className="text-slate-600 hover:text-rose-500 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    
                    {[...Array(3 - selectedProjects.length)].map((_, i) => (
                        <div key={i} className="h-12 w-32 rounded-2xl border border-dashed border-white/10 flex items-center justify-center">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-700">Empty Slot</span>
                        </div>
                    ))}
                </div>

                <div className="pl-4 pr-1">
                    <button
                        onClick={handleCompare}
                        disabled={selectedProjects.length < 2}
                        className={`h-14 px-8 rounded-[1.5rem] flex items-center gap-3 transition-all duration-500 font-black uppercase tracking-widest text-xs ${
                            selectedProjects.length >= 2 
                                ? 'bg-yellow-500 text-slate-950 shadow-xl shadow-yellow-500/20 hover:scale-105 active:scale-95' 
                                : 'bg-white/5 text-slate-500 grayscale cursor-not-allowed opacity-50'
                        }`}
                    >
                        <span>Analyze & Compare</span>
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
