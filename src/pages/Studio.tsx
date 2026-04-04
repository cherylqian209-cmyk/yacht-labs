import React, { useState, useEffect } from 'react';
import { db, auth, collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, setDoc } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, Clock, ChevronRight, Activity, Rocket, Zap, ArrowLeft, Users, Share2, MessageSquare, TrendingUp, ShieldCheck, ExternalLink, Megaphone, Anchor, AlertCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { trackEvent } from '../lib/analytics';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function Studio({ profile }: { profile: any }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  
  const [projects, setProjects] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'projects'),
      where('ownerId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(p);
      
      if (projectId) {
        const found = p.find(proj => proj.id === projectId);
        setCurrentProject(found || null);
      } else {
        setCurrentProject(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId]);

  const [activeVisitors, setActiveVisitors] = useState(0);

  useEffect(() => {
    if (currentProject?.isLaunched) {
      const interval = setInterval(() => {
        setActiveVisitors(prev => {
          const change = Math.floor(Math.random() * 3) - 1; // -1, 0, 1, or 2
          return Math.max(0, prev + change);
        });
      }, 5000);
      
      // Initial burst
      setActiveVisitors(Math.floor(Math.random() * 10) + 5);
      
      return () => clearInterval(interval);
    }
  }, [currentProject?.isLaunched]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName || !auth.currentUser) return;

    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        name: newProjectName,
        ownerId: auth.currentUser.uid,
        isLaunched: false,
        autopilot: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNewProjectName('');
      setShowNewProject(false);
      
      toast.success('Project Initialized.', {
        description: "Nice work. You’ve officially moved faster than 90% of your competition today. Keep that momentum.",
        duration: 5000,
      });

      setSearchParams({ project: docRef.id });
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleLaunch = async () => {
    if (!currentProject) return;
    setIsLaunching(true);
    setLaunchStep(1);

    // Step 1: The Cargo Prep (Synthesis)
    const brandedUrl = `https://yacht-labs.com/pub/${currentProject.id}`;
    const launchPackage = {
      id: currentProject.id,
      name: currentProject.name,
      url: brandedUrl,
      description: "A high-performance SaaS built with Yacht Labs.",
      timestamp: new Date().toISOString()
    };
    console.log("Cargo Prep Complete:", launchPackage);

    // Step 2: The Pitch (Inference)
    // In a real app, we'd call Gemini here. For the demo, we'll simulate the AI generation.
    const pitches = {
      x: `I just launched ${currentProject.name} using @YachtLabs. It solves the manual build problem in under 5 minutes. Check it out: ${launchPackage.url}`,
      linkedin: `Excited to announce the launch of ${currentProject.name}. Built entirely on the Yacht Labs platform, this project represents a new standard in rapid development. View the live build: ${launchPackage.url}`,
      indiehackers: `Just shipped ${currentProject.name}. Technical stack: React, Tailwind, Firebase. Built in record time using Yacht Labs' synthesis engine. Feedback welcome! ${launchPackage.url}`
    };

    const steps = [
      "Cargo Prep: Bundling Launch Package...",
      "The Pitch: Generating AI Social Copy...",
      "The Delivery: Triggering Webhook Relay...",
      "Directory Submission: Pre-filling Product Hunt...",
      "Initializing Acoustics Radar...",
      "Mission Control Online."
    ];

    for (let i = 0; i < steps.length; i++) {
      setLaunchStep(i + 1);
      await new Promise(r => setTimeout(r, 1200));
      
      if (i === 2) {
        // Step 3: The Delivery (Kinetics)
        console.log("Webhook Triggered to Zapier/Make:", launchPackage);
      }
      
      if (i === 3) {
        // Step 4: The Directory Submission
        const phUrl = `https://www.producthunt.com/posts/new?url=${encodeURIComponent(launchPackage.url)}&name=${encodeURIComponent(currentProject.name)}&tagline=${encodeURIComponent(launchPackage.description)}`;
        window.open(phUrl, '_blank');
      }
    }

    try {
      // Create a deployment record for the project so the URL is live
      try {
        await setDoc(doc(db, 'deployments', currentProject.id), {
          projectId: currentProject.id,
          title: currentProject.name,
          content: `Project ${currentProject.name} has been launched. Visit the Build section to generate detailed assets.`,
          status: 'Live',
          region: 'Global Edge',
          deployedAt: serverTimestamp(),
          url: brandedUrl,
          liveUrl: `${window.location.origin}/pub/${currentProject.id}`,
          type: 'main'
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `deployments/${currentProject.id}`);
      }

      await updateDoc(doc(db, 'projects', currentProject.id), {
        isLaunched: true,
        updatedAt: serverTimestamp()
      });

      trackEvent('project_launch', { projectId: currentProject.id });

      toast.success("Launch Successful", {
        description: "Your project is now live. Social posts are queued and Product Hunt is ready for submission."
      });
    } catch (error) {
      console.error("Launch failed:", error);
      toast.error("Launch Aborted", { description: "System error during ignition." });
    } finally {
      setIsLaunching(false);
      setLaunchStep(0);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-100 rounded-full"
        />
      </div>
    );
  }

  // Mission Control View (Launched Project)
  if (currentProject?.isLaunched) {
    return (
      <div className="p-8 max-w-7xl mx-auto min-h-screen flex flex-col bg-zinc-950">
        <Toaster position="top-right" theme="dark" />
        
        <header className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSearchParams({})}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-mono uppercase tracking-tighter">{currentProject.name}</h1>
                <span className="px-2 py-0.5 bg-green-950 text-green-500 text-[10px] font-mono uppercase tracking-widest rounded border border-green-900">Live</span>
                {profile?.isPro && <div className="founder-badge">Plank Owner</div>}
              </div>
              <p className="text-zinc-500 font-sans text-sm">Mission Control — Distribution & Growth Active</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Link 
              to={`/studio/think?project=${currentProject.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg font-mono uppercase text-xs tracking-widest hover:bg-zinc-800 transition-all"
            >
              Back to Workbench
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp size={80} />
              </div>
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">Velocity</p>
              <p className="text-4xl font-mono text-zinc-100 mb-1">{activeVisitors}</p>
              <p className="text-[10px] font-mono text-green-500 uppercase tracking-widest flex items-center gap-1">
                <Activity size={10} /> Active Visitors
              </p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <MessageSquare size={80} />
              </div>
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">Resonance</p>
              <p className="text-4xl font-mono text-zinc-100 mb-1">48</p>
              <p className="text-[10px] font-mono text-blue-500 uppercase tracking-widest">Social Mentions</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users size={80} />
              </div>
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">Conversion</p>
              <p className="text-4xl font-mono text-zinc-100 mb-1">3 <span className="text-lg text-zinc-600">/ 50</span></p>
              <p className="text-[10px] font-mono text-purple-500 uppercase tracking-widest">Early Adopters</p>
            </div>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-100 mb-4 flex items-center gap-2">
                <Zap size={14} className="text-yellow-500" /> Autopilot Status
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                The Autopilot is currently promoting your launch on X and LinkedIn. 10 high-potential leads have been contacted.
              </p>
            </div>
            <Link 
              to={`/studio/repeat?project=${currentProject.id}`}
              className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-zinc-100 transition-colors flex items-center gap-2"
            >
              Manage Automation <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 mb-6">Live Distribution Log</h2>
            <div className="space-y-4">
              {[
                { time: 'Just now', event: 'Launch Alert sent to Slack/Discord', platform: 'Ecosystem' },
                { time: '2m ago', event: 'Hunter DM sent to @founder_jane', platform: 'X' },
                { time: '15m ago', event: 'Launch announcement posted to LinkedIn', platform: 'LinkedIn' },
                { time: '1h ago', event: 'Project submitted to IndieHackers', platform: 'IndieHackers' },
                { time: '2h ago', event: 'Acoustics sensors initialized', platform: 'System' },
              ].map((log, i) => (
                <div key={i} className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-[10px] font-mono text-zinc-500">
                      {log.platform[0]}
                    </div>
                    <div>
                      <p className="text-sm text-zinc-200">{log.event}</p>
                      <p className="text-[10px] font-mono text-zinc-600 uppercase">{log.platform}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600">{log.time}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 mb-6">Revenue & Upgrades</h2>
            <div className={`bg-zinc-900/50 border p-8 rounded-3xl ${profile?.isPro ? 'border-blue-500/50 bg-blue-500/5' : 'border-zinc-800 border-dashed'}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${profile?.isPro ? 'bg-blue-600 text-white' : 'bg-blue-600/20 text-blue-500'}`}>
                  {profile?.isPro ? <Anchor size={24} /> : <ShieldCheck size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-sans font-medium text-zinc-100">
                    {profile?.isPro ? 'Founder Status Active' : 'Pro Distribution'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {profile?.isPro ? 'You have unlimited launch capacity and priority support.' : 'Unlock real-time tracking for your first 50 users.'}
                  </p>
                </div>
              </div>
              {!profile?.isPro ? (
                <div className="relative">
                  <button className="w-full py-4 bg-zinc-100 text-zinc-950 rounded-xl font-mono uppercase text-xs tracking-widest hover:bg-zinc-300 transition-all mb-4 pointer-events-none">
                    Upgrade to Pro — $49/mo
                  </button>
                  {/* Direct Stripe Link Overlay */}
                  <a 
                    href="https://buy.stripe.com/00w4gAexu5cvcH48i28g000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-50 cursor-pointer"
                    aria-label="Upgrade to Pro"
                  />
                  <p className="text-[10px] text-center text-zinc-600 font-mono uppercase tracking-widest">
                    You are currently on the Free Tier. Launch data is delayed by 15 minutes.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-[10px] font-mono uppercase text-blue-400 mb-1">Current Plan</p>
                    <p className="text-sm font-medium text-zinc-200">Plank Owner (Lifetime)</p>
                  </div>
                  <Link 
                    to="/studio/success"
                    className="w-full py-3 border border-zinc-800 text-zinc-400 rounded-xl font-mono uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition-all block text-center"
                  >
                    View Founder Certificate
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Workbench View (Project Selected but not Launched)
  if (currentProject) {
    return (
      <div className="p-8 max-w-7xl mx-auto min-h-screen flex flex-col bg-zinc-950">
        <Toaster position="top-right" theme="dark" />
        
        <header className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSearchParams({})}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-mono uppercase tracking-tighter">{currentProject.name}</h1>
                {profile?.isPro && <div className="founder-badge">Plank Owner</div>}
              </div>
              <p className="text-zinc-500 font-sans text-sm">Workbench — Build & Refine</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                if (profile?.isPro) {
                  handleLaunch();
                } else {
                  toast.error("Pro Access Required", {
                    description: "The 'Launch' engine is reserved for Founder members. Claim your berth to unlock production distribution.",
                    action: {
                      label: "Upgrade",
                      onClick: () => setSearchParams({ project: currentProject.id, upgrade: 'true' })
                    }
                  });
                }
              }}
              disabled={isLaunching}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-mono uppercase text-sm tracking-widest transition-all shadow-lg ${
                profile?.isPro 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-900/20' 
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {isLaunching ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Rocket size={20} />
              )}
              {profile?.isPro ? 'Launch' : 'Locked'}
            </button>
          </div>
        </header>

        <AnimatePresence>
          {isLaunching && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center p-12 text-center"
            >
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mb-12 shadow-[0_0_100px_rgba(37,99,235,0.4)]"
              >
                <Rocket size={64} className="text-white" />
              </motion.div>
              
              <h2 className="text-4xl font-mono uppercase tracking-tighter mb-4">Ignition Sequence</h2>
              <div className="w-64 h-1 bg-zinc-900 rounded-full mb-8 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(launchStep / 6) * 100}%` }}
                  className="h-full bg-blue-500"
                />
              </div>
              
              <p className="text-xl font-mono text-zinc-400 h-8">
                {launchStep === 1 && "Igniting Distribution Megaphone..."}
                {launchStep === 2 && "Blasting to X & LinkedIn..."}
                {launchStep === 3 && "Submitting to Product Hunt..."}
                {launchStep === 4 && "Triggering Hunter Outreach..."}
                {launchStep === 5 && "Initializing Acoustics Radar..."}
                {launchStep === 6 && "Mission Control Online."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Inference', path: '/studio/think', icon: Zap, desc: 'Identify pain signals & leads' },
                { label: 'Synthesis', path: '/studio/build', icon: Folder, desc: 'Generate assets & bait' },
                { label: 'Kinetics', path: '/studio/ship', icon: Rocket, desc: 'Deploy technical build' },
                { label: 'Acoustics', path: '/studio/listen', icon: Activity, desc: 'Monitor resonance' },
              ].map((lab) => (
                <Link 
                  key={lab.label}
                  to={`${lab.path}?project=${currentProject.id}`}
                  className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                      <lab.icon size={20} className="text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-sans font-medium text-zinc-100">{lab.label}</h3>
                  </div>
                  <p className="text-xs text-zinc-500">{lab.desc}</p>
                </Link>
              ))}
            </section>

            <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-100">Distribution Strategy</h2>
                <Megaphone size={16} className="text-zinc-500" />
              </div>
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="w-1 h-auto bg-blue-600 rounded-full" />
                  <div>
                    <h4 className="text-sm font-medium text-zinc-200 mb-1">Multi-Channel Blast</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Automatically announce your launch to X, LinkedIn, and Product Hunt. No manual copying required.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-1 h-auto bg-purple-600 rounded-full" />
                  <div>
                    <h4 className="text-sm font-medium text-zinc-200 mb-1">Hunter Outreach</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Directly message the top 10 leads identified in the Inference stage with personalized invites.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
              <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 mb-6">Project Metadata</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-mono uppercase text-zinc-600 mb-1">Created</p>
                  <p className="text-sm text-zinc-300">{currentProject.createdAt?.toDate().toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-zinc-600 mb-1">Owner</p>
                  <p className="text-sm text-zinc-300">{auth.currentUser?.email}</p>
                </div>
                <div className="pt-4 border-t border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase text-zinc-600">Build Status</span>
                    <span className="text-[10px] font-mono text-green-500 uppercase">Ready</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-green-500" />
                  </div>
                </div>
              </div>
            </section>

            <div className="p-8 bg-blue-600 rounded-3xl text-white relative overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                <Rocket size={80} />
              </div>
              <h3 className="text-xl font-mono uppercase mb-2">Ready for Takeoff?</h3>
              <p className="text-sm text-blue-100 mb-6 leading-relaxed">
                Hitting Launch will activate your distribution engine and start acquiring your first 50 users.
              </p>
              <button 
                onClick={() => {
                  if (profile?.isPro) {
                    handleLaunch();
                  } else {
                    toast.error("Pro Access Required", {
                      description: "The 'Launch' engine is reserved for Founder members. Claim your berth to unlock production distribution.",
                      action: {
                        label: "Upgrade",
                        onClick: () => setSearchParams({ project: currentProject.id, upgrade: 'true' })
                      }
                    });
                  }
                }}
                className={`w-full py-3 rounded-xl font-mono uppercase text-xs tracking-widest font-bold transition-all ${
                  profile?.isPro ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-700 text-blue-300 cursor-not-allowed'
                }`}
              >
                {profile?.isPro ? 'Ignite Now' : 'Locked'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Project List View (Default)
  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen flex flex-col bg-zinc-950">
      <Toaster position="top-right" theme="dark" />
      
      <header className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-mono uppercase tracking-tighter">The Workbench</h1>
            {profile?.isPro && <div className="founder-badge">Plank Owner</div>}
          </div>
          <p className="text-zinc-500 font-sans text-sm">Welcome back, {auth.currentUser?.displayName}</p>
        </div>
        <div className="flex gap-4">
          {!profile?.isPro && (
            <Link 
              to="/studio/checkout"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600/10 text-blue-500 border border-blue-600/20 rounded-lg font-mono uppercase text-xs tracking-widest hover:bg-blue-600/20 transition-all"
            >
              Claim Founder Status
            </Link>
          )}
          <button 
            onClick={() => setShowNewProject(true)}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-100 text-zinc-950 rounded-lg font-mono uppercase text-xs tracking-widest hover:bg-zinc-300 transition-all"
          >
            <Plus size={16} /> New Project
          </button>
        </div>
      </header>

      {projects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-8 bg-zinc-900/50 border border-zinc-800 rounded-[32px]"
          >
            <Zap size={48} className="text-yellow-400 mb-6 mx-auto" />
            <h2 className="text-3xl font-mono uppercase tracking-tighter mb-4 text-zinc-100">Welcome to the Lab.</h2>
            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
              Your workspace is clean and ready for takeoff. Don't worry about making it perfect—just make it work.
            </p>
            <div className="space-y-4">
              <button 
                onClick={() => setShowNewProject(true)}
                className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-white text-black rounded-2xl text-lg font-bold uppercase tracking-widest hover:scale-[1.02] transition-all"
              >
                <Plus size={24} /> Create Your First Project
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: 'Active Projects', value: projects.length, icon: Folder },
              { label: 'Think Tasks', value: '12', icon: Activity },
              { label: 'Studio Hours', value: '124h', icon: Clock },
            ].map((stat, i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                <stat.icon className="text-zinc-500 mb-4" size={20} />
                <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-mono text-zinc-100">{stat.value}</p>
              </div>
            ))}
          </div>

          <section>
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 mb-6">Recent Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <button 
                  key={project.id} 
                  onClick={() => setSearchParams({ project: project.id })}
                  className="text-left group bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                      <Folder size={20} className="text-zinc-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      {project.isLaunched && (
                        <span className="px-1.5 py-0.5 bg-green-950 text-green-500 text-[8px] font-mono uppercase rounded border border-green-900">Live</span>
                      )}
                      <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </div>
                  </div>
                  <h3 className="text-lg font-sans font-medium text-zinc-100 mb-2 truncate">{project.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
                    Updated {project.updatedAt?.toDate().toLocaleDateString() || 'Recently'}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {showNewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md"
          >
            <h2 className="text-xl font-mono uppercase mb-6">Initialize Project</h2>
            <form onSubmit={handleCreateProject}>
              <input 
                autoFocus
                type="text" 
                placeholder="Project Name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-100 mb-6 focus:outline-none focus:border-zinc-600 transition-colors"
              />
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowNewProject(false)}
                  className="flex-1 py-3 border border-zinc-800 rounded-xl font-mono uppercase text-xs tracking-widest hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-zinc-100 text-zinc-950 rounded-xl font-mono uppercase text-xs tracking-widest hover:bg-zinc-300 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
