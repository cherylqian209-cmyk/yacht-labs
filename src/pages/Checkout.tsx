import React from 'react';
import { motion } from 'framer-motion';
import { Anchor, Check, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function Checkout({ user, profile }: { user: any, profile: any }) {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto px-8 py-20">
        {/* Header */}
        <header className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono uppercase tracking-widest mb-6">
              <Sparkles size={12} /> Founder Access Only
            </div>
            <h1 className="text-5xl md:text-7xl font-mono uppercase tracking-tighter mb-6">
              Claim Your Berth <br /> in the First 50.
            </h1>
            <p className="text-xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
              Stop pushing pixels and start owning the market. Lock in the Yacht Labs "Founder Rate" for life.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Value Prop */}
          <div className="space-y-12">
            <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-[32px] space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500">Founder Status</h2>
                <div className="founder-badge">Plank Owner</div>
              </div>
              <p className="text-lg font-light leading-relaxed">
                "As a Founder Member, you receive the permanent <span className="text-blue-400 font-medium">'Plank Owner'</span> badge on your profile. This isn't just status—it’s a <span className="text-white font-bold">70% lifetime discount</span> on all future Laboratory tools (Inference, Synthesis, and Autonomics)."
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500">What's Included</h3>
              <ul className="space-y-4">
                {[
                  "Unlimited Projects & Experiments",
                  "Custom Domains & White-labeling",
                  "The 'Megaphone' Distribution Engine",
                  "Priority Inference Node Access",
                  "Direct Line to the Engineering Team",
                  "Lifetime 'Founder Rate' Lock-in"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-400">
                    <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Check size={12} className="text-blue-400" />
                    </div>
                    <span className="text-sm font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Pricing Card */}
          <div className="relative">
            {/* Live Counter */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest shadow-xl shadow-blue-600/20">
                [34/50] Founder Spots Remaining
              </div>
            </div>

            <div className="bg-white text-black p-12 rounded-[48px] space-y-10 shadow-2xl shadow-blue-500/10">
              <div className="space-y-2">
                <h4 className="text-2xl font-mono uppercase tracking-tighter">Pro Founder Plan</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-mono tracking-tighter">$29</span>
                  <span className="text-zinc-400 font-mono text-sm uppercase">/ month</span>
                  <span className="ml-4 text-xs font-mono text-zinc-400 line-through uppercase tracking-widest">Normally $99</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <button 
                    className="group w-full py-6 bg-black text-white rounded-2xl font-mono uppercase text-sm font-bold tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 pointer-events-none"
                  >
                    <Anchor size={18} className="group-hover:rotate-12 transition-transform" />
                    Secure My Founder Status
                  </button>
                  {/* Direct Stripe Link Overlay */}
                  <a 
                    href="https://buy.stripe.com/00w4gAexu5cvcH48i28g000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-50 cursor-pointer"
                    aria-label="Secure My Founder Status"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 text-center font-mono uppercase tracking-widest">
                  Secure transaction via Stripe
                </p>
              </div>

              <div className="pt-8 border-t border-zinc-100 space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={18} className="text-zinc-400 shrink-0" />
                  <p className="text-xs text-zinc-500 leading-relaxed italic">
                    "No fluff. No over-engineered contracts. Cancel anytime if we don't help you ship faster."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-zinc-900 text-center">
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.4em]">
            Yacht Labs © 2026 / Creative Intelligence
          </p>
        </footer>
      </div>
    </div>
  );
}
