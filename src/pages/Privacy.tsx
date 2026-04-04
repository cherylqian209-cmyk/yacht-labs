import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-100 selection:text-black p-8 md:p-24">
      <nav className="mb-16">
        <Link to="/" className="font-mono text-2xl tracking-tighter uppercase flex items-center gap-4">
          <div className="grid grid-cols-3 gap-0.5 w-6 h-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className={`w-full h-full ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-800'}`} />
            ))}
          </div>
          Yacht Labs
        </Link>
      </nav>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-12"
      >
        <h1 className="text-6xl font-mono uppercase tracking-tighter">Privacy Policy</h1>
        
        <section className="space-y-4">
          <h2 className="text-xl font-mono uppercase text-zinc-400">1. Information We Collect</h2>
          <p className="text-zinc-500 leading-relaxed font-light">
            We collect information you provide directly to us when you create an account, use our services, or communicate with us.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-mono uppercase text-zinc-400">2. How We Use Information</h2>
          <p className="text-zinc-500 leading-relaxed font-light">
            We use the information we collect to provide, maintain, and improve our services, and to communicate with you.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-mono uppercase text-zinc-400">3. Data Security</h2>
          <p className="text-zinc-500 leading-relaxed font-light">
            We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-mono uppercase text-zinc-400">4. Changes to this Policy</h2>
          <p className="text-zinc-500 leading-relaxed font-light">
            We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the bottom of the policy.
          </p>
        </section>

        <footer className="pt-24 border-t border-zinc-900 text-zinc-700 text-xs font-mono uppercase tracking-widest">
          Last Updated: April 2, 2026
        </footer>
      </motion.div>
    </div>
  );
}
