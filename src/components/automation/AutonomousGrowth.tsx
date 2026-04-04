import React from 'react';
import { motion } from 'framer-motion';
import { Zap, DollarSign, Clock, BarChart3, ArrowRight, AlertTriangle, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

interface AutonomousGrowthProps {
  onAction: (prompt: string) => void;
}

export default function AutonomousGrowth({ onAction }: AutonomousGrowthProps) {
  return (
    <div className="space-y-8 p-8">
      {/* Header with Autopilot Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-sans font-medium text-zinc-100">Autonomous Growth Engine</h2>
          <p className="text-sm text-zinc-500">AI orchestrating 3 campaigns • 12 actions queued</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-green-950/20 border border-green-900/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <span className="text-xs font-mono uppercase tracking-widest text-green-500 font-bold">Active</span>
        </div>
      </div>

      {/* ROI Calculator Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">Value created this month</p>
            <p className="text-4xl font-sans font-bold text-green-500">$4,300</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">Time saved</p>
            <p className="text-3xl font-sans font-medium text-zinc-100">43 hrs</p>
          </div>
        </div>
        <div className="pt-6 border-t border-zinc-800">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-1">Content generation</p>
              <p className="text-sm text-zinc-300 font-medium">18 hrs</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-1">Competitive analysis</p>
              <p className="text-sm text-zinc-300 font-medium">12 hrs</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-1">Outreach</p>
              <p className="text-sm text-zinc-300 font-medium">13 hrs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Autopilot Suggestions */}
      <div className="bg-zinc-900/30 border-2 border-blue-900/30 p-8 rounded-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-blue-950/30 rounded-lg flex items-center justify-center">
            <Sparkles className="text-blue-500" size={18} />
          </div>
          <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-100">Autopilot recommendations</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Suggestion 1 */}
          <div className="flex items-start gap-6 p-6 bg-blue-950/10 border border-blue-900/20 rounded-2xl group hover:border-blue-500/30 transition-all">
            <div className="flex-1">
              <p className="text-sm font-sans font-medium text-blue-400 mb-1">High conversion opportunity</p>
              <p className="text-xs text-zinc-400 leading-relaxed">3 leads mentioned "deployment pain" in past 2 hours. Personalized outreach drafted and ready.</p>
            </div>
            <button 
              onClick={() => onAction('Execute deployment pain outreach')}
              className="flex-shrink-0 px-6 py-2 bg-blue-500 text-white rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-blue-400 transition-all flex items-center gap-2"
            >
              Execute <ArrowRight size={12} />
            </button>
          </div>

          {/* Suggestion 2 */}
          <div className="flex items-start gap-6 p-6 bg-amber-950/10 border border-amber-900/20 rounded-2xl group hover:border-amber-500/30 transition-all">
            <div className="flex-1">
              <p className="text-sm font-sans font-medium text-amber-400 mb-1">Landing page underperforming</p>
              <p className="text-xs text-zinc-400 leading-relaxed">Resonance score: 0%. Competitor launched similar product. New variant generated with current pain signals.</p>
            </div>
            <button 
              onClick={() => onAction('Review new landing page variant')}
              className="flex-shrink-0 px-6 py-2 bg-amber-500 text-black rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-amber-400 transition-all flex items-center gap-2"
            >
              Review <ArrowRight size={12} />
            </button>
          </div>

          {/* Suggestion 3 */}
          <div className="flex items-start gap-6 p-6 bg-green-950/10 border border-green-900/20 rounded-2xl group hover:border-green-500/30 transition-all">
            <div className="flex-1">
              <p className="text-sm font-sans font-medium text-green-400 mb-1">Predictive outreach window</p>
              <p className="text-xs text-zinc-400 leading-relaxed">Message Sarah Chen within 2 hours → 73% conversion probability vs. 34% if delayed.</p>
            </div>
            <button 
              onClick={() => onAction('Draft message to Sarah Chen')}
              className="flex-shrink-0 px-6 py-2 bg-green-500 text-black rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-green-400 transition-all flex items-center gap-2"
            >
              Draft <ArrowRight size={12} />
            </button>
          </div>

          {/* Suggestion 4 */}
          <div className="flex items-start gap-6 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl group hover:border-zinc-700 transition-all">
            <div className="flex-1">
              <p className="text-sm font-sans font-medium text-zinc-300 mb-1">Competitor movement detected</p>
              <p className="text-xs text-zinc-500 leading-relaxed">AcmeCorp raised Series B ($15M). Counter-positioning brief ready for review.</p>
            </div>
            <button 
              onClick={() => onAction('Show AcmeCorp competitive brief')}
              className="flex-shrink-0 px-6 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-zinc-700 transition-all flex items-center gap-2"
            >
              View <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active campaigns', value: '3', trend: '+1 this week', trendColor: 'text-green-500' },
          { label: 'Autonomous actions', value: '147', trend: 'This month', trendColor: 'text-zinc-500' },
          { label: 'Pipeline velocity', value: '+34%', trend: 'vs. last month', trendColor: 'text-green-500' },
          { label: 'Competitive intel', value: '8', trend: '2 require action', trendColor: 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl">
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-2">{stat.label}</p>
            <p className="text-2xl font-sans font-medium text-zinc-100">{stat.value}</p>
            <p className={`text-[10px] font-mono uppercase tracking-widest mt-1 ${stat.trendColor}`}>{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* Active Workflows */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
        <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-8">Running automations</h3>
        
        <div className="space-y-4">
          {/* Workflow 1 */}
          <div className="p-6 bg-zinc-950 border-l-4 border-green-500 rounded-r-2xl">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-sans font-medium text-zinc-100">Product Launch → Multi-channel Distribution</h4>
              <span className="px-2 py-1 bg-green-950/30 text-green-500 rounded text-[8px] font-mono uppercase tracking-widest font-bold">Active</span>
            </div>
            <p className="text-xs text-zinc-500 mb-4">Auto-posting to X, LinkedIn • 12 leads contacted • Press release distributed</p>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-blue-500">
              <Clock size={12} /> Next: Investor deck synthesis in 2h
            </div>
          </div>

          {/* Workflow 2 */}
          <div className="p-6 bg-zinc-950 border-l-4 border-blue-500 rounded-r-2xl">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-sans font-medium text-zinc-100">Competitive Response → AcmeCorp Series B</h4>
              <span className="px-2 py-1 bg-blue-950/30 text-blue-500 rounded text-[8px] font-mono uppercase tracking-widest font-bold">Monitoring</span>
            </div>
            <p className="text-xs text-zinc-500 mb-4">Tracking product changes • Brief ready • Counter-narrative drafted</p>
            <button 
              onClick={() => onAction('Show AcmeCorp response strategy')}
              className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 hover:text-zinc-100 flex items-center gap-2 transition-colors"
            >
              View strategy <ArrowRight size={12} />
            </button>
          </div>

          {/* Workflow 3 */}
          <div className="p-6 bg-zinc-950 border-l-4 border-amber-500 rounded-r-2xl">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-sans font-medium text-zinc-100">Lead Nurture → Enterprise Segment</h4>
              <span className="px-2 py-1 bg-amber-950/30 text-amber-500 rounded text-[8px] font-mono uppercase tracking-widest font-bold">Awaiting approval</span>
            </div>
            <p className="text-xs text-zinc-500 mb-4">18 personalized emails drafted • Timing optimized • A/B variants ready</p>
            <button 
              onClick={() => onAction('Review enterprise nurture emails')}
              className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 hover:text-zinc-100 flex items-center gap-2 transition-colors"
            >
              Review batch <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
