'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Save, Loader2, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DecisionNoteEditorProps {
    clientId: string;
    projectId: string;
    initialNotes: string | null;
}

export default function DecisionNoteEditor({ clientId, projectId, initialNotes }: DecisionNoteEditorProps) {
    const t = useTranslations('Workspace');
    const [notes, setNotes] = useState(initialNotes || '');
    const [isSaving, setIsSaving] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (hasSaved) {
            const timer = setTimeout(() => setHasSaved(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [hasSaved]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('client_workspace_selections')
                .update({ notes: notes })
                .eq('client_id', clientId)
                .eq('project_id', projectId);

            if (error) throw error;
            setHasSaved(true);
        } catch (error) {
            console.error('Error saving notes:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Ghi chú của bạn</span>
                <button 
                    onClick={handleSave}
                    disabled={isSaving || notes === initialNotes}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                        hasSaved 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : (isSaving || notes === initialNotes)
                            ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                            : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    }`}
                >
                    {isSaving ? <Loader2 size={10} className="animate-spin" /> : hasSaved ? <Check size={10} /> : <Save size={10} />}
                    {isSaving ? 'Saving...' : hasSaved ? 'Saved' : 'Save'}
                </button>
            </div>
            <textarea 
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 min-h-[120px] resize-none transition-all"
                placeholder={t('personal_notes_placeholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
        </div>
    );
}
