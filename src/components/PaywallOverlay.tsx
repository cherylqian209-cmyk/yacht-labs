import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PaywallOverlayProps {
  title: string;
  description: string;
}

export const PaywallOverlay: React.FC<PaywallOverlayProps> = ({ title, description }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md rounded-[32px]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-10 rounded-[40px] text-center space-y-8 shadow-2xl shadow-blue-500/10"
      >
        <div className="w-20 h-20 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex items-center justify-center mx-auto">
          <Lock size={40} className="text-blue-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-mono uppercase tracking-tighter text-zinc-100">{title}</h3>
          <p className="text-zinc-500 font-light text-sm leading-relaxed">{description}</p>
        </div>

        <div className="space-y-4">
          <Link 
            to="/studio/checkout"
            className="group w-full flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-xl font-mono uppercase text-xs font-bold tracking-widest hover:scale-[1.02] transition-all"
          >
            <Sparkles size={16} />
            Upgrade to Pro Lab
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            Unlock all laboratory modules instantly
          </p>
        </div>
      </motion.div>
    </div>
  );
};
