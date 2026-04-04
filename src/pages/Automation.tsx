import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

import { 
  Zap, 
  Activity, 
  Layers, 
  Sparkles, 
  TrendingUp, 
  Power, 
  ChevronRight, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Send, 
  Users, 
  Share2, 
  MessageCircle, 
  Edit2, 
  BarChart3,
  MousePointer2,
  Globe,
  Star,
  Bug,
  Heart,
  TrendingDown,
  ArrowUpRight,
  Plus,
  Play,
  Settings,
  Shield,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Copy,
  ExternalLink,
  RefreshCw,
  Layout,
  Terminal,
  Cpu,
  Repeat,
  LayoutDashboard,
  Twitter,
  MessageSquare,
  X,
  Target,
  Waves,
  Megaphone,
  HeartHandshake,
  Database
} from 'lucide-react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-buy-button': any;
    }
  }
}

import { db, doc, onSnapshot, updateDoc, serverTimestamp, getDoc } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { trackEvent } from '../lib/analytics';
import OutreachPanel from '../components/OutreachPanel';
import AutonomousGrowth from '../components/automation/AutonomousGrowth';
import WorkflowBuilder from '../components/automation/WorkflowBuilder';
import CompetitiveIntelligence from '../components/automation/CompetitiveIntelligence';
import PredictiveIntelligence from '../components/automation/PredictiveIntelligence';
import ContentMultiplication from '../components/automation/ContentMultiplication';

const WORKFLOW_TEMPLATES = [
  {
    id: 'user-hunter',
    title: 'User Hunter',
    mission: 'Growth Mission',
    goal: 'Acquire 50 new users.',
    icon: Target,
    color: 'blue',
    description: 'Identify, engage, and onboard 50 high-intent early adopters on 100% Autopilot.',
    blueprint: [
      { pillar: 'Think', desc: 'Scan social horizon (X, Reddit, LinkedIn) for "Pain Signals".', icon: Sparkles },
      { pillar: 'Build', desc: 'Draft unique, value-first responses for each lead.', icon: Layers },
      { pillar: 'Ship', desc: 'Deploy outreach during peak engagement hours.', icon: Zap },
      { pillar: 'Listen', desc: 'Track CTR, Likes, and Sign-ups to measure resonance.', icon: Waves },
      { pillar: 'Repeat', desc: 'Retire weak headlines; double down on high-converting messaging.', icon: Repeat },
    ],
    parameters: [
      { key: 'keywords', label: 'Target Keywords', placeholder: 'e.g., UI design help, SaaS launch, no-code tools', type: 'text' },
      { key: 'platforms', label: 'Target Platforms', options: ['X / Twitter', 'Reddit', 'LinkedIn', 'IndieHackers'], type: 'checkbox' },
      { key: 'payload', label: 'The Payload (Your Link)', placeholder: 'https://your-project.yacht-labs.io/launch', type: 'text' },
      { key: 'velocity', label: 'Daily Outreach Velocity', type: 'range', min: 5, max: 50, default: 15 },
    ]
  },
  {
    id: 'authority-megaphone',
    title: 'Authority Megaphone',
    mission: 'Brand Mission',
    goal: 'Automate my weekly content engine.',
    icon: Megaphone,
    color: 'purple',
    description: 'Build a "Thought Leader" presence to attract high-value contracts and users.',
    blueprint: [
      { pillar: 'Think', desc: 'Identify top 3 trending topics in your niche today.', icon: Sparkles },
      { pillar: 'Build', desc: 'Synthesize 5-post threads or LinkedIn articles.', icon: Layers },
      { pillar: 'Ship', desc: 'Schedule and post during peak engagement hours.', icon: Zap },
      { pillar: 'Listen', desc: 'Monitor "Share" and "Save" counts for high-intent signals.', icon: Waves },
      { pillar: 'Repeat', desc: 'Synthesize follow-up deep-dives based on comments.', icon: Repeat },
    ],
    parameters: [
      { key: 'niche', label: 'Your Niche', placeholder: 'e.g., Solopreneurship, AI, Fintech', type: 'text' },
      { key: 'platforms', label: 'Target Platforms', options: ['X / Twitter', 'LinkedIn', 'Medium'], type: 'checkbox' },
      { key: 'frequency', label: 'Weekly Post Frequency', type: 'range', min: 1, max: 14, default: 7 },
    ]
  },
  {
    id: 'revenue-guard',
    title: 'Revenue Guard',
    mission: 'Retention Mission',
    goal: 'Create a "Self-Healing" feedback loop.',
    icon: HeartHandshake,
    color: 'green',
    description: 'Stop users from quitting and convert them into paying subscribers.',
    blueprint: [
      { pillar: 'Listen', desc: 'Monitor dashboard for users stuck in "Build" > 48h.', icon: Waves },
      { pillar: 'Think', desc: 'Analyze project data to guess why they got stuck.', icon: Sparkles },
      { pillar: 'Build', desc: 'Generate personalized "Rescue" emails with specific tips.', icon: Layers },
      { pillar: 'Ship', desc: 'Deliver the rescue payload directly to user inbox.', icon: Zap },
      { pillar: 'Repeat', desc: 'Trigger 1-on-1 strategy call offers if still stuck.', icon: Repeat },
    ],
    parameters: [
      { key: 'stuck_threshold', label: 'Stuck Threshold (Hours)', type: 'range', min: 12, max: 168, default: 48 },
      { key: 'discount_code', label: 'Rescue Discount Code', placeholder: 'e.g., RESCUE20', type: 'text' },
      { key: 'support_link', label: 'Strategy Call Link', placeholder: 'Calendly link', type: 'text' },
    ]
  }
];

