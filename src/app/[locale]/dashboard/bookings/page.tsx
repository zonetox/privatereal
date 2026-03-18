import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/navigation';
import { getTranslations } from 'next-intl/server';
import CRMBookingsClient from './CRMBookingsClient';

export default async function CRMBookingsPage({ params: { locale } }: { params: { locale: string } }) {
    const supabase = createClient();
    const t = await getTranslations();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect({ href: '/login', locale });
        return null;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect({ href: '/dashboard', locale });
    }

    // Fetch all bookings
    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
            *,
            clients (
                id,
                profiles ( full_name, email, phone )
            ),
            projects ( id, name, developer )
        `)
        .order('created_at', { ascending: false });

    // Type casting logic to match Client UI expectations
    const formattedBookings = (bookings || []).map((b: any) => ({
        id: b.id,
        visit_date: b.visit_date,
        visit_time: b.visit_time,
        type: b.type,
        status: b.status,
        note: b.note,
        crm_notes: b.crm_notes,
        created_at: b.created_at,
        client_name: b.clients?.profiles?.full_name || 'Khách Vô Danh',
        client_phone: b.clients?.profiles?.phone || 'No Phone',
        project_name: b.projects?.name || 'Dự án đã xóa',
        is_delayed: b.status === 'Mới đặt lịch' && 
                    (new Date().getTime() - new Date(b.created_at).getTime()) > 24 * 60 * 60 * 1000
    }));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                    {t('CRMBookings.title')}
                </h1>
                <p className="text-slate-400 mt-2 text-sm">
                    {t('CRMBookings.subtitle')}
                </p>
            </div>

            <CRMBookingsClient bookings={formattedBookings} />
        </div>
    );
}
