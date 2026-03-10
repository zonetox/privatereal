'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Briefcase, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WorkspaceToggleProps {
    projectId: string;
    clientId: string;
    initialState?: boolean;
}

export default function WorkspaceToggle({ projectId, clientId, initialState = false }: WorkspaceToggleProps) {
    const [isAdded, setIsAdded] = useState(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        // Sync with server state if not provided initially
        if (initialState === undefined) {
            const checkStatus = async () => {
                const { data } = await supabase
                    .from('client_workspace_selections')
                    .select('id')
                    .eq('client_id', clientId)
                    .eq('project_id', projectId)
                    .maybeSingle();
                
                setIsAdded(!!data);
            };
            checkStatus();
        }
    }, [projectId, clientId, initialState, supabase]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        setIsLoading(true);
        
        if (isAdded) {
            // Remove
            const { error } = await supabase
                .from('client_workspace_selections')
                .delete()
                .eq('client_id', clientId)
                .eq('project_id', projectId);
            
            if (!error) {
                setIsAdded(false);
                router.refresh();
            }
        } else {
            // Add
            const { error } = await supabase
                .from('client_workspace_selections')
                .insert({
                    client_id: clientId,
                    project_id: projectId
                });
            
            if (!error) {
                setIsAdded(true);
                router.refresh();
            }
        }
        
        setIsLoading(false);
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
                isAdded 
                    ? 'bg-yellow-500 text-slate-950 border-yellow-500 shadow-lg shadow-yellow-500/20' 
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:border-white/20'
            }`}
        >
            {isAdded ? (
                <>
                    <Check size={14} className="animate-in zoom-in duration-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest">In Workspace</span>
                </>
            ) : (
                <>
                    <Briefcase size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Add to Workspace</span>
                </>
            )}
        </button>
    );
}
