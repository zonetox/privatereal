'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, CheckCircle2, Loader2, Video, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createClientBookingAction } from '@/app/actions/client-bookings';

interface BookingClientSideProps {
    projectId: string;
    initialData: {
        name: string;
        email: string;
        phone: string;
    };
}

export default function BookingClientSide({ projectId, initialData }: BookingClientSideProps) {
    const t = useTranslations('BookingPage');
    const router = useRouter();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    // Form State
    const [visitDate, setVisitDate] = useState('');
    const [visitTime, setVisitTime] = useState('Sáng');
    const [visitType, setVisitType] = useState('Trực tiếp');
    const [note, setNote] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!visitDate) return;
        
        setIsSubmitting(true);
        const res = await createClientBookingAction({
            projectId,
            visitDate,
            visitTime,
            visitType,
            note
        });

        if (res.success) {
            setIsSuccess(true);
        } else {
            console.error(res.error);
            setIsSubmitting(false);
            // Có thể thêm toast error
        }
    };

    if (isSuccess) {
        return (
            <div className="bg-slate-900/60 border border-emerald-500/30 p-12 rounded-[2rem] text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-4 animate-in zoom-in duration-500">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                    {t('success_title')}
                </h2>
                <p className="text-slate-400 max-w-sm">
                    {t('success_desc')}
                </p>
                <div className="pt-8">
                    <button 
                        onClick={() => router.push(`/dashboard/projects/${projectId}`)}
                        className="px-8 py-4 rounded-xl bg-slate-800 text-slate-300 font-bold uppercase text-sm hover:bg-slate-700 transition"
                    >
                        {t('back_to_project')}
                    </button>
                </div>
            </div>
        );
    }

    // Lấy YYYY-MM-DD làm giá trị min cho Date Picker
    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-3xl pointer-events-none rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="space-y-2 mb-8">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                        {t('title')}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="space-y-6">
                    {/* 1. Ngày */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Calendar size={14} /> {t('form_select_date')} <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="date" 
                            required
                            min={todayStr}
                            value={visitDate}
                            onChange={(e) => setVisitDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-slate-200 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 uppercase font-medium tracking-wider"
                        />
                    </div>

                    {/* 2. Thời gian */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Clock size={14} /> {t('form_select_time')} <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {['Sáng', 'Chiều', 'Tối'].map((timeStr) => {
                                const key = timeStr === 'Sáng' ? 'morning' : timeStr === 'Chiều' ? 'afternoon' : 'evening';
                                return (
                                    <button
                                        key={timeStr}
                                        type="button"
                                        onClick={() => setVisitTime(timeStr)}
                                        className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                                            visitTime === timeStr 
                                            ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' 
                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        {t(`time_${key}`)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Hình thức */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <MapPin size={14} /> {t('form_select_type')} <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { val: 'Trực tiếp', icon: MapPin, key: 'direct' },
                                { val: 'Nhà mẫu', icon: Home, key: 'model' },
                                { val: 'Online', icon: Video, key: 'online' }
                            ].map((typeItem) => (
                                <button
                                    key={typeItem.val}
                                    type="button"
                                    onClick={() => setVisitType(typeItem.val)}
                                    className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                                        visitType === typeItem.val 
                                        ? 'bg-slate-800 border-slate-600 text-white' 
                                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-400 hover:border-slate-700'
                                    }`}
                                >
                                    <typeItem.icon size={14} />
                                    {t(`type_${typeItem.key}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Thông tin liên hệ (Read Only/Auto Fill) */}
                <div className="pt-6 border-t border-slate-800/60 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                        {t('contact_info')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            type="text" 
                            value={initialData.name} 
                            disabled 
                            className="w-full bg-slate-950/50 border border-slate-800/50 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed"
                            placeholder="Họ và tên"
                        />
                        <input 
                            type="text" 
                            value={initialData.phone || initialData.email} 
                            disabled 
                            className="w-full bg-slate-950/50 border border-slate-800/50 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed"
                            placeholder="Số điện thoại / Email"
                        />
                    </div>
                </div>

                {/* 5. Ghi chú */}
                <div className="pt-2 space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                        {t('form_note')}
                    </label>
                    <textarea 
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={t('form_note_placeholder')}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 resize-none text-sm"
                    />
                </div>

                {/* 6. CTA */}
                <div className="pt-4">
                    <button 
                        type="submit"
                        disabled={isSubmitting || !visitDate}
                        className="w-full h-14 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_40px_-10px_rgba(234,179,8,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <><Loader2 size={18} className="animate-spin" /> Đang xử lý...</>
                        ) : (
                            t('cta_submit')
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
