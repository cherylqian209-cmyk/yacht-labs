import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, UserCheck, Clock, AlertCircle, ArrowRight, CheckCircle2, UserPlus, MessageCircle, DollarSign, BarChart3 } from 'lucide-react';

interface PredictiveIntelligenceProps {
  onAction: (prompt: string) => void;
}

export default function PredictiveIntelligence({ onAction }: PredictiveIntelligenceProps) {
  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-sans font-medium text-zinc-100">Predictive Intelligence Dashboard</h2>
          <p className="text-sm text-zinc-500">AI-powered forecasting and strategic nudges</p>
        </div>
      </div>

      {/* Revenue Forecasting Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
        <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-8">Revenue forecast (next 30 days)</h3>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl">
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-2">Conservative</p>
            <p className="text-3xl font-sans font-bold text-zinc-100">$18,400</p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mt-2">80% confidence</p>
          </div>
          <div className="p-6 bg-blue-950/10 border-2 border-blue-500 rounded-2xl">
            <p className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-2 font-bold">Expected</p>
            <p className="text-3xl font-sans font-bold text-blue-500">$24,700</p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mt-2">Most likely</p>
          </div>
          <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl">
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-2">Optimistic</p>
            <p className="text-3xl font-sans font-bold text-zinc-100">$31,200</p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mt-2">20% confidence</p>
          </div>
        </div>

        <div className="p-6 bg-zinc-950 border-l-4 border-blue-500 rounded-r-2xl">
          <p className="text-sm text-zinc-400 leading-relaxed">
            <strong className="text-zinc-100">Key drivers:</strong> 12 leads in late-stage • Enterprise deal velocity +34% • Product launch momentum from last week
          </p>
        </div>
      </div>

      {/* Strategic Nudges */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
        <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-8">Strategic nudges</h3>
        
        <div className="grid grid-cols-1 gap-4">
          {/* High Priority Nudge */}
          <div className="p-6 bg-green-950/10 border-2 border-green-500 rounded-2xl">
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 bg-green-950/30 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="text-green-500" size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-sans font-medium text-green-500">Contact Sarah Chen within 2 hours</p>
                  <span className="px-2 py-1 bg-green-950/30 text-green-500 rounded text-[10px] font-mono uppercase tracking-widest font-bold">73% → 34%</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">She's researching competitors right now. Window closes at 4:30 PM EST. Conversion probability drops 39% if delayed.</p>
                <button 
                  onClick={() => onAction('Draft personalized message to Sarah Chen')}
                  className="px-6 py-2 bg-green-500 text-black rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-green-400 transition-all"
                >
                  Draft message
                </button>
              </div>
            </div>
          </div>

          {/* Medium Priority */}
          <div className="p-6 bg-blue-950/10 border border-blue-900/20 rounded-2xl">
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 bg-blue-950/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="text-blue-500" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-sans font-medium text-blue-400 mb-1">Optimize outreach timing for Enterprise segment</p>
                <p className="text-xs text-zinc-400 leading-relaxed">Send emails Tuesday 9-11 AM EST for 2.3x higher open rates vs. current schedule</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="p-6 bg-amber-950/10 border border-amber-900/20 rounded-2xl">
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 bg-amber-950/30 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-amber-500" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-sans font-medium text-amber-500 mb-1">Landing page resonance declining</p>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">Current pain signals don't match messaging. Regenerate with latest competitive intel?</p>
                <button 
                  onClick={() => onAction('Regenerate landing page with current signals')}
                  className="px-6 py-2 bg-amber-500 text-black rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-amber-400 transition-all"
                >
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Scoring with Predictions */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
        <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-100 mb-8">High-probability conversions (next 7 days)</h3>
        
        <div className="space-y-4">
          {[
            { name: 'Sarah Chen', role: 'VP Engineering • TechCorp', activity: 'Viewed pricing page 3x today • Downloaded security whitepaper • LinkedIn: "evaluating deployment tools"', score: '73%', sub: 'if contacted now', color: 'green', initial: 'SC' },
            { name: 'Marcus Johnson', role: 'CTO • StartupXYZ', activity: 'Demo scheduled for Friday • Shared deck with team • Asked about SOC2 timeline', score: '61%', sub: 'post-demo close rate', color: 'blue', initial: 'MJ' },
            { name: 'Alicia Lopez', role: 'Product Lead • MegaCo', activity: 'Went dark 5 days ago • Previous: high engagement • Risk: evaluating competitors', score: '47%', sub: 're-engagement needed', color: 'amber', initial: 'AL' },
          ].map((lead, i) => (
            <div key={i} className={`p-6 bg-zinc-950 border-l-4 border-${lead.color}-500 rounded-r-2xl flex justify-between items-start`}>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-10 h-10 rounded-full bg-${lead.color}-950/30 flex items-center justify-center font-bold text-xs text-${lead.color}-500`}>
                    {lead.initial}
                  </div>
                  <div>
                    <p className="text-sm font-sans font-medium text-zinc-100">{lead.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{lead.role}</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">{lead.activity}</p>
              </div>
              <div className="text-right ml-8">
                <p className={`text-2xl font-sans font-bold text-${lead.color}-500`}>{lead.score}</p>
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mt-1">{lead.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 p-8 bg-blue-950/10 border border-blue-900/20 rounded-3xl">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-2xl font-sans font-bold text-blue-500">$47k</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-1">Pipeline value (high-prob)</p>
            </div>
            <div>
              <p className="text-2xl font-sans font-bold text-blue-500">5.2 days</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-1">Avg. time to close</p>
            </div>
            <div>
              <p className="text-2xl font-sans font-bold text-blue-500">68%</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-1">Win rate (similar leads)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
