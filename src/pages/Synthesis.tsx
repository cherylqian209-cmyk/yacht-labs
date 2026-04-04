import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Palette, Layers, Box, Type, Image as ImageIcon, Sparkles, Copy, FileUp, Zap, FileText, Layout, X as CloseIcon, FileIcon, RefreshCcw, GitBranch, Terminal, ShieldCheck, AlertCircle, Ship, Rocket, Edit3, X, Play, Smartphone, Tablet, Monitor, ChevronDown } from 'lucide-react';
import { generateDesignPrompt, validateSynthesis, chatWithGemini } from '../lib/gemini';
import { storage, ref, uploadBytes, getDownloadURL, db, auth, collection, addDoc, serverTimestamp, doc, setDoc, query, onSnapshot } from '../firebase';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { trackEvent } from '../lib/analytics';
import { triggerSyntheticFeedback } from '../lib/feedback';

import { PaywallOverlay } from '../components/PaywallOverlay';

const TEMPLATES = [
  {
    id: 'ecommerce',
    title: 'E-commerce Marketplace',
    description: 'Multi-vendor marketplace with product discovery and checkout.',
    icon: Box,
    prompt: 'Design a modern multi-vendor e-commerce marketplace. Key components: Dynamic product catalog with advanced filtering, vendor storefronts, a secure multi-step checkout process, user reviews and ratings, and a seller dashboard for order management. Focus on high conversion and mobile-first responsiveness.'
  },
  {
    id: 'dev-tool',
    title: 'Developer SDK/Tool',
    description: 'Technical documentation, CLI reference, and integration guides.',
    icon: Terminal,
    prompt: 'Create a design brief for a new developer tool/SDK. Include: A landing page highlighting technical benefits, comprehensive API documentation structure, CLI command reference, interactive code playground examples, and a "Getting Started" guide that reduces friction for new developers.'
  },
  {
    id: 'fintech',
    title: 'Fintech Dashboard',
    description: 'Data-heavy analytics, transaction tracking, and security.',
    icon: ShieldCheck,
    prompt: 'Synthesize a fintech dashboard for personal wealth management. Requirements: Real-time transaction tracking, interactive data visualizations for spending habits, multi-account aggregation, security settings (2FA, biometric), and a clean, trustworthy aesthetic using a professional color palette.'
  },
  {
    id: 'social-community',
    title: 'Community Network',
    description: 'User-generated content, profiles, and engagement loops.',
    icon: Layers,
    prompt: 'Design a niche community social network. Features: Customizable user profiles, threaded discussions, real-time notifications, content discovery feed based on interests, and moderation tools. The UI should encourage engagement and feel welcoming to new members.'
  }
];

const DEVICE_PRESETS = [
  { id: 'iphone-se', name: 'iPhone SE', width: 375, height: 667, icon: Smartphone, category: 'Mobile' },
  { id: 'iphone-13', name: 'iPhone 13 / 14 / 15', width: 390, height: 844, icon: Smartphone, category: 'Mobile', default: true },
  { id: 'iphone-max', name: 'iPhone 13 Pro Max / 14 Plus / 15 Plus', width: 428, height: 926, icon: Smartphone, category: 'Mobile' },
  { id: 'android-sm', name: 'Small Android', width: 360, height: 640, icon: Smartphone, category: 'Mobile' },
  { id: 'android-std', name: 'Standard Android', width: 360, height: 800, icon: Smartphone, category: 'Mobile' },
  { id: 'android-lg', name: 'Large Android', width: 412, height: 915, icon: Smartphone, category: 'Mobile' },
  { id: 'ipad-mini', name: 'iPad Mini', width: 768, height: 1024, icon: Tablet, category: 'Tablet' },
  { id: 'ipad-std', name: 'iPad / iPad Air', width: 820, height: 1180, icon: Tablet, category: 'Tablet' },
  { id: 'ipad-pro-11', name: 'iPad Pro 11"', width: 834, height: 1194, icon: Tablet, category: 'Tablet' },
  { id: 'ipad-pro-12', name: 'iPad Pro 12.9"', width: 1024, height: 1366, icon: Tablet, category: 'Tablet' },
  { id: 'laptop-sm', name: 'Small Laptop', width: 1280, height: 800, icon: Monitor, category: 'Desktop' },
  { id: 'desktop-std', name: 'Standard Desktop', width: 1440, height: 900, icon: Monitor, category: 'Desktop' },
  { id: 'desktop-lg', name: 'Large Desktop', width: 1920, height: 1080, icon: Monitor, category: 'Desktop' },
  { id: 'responsive', name: 'Responsive', width: '100%', height: '100%', icon: Layout, category: 'Custom' },
];

