import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/navigation';
import { getTranslations } from 'next-intl/server';
import AdvisoryCollectionTable from '@/components/reports/AdvisoryCollectionTable';
import MarketAdvisoryGrid from '@/components/reports/MarketAdvisoryGrid';
import AdvisoryEngagementList from '@/components/reports/AdvisoryEngagementList';
import WorkspaceActivityTable from '@/components/reports/WorkspaceActivityTable';

export const dynamic = 'force-dynamic';

export default async function ReportsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale });
  const supabase = createClient();

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
    return null;
  }

  // Fetch Reporting Data from Views
  const { data: portfolioRaw } = await supabase.from('v_client_property_portfolio_summary').select('*');
  const { data: marketData } = await supabase.from('v_market_intelligence_snapshot').select('*');
  const { data: workspaceActivity } = await supabase.from('v_client_workspace_activity').select('*');
  const { data: engagementRaw } = await supabase.from('advisor_client_notes').select('client_id, created_at, action_items, clients(full_name)');
  
  // Fetch Extra Client Meta (separately to enrich)
  const { data: clientFinancials } = await supabase.from('client_financials').select('client_id, budget_range');
  const { data: workspaceSelections } = await supabase.from('client_workspace_selections').select('client_id');

  // Transform/Enrich portfolio data
  const portfolioEnriched = (portfolioRaw || []).map(item => {
    const financials = (clientFinancials || []).find(f => f.client_id === item.client_id);
    const selectionCount = (workspaceSelections || []).filter(s => s.client_id === item.client_id).length;
    const clientNotes = (engagementRaw || []).filter(n => n.client_id === item.client_id);
    
    return {
      client_id: item.client_id,
      client_name: item.client_name,
      risk_profile: item.risk_profile,
      total_property_investment: item.total_budget_allocated, // Map view name to component name
      asset_count: item.property_count,
      avg_expected_roi: item.avg_expected_return,
      portfolio_lifecycle_status: item.advisory_lifecycle_status,
      // Enriched
      capital_range: financials?.budget_range,
      workspace_project_count: selectionCount,
      active_directives_count: clientNotes.reduce((acc, n) => acc + (n.action_items?.length || 0), 0)
    };
  });

  // Transform engagement data for the Engagement List section
  const engagementData = portfolioEnriched.map(client => {
    const clientNotes = (engagementRaw || []).filter(n => n.client_id === client.client_id);
    return {
      client_id: client.client_id,
      client_name: client.client_name,
      note_count: clientNotes.length,
      last_contact: clientNotes[0]?.created_at || '',
      pending_actions: client.active_directives_count || 0
    };
  });

  return (
    <div className="p-4 md:p-8 space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight gold-text-gradient italic uppercase">{t('ReportsOverview.title')}</h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl font-medium leading-relaxed">{t('ReportsOverview.subtitle')}</p>
      </div>

      <div className="space-y-12">
        {/* Section 1: Advisory Collections */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-slate-200">{t('ReportsOverview.collections_title')}</h2>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
              {t('ReportsOverview.total_active')}: {portfolioEnriched?.length || 0}
            </span>
          </div>
          <div className="glass rounded-2xl border border-white/5 p-2">
            <AdvisoryCollectionTable data={portfolioEnriched || []} />
          </div>
        </section>

        {/* Section 2: Market Advisory */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-slate-200">{t('ReportsOverview.market_title')}</h2>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
              {t('Dashboard.projects')}: {marketData?.length || 0}
            </span>
          </div>
          <MarketAdvisoryGrid data={marketData || []} />
        </section>

        {/* Section 3: Advisory Engagement */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-slate-200">{t('ReportsOverview.engagement_title')}</h2>
          </div>
          <div className="max-w-4xl">
            <AdvisoryEngagementList data={engagementData} />
          </div>
        </section>

        {/* Section 4: Client Workspace Activity */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-slate-200">{t('ReportsOverview.workspace_activity_title')}</h2>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
              {t('Dashboard.workspaceClient')}: {workspaceActivity?.length || 0}
            </span>
          </div>
          <WorkspaceActivityTable data={workspaceActivity || []} />
        </section>
      </div>
    </div>
  );
}