import { PaywallOverlay } from '../components/PaywallOverlay';

export default function Automation({ profile }: { profile: any }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as any || 'dashboard';
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workflows' | 'intelligence' | 'predictive' | 'outreach'>(initialTab);
  const projectId = searchParams.get('project');
  const [project, setProject] = useState<any>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  
  // Custom Workflow State
  const [isCustomWorkflowModalOpen, setIsCustomWorkflowModalOpen] = useState(false);
  const [customTrigger, setCustomTrigger] = useState('');
  const [customAction, setCustomAction] = useState('');
  
  // Workflow Modal State
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [workflowStep, setWorkflowStep] = useState<'intake' | 'blueprint' | 'config' | 'success'>('intake');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [workflowConfig, setWorkflowConfig] = useState<any>({});
  const [isInitializing, setIsInitializing] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleMockupAction = (prompt: string) => {
    toast.info("Synthesizing Action", {
      description: `AI is processing: "${prompt}"`,
      icon: <Sparkles className="text-blue-500" size={16} />
    });
    // In a real app, this would trigger a specific AI flow
  };

  useEffect(() => {
    if (!projectId) return;

    const unsub = onSnapshot(doc(db, 'projects', projectId), (snap) => {
      if (snap.exists()) {
        setProject({ id: snap.id, ...snap.data() });
      }
    }, (error) => {
      console.error("Project listener failed:", error);
      toast.error("Access Denied", {
        description: "You do not have permission to view this project."
      });
    });

    // Simulated Autopilot Logs
    const mockLogs = [
      { id: 1, type: 'think', message: 'Think synthesized "Market Analysis v2"', status: 'Triggered', detail: 'Auto-publishing to Discord...', time: 'Just now' },
      { id: 2, type: 'ship', message: 'Ship finished render "Landing Page v1"', status: 'Success', detail: 'Uploaded to Google Drive Storage', time: '2m ago' },
      { id: 3, type: 'think', message: 'Think synthesized "Investor Deck"', status: 'Success', detail: 'Auto-published to Discord', time: '15m ago' },
      { id: 4, type: 'ship', message: 'Ship finished render "Brand Assets"', status: 'Success', detail: 'Uploaded to Google Drive Storage', time: '1h ago' },
    ];
    setLogs(mockLogs);

    return unsub;
  }, [projectId]);

  const handleToggleAutopilot = async () => {
    if (!projectId || !project) return;
    setIsToggling(true);

    const newState = !project.autopilot;
    
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        autopilot: newState,
        updatedAt: serverTimestamp()
      });

      trackEvent('autopilot_toggle', { projectId, enabled: newState });

      if (newState) {
        toast.success("Autopilot Engaged", {
          description: "Yacht Labs is now orchestrating your project lifecycle. Sit back and watch the resonance grow."
        });
      } else {
        toast.info("Autopilot Disengaged", {
          description: "Manual control restored. The lab is standing by."
        });
      }
    } catch (error) {
      console.error("Failed to toggle autopilot:", error);
      toast.error("System Error", {
        description: "Could not engage autopilot. Check your connection."
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleAddCustomWorkflow = async () => {
    if (!projectId || !project || !customTrigger || !customAction) return;
    
    const newWorkflow = {
      id: Math.random().toString(36).substr(2, 9),
      trigger: customTrigger,
      action: customAction,
      active: true,
      createdAt: new Date().toISOString()
    };

    try {
      const currentWorkflows = project.customWorkflows || [];
      await updateDoc(doc(db, 'projects', projectId), {
        customWorkflows: [...currentWorkflows, newWorkflow],
        updatedAt: serverTimestamp()
      });
      
      toast.success("Workflow Synthesized", {
        description: `New automation rule: When ${customTrigger}, then ${customAction}.`
      });
      
      setIsCustomWorkflowModalOpen(false);
      setCustomTrigger('');
      setCustomAction('');
    } catch (error) {
      console.error("Failed to add workflow:", error);
      toast.error("Failed to save workflow");
    }
  };

  const handleDeleteCustomWorkflow = async (id: string) => {
    if (!projectId || !project) return;
    
    try {
      const updatedWorkflows = (project.customWorkflows || []).filter((w: any) => w.id !== id);
      await updateDoc(doc(db, 'projects', projectId), {
        customWorkflows: updatedWorkflows,
        updatedAt: serverTimestamp()
      });
      toast.success("Workflow Deleted");
    } catch (error) {
      toast.error("Failed to delete workflow");
    }
  };

  if (!projectId) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 font-mono uppercase text-xs tracking-widest bg-zinc-950">
        Select a project from the dashboard to begin automation.
      </div>
    );
  }

  const integrations = [
    { id: 'x', name: 'X (Twitter)', status: project?.integrations?.x ? 'Connected' : 'Disconnected', icon: Globe, url: 'https://x.com' },
    { id: 'linkedin', name: 'LinkedIn', status: project?.integrations?.linkedin ? 'Connected' : 'Disconnected', icon: Share2, url: 'https://linkedin.com' },
    { id: 'reddit', name: 'Reddit', status: project?.integrations?.reddit ? 'Connected' : 'Disconnected', icon: MessageCircle, url: 'https://reddit.com' },
    { id: 'drive', name: 'Google Drive', status: project?.integrations?.drive ? 'Connected' : 'Disconnected', icon: Database, url: 'https://drive.google.com' },
    { id: 'discord', name: 'Discord', status: project?.integrations?.discord ? 'Connected' : 'Disconnected', icon: Globe, url: 'https://discord.com' },
    { id: 'github', name: 'GitHub', status: project?.integrations?.github ? 'Connected' : 'Disconnected', icon: Database, url: 'https://github.com' },
    { id: 'slack', name: 'Slack', status: project?.integrations?.slack ? 'Connected' : 'Disconnected', icon: Share2, url: 'https://slack.com' },
  ];

  const handleConnect = async (id: string, url: string) => {
    if (!projectId) return;
    setConnectingId(id);
    const toastId = toast.loading(`Opening ${id.toUpperCase()} for authorization...`);
    
    try {
      // Open the platform in a new window for "authorization"
      const authWindow = window.open(url, '_blank', 'width=600,height=700');
      
      if (!authWindow) {
        toast.error("Popup Blocked", {
          description: "Please allow popups to authorize Yacht Labs.",
          id: toastId
        });
        setConnectingId(null);
        return;
      }

      // Simulate waiting for the user to authorize
      await new Promise(r => setTimeout(r, 3000));
      
      const updatedIntegrations = {
        ...(project?.integrations || {}),
        [id]: true
      };

      await updateDoc(doc(db, 'projects', projectId), {
        integrations: updatedIntegrations,
        updatedAt: serverTimestamp()
      });

      toast.success(`${id.toUpperCase()} Node Authorized`, { 
        id: toastId,
        description: "Yacht Labs now has permission to access and perform actions on your behalf."
      });
    } catch (error) {
      toast.error(`Failed to authorize ${id}`, { id: toastId });
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!projectId) return;
    const toastId = toast.loading(`Disconnecting ${id.toUpperCase()}...`);
    
    try {
      const updatedIntegrations = {
        ...(project?.integrations || {})
      };
      delete updatedIntegrations[id];

      await updateDoc(doc(db, 'projects', projectId), {
        integrations: updatedIntegrations,
        updatedAt: serverTimestamp()
      });

      toast.success(`${id.toUpperCase()} Node Disconnected`, { id: toastId });
    } catch (error) {
      toast.error(`Failed to disconnect ${id}`, { id: toastId });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      <Toaster position="top-right" theme="dark" />
      <header className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <Repeat className="text-zinc-100" size={20} />
            </div>
            <div>
              <h1 className="text-sm font-mono uppercase tracking-widest text-zinc-100">Repeat Lab</h1>
              <p className="text-[10px] text-zinc-500 font-sans italic">Synthesizing recursive growth loops and outreach automation.</p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-zinc-900 mx-2" />
          
          <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 overflow-x-auto max-w-[600px]">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'workflows', label: 'Workflows', icon: Zap },
              { id: 'intelligence', label: 'Intelligence', icon: Search },
              { id: 'predictive', label: 'Predictive', icon: TrendingUp },
              { id: 'outreach', label: 'Outreach', icon: Send },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'bg-zinc-100 text-zinc-950 shadow-lg' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {activeTab === 'workflows' ? (
            <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-100">Autopilot</span>
                <span className={`text-[8px] font-mono uppercase tracking-widest ${project?.autopilot ? 'text-green-500' : 'text-zinc-600'}`}>
                  {project?.autopilot ? 'Engaged' : 'Standby'}
                </span>
              </div>
              <button 
                onClick={handleToggleAutopilot}
                disabled={isToggling}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${project?.autopilot ? 'bg-green-500' : 'bg-zinc-800'}`}
              >
                <motion.div 
                  animate={{ x: project?.autopilot ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                const industry = prompt("Enter industry or niche for lead generation:", "SaaS Founders");
                if (industry) {
                  window.location.href = `/studio/inference?project=${projectId}&action=generate_leads&industry=${encodeURIComponent(industry)}`;
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg font-mono uppercase text-xs tracking-widest hover:bg-zinc-800 transition-all"
            >
              <Sparkles size={16} className="text-blue-500" /> Generate via Think
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {!profile?.isPro && (
          <PaywallOverlay 
            title="Repeat Lab Required" 
            description="The Repeat Lab handles ecosystem integrations and intelligent automation. Pro Lab members get full access to cross-platform workflows and autopilot orchestration."
          />
        )}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
              {activeTab === 'dashboard' && <AutonomousGrowth onAction={handleMockupAction} />}
              
              {activeTab === 'workflows' && (
                <div className="flex gap-8">
                  {/* Left Column: Integrations & Config */}
                  <div className="w-80 flex flex-col gap-8">
                    <section>
                      <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                        <Layers size={12} className="text-blue-500" /> Ecosystem Nodes
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {integrations.slice(0, 4).map((node, i) => (
                          <div key={i} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <node.icon size={14} className={node.status === 'Connected' ? 'text-blue-500' : 'text-zinc-600'} />
                              <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'Connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-zinc-800'}`} />
                            </div>
                            <div>
                              <p className="text-[10px] font-mono text-zinc-100 uppercase">{node.name}</p>
                              <p className="text-[8px] text-zinc-500 uppercase">{node.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                        <Activity size={12} className="text-green-500" /> Active Pulse
                      </h3>
                      <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">System Health</span>
                          <span className="text-[10px] font-mono text-green-500 uppercase">Optimal</span>
                        </div>
                        <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div 
                            animate={{ width: ['90%', '95%', '92%'] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="h-full bg-green-500" 
                          />
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Right Column: Builder */}
                  <div className="flex-1 overflow-y-auto">
                    <WorkflowBuilder onAction={handleMockupAction} />
                  </div>
                </div>
              )}

              {activeTab === 'intelligence' && <CompetitiveIntelligence onAction={handleMockupAction} />}
              
              {activeTab === 'predictive' && <PredictiveIntelligence onAction={handleMockupAction} />}

              {activeTab === 'outreach' && (
                <div className="space-y-8">
                  <ContentMultiplication onAction={handleMockupAction} />
                  <div className="p-8 border-t border-zinc-900">
                    <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 mb-8">Lead Distribution Tracker</h2>
                    <OutreachPanel profile={profile} projectId={projectId || ''} />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Custom Workflow Builder Modal */}
        <AnimatePresence>
          {isCustomWorkflowModalOpen && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={() => setIsCustomWorkflowModalOpen(false)}
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-zinc-950 border border-zinc-800 rounded-[32px] w-full max-w-lg overflow-hidden flex flex-col shadow-2xl p-10 space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
                      <Zap className="text-blue-500" size={20} />
                    </div>
                    <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-100">Workflow Builder</h2>
                  </div>
                  <button onClick={() => setIsCustomWorkflowModalOpen(false)} className="text-zinc-500 hover:text-zinc-100">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Workflow Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., High-Intent Lead Nurture"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Trigger Event</label>
                    <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50 transition-all appearance-none">
                      <option>New Resonance Signal (Sentiment)</option>
                      <option>Stripe Subscription Event</option>
                      <option>Competitor Activity Detected</option>
                      <option>Predictive Revenue Dip</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Autonomous Action</label>
                    <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50 transition-all appearance-none">
                      <option>Generate & Send Omnichannel Campaign</option>
                      <option>Trigger Personalized Outreach</option>
                      <option>Update Competitive Strategy</option>
                      <option>Notify Sales Team (Slack/Email)</option>
                    </select>
                  </div>

                  <button 
                    onClick={() => {
                      toast.success("Autonomous workflow synthesized and deployed.");
                      setIsCustomWorkflowModalOpen(false);
                    }}
                    className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-mono uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20"
                  >
                    Synthesize Workflow
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Upgrade Modal */}
        <AnimatePresence>
          {isUpgradeModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={() => setIsUpgradeModalOpen(false)}
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-zinc-950 border border-zinc-800 rounded-[32px] w-full max-w-md overflow-hidden flex flex-col shadow-2xl"
              >
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Zap className="text-blue-500" size={40} />
                  </div>
                  <h2 className="text-2xl font-mono uppercase tracking-tighter text-zinc-100 mb-4">Pro Lab Required</h2>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                    Autonomous growth engines and predictive intelligence are exclusive to Pro Lab members. Scale your resonance with Yacht Labs Pro.
                  </p>
                  
                  <div className="space-y-4">
                    <stripe-buy-button
                      buy-button-id={(import.meta as any).env.VITE_STRIPE_PRO_BUTTON_ID}
                      publishable-key={(import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY}
                      customer-email={profile?.email}
                    />
                    <button 
                      onClick={() => setIsUpgradeModalOpen(false)}
                      className="w-full py-4 text-zinc-500 hover:text-zinc-300 font-mono uppercase tracking-widest text-[10px] transition-all"
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
