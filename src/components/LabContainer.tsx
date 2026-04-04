import React from 'react';
import { auth } from '../firebase';

interface LabContainerProps {
  children: React.ReactNode;
}

export const LabContainer: React.FC<LabContainerProps> = ({ children }) => {
  const isAdmin = auth.currentUser?.email === "cheryl.q731@gmail.com";

  return (
    <div className="min-h-screen w-full bg-navy relative overflow-hidden flex flex-col">
      {/* Grid Background Overlay */}
      <div className="absolute inset-0 lab-grid opacity-20 pointer-events-none" />
      
      {/* Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,116,217,0.1)_0%,transparent_70%)] pointer-events-none" />
      
      {/* Header / Top Bar */}
      <header className="relative z-10 border-b border-lab-blue/30 px-6 py-4 flex items-center justify-between bg-navy/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-electric animate-pulse rounded-full" />
          <h1 className="text-white text-sm font-bold tracking-[0.2em] uppercase">
            System Synthesis <span className="text-lab-blue opacity-50">v1.0.0</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-[10px] text-lab-blue font-bold uppercase tracking-widest hidden sm:block">
            Status: <span className="text-electric">Online</span>
          </div>
          {isAdmin && <div className="founder-badge">Plank Owner</div>}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto w-full p-6 gap-6">
        {children}
      </main>

      {/* Footer / Status Bar */}
      <footer className="relative z-10 border-t border-lab-blue/30 px-6 py-2 flex items-center justify-between text-[9px] text-lab-blue/50 uppercase tracking-[0.1em] font-bold">
        <div>© 2026 Yacht Labs // Technical Workbench</div>
        <div className="flex gap-4">
          <span>Inference: Active</span>
          <span>Lat: 24ms</span>
          <span>Loc: US-WEST-2</span>
        </div>
      </footer>
    </div>
  );
};
