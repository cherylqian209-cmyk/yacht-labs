import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { motion } from 'framer-motion';
import { ArrowRight, Github, Mail, Sparkles, Layers, Zap, Waves, Repeat } from 'lucide-react';

export default function LandingPage() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeMagnet, setActiveMagnet] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.code === 'auth/unauthorized-domain') {
        setLoginError('Domain not authorized. Please add yacht-labs.com to "Authorized domains" in Firebase Console > Authentication > Settings.');
      } else {
        setLoginError('Login failed. Please check your connection or try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-100 selection:text-black flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center mix-blend-difference">
        <div className="flex items-center gap-4">
          <div className="grid grid-cols-3 gap-0.5 w-6 h-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className={`w-full h-full ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-800'}`} />
            ))}
          </div>
          <span className="font-mono text-2xl tracking-tighter uppercase">Yacht Labs</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen relative flex flex-col items-center justify-center px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)]" />
        </div>

        <div className="z-10 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-mono leading-[0.9] tracking-tighter uppercase mb-6">
              Build it.<br />Ship it. Done.
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg md:text-xl font-light max-w-xl mx-auto mb-12 leading-relaxed text-zinc-400"
          >
            Stop pushing pixels and start onboarding users. Yacht Labs is the workbench for your next big move.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-4 w-full max-w-sm mx-auto"
          >
            <button
              onClick={handleGoogleLogin}
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-red-400 font-mono uppercase tracking-wider"
              >
                {loginError}
              </motion.div>
            )}

            <button
              onClick={() => setShowEmailForm(!showEmailForm)}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-xl text-sm font-medium transition-all hover:bg-zinc-800 hover:text-zinc-100"
            >
              <Mail size={20} />
              Sign up with email
            </button>

            {showEmailForm && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3 mt-2"
              >
                <input 
                  type="email" 
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600"
                />
                <input 
                  type="password" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600"
                />
                <button className="w-full py-4 bg-zinc-100 text-black rounded-xl text-sm font-bold uppercase tracking-widest">
                  Create Account
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Free Samples Section */}
      <section className="px-8 py-32 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 mb-4">Free Samples</h2>
            <h3 className="text-4xl font-mono uppercase tracking-tighter">Synthesis Lead Magnets</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-zinc-900/30 border border-zinc-800 p-12 rounded-[48px] flex flex-col justify-between group hover:border-zinc-700 transition-all">
              <div>
                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-zinc-700 transition-colors">
                  <Layers className="text-zinc-400" size={32} />
                </div>
                <h4 className="text-2xl font-mono uppercase mb-4">SaaS Landing Page Generator</h4>
                <p className="text-zinc-500 font-light leading-relaxed mb-8">
                  Generate a high-conversion landing page brief and structure for your next SaaS idea in seconds.
                </p>
              </div>
              <button 
                onClick={() => setActiveMagnet('SaaS Landing Page Generator')}
                className="flex items-center gap-2 text-zinc-100 font-mono uppercase text-xs tracking-widest group-hover:gap-4 transition-all"
              >
                Access Tool <ArrowRight size={16} />
              </button>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800 p-12 rounded-[48px] flex flex-col justify-between group hover:border-zinc-700 transition-all">
              <div>
                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-zinc-700 transition-colors">
                  <Zap className="text-zinc-400" size={32} />
                </div>
                <h4 className="text-2xl font-mono uppercase mb-4">Project Scaffolder</h4>
                <p className="text-zinc-500 font-light leading-relaxed mb-8">
                  Instantly generate a project roadmap, tech stack recommendation, and initial task list.
                </p>
              </div>
              <button 
                onClick={() => setActiveMagnet('Project Scaffolder')}
                className="flex items-center gap-2 text-zinc-100 font-mono uppercase text-xs tracking-widest group-hover:gap-4 transition-all"
              >
                Access Tool <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Magnet Modal */}
      {activeMagnet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setActiveMagnet(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-zinc-900 border border-zinc-800 p-12 rounded-[48px] max-w-lg w-full text-center space-y-8"
          >
            <div className="w-20 h-20 bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto">
              <Sparkles className="text-zinc-100" size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-mono uppercase tracking-tighter">Sign up to use the {activeMagnet}</h3>
              <p className="text-zinc-500 font-light text-sm">Join Yacht Labs to access our suite of synthesis tools and start building your vision today.</p>
            </div>
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-xl text-sm font-bold uppercase tracking-widest transition-all hover:scale-[1.02]"
              >
                Continue with Google
              </button>
              {loginError && (
                <p className="text-[10px] text-red-500 font-mono uppercase tracking-wider">{loginError}</p>
              )}
              <button 
                onClick={() => {
                  setActiveMagnet(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest hover:text-zinc-300 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Features Grid */}
      <section className="px-8 py-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-900 border-b border-zinc-800">
        {[
          { title: 'Think', desc: 'AI-driven task management and document synthesis. Plan your next move with intelligence.', icon: Sparkles },
          { title: 'Build', desc: 'The Assembler. Turn raw, messy research into investor decks or landing pages.', icon: Layers },
          { title: 'Ship', desc: 'The Engine. Automation and deployment layer. Ideas are static, Ship makes them move.', icon: Zap },
          { title: 'Listen', desc: 'Vibe & Feedback. Sentiment analysis and social listening to de-risk your launch.', icon: Waves },
          { title: 'Repeat', desc: 'Ecosystem Integrations. Automate recurring workflows and feedback loops.', icon: Repeat },
          { title: 'Documentation', desc: 'Real-time collaborative documentation and planning.', icon: ArrowRight },
        ].map((f, i) => (
          <div key={i} className="bg-black p-12 hover:bg-zinc-950 transition-colors group cursor-default">
            <f.icon className="mb-8 opacity-40 group-hover:opacity-100 transition-opacity" size={32} />
            <h3 className="text-2xl font-mono uppercase mb-4">{f.title}</h3>
            <p className="text-zinc-500 font-light leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Pricing Section */}
      <section className="px-8 py-32 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 mb-4">The Lab Access</h2>
          <h3 className="text-5xl font-mono uppercase tracking-tighter mb-16">Choose Your Velocity</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-zinc-900/30 border border-zinc-800 p-12 rounded-[48px] text-left">
              <h4 className="text-xl font-mono uppercase mb-2">Free Tier</h4>
              <p className="text-4xl font-mono mb-8">$0 <span className="text-sm text-zinc-600">/ forever</span></p>
              <ul className="space-y-4 mb-12 text-sm text-zinc-400 font-light">
                <li className="flex items-center gap-2"><ArrowRight size={12} className="text-zinc-600" /> 1 Active Project</li>
                <li className="flex items-center gap-2"><ArrowRight size={12} className="text-zinc-600" /> Basic Synthesis</li>
                <li className="flex items-center gap-2"><ArrowRight size={12} className="text-zinc-600" /> Manual Kinetics (Ship)</li>
                <li className="flex items-center gap-2 text-zinc-700 line-through"><ArrowRight size={12} /> Real-time Mission Control</li>
                <li className="flex items-center gap-2 text-zinc-700 line-through"><ArrowRight size={12} /> Autopilot Growth Engine</li>
              </ul>
              <div className="relative">
                <button 
                  className="w-full py-4 border border-zinc-800 rounded-xl font-mono uppercase text-xs tracking-widest hover:bg-zinc-800 transition-colors pointer-events-none"
                >
                  Get Started
                </button>
                {/* Stripe Buy Button Overlay */}
                <div className="absolute inset-0 z-50">
                  {/* @ts-ignore */}
                  <stripe-buy-button
                    buy-button-id="buy_btn_1TH3HBLTAUCFfwHWguDiyMpg"
                    publishable-key="pk_live_51TH1X8LTAUCFfwHWy2ZreyGIHneYTBd9bMNJJghUxN275FuRt5bdtbDZ3IQ15ff0o6NXshNsXVcfHbukzjqbCxjO00pXZylYgj"
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      opacity: 0, 
                      cursor: 'pointer',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Pro Tier */}
            <div className="bg-white text-black p-12 rounded-[48px] text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <Sparkles size={32} className="text-black/10" />
              </div>
              <h4 className="text-xl font-mono uppercase mb-2">Pro Lab</h4>
              <p className="text-4xl font-mono mb-8">$99 <span className="text-sm opacity-50">/ month</span></p>
              <ul className="space-y-4 mb-12 text-sm font-medium">
                <li className="flex items-center gap-2"><ArrowRight size={12} /> Unlimited Projects</li>
                <li className="flex items-center gap-2"><ArrowRight size={12} /> Advanced Synthesis (Lead Magnets)</li>
                <li className="flex items-center gap-2"><ArrowRight size={12} /> Real-time Mission Control</li>
                <li className="flex items-center gap-2"><ArrowRight size={12} /> Autopilot Growth Engine (50 Users)</li>
                <li className="flex items-center gap-2"><ArrowRight size={12} /> Priority Inference Nodes</li>
              </ul>
              <div className="relative">
                <button 
                  className="w-full py-4 bg-black text-white rounded-xl font-mono uppercase text-xs tracking-widest hover:bg-zinc-800 transition-colors pointer-events-none"
                >
                  Go Pro
                </button>
                {/* Direct Stripe Link Overlay */}
                <a 
                  href="https://buy.stripe.com/00w4gAexu5cvcH48i28g000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-50 cursor-pointer"
                  aria-label="Upgrade to Pro"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
        <span className="font-mono text-sm opacity-30 uppercase tracking-widest">© 2026 Yacht Labs / Creative Intelligence</span>
        <div className="flex gap-8">
          <a href="/terms" className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300 transition-colors">Terms</a>
          <a href="/privacy" className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300 transition-colors">Privacy</a>
        </div>
      </footer>
    </div>

  );
}
