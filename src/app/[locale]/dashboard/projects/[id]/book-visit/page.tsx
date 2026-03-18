import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/navigation';
import { notFound } from 'next/navigation';
import BookingClientSide from './BookingClientSide';
import { Building2, MapPin, CheckCircle2, ChevronLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';

export default async function BookVisitPage({ params }: { params: { locale: string; id: string } }) {
    const { locale, id } = params;
    const t = await getTranslations();
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect({ href: '/login', locale });
        return null;
    }

    // Fetch Project Data
    const { data: project } = await supabase
        .from('projects')
        .select('*, opportunity_cards(*)')
        .eq('id', id)
        .single();

    if (!project) notFound();

    // Fetch Client Data + Fit Score
    const { data: clientRecord } = await supabase
        .from('clients')
        .select('*, profiles(full_name, email, phone)')
        .eq('user_id', user.id)
        .single();
        
    let fitData = null;
    if (clientRecord) {
        const { data: rpcResult } = await supabase.rpc('calculate_project_fit', {
            p_client_id: clientRecord.id,
            p_project_id: id
        });
        if (rpcResult) {
            fitData = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;
        }
    }

    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
            <Link 
                href={`/dashboard/projects/${id}`}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-8"
            >
                <ChevronLeft size={16} />
                {t('BookingPage.back_to_project')}
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* LLEFT PANEL — THÔNG TIN DỰ ÁN */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight">
                            {project.name}
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-sm">
                            <Building2 size={16} /> {project.developer} <span className="text-slate-700">|</span> <MapPin size={16} /> {project.location}
                        </p>
                        
                        <div className="pt-4 border-t border-slate-800/60 inline-block mt-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">
                                {t('BookingPage.price_from')}
                            </p>
                            <p className="text-2xl font-black text-yellow-500 uppercase tracking-tighter">
                                {project.price_per_m2 ? formatter.format(Number(project.price_per_m2)) : '--'}
                            </p>
                        </div>
                    </div>

                    {fitData && clientRecord && (
                        <div className="bg-gradient-to-br from-yellow-950/20 to-slate-900/40 p-8 rounded-[2rem] border border-yellow-900/30 space-y-4 shadow-xl">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-yellow-600 mb-6">
                                {t('BookingPage.reminder_title')}
                            </h3>
                            
                            <div className="space-y-3">
                                {fitData.budget_alignment >= 70 && (
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={16} className="text-emerald-400" />
                                        <span className="text-sm font-medium text-slate-300">Phù hợp với ngân sách của bạn</span>
                                    </div>
                                )}
                                {fitData.location_alignment >= 70 && (
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={16} className="text-emerald-400" />
                                        <span className="text-sm font-medium text-slate-300">Khớp với khu vực bạn quan tâm</span>
                                    </div>
                                )}
                                {(fitData.goal_alignment >= 70 || fitData.horizon_alignment >= 70) && (
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={16} className="text-emerald-400" />
                                        <span className="text-sm font-medium text-slate-300">Tiềm năng sinh lời tối ưu theo kế hoạch</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL — FORM ĐẶT LỊCH */}
                <div className="lg:col-span-7">
                    <BookingClientSide 
                        projectId={id} 
                        initialData={{
                            name: clientRecord?.profiles?.full_name || '',
                            email: clientRecord?.profiles?.email || '',
                            phone: clientRecord?.profiles?.phone || ''
                        }}
                    />
                </div>

            </div>
        </div>
    );
}
