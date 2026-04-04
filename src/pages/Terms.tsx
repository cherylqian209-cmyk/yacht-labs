import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Terms() {
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
        <h1 className="text-6xl font-mono uppercase tracking-tighter">Terms of Service</h1>
        
        <section className="space-y-4">
          <h2 className="text-xl font-mono uppercase text-zinc-400">1. Acceptance of Terms</h2>
          <p className="text-zinc-500 leading-relaxed font-light">
            By accessing or using Yacht Labs, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-mono uppercase text-zinc-400">2. Description of Service</h2>
          <p className="text-zinc-500 leading-relaxed font-light">
            Yacht Labs provides an AI-powered synthesis and deployment platform. We reserve the right to modify or discontinue any part of the service at any time.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-mono uppercase text-zinc-400">3. User Conduct</h2>
          <p className="text-zinc-500 leading-relaxed font-light">
            You are responsible for all activity that occurs under your account. You agree not to use the service for any illegal or unauthorized purpose.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-mono uppercase text-zinc-400">4. Intellectual Property</h2>
          <p className="text-zinc-500 leading-relaxed font-light">
            The service and its original content, features, and functionality are and will remain the exclusive property of Yacht Labs and its licensors.
          </p>
        </section>

        <footer className="pt-24 border-t border-zinc-900 text-zinc-700 text-xs font-mono uppercase tracking-widest">
          Last Updated: April 2, 2026
        </footer>
      </motion.div>
    </div>
  );
}
