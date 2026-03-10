import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/navigation';
import { getTranslations } from 'next-intl/server';
import PropertyPortfolioTable from '@/components/reports/PropertyPortfolioTable';
import MarketIntelligenceGrid from '@/components/reports/MarketIntelligenceGrid';
import AdvisoryEngagementList from '@/components/reports/AdvisoryEngagementList';

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
  }

  // Fetch Reporting Data from Views
  const { data: portfolioData } = await supabase.from('v_client_property_portfolio_summary').select('*');
  const { data: marketData } = await supabase.from('v_market_intelligence_snapshot').select('*');
  const { data: engagementRaw } = await supabase.from('advisor_client_notes').select('client_id, created_at, action_items, clients(full_name)');

  // Transform engagement data (manual aggregate since it's more complex)
  const engagementData = (portfolioData || []).map(client => {
    const clientNotes = (engagementRaw || []).filter(n => n.client_id === client.client_id);
    return {
      client_id: client.client_id,
      client_name: client.client_name,
      note_count: clientNotes.length,
      last_contact: clientNotes[0]?.created_at || '',
      pending_actions: clientNotes.reduce((acc, n) => acc + (n.action_items?.length || 0), 0)
    };
  });

  return (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight gold-text-gradient mb-3">Institutional Reporting Hub</h1>
        <p className="text-slate-400 max-w-2xl">Executive oversight across client property collections, market location intelligence, and advisory performance metrics.</p>
      </div>

      <div className="space-y-12">
        {/* Section 1: Client Portfolio */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-slate-200">Client Property Collections</h2>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total Collections: {portfolioData?.length || 0}</span>
          </div>
          <div className="glass rounded-2xl border border-white/5 p-2">
            <PropertyPortfolioTable data={portfolioData || []} />
          </div>
        </section>

        {/* Section 2: Market Intelligence */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-slate-200">Market Location Intelligence</h2>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Active Projects: {marketData?.length || 0}</span>
          </div>
          <MarketIntelligenceGrid data={marketData || []} />
        </section>

        {/* Section 3: Advisory Engagement */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-slate-200">Advisory Engagement Analysis</h2>
          </div>
          <div className="max-w-4xl">
            <AdvisoryEngagementList data={engagementData} />
          </div>
        </section>
      </div>
    </div>
  );
}
