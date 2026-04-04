import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Play, Pause, Settings, Plus, Sparkles, Layers, Waves, Repeat, ArrowRight, CheckCircle2, Clock, Target, Megaphone, HeartHandshake } from 'lucide-react';

interface WorkflowBuilderProps {
  onAction: (prompt: string) => void;
}

export default function WorkflowBuilder({ onAction }: WorkflowBuilderProps) {
  const templates = [
    { id: 'launch', title: 'Product Launch', desc: 'Multi-channel announcement with coordinated distribution, press outreach, and lead nurture', icon: Target, color: 'purple' },
    { id: 'competitor', title: 'Competitor Response', desc: 'Automated monitoring, brief generation, and strategic counter-positioning content', icon: Repeat, color: 'coral' },
    { id: 'nurture', title: 'Lead Nurture', desc: 'Intelligent drip campaign with personalization, timing optimization, and engagement tracking', icon: HeartHandshake, color: 'teal' },
    { id: 'amplification', title: 'Content Amplification', desc: 'One piece → multi-format distribution across all channels with optimal timing', icon: Megaphone, color: 'blue' },
  ];

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-sans font-medium text-zinc-100">Workflow Automation Builder</h2>
          <p className="text-sm text-zinc-500">Visual orchestration • No-code campaign automation</p>
        </div>
        <button 
          onClick={() => onAction('Create new workflow from template')}
          className="px-6 py-2 bg-zinc-100 text-zinc-950 rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-white transition-all flex items-center gap-2"
        >
          New workflow <ArrowRight size={12} />
        </button>
      </div>

      {/* Template Library */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
        <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-8">Pre-built templates</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {templates.map((template) => (
            <div 
              key={template.id}
              onClick={() => onAction(`Load ${template.title} template`)}
              className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl cursor-pointer hover:border-zinc-600 transition-all group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <template.icon className="text-zinc-400 group-hover:text-zinc-100" size={20} />
                </div>
                <p className="text-sm font-sans font-medium text-zinc-100">{template.title}</p>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">{template.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Workflow Visualization */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
        <div className="flex justify-between items-center mb-12">
          <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-100">Active workflow: Product Launch Campaign</h3>
          <div className="flex gap-3">
            <button onClick={() => onAction('Edit workflow')} className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg text-[10px] font-mono uppercase tracking-widest hover:text-zinc-100 transition-colors">Edit</button>
            <button onClick={() => onAction('Pause workflow')} className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg text-[10px] font-mono uppercase tracking-widest hover:text-zinc-100 transition-colors">Pause</button>
          </div>
        </div>

        {/* Visual Flow */}
        <div className="relative p-10 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-x-auto">
          <div className="flex items-center gap-6 min-w-[900px]">
            {/* Trigger Node */}
            <div className="flex-shrink-0 text-center">
              <div className="w-32 p-4 bg-green-950/20 border-2 border-green-500 rounded-2xl">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Play className="text-green-500" size={16} />
                </div>
                <p className="text-xs font-mono uppercase tracking-widest text-green-500 font-bold">Trigger</p>
                <p className="text-[10px] text-green-500/60 mt-1">Launch event</p>
              </div>
            </div>

            <div className="flex-shrink-0 w-12 h-px bg-zinc-800" />

            {/* Think Node */}
            <div className="flex-shrink-0 text-center">
              <div className="w-32 p-4 bg-purple-950/20 border-2 border-purple-500 rounded-2xl">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="text-purple-500" size={16} />
                </div>
                <p className="text-xs font-mono uppercase tracking-widest text-purple-500 font-bold">Think</p>
                <p className="text-[10px] text-purple-500/60 mt-1">Analyze signals</p>
              </div>
              <div className="mt-3 flex items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-widest text-green-500">
                <CheckCircle2 size={10} /> Complete
              </div>
            </div>

            <div className="flex-shrink-0 w-12 h-px bg-zinc-800" />

            {/* Build Node */}
            <div className="flex-shrink-0 text-center">
              <div className="w-32 p-4 bg-teal-950/20 border-2 border-teal-500 rounded-2xl">
                <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Layers className="text-teal-500" size={16} />
                </div>
                <p className="text-xs font-mono uppercase tracking-widest text-teal-500 font-bold">Build</p>
                <p className="text-[10px] text-teal-500/60 mt-1">8 assets</p>
              </div>
              <div className="mt-3 flex items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-widest text-green-500">
                <CheckCircle2 size={10} /> Complete
              </div>
            </div>

            <div className="flex-shrink-0 w-12 h-px bg-blue-500" />

            {/* Ship Node (Active) */}
            <div className="flex-shrink-0 text-center">
              <div className="w-32 p-4 bg-blue-950/20 border-2 border-blue-500 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="text-blue-500" size={16} />
                </div>
                <p className="text-xs font-mono uppercase tracking-widest text-blue-500 font-bold">Ship</p>
                <p className="text-[10px] text-blue-500/60 mt-1">Multi-channel</p>
              </div>
              <div className="mt-3 flex items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-widest text-blue-500 animate-pulse">
                <Clock size={10} /> Running...
              </div>
            </div>

            <div className="flex-shrink-0 w-12 h-px bg-zinc-800 opacity-30" />

            {/* Listen Node (Queued) */}
            <div className="flex-shrink-0 text-center opacity-40">
              <div className="w-32 p-4 bg-zinc-900 border-2 border-zinc-800 rounded-2xl">
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Waves className="text-zinc-500" size={16} />
                </div>
                <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold">Listen</p>
                <p className="text-[10px] text-zinc-600 mt-1">Track metrics</p>
              </div>
              <div className="mt-3 text-[10px] font-mono uppercase tracking-widest text-zinc-600">Queued</div>
            </div>

            <div className="flex-shrink-0 w-12 h-px bg-zinc-800 opacity-30" />

            {/* Repeat Node (Queued) */}
            <div className="flex-shrink-0 text-center opacity-40">
              <div className="w-32 p-4 bg-zinc-900 border-2 border-zinc-800 rounded-2xl">
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Repeat className="text-zinc-500" size={16} />
                </div>
                <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold">Repeat</p>
                <p className="text-[10px] text-zinc-600 mt-1">Optimize loop</p>
              </div>
              <div className="mt-3 text-[10px] font-mono uppercase tracking-widest text-zinc-600">Queued</div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-12 pt-8 border-t border-zinc-900">
            <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">Overall progress</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-100 font-bold">3 of 5 complete</p>
            </div>
            <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                className="h-full bg-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Execution Details */}
        <div className="mt-6 p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">Current execution</p>
          <div className="grid grid-cols-2 gap-x-12 gap-y-3">
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <div className="w-1 h-1 bg-zinc-600 rounded-full" />
              Posting to X: <span className="text-zinc-100 font-medium ml-auto">3 of 9 tweets scheduled</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <div className="w-1 h-1 bg-green-500 rounded-full" />
              LinkedIn announcement: <span className="text-zinc-100 font-medium ml-auto">Published 12m ago (47 impressions)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
              Email to investor list: <span className="text-zinc-100 font-medium ml-auto">Sending batch 2 of 4 (67% open rate)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <div className="w-1 h-1 bg-green-500 rounded-full" />
              Press release: <span className="text-zinc-100 font-medium ml-auto">Distributed to 23 outlets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
