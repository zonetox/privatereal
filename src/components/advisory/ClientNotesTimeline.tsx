'use client';

import React, { useState } from 'react';
import { addAdvisorClientNoteAction } from '@/app/actions/advisor-actions';
import { Activity, Plus, ShieldCheck, Target, AlertTriangle, FileText, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Note {
    id: string;
    note_type: 'meeting' | 'strategy' | 'risk_alert' | 'general';
    content: string;
    action_items: string[];
    created_at: string;
}

interface ClientNotesTimelineProps {
    clientId: string;
    initialNotes: Note[];
}

export default function ClientNotesTimeline({ clientId, initialNotes }: ClientNotesTimelineProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [noteType, setNoteType] = useState<'meeting' | 'strategy' | 'risk_alert' | 'general'>('meeting');
    const [content, setContent] = useState('');
    const [actionItems, setActionItems] = useState<string[]>(['']);
    const router = useRouter();

    const handleAddActionItem = () => setActionItems([...actionItems, '']);
    
    const handleActionItemChange = (index: number, value: string) => {
        const newItems = [...actionItems];
        newItems[index] = value;
        setActionItems(newItems);
    };

    const handleRemoveActionItem = (index: number) => {
        const newItems = actionItems.filter((_, i) => i !== index);
        setActionItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const filledActionItems = actionItems.filter(item => item.trim() !== '');

        const result = await addAdvisorClientNoteAction({
            client_id: clientId,
            note_type: noteType,
            content,
            action_items: filledActionItems
        });

        if (result.success) {
            setContent('');
            setActionItems(['']);
            setShowForm(false);
            router.refresh();
        } else {
            console.error('Failed to add note:', result.error);
        }

        setIsSubmitting(false);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'meeting': return <Activity size={16} />;
            case 'strategy': return <Target size={16} />;
            case 'risk_alert': return <AlertTriangle size={16} />;
            default: return <FileText size={16} />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-100">
                    <ShieldCheck className="text-yellow-500" />
                    Strategic Advisory Notes
                </h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-slate-950 transition-colors rounded-lg text-sm font-bold tracking-widest uppercase"
                >
                    <Plus size={16} />
                    New Record
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="glass p-6 rounded-2xl border border-yellow-500/30 space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Record Type</label>
                        <select
                            value={noteType}
                            onChange={(e) => setNoteType(e.target.value as any)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                        >
                            <option value="meeting">Meeting Transcript / Summary</option>
                            <option value="strategy">Strategic Directive</option>
                            <option value="risk_alert">Risk Alert</option>
                            <option value="general">General Note</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Content</label>
                        <textarea
                            required
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none resize-none"
                            placeholder="Detail the strategic insights, discussions, or warnings..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Action Items (Optional)</label>
                        <div className="space-y-2">
                            {actionItems.map((item, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => handleActionItemChange(idx, e.target.value)}
                                        placeholder="Add an action item..."
                                        className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-yellow-500 outline-none"
                                    />
                                    {actionItems.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveActionItem(idx)}
                                            className="px-3 text-slate-500 hover:text-red-500 transition-colors"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={handleAddActionItem}
                            className="mt-2 text-xs font-bold text-yellow-500 hover:text-yellow-400"
                        >
                            + Add Another Item
                        </button>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-6 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold bg-yellow-500 text-slate-950 hover:bg-yellow-400 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                            {isSubmitting ? 'Saving...' : 'Secure Note'}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {initialNotes.length === 0 ? (
                    <div className="text-center py-10 glass rounded-xl border border-white/5">
                        <p className="text-slate-500">No advisory notes recorded yet.</p>
                    </div>
                ) : (
                    initialNotes.map((note) => (
                        <div key={note.id} className="glass p-5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-2 rounded-lg ${
                                    note.note_type === 'risk_alert' ? 'bg-red-500/10 text-red-500' :
                                    note.note_type === 'strategy' ? 'bg-blue-500/10 text-blue-500' :
                                    note.note_type === 'meeting' ? 'bg-green-500/10 text-green-500' :
                                    'bg-slate-500/10 text-slate-500'
                                }`}>
                                    {getTypeIcon(note.note_type)}
                                </div>
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{note.note_type.replace('_', ' ')}</span>
                                    <p className="text-xs text-slate-500">
                                        {new Date(note.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            
                            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {note.content}
                            </p>

                            {note.action_items && note.action_items.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Action Items</p>
                                    <ul className="space-y-2">
                                        {note.action_items.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-yellow-500/80">
                                                <span>•</span>
                                                <span className="text-slate-400">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
