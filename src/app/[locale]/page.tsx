import HeroSection from '@/components/landing/HeroSection';
import RealitySection from '@/components/landing/RealitySection';
import IntroSection from '@/components/landing/IntroSection';
import HowItWorks from '@/components/landing/HowItWorks';
import IntelligenceSection from '@/components/landing/IntelligenceSection';
import OpportunityBoardSection from '@/components/landing/OpportunityBoardSection';
import DecisionWorkspaceSection from '@/components/landing/DecisionWorkspaceSection';
import FinalStatement from '@/components/landing/FinalStatement';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-yellow-500/30 overflow-x-hidden">
      <HeroSection />
      <RealitySection />
      <IntroSection />
      <HowItWorks />
      <IntelligenceSection />
      <OpportunityBoardSection />
      <DecisionWorkspaceSection />
      <FinalStatement />
      
      {/* Editorial Footer Information */}
      <footer className="py-20 px-6 bg-white text-slate-950 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="space-y-4">
            <h3 className="text-xl font-black italic tracking-tighter">PREIO.</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Private Real Estate Intelligence Office</p>
          </div>
          <div className="flex gap-12">
            <div className="space-y-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Protocol</span>
                <p className="text-[11px] font-bold">Advisory Portal</p>
            </div>
            <div className="space-y-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Intelligence</span>
                <p className="text-[11px] font-bold">Decision Workspace</p>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2024 PREIO. Hiểu rõ dự án. Quyết định tự tin.</p>
        </div>
      </footer>
    </main>
  );
}
