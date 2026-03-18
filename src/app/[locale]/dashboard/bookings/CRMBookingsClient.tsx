'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { updateBookingStatusAction } from '@/app/actions/client-bookings';
import { Calendar, Clock, MapPin, User, Building2, AlertCircle, Save, Loader2 } from 'lucide-react';

interface Booking {
    id: string;
    visit_date: string;
    visit_time: string;
    type: string;
    status: string;
    note: string;
    crm_notes: string;
    created_at: string;
    client_name: string;
    client_phone: string;
    project_name: string;
    is_delayed: boolean;
}

export default function CRMBookingsClient({ bookings }: { bookings: Booking[] }) {
    const t = useTranslations('CRMBookings');
    const [localBookings, setLocalBookings] = useState(bookings);
    const [savingId, setSavingId] = useState<string | null>(null);

    const STATUSES = ['Mới đặt lịch', 'Đã xác nhận', 'Đã đi xem', 'Đang theo dõi', 'Chốt giao dịch'];

    const handleUpdate = async (id: string, newStatus: string, newNote: string) => {
        setSavingId(id);
        const res = await updateBookingStatusAction(id, newStatus, newNote);
        if (res.success) {
            setLocalBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus, crm_notes: newNote, is_delayed: false } : b));
        } else {
            alert('Lỗi: ' + res.error);
        }
        setSavingId(null);
    };

    if (localBookings.length === 0) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                {t('no_bookings')}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localBookings.map((booking) => (
                <BookingCard 
                    key={booking.id} 
                    booking={booking} 
                    t={t} 
                    STATUSES={STATUSES} 
                    isSaving={savingId === booking.id}
                    onSave={(status: string, notes: string) => handleUpdate(booking.id, status, notes)} 
                />
            ))}
        </div>
    );
}

function BookingCard({ booking, t, STATUSES, isSaving, onSave }: any) {
    const [status, setStatus] = useState(booking.status);
    const [notes, setNotes] = useState(booking.crm_notes || '');

    const isChanged = status !== booking.status || notes !== (booking.crm_notes || '');

    return (
        <div className={`p-6 rounded-[2rem] border transition-all ${
            booking.is_delayed 
            ? 'bg-rose-950/20 border-rose-900/50 shadow-[0_0_15px_-3px_rgba(225,29,72,0.2)]' 
            : 'bg-slate-900 border-slate-800'
        }`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                    <p className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <User size={14} className="text-slate-500" />
                        {booking.client_name}
                    </p>
                    <p className="text-xs font-medium text-slate-400">
                        {booking.client_phone}
                    </p>
                </div>
                {booking.is_delayed && (
                    <div className="flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-rose-400 bg-rose-500/10 px-2 py-1 rounded-full">
                        <AlertCircle size={12} /> Cần Follow-up
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="space-y-3 pt-4 border-t border-slate-800/60 mb-6">
                <div className="flex items-start gap-3">
                    <Building2 size={16} className="text-slate-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{t('col_project')}</p>
                        <p className="text-sm font-bold text-slate-200">{booking.project_name}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Calendar size={16} className="text-slate-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{t('col_date')}</p>
                        <p className="text-sm font-medium text-slate-300">
                            {new Date(booking.visit_date).toLocaleDateString('vi-VN')} - {booking.visit_time}
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-slate-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Hình thức</p>
                        <p className="text-sm font-medium text-slate-300">{booking.type}</p>
                    </div>
                </div>
                {booking.note && (
                    <div className="bg-slate-950 p-3 rounded-xl mt-2 border border-slate-800/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Ghi chú của khách:</p>
                        <p className="text-sm text-slate-400 italic">"{booking.note}"</p>
                    </div>
                )}
            </div>

            {/* Actions & CRM Notes */}
            <div className="space-y-4 pt-4 border-t border-slate-800/60">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t('col_status')}</label>
                    <div className="flex flex-wrap gap-2">
                        {STATUSES.map((s: string) => (
                            <button
                                key={s}
                                onClick={() => setStatus(s)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                    status === s
                                    ? s === 'Chốt giao dịch' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-yellow-500 text-slate-950 border-yellow-500'
                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex justify-between">
                        {t('crm_notes')}
                    </label>
                    <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t('crm_notes_placeholder')}
                        className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 resize-none"
                    />
                </div>

                {isChanged && (
                    <button 
                        onClick={() => onSave(status, notes)}
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-widest transition-all"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {t('save_changes')}
                    </button>
                )}
            </div>
        </div>
    );
}
