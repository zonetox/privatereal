'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { submitBookingAction } from '@/app/actions/bookings';

interface BookingFormProps {
    leadId: string;
    leadEmail: string;
}

export default function BookingForm({ leadId, leadEmail }: BookingFormProps) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const scheduledAt = new Date(`${date}T${time}:00`).toISOString();

        const result = await submitBookingAction({
            leadId,
            leadEmail,
            scheduledAt
        });

        setIsSubmitting(false);
        if (result.success) {
            setIsSuccess(true);
        } else {
            alert(result.error || 'Failed to book consultation');
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center space-y-4 py-8 animate-in fade-in duration-500">
                <div className="flex justify-center">
                    <CheckCircle2 className="text-emerald-500 w-16 h-16" />
                </div>
                <h3 className="text-2xl font-bold text-white">Consultation Secured</h3>
                <p className="text-slate-400">Your strategic advisor will see you on {new Date(date).toLocaleDateString()} at {time}. Check your email for the calendar invitation.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <CalendarIcon size={16} /> Select Date
                    </label>
                    <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 focus:border-primary outline-none transition-all text-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <Clock size={16} /> Select Time
                    </label>
                    <select
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 focus:border-primary outline-none transition-all text-white"
                    >
                        <option value="">Select a slot</option>
                        {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting || !date || !time}
                className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
                {isSubmitting ? 'Confirming...' : 'Confirm Strategic Consultation'}
                {!isSubmitting && <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>
        </form>
    );
}
