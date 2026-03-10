'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChevronRight, Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StageUpdateProps {
    lifecycleId: string;
    currentStage: string;
    isAdmin: boolean;
}

const STAGES = [
    { id: 'research', label: 'Research' },
    { id: 'site_visit', label: 'Site Visit' },
    { id: 'reservation', label: 'Reservation' },
    { id: 'deposit', label: 'Deposit' },
    { id: 'contract', label: 'Contract Executed' },
    { id: 'payment', label: 'Final Payment' },
    { id: 'portfolio', label: 'Portfolio' }
];

export default function LifecycleStageUpdate({ lifecycleId, currentStage, isAdmin }: StageUpdateProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleUpdate = async (stage: string) => {
        setIsLoading(true);
        const { error } = await supabase
            .from('client_project_lifecycle')
            .update({ stage, updated_at: new Date().toISOString() })
            .eq('id', lifecycleId);
        
        if (!error) {
            router.refresh();
            setIsOpen(false);
        }
        setIsLoading(false);
    };

    if (!isAdmin) return null;

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-yellow-500 hover:bg-white/10 transition-all"
            >
                <Settings2 size={14} />
                Manage Transition
            </button>

            {isOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-56 glass border border-white/10 bg-slate-900 shadow-2xl rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-3 mb-2 border-b border-white/5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Select New Stage</span>
                    </div>
                    {STAGES.map(stage => (
                        <button
                            key={stage.id}
                            disabled={isLoading || stage.id === currentStage}
                            onClick={() => handleUpdate(stage.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                stage.id === currentStage 
                                    ? 'bg-yellow-500/10 text-yellow-500' 
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                            }`}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider">{stage.label}</span>
                            {stage.id !== currentStage && <ChevronRight size={12} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
