import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Anchor, Sparkles, ArrowRight, Rocket, CheckCircle2, LogIn } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { auth, db, doc, getDoc, setDoc, serverTimestamp, onAuthStateChanged, signInWithPopup, googleProvider } from '../firebase';
import { toast } from 'sonner';

export default function Success() {
  const [searchParams] = useSearchParams();
  const [founderNumber, setFounderNumber] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  const plan = searchParams.get('plan') || 'pro';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        handleUpgrade(u.uid, u.email);
      } else {
        setIsUpdating(false);
      }
    });
    return unsubscribe;
  }, []);

  const handleUpgrade = async (uid: string, email: string | null) => {
    try {
      await setDoc(doc(db, 'users', uid), {
        plan: plan,
        isPro: plan === 'pro',
        updatedAt: serverTimestamp(),
        email: email
      }, { merge: true });
      
      toast.success(`Account upgraded to ${plan.toUpperCase()}!`);
      setIsUpdating(false);
    } catch (error) {
      console.error('Failed to upgrade account:', error);
      toast.error('Failed to update account status. Please contact support.');
      setIsUpdating(false);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  useEffect(() => {
    setFounderNumber(Math.floor(Math.random() * 15) + 35);
  }, []);

  if (isUpdating) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-zinc-800 border-t-blue-500 rounded-full mb-8"
        />
        <p className="font-mono text-sm uppercase tracking-widest text-zinc-500 animate-pulse">Synchronizing Lab Credentials...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
          <CheckCircle2 size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-mono uppercase tracking-tighter mb-4">Payment Successful</h1>
        <p className="text-zinc-400 max-w-md mb-12 font-light leading-relaxed">
          Your payment was processed successfully. Please log in with your Google account to link your {plan.toUpperCase()} plan to your laboratory profile.
        </p>
        <button
          onClick={handleLogin}
          className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-xl font-mono uppercase text-sm font-bold tracking-widest hover:scale-[1.02] transition-all"
        >
          <LogIn size={18} />
          Link My Account
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans flex items-center justify-center p-8">
      <div className="max-w-3xl w-full text-center space-y-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="w-32 h-32 bg-blue-600 rounded-[40px] flex items-center justify-center mx-auto shadow-[0_0_80px_rgba(37,99,235,0.3)]"
        >
          <Anchor size={64} className="text-white" />
        </motion.div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono uppercase tracking-widest mb-6">
              <Sparkles size={12} /> Mission Initialized
            </div>
            <h1 className="text-5xl md:text-7xl font-mono uppercase tracking-tighter mb-6">
              Welcome to the Fleet, <br /> Founder #{founderNumber}.
            </h1>
            <p className="text-xl text-zinc-400 font-light leading-relaxed max-w-lg mx-auto">
              Your berth is secured. The "Plank Owner" status has been permanently added to your profile.
            </p>
          </motion.div>
        </div>

        {/* Live Mission Feed */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-xl mx-auto bg-zinc-900/30 border border-zinc-800 p-8 rounded-[32px] text-left space-y-6"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Live Autopilot Feed</p>
            <div className="flex items-center gap-2 text-green-500 text-[10px] font-mono uppercase tracking-widest">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Active
            </div>
          </div>
          
          <div className="space-y-3 font-mono text-[11px] text-zinc-400">
            <p className="flex items-center gap-3"><span className="text-blue-500">[SCANNING]</span> Searching Reddit (r/SaaS, r/SideProject)... Found 12 signals.</p>
            <p className="flex items-center gap-3"><span className="text-blue-500">[SCANNING]</span> Searching X (Keywords: "UI help", "SaaS launch")... Found 45 signals.</p>
            <p className="flex items-center gap-3"><span className="text-blue-500">[SYNTHESIZING]</span> Drafting personalized outreach for 57 leads... Ready.</p>
            <p className="flex items-center gap-3"><span className="text-green-500">[KINETICS]</span> First outreach batch scheduled for 9:00 AM (Peak Engagement).</p>
          </div>
        </motion.div>

        {/* Personal Note from Cheryl */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-lg mx-auto p-8 bg-blue-600/5 border border-blue-500/20 rounded-[32px] text-left space-y-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">C</div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-blue-400">A Note from Cheryl</p>
          </div>
          <p className="text-sm text-zinc-300 italic leading-relaxed">
            "You were chosen for the first 50 because your build signals showed a rare combination of speed and vision. Most founders overthink; you ship. I've unlocked the full Autonomics suite for you. Let's build the factory."
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-12"
        >
          <Link 
            to="/studio"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-zinc-100 text-zinc-950 rounded-2xl font-mono uppercase text-sm font-bold tracking-widest hover:bg-white transition-all shadow-xl"
          >
            Enter the Laboratory
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Status', value: 'Plank Owner', icon: Anchor },
            { label: 'Discount', value: '70% Lifetime', icon: Sparkles },
            { label: 'Access', value: 'Unlimited', icon: Rocket },
          ].map((item, i) => (
            <div key={i} className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-3xl">
              <item.icon size={20} className="text-blue-500 mb-4 mx-auto" />
              <p className="text-[10px] font-mono uppercase text-zinc-600 mb-1">{item.label}</p>
              <p className="text-sm font-medium text-zinc-200">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
