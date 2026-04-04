import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: 'left' | 'right' | 'top' | 'bottom';
}

const steps: TourStep[] = [
  {
    targetId: 'sidebar-nav',
    title: 'The Cargo Hold',
    content: 'This is where your projects and assets live. Everything you build is saved here automatically.',
    position: 'right'
  },
  {
    targetId: 'main-canvas',
    title: 'The Workbench',
    content: 'This is your active space. Drag, drop, and iterate. Perfection is optional; progress is mandatory.',
    position: 'bottom'
  },
  {
    targetId: 'launch-button',
    title: 'The Horizon',
    content: "When you’re ready to show the world, hit 'Launch.' We’ll handle the heavy lifting.",
    position: 'left'
  }
];

export default function UITour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('yacht-labs-tour-seen');
    if (!hasSeenTour) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      const target = document.getElementById(steps[currentStep].targetId);
      if (target) {
        const rect = target.getBoundingClientRect();
        setCoords({
          top: rect.top + rect.height / 2,
          left: rect.left + rect.width / 2
        });
      }
    }
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsVisible(false);
      localStorage.setItem('yacht-labs-tour-seen', 'true');
    }
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ 
          top: coords.top, 
          left: coords.left,
          transform: 'translate(-50%, -50%)' 
        }}
        className="absolute pointer-events-auto w-72 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-100">{step.title}</h3>
          <button onClick={() => setIsVisible(false)} className="text-zinc-500 hover:text-zinc-100">
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed mb-6">
          {step.content}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono text-zinc-600">{currentStep + 1} / {steps.length}</span>
          <button 
            onClick={handleNext}
            className="px-4 py-2 bg-zinc-100 text-zinc-950 rounded-lg text-[10px] font-mono uppercase tracking-widest hover:bg-zinc-300 transition-all"
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>

        {/* Pointer Arrow */}
        <div className={`absolute w-3 h-3 bg-zinc-900 border-t border-l border-zinc-800 rotate-45 ${
          step.position === 'right' ? '-left-1.5 top-1/2 -translate-y-1/2 -rotate-45' :
          step.position === 'left' ? '-right-1.5 top-1/2 -translate-y-1/2 rotate-[135deg]' :
          step.position === 'bottom' ? '-top-1.5 left-1/2 -translate-x-1/2 rotate-45' :
          '-bottom-1.5 left-1/2 -translate-x-1/2 rotate-[225deg]'
        }`} />
      </motion.div>
    </div>
  );
}
