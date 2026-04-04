import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Twitter, Linkedin, Mail, Layout, FileCode, Shield, CheckCircle2, Clock, ArrowRight, Sparkles, Database, Globe, Share2 } from 'lucide-react';

interface ContentMultiplicationProps {
  onAction: (prompt: string) => void;
}

export default function ContentMultiplication({ onAction }: ContentMultiplicationProps) {
  const assets = [
    { id: 'blog', title: 'Blog post', desc: '1,847 words', detail: '"Rethinking Enterprise Security: Why Zero-Trust Doesn\'t Have to Be Zero-Fun"', icon: FileText, color: 'purple' },
    { id: 'twitter', title: 'X thread', desc: '9 tweets', detail: 'Opening hook + 3 pain points + solution + proof point + CTA', icon: Twitter, color: 'blue' },
    { id: 'linkedin', title: 'LinkedIn carousel', desc: '7 slides', detail: 'Stat-driven narrative with visual data points', icon: Linkedin, color: 'teal' },
    { id: 'email', title: 'Email sequence', desc: '5 emails', detail: 'Nurture flow: Awareness → Education → Consideration → Decision → Retention', icon: Mail, color: 'coral' },
    { id: 'landing', title: 'Landing page copy', desc: 'Hero + 5 sections', detail: 'Conversion-optimized structure with social proof and urgency', icon: Layout, color: 'pink' },
    { id: 'press', title: 'Press release', desc: '847 words', detail: 'AP style with executive quotes and analyst context', icon: Globe, color: 'amber' },
    { id: 'docs', title: 'Product docs', desc: 'Quick start guide', detail: 'Technical onboarding with code examples and troubleshooting', icon: FileCode, color: 'green' },
    { id: 'sales', title: 'Sales one-pager', desc: 'Objection handling', detail: 'Battle card with competitive positioning and ROI calculator', icon: Shield, color: 'red' },
  ];

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-sans font-medium text-zinc-100">Content Multiplication Engine</h2>
          <p className="text-sm text-zinc-500">One brief → Entire omnichannel campaign in 5 minutes</p>
        </div>
      </div>

      {/* Input Brief Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
            <FileText className="text-zinc-400" size={18} />
          </div>
          <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500">Source brief</h3>
        </div>
        <div className="p-8 bg-zinc-950 border-l-4 border-blue-500 rounded-r-2xl">
          <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
            <p><strong className="text-zinc-100">Campaign:</strong> Enterprise Security Product Launch</p>
            <p><strong className="text-zinc-100">Key message:</strong> Zero-trust architecture without complexity tax</p>
            <p><strong className="text-zinc-100">Pain points:</strong> Legacy VPN brittleness, compliance burden, deployment friction</p>
            <p><strong className="text-zinc-100">Tone:</strong> Technical but accessible, confident without arrogant</p>
          </div>
        </div>
      </div>

      {/* Output Channels */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-100">Generated assets</h3>
          <span className="px-4 py-1.5 bg-green-950/30 text-green-500 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold">8 assets • 4m 23s</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {assets.map((asset) => (
            <div key={asset.id} className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl group hover:border-zinc-600 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-10 h-10 bg-${asset.color}-950/30 rounded-xl flex items-center justify-center`}>
                  <asset.icon className={`text-${asset.color}-500`} size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-sans font-medium text-zinc-100">{asset.title}</p>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{asset.desc}</p>
                </div>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mb-6">{asset.detail}</p>
              <button 
                onClick={() => onAction(`Show ${asset.title} draft`)}
                className="w-full py-2 bg-zinc-900 text-zinc-300 rounded-xl text-[10px] font-mono uppercase tracking-widest hover:text-zinc-100 transition-colors flex items-center justify-center gap-2"
              >
                Review <ArrowRight size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Brand Voice Consistency */}
        <div className="mt-8 p-6 bg-blue-950/10 border border-blue-900/20 rounded-2xl">
          <div className="flex items-center gap-4 text-sm text-blue-400">
            <Sparkles size={18} />
            <p><strong>Brand voice consistency:</strong> 94% match across all assets • Tone calibrated to technical-but-accessible</p>
          </div>
        </div>
      </div>
    </div>
  );
}
