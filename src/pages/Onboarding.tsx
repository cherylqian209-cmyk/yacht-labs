import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, TrendingUp, Compass, ArrowRight } from 'lucide-react';
import { db, auth, doc, setDoc, serverTimestamp } from '../firebase';

export default function Onboarding() {
  const handleSelectIntent = async (intent: string) => {
    if (!auth.currentUser) return;
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        intent,
        onboarded: true,
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Failed to update intent:', error);
    }
  };

  const options = [
    {
      id: 'builder',
      title: "I'm launching a new product.",
      desc: "Focus on: MVP tools, landing pages, core UI",
      icon: Rocket,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      id: 'optimizer',
      title: "I'm scaling an existing app.",
      desc: "Focus on: Analytics, user flows, friction-reduction",
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-400/10'
    },
    {
      id: 'explorer',
      title: "I just want to see how this works.",
      desc: "Focus on: Sandbox, demo data",
      icon: Compass,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-mono uppercase tracking-tighter mb-4">What’s on the workbench today?</h1>
          <p className="text-zinc-500 text-lg">We’ll prep the lab based on your goal.</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4">
          {options.map((option, i) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleSelectIntent(option.id)}
              className="group flex items-center gap-6 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-left transition-all hover:bg-zinc-900 hover:border-zinc-700 hover:scale-[1.01]"
            >
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${option.bg} ${option.color}`}>
                <option.icon size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-medium text-zinc-100 mb-1">{option.title}</h3>
                <p className="text-zinc-500 text-sm">{option.desc}</p>
              </div>
              <ArrowRight size={24} className="text-zinc-700 group-hover:text-zinc-100 transition-colors" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