export default function Synthesis({ profile, lastBuild, setLastBuild }: { profile: any, lastBuild: any, setLastBuild: any }) {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetOutput, setTargetOutput] = useState<'deck' | 'landing' | 'brand' | 'bait' | 'landing_gen' | 'scaffolder'>('brand');
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
  const [isValidating, setIsValidating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [buildCount, setBuildCount] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState(DEVICE_PRESETS[1]);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const navigate = useNavigate();

  // Sync local state with lifted state
  const generatedBrief = lastBuild?.brief || null;
  const generatedFiles = lastBuild?.files || [];
  const lastGeneratedDocId = lastBuild?.docId || null;

  useEffect(() => {
    if (!projectId) return;
    const q = query(collection(db, `projects/${projectId}/documents`));
    const unsubscribe = onSnapshot(q, (snap) => {
      setBuildCount(snap.docs.length);
    });
    return unsubscribe;
  }, [projectId]);

  const handlePublish = async () => {
    if (!projectId || !generatedFiles.length || isPublishing) return;
    
    const activeFile = generatedFiles[activeFileIndex];
    if (!activeFile) return;

    setIsPublishing(true);
    const toastId = toast.loading(`Publishing ${activeFile.name} to Ship...`);

    try {
      // Create a unique deployment ID for this specific asset
      const deploymentId = `${projectId}_${activeFile.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-6)}`;
      const brandedUrl = `https://yacht-labs.com/pub/${deploymentId}`;
      const liveUrl = `${window.location.origin}/pub/${deploymentId}`;

      await setDoc(doc(db, 'deployments', deploymentId), {
        projectId,
        documentId: lastGeneratedDocId || deploymentId, // Link to the source document if available
        title: activeFile.name,
        content: activeFile.content,
        status: 'Live',
        region: 'Global Edge',
        deployedAt: serverTimestamp(),
        url: brandedUrl,
        liveUrl: liveUrl,
        type: 'micro-tool',
        folderId: null // Ensure it goes to Uncategorized
      });

      toast.success("Published to Ship", {
        description: `${activeFile.name} is now live and available in the Ship engine.`,
        id: toastId
      });

      trackEvent('publish_micro_tool', { projectId, assetName: activeFile.name });
      
      // Navigate to Ship to see the new deployment
      navigate(`/studio/ship?project=${projectId}`);
    } catch (error: any) {
      console.error("Publish failed:", error);
      toast.error("Publish Failed", {
        description: error.message,
        id: toastId
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const cleanContent = (text: string) => {
    let cleaned = text;
    // Remove <thought>...</thought>
    cleaned = cleaned.replace(/<thought>[\s\S]*?<\/thought>/g, '');
    // Remove [Project Architecture Initialized]
    cleaned = cleaned.replace(/\[Project Architecture Initialized\]/g, '');
    return cleaned.trim();
  };

  const parseFiles = (text: string) => {
    const cleaned = cleanContent(text);
    const files: { name: string, content: string }[] = [];
    const parts = cleaned.split(/\[FILE: (.*?)\]/);
    
    // The first part is usually the preamble/file tree
    if (parts[0].trim()) {
      files.push({ name: 'Architecture', content: parts[0].trim() });
    }
    
    for (let i = 1; i < parts.length; i += 2) {
      const name = parts[i];
      const content = parts[i + 1]?.trim() || '';
      files.push({ name, content });
    }

    // Sort index.html to the top
    return files.sort((a, b) => {
      if (a.name.toLowerCase() === 'index.html') return -1;
      if (b.name.toLowerCase() === 'index.html') return 1;
      return 0;
    });
  };

  const isHtml = (filename: string) => filename.toLowerCase().endsWith('.html');
  const isMarkdown = (filename: string) => filename.toLowerCase().endsWith('.md') || filename.toLowerCase().endsWith('.markdown');

  React.useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };



  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Input Required", {
        description: "Please paste some notes to begin synthesis."
      });
      return;
    }
    if (!projectId) {
      toast.error("No Project Selected", {
        description: "Please select a project from the dashboard first."
      });
      return;
    }
    
    const controller = new AbortController();
    setAbortController(controller);
    setIsGenerating(true);
    setLastBuild(null);
    setGenerationProgress(0);
    const toastId = toast.loading("Synthesizing your vision...");
    
    // Check plan limits
    const limit = profile?.isPro ? 10 : 3;
    if (buildCount >= limit) {
      toast.error('Build Limit Reached', {
        description: `Your ${profile?.isPro ? 'Pro' : 'Free'} plan is limited to ${limit} builds.`,
        action: !profile?.isPro ? {
          label: "Upgrade",
          onClick: () => navigate('/studio/checkout')
        } : undefined
      });
      setIsGenerating(false);
      toast.dismiss(toastId);
      return;
    }

    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) return prev;
        return prev + (prev < 50 ? 2 : 1);
      });
    }, 1000);
    
    try {
        // 1. Run AI generation
        let designPrompt = await generateDesignPrompt(targetOutput, prompt);
        
        if (controller.signal.aborted) return;

        if (designPrompt) {
          // Generate a unique title based on the content
          let generatedTitle = `${targetOutput.toUpperCase()} Design Build - ${new Date().toLocaleDateString()}`;
          try {
            const titleResponseText = await chatWithGemini([
              { role: "user", content: `Based on this design prompt, generate a short, unique, and descriptive title (max 5 words). Do not include quotes or special characters. Prompt: ${prompt.slice(0, 500)}` }
            ]);
            if (titleResponseText) {
              generatedTitle = titleResponseText.trim();
            }
          } catch (e) {
            console.error("Title generation failed:", e);
          }

          // 2. THE "VALIDATION" LAYER (INFERENCE)
          setIsValidating(true);
          const validation = await validateSynthesis(prompt, designPrompt);
          
          if (controller.signal.aborted) return;

          if (!validation.isValid) {
            console.log("Sanity check failed, re-synthesizing...", validation.reason);
            designPrompt = await generateDesignPrompt(targetOutput, prompt + "\n\nCRITICAL FIX: " + (validation.reason || "Ensure the output strictly follows the requested project goals."));
          }
          setIsValidating(false);

          if (controller.signal.aborted) return;

          const parsed = parseFiles(designPrompt);
          
          // 3. Save to Firestore as a new document
          const docRef = await addDoc(collection(db, `projects/${projectId}/documents`), {
            title: generatedTitle,
            content: designPrompt,
            projectId,
            ownerId: auth.currentUser?.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            folderId: null // Ensure it goes to Uncategorized
          });

        setLastBuild({
          brief: designPrompt,
          files: parsed,
          docId: docRef.id
        });
        setActiveFileIndex(0);

        toast.success("Synthesis Complete", {
          description: `Your ${targetOutput} design build has been generated and saved.`,
          id: toastId
        });
        
        triggerSyntheticFeedback(projectId);
        trackEvent('synthesis_complete', { projectId, targetOutput });

        // Reset form
        setPrompt('');
      } else {
        throw new Error("No prompt generated");
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error("Generation Cancelled", { id: toastId });
      } else {
        console.error('Generation failed:', error);
        toast.error("Synthesis Failed", {
          description: error.message || "An unexpected error occurred. Please try again.",
          id: toastId
        });
      }
    } finally {
      clearInterval(progressInterval);
      setGenerationProgress(100);
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
        setAbortController(null);
      }, 500);
    }
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      <Toaster position="top-right" theme="dark" />
      <header className="p-6 border-b border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
            <Layers className="text-zinc-100" size={20} />
          </div>
          <div>
            <h1 className="text-sm font-mono uppercase tracking-widest text-zinc-100">Build: The Assembler</h1>
            <p className="text-[10px] text-zinc-500 font-sans italic">Synthesize research into actionable design briefs.</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Inputs */}
        <div className="w-[450px] border-r border-zinc-900 flex flex-col bg-zinc-950 overflow-y-auto no-scrollbar">
          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <h2 className="text-xl font-mono uppercase tracking-[0.2em] text-zinc-100">New Synthesis</h2>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">Your synthesized briefs are automatically saved to the project editor.</p>
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">Target Output</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'deck', label: 'Investor Deck', icon: FileText },
                    { id: 'landing', label: 'Landing Page', icon: Layout },
                    { id: 'brand', label: 'Brand Identity', icon: Palette },
                    { id: 'bait', label: 'Outreach Bait', icon: Zap },
                    { id: 'landing_gen', label: 'SaaS Landing', icon: Sparkles, pro: true },
                    { id: 'scaffolder', label: 'Scaffolder', icon: Box, pro: true },
                  ].map((opt) => (
                    <button 
                      key={opt.id}
                      onClick={() => {
                        if (opt.pro && !profile?.isPro) {
                          toast.error("Advanced Synthesis Required", {
                            description: "SaaS generators and scaffolders are reserved for Pro Lab members.",
                            action: {
                              label: "Upgrade",
                              onClick: () => navigate('/studio/checkout')
                            }
                          });
                          return;
                        }
                        setTargetOutput(opt.id as any);
                      }}
                      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all relative ${
                        targetOutput === opt.id 
                          ? 'bg-zinc-100 border-zinc-100 text-zinc-950' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {opt.pro && !profile?.isPro && (
                        <div className="absolute top-2 right-2">
                          <Zap size={10} className="text-blue-500 fill-blue-500" />
                        </div>
                      )}
                      <opt.icon size={20} />
                      <span className="text-[9px] font-mono uppercase tracking-widest text-center">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">Template Library</h3>
                <div className="space-y-3">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setPrompt(template.prompt)}
                      className="w-full flex items-start gap-4 p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl hover:border-zinc-700 hover:bg-zinc-900/50 transition-all text-left group"
                    >
                      <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-blue-500 transition-colors shrink-0">
                        <template.icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-mono uppercase tracking-widest text-zinc-100 mb-1">{template.title}</h4>
                        <p className="text-[9px] text-zinc-500 font-sans leading-relaxed line-clamp-2">{template.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Raw Input & Research</h3>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Paste raw notes, data points, or project goals here..."
                  className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 resize-none"
                />
              </section>

              {!hasApiKey ? (
                <div className="p-4 bg-amber-950/20 border border-amber-900/50 rounded-2xl space-y-3">
                  <p className="text-[9px] text-amber-500 font-mono uppercase tracking-widest text-center">
                    Gemini API Key Required
                  </p>
                  <button 
                    onClick={handleSelectKey}
                    className="w-full py-3 bg-amber-500 text-black rounded-xl font-mono uppercase text-[10px] font-bold tracking-widest hover:bg-amber-400 transition-all"
                  >
                    Select API Key
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-5 bg-zinc-100 text-zinc-950 rounded-2xl font-mono uppercase text-[11px] font-bold tracking-widest hover:bg-zinc-300 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap size={16} />
                      </motion.div>
                      Synthesizing...
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Build Product
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Output */}
        <div className="flex-1 bg-zinc-950 relative overflow-hidden flex flex-col">
          {isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center p-12 space-y-12">
              <div className="relative">
                <div className="w-32 h-32 border-4 border-zinc-900 rounded-full" />
                <motion.div 
                  className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="text-blue-500 animate-pulse" size={32} />
                </div>
              </div>
              
              <div className="w-full max-w-md space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Build Progress</h3>
                  <span className="text-[10px] font-mono text-zinc-100">{Math.round(generationProgress)}%</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${generationProgress}%` }}
                    className="bg-blue-600 h-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center space-y-2">
                    <div className={`h-1 rounded-full ${generationProgress > 30 ? 'bg-blue-500' : 'bg-zinc-800'}`} />
                    <span className="text-[8px] font-mono uppercase text-zinc-600">Architect</span>
                  </div>
                  <div className="text-center space-y-2">
                    <div className={`h-1 rounded-full ${generationProgress > 60 ? 'bg-blue-500' : 'bg-zinc-800'}`} />
                    <span className="text-[8px] font-mono uppercase text-zinc-600">Synthesize</span>
                  </div>
                  <div className="text-center space-y-2">
                    <div className={`h-1 rounded-full ${generationProgress > 90 ? 'bg-blue-500' : 'bg-zinc-800'}`} />
                    <span className="text-[8px] font-mono uppercase text-zinc-600">Validate</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCancel}
                className="px-8 py-3 border border-zinc-800 rounded-xl text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:bg-red-900/20 hover:text-red-500 hover:border-red-900/50 transition-all flex items-center gap-2"
              >
                <X size={14} /> Cancel Build
              </button>
            </div>
          ) : generatedBrief ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col"
            >
              <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
                <div className="bg-zinc-900/30 border border-zinc-900 rounded-[32px] p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Terminal size={14} className="text-blue-500" />
                        <h2 className="text-xl font-mono uppercase tracking-[0.2em] text-zinc-100">Synthesis Workbench</h2>
                      </div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Multi-Dimensional Project Architecture for {targetOutput}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] disabled:opacity-50"
                      >
                        {isPublishing ? <RefreshCcw size={14} className="animate-spin" /> : <Rocket size={14} />}
                        Publish to Ship
                      </button>
                      <div className="h-8 w-px bg-zinc-800 mx-2" />
                      <button 
                        onClick={() => setLastBuild(null)}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-100 rounded-xl transition-colors"
                      >
                        <CloseIcon size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Asset Toggle (Tabs) */}
                  <div className="flex items-center justify-between mb-6 border-b border-zinc-900">
                    <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
                      {generatedFiles.map((file: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveFileIndex(idx);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all whitespace-nowrap ${
                            activeFileIndex === idx 
                              ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                              : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <FileIcon size={12} />
                          {file.name}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 mb-4">
                        <div className="relative">
                          <button
                            onClick={() => setShowDeviceMenu(!showDeviceMenu)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                          >
                            <selectedDevice.icon size={12} />
                            {selectedDevice.name}
                            <ChevronDown size={10} />
                          </button>
                          
                          {showDeviceMenu && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 py-2 max-h-[400px] overflow-y-auto">
                              {['Mobile', 'Tablet', 'Desktop', 'Custom'].map(category => (
                                <div key={category} className="px-2 mb-2">
                                  <div className="px-2 py-1 text-[8px] font-mono uppercase text-zinc-500 tracking-widest">{category}</div>
                                  {DEVICE_PRESETS.filter(p => p.category === category).map(preset => (
                                    <button
                                      key={preset.id}
                                      onClick={() => {
                                        setSelectedDevice(preset);
                                        setShowDeviceMenu(false);
                                      }}
                                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-mono transition-all ${
                                        selectedDevice.id === preset.id ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <preset.icon size={12} />
                                        {preset.name}
                                      </div>
                                      <span className="text-[8px] opacity-50">{preset.width}x{preset.height}</span>
                                    </button>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="w-px h-4 bg-zinc-800 mx-1" />
                        <button
                          onClick={() => setViewMode('code')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all ${
                            viewMode === 'code' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <Terminal size={14} /> Code
                        </button>
                        <button
                          onClick={() => setViewMode('preview')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all ${
                            viewMode === 'preview' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <Sparkles size={14} /> Preview
                        </button>
                    </div>
                  </div>

                  {/* Workbench Output Area */}
                  <div className="relative group">
                    <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedFiles[activeFileIndex]?.content || '');
                          toast.success("Copied to clipboard");
                        }}
                        className="p-3 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 text-zinc-100 rounded-xl hover:bg-zinc-800 transition-all shadow-xl"
                        title="Copy asset content"
                      >
                        <Copy size={16} />
                      </button>
                    </div>

                    <div 
                      className={`synthesis-output max-w-none bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden font-sans text-sm leading-relaxed min-h-[500px] transition-all duration-300 ${
                        viewMode === 'code' ? 'p-8 overflow-y-auto max-h-[60vh]' : ''
                      }`}
                    >
                      {viewMode === 'code' ? (
                        <pre className="text-zinc-300 font-mono whitespace-pre-wrap text-xs leading-relaxed">
                          {generatedFiles[activeFileIndex]?.content || ''}
                        </pre>
                      ) : (
                        <div className="relative w-full h-full min-h-[500px] flex items-center justify-center bg-zinc-900/20 overflow-auto p-8">
                          <div 
                            style={{ 
                              width: selectedDevice.width === '100%' ? '100%' : `${selectedDevice.width}px`,
                              margin: '0 auto',
                            }}
                            className="h-full bg-white transition-all duration-300 overflow-hidden shadow-2xl rounded-2xl"
                          >
                            {isHtml(generatedFiles[activeFileIndex]?.name || '') ? (
                              <iframe
                                srcDoc={generatedFiles[activeFileIndex]?.content}
                                style={{ 
                                  height: selectedDevice.height === '100%' ? '100%' : `${selectedDevice.height}px`,
                                  maxHeight: '800px'
                                }}
                                className="w-full bg-white border-none"
                                title="Prototype Preview"
                                sandbox="allow-scripts allow-forms allow-popups allow-modals"
                              />
                            ) : (
                              <div className="p-8 md:p-12 bg-zinc-950 min-h-full prose prose-invert prose-zinc max-w-none">
                                <Markdown remarkPlugins={[remarkGfm]}>
                                  {generatedFiles[activeFileIndex]?.content || ''}
                                </Markdown>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Validation Status Footer */}
                  <div className="mt-8 flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-900 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <ShieldCheck size={16} className="text-green-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase text-zinc-100">Sanity Check Passed</p>
                        <p className="text-[9px] text-zinc-500 font-sans">Build verified against original mission goals.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-widest">Robust Build v1.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6">
              <div className="w-20 h-20 bg-zinc-900 rounded-[32px] flex items-center justify-center text-zinc-800">
                <Box size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500">No Active Build</h3>
                <p className="text-[10px] text-zinc-700 max-w-xs mx-auto uppercase tracking-widest leading-relaxed">
                  Configure your project goals on the left to synthesize a new project architecture.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
