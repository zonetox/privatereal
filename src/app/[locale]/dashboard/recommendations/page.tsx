import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/navigation';
import { getTranslations } from 'next-intl/server';
import AdvisoryFlashcard from '@/components/projects/AdvisoryFlashcard';
import OpportunityBoardFilters from '@/components/projects/OpportunityBoardFilters';
import MatchingSummaryPanel from '@/components/projects/MatchingSummaryPanel';

interface RecommendationsPageProps {
    params: { locale: string };
}

type Project = {
    id: string;
    name: string;
    location: string;
    developer: string | null;
    property_type: string | null;
    target_segment: string | null;
    price_per_m2: number | null;
    launch_year: number | null;
    expected_growth_rate: number | null;
    holding_period_recommendation: number | null;
    investment_grade: string | null;
    analyst_confidence_level: number | null;
    liquidity_score: number | null;
    growth_score: number | null;
    infrastructure_score: number | null;
    avg_rental_yield: number | null;
    evaluation_notes: string | null;
    min_unit_price: number | null;
    opportunity_cards?: any[];
};

type FitResult = {
    fit_score: number | null;
    fit_label: string | null;
    budget_alignment: number | null;
    risk_alignment: number | null;
    horizon_alignment: number | null;
    location_alignment: number | null;
    goal_alignment: number | null;
};

type ProjectWithFit = Project & FitResult & { isSelected: boolean };

export default async function RecommendationsPage({ params }: RecommendationsPageProps) {
    const { locale } = await Promise.resolve(params);
    const t = await getTranslations('Workspace');
    const supabase = createClient();

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect({ href: '/login', locale });
        return null;
    }

    // 2. Get client id
    const { data: clientRecord } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();
    
    const clientId = clientRecord?.id ?? null;

    // 3. Fetch data parallel
    const [projectsResponse, fitResponse, selectionsResponse] = await Promise.all([
        supabase
            .from('projects')
            .select('*, opportunity_cards(*)')
            .eq('status', 'active')
            .eq('visible_to_clients', true),
        clientId ? supabase.rpc('calculate_all_project_fits', { p_client_id: clientId }) : Promise.resolve({ data: [] }),
        clientId ? supabase.from('client_workspace_selections').select('project_id').eq('client_id', clientId) : Promise.resolve({ data: [] })
    ]);

    const activeProjects = projectsResponse.data ?? [];
    const fitDataMap = new Map((fitResponse.data as any[] || []).map(f => [f.project_id, f]));
    const selectedIds = new Set((selectionsResponse.data as any[] || []).map(s => s.project_id));

    // 4. Merge results
    const projectsWithFit: ProjectWithFit[] = activeProjects.map(project => {
        const fitData = fitDataMap.get(project.id);
        return {
            ...project,
            fit_score: fitData?.fit_score ?? null,
            fit_label: fitData?.fit_label ?? null,
            budget_alignment: fitData?.budget_alignment ?? null,
            risk_alignment: fitData?.risk_alignment ?? null,
            horizon_alignment: fitData?.horizon_alignment ?? null,
            location_alignment: fitData?.location_alignment ?? null,
            goal_alignment: fitData?.goal_alignment ?? null,
            isSelected: selectedIds.has(project.id)
        };
    });

    const sorted = projectsWithFit.sort((a, b) => (b.fit_score || 0) - (a.fit_score || 0));

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            
            {/* AREA 1: HEADER */}
            <div className="space-y-4 px-1">
                <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-yellow-600/80">
                        {t('opportunity_board')}
                    </p>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-100 italic">
                        Cơ hội phù hợp với <span className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 bg-clip-text text-transparent">Hồ sơ của bạn</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-px w-12 bg-yellow-500/30"></div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest italic">
                        {t('suitable_projects_count', { count: sorted.length })}
                    </p>
                </div>
            </div>

            {/* AREA 2: FILTER BAR */}
            <OpportunityBoardFilters />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16">
                
                {/* AREA 3: OPPORTUNITY GRID */}
                <div className="lg:col-span-3 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                        {sorted.map((project) => (
                            <AdvisoryFlashcard 
                                key={project.id} 
                                project={project} 
                                clientId={clientId} 
                                locale={locale} 
                            />
                        ))}
                    </div>

                    {sorted.length === 0 && (
                        <div className="py-20 text-center space-y-4 glass rounded-[2rem] border border-white/5 bg-slate-950/20">
                            <p className="text-xl font-bold text-slate-400 italic">No matching opportunities found</p>
                            <p className="text-xs text-slate-600 uppercase tracking-widest max-w-sm mx-auto">
                                Adjust your advisory profile filters or contact your personal advisor for professional curation.
                            </p>
                        </div>
                    )}
                </div>

                {/* AREA 4: SIDE INSIGHT PANEL */}
                <div className="lg:col-span-1">
                    <MatchingSummaryPanel 
                        bestFit={sorted[0]} 
                        totalProjects={sorted.length} 
                    />
                </div>
            </div>
        </div>
    );
}
