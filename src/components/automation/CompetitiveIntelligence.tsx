import React from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, AlertTriangle, Briefcase, ArrowRight, Activity, Globe, ShieldCheck, DollarSign, Target } from 'lucide-react';

interface CompetitiveIntelligenceProps {
  onAction: (prompt: string) => void;
}

export default function CompetitiveIntelligence({ onAction }: CompetitiveIntelligenceProps) {
  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-sans font-medium text-zinc-100">Competitive Intelligence Engine</h2>
          <p className="text-sm text-zinc-500">Real-time monitoring of 5 competitors • 23 signals tracked</p>
        </div>
        <button 
          onClick={() => onAction('Add new competitor to monitor')}
          className="px-6 py-2 bg-zinc-100 text-zinc-950 rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-white transition-all flex items-center gap-2"
        >
          Add Competitor <ArrowRight size={12} />
        </button>
      </div>

      {/* Alert Banner */}
      <div className="bg-amber-950/20 border-2 border-amber-900/30 p-6 rounded-3xl">
        <div className="flex items-start gap-6">
          <div className="w-10 h-10 bg-amber-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="text-amber-500" size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-sans font-medium text-amber-500 mb-1">2 competitive movements require response</p>
            <p className="text-xs text-zinc-400 leading-relaxed">AcmeCorp Series B announcement + FlowTech pricing change detected</p>
          </div>
          <button 
            onClick={() => onAction('Show competitive response briefs')}
            className="flex-shrink-0 px-6 py-2 bg-amber-500 text-black rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-amber-400 transition-all flex items-center gap-2"
          >
            Review <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Competitor Cards */}
      <div className="grid grid-cols-1 gap-6">
        {/* AcmeCorp - Active */}
        <div className="bg-zinc-900/50 border-2 border-amber-900/30 p-8 rounded-3xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg font-sans font-medium text-zinc-100">AcmeCorp</h3>
              <p className="text-xs text-zinc-500">Direct competitor • Series B stage</p>
            </div>
            <span className="px-3 py-1 bg-amber-950/30 text-amber-500 rounded-lg text-[10px] font-mono uppercase tracking-widest font-bold">Action needed</span>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl">
              <p className="text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-4 font-bold">Recent activity</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-xs text-zinc-400">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5" />
                  Announced $15M Series B (2h ago)
                </div>
                <div className="flex items-start gap-3 text-xs text-zinc-400">
                  <div className="w-1 h-1 bg-zinc-600 rounded-full mt-1.5" />
                  Hiring: 3 enterprise AEs (1d ago)
                </div>
                <div className="flex items-start gap-3 text-xs text-zinc-400">
                  <div className="w-1 h-1 bg-zinc-600 rounded-full mt-1.5" />
                  Product update: SOC2 compliance (3d ago)
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-950/10 border border-blue-900/20 rounded-2xl">
              <p className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-4 font-bold">Counter-positioning brief ready</p>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Emphasize: bootstrapped profitability vs. VC dependence • Feature parity on compliance • Superior deployment speed
              </p>
              <div className="flex gap-3">
                <button onClick={() => onAction('Show AcmeCorp full brief')} className="flex-1 py-2 bg-zinc-900 text-zinc-300 rounded-xl text-[10px] font-mono uppercase tracking-widest hover:text-zinc-100 transition-colors">Full brief</button>
                <button onClick={() => onAction('Generate counter-narrative for AcmeCorp')} className="flex-1 py-2 bg-blue-500 text-white rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-blue-400 transition-all">Auto-respond</button>
              </div>
            </div>
          </div>
        </div>

        {/* FlowTech - Monitoring */}
        <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg font-sans font-medium text-zinc-100">FlowTech</h3>
              <p className="text-xs text-zinc-500">Adjacent market • Enterprise focus</p>
            </div>
            <span className="px-3 py-1 bg-blue-950/30 text-blue-500 rounded-lg text-[10px] font-mono uppercase tracking-widest font-bold">Monitoring</span>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl">
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4 font-bold">Recent activity</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-xs text-zinc-400">
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5" />
                  Pricing change: -20% on annual (4h ago)
                </div>
                <div className="flex items-start gap-3 text-xs text-zinc-400">
                  <div className="w-1 h-1 bg-zinc-600 rounded-full mt-1.5" />
                  New integration: Salesforce (2d ago)
                </div>
                <div className="flex items-start gap-3 text-xs text-zinc-400">
                  <div className="w-1 h-1 bg-zinc-600 rounded-full mt-1.5" />
                  Case study: Fortune 100 win (5d ago)
                </div>
              </div>
            </div>

            <div className="p-6 bg-zinc-950 border-l-4 border-blue-500 rounded-r-2xl flex flex-col justify-between">
              <p className="text-xs text-zinc-400 leading-relaxed italic">
                "Pricing pressure detected. Recommendation: maintain premium positioning, add value through faster time-to-value narrative."
              </p>
              <button onClick={() => onAction('Show FlowTech analysis')} className="mt-6 w-full py-2 bg-zinc-900 text-zinc-300 rounded-xl text-[10px] font-mono uppercase tracking-widest hover:text-zinc-100 transition-colors">View analysis</button>
            </div>
          </div>
        </div>
      </div>

      {/* Market Intelligence Summary */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
        <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-100 mb-8">Market intelligence summary</h3>
        
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Funding events (30d)', value: '2' },
            { label: 'Product launches', value: '4' },
            { label: 'Pricing changes', value: '3' },
            { label: 'Content published', value: '47' },
          ].map((stat, i) => (
            <div key={i} className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl">
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-2">{stat.label}</p>
              <p className="text-2xl font-sans font-medium text-zinc-100">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Strategic Recommendations */}
        <div className="p-8 bg-blue-950/10 border border-blue-900/20 rounded-3xl">
          <p className="text-sm font-sans font-medium text-blue-400 mb-6 flex items-center gap-2">
            <ShieldCheck size={18} /> Strategic recommendations
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-4 text-sm text-zinc-300">
              <span className="text-blue-500 font-mono font-bold">01</span>
              <p><strong>Respond to AcmeCorp funding</strong> within 24h with thought leadership on sustainable growth</p>
            </div>
            <div className="flex items-start gap-4 text-sm text-zinc-300">
              <span className="text-blue-500 font-mono font-bold">02</span>
              <p><strong>Price anchor against FlowTech</strong> by emphasizing total cost of ownership, not list price</p>
            </div>
            <div className="flex items-start gap-4 text-sm text-zinc-300">
              <span className="text-blue-500 font-mono font-bold">03</span>
              <p><strong>Capitalize on BuildRight stagnation</strong> with rapid feature velocity messaging</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
