import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { db, auth, collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, doc, updateDoc, storage, ref, uploadBytes, getDownloadURL } from '../firebase';
import { chatWithGemini } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Plus, 
  CheckCircle2, 
  Circle, 
  FileText, 
  MessageSquare, 
  CheckSquare,
  ChevronRight,
  Sparkles,
  Save,
  Paperclip,
  X as CloseIcon,
  FileIcon,
  ImageIcon,
  Target,
  Users,
  Search,
  Zap,
  Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast, Toaster } from 'sonner';
import { trackEvent } from '../lib/analytics';
import { triggerSyntheticFeedback } from '../lib/feedback';

import { PaywallOverlay } from '../components/PaywallOverlay';

const ChatInput = ({ onSendMessage, isTyping }: { onSendMessage: (msg: string) => void, isTyping: boolean }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex gap-2 w-full">
      <div className="relative flex-1">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Think through new ideas..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3.5 pl-6 pr-16 text-zinc-100 focus:outline-none focus:border-zinc-700 transition-colors"
        />
        <button 
          type="submit"
          disabled={!input.trim() || isTyping}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-zinc-100 text-zinc-950 rounded-lg flex items-center justify-center hover:bg-zinc-300 disabled:opacity-50 transition-all"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
};

const TaskInput = ({ onAddTask }: { onAddTask: (task: string) => void }) => {
  const [newTask, setNewTask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    onAddTask(newTask);
    setNewTask('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 relative">
      <input 
        type="text" 
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="New task..."
        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-6 pr-16 text-zinc-100 focus:outline-none focus:border-zinc-700 transition-colors"
      />
      <button 
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-zinc-800 text-zinc-100 rounded-lg flex items-center justify-center hover:bg-zinc-700 transition-all"
      >
        <Plus size={18} />
      </button>
    </form>
  );
};

export default function Inference({ profile }: { profile: any }) {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  
  const [activeTab, setActiveTab] = useState<'chat' | 'editor' | 'tasks' | 'hunter'>('chat');
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const [tasks, setTasks] = useState<any[]>([]);
  
  const [document, setDocument] = useState<any>(null);
  const [docContent, setDocContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [leads, setLeads] = useState<any[]>([]);
  const [painSignals, setPainSignals] = useState<any[]>([]);
  const [isGeneratingLeads, setIsGeneratingLeads] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!projectId) return;

    const action = searchParams.get('action');
    const industry = searchParams.get('industry');

    if (action === 'generate_leads' && industry && !isGeneratingLeads) {
      handleGenerateLeads(industry);
    }

    if (action === 'generate_lead' && !isTyping) {
      handleSendMessage("Generate a high-potential lead for my project. Include their name, platform, handle, role, company, and why they are a good fit. Format it clearly.");
    }

    // Fetch Messages
    const qMessages = query(
      collection(db, `projects/${projectId}/chats`),
      orderBy('timestamp', 'asc')
    );
    const unsubMessages = onSnapshot(qMessages, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Fetch Tasks
    const qTasks = query(
      collection(db, `projects/${projectId}/tasks`),
      orderBy('createdAt', 'desc')
    );
    const unsubTasks = onSnapshot(qTasks, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Fetch Document (assuming one main doc for now)
    const qDocs = query(
      collection(db, `projects/${projectId}/documents`),
      orderBy('updatedAt', 'desc')
    );
    const unsubDocs = onSnapshot(qDocs, (snap) => {
      if (!snap.empty) {
        const d = snap.docs[0];
        setDocument({ id: d.id, ...d.data() });
        setDocContent(d.data().content || '');
      }
    });

    // Simulated Growth Engine Data
    setPainSignals([
      { id: 1, platform: 'X', user: '@dev_guru', text: "I'm stuck on my UI, everything looks like 2010.", signal: 'UI Friction' },
      { id: 2, platform: 'Reddit', user: 'u/saas_builder', text: "I hate manual deployments. There has to be a better way.", signal: 'Deployment Pain' },
      { id: 3, platform: 'LinkedIn', user: 'Sarah Chen', text: "I wish I could automate my SaaS build process.", signal: 'Automation Need' },
    ]);

    setLeads([
      { id: 1, name: '@dev_guru', status: 'Identified', score: 92 },
      { id: 2, name: 'u/saas_builder', status: 'Identified', score: 88 },
      { id: 3, name: 'Sarah Chen', status: 'Identified', score: 95 },
    ]);

    return () => {
      unsubMessages();
      unsubTasks();
      unsubDocs();
    };
  }, [projectId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (userMsg: string) => {
    if (!projectId || !auth.currentUser) return;

    setIsTyping(true);

    try {
      await addDoc(collection(db, `projects/${projectId}/chats`), {
        role: 'user',
        content: userMsg,
        timestamp: serverTimestamp(),
        projectId
      });

      const aiResponse = await chatWithGemini([
        ...messages.map(m => ({
          role: m.role,
          content: m.content,
          fileData: m.fileData,
          fileType: m.fileType
        })),
        { 
          role: 'user', 
          content: userMsg
        }
      ], "SYSTEM: You are the Yacht Labs Synthesis Engine. OUTPUT ONLY RAW MARKDOWN. Do not use blockquotes for the entire response. Use # for H1, ## for H2, and triple backticks (```) for code blocks. Ensure there is a double newline between paragraphs. If you do not follow this formatting, the Synthesis fails.");

      await addDoc(collection(db, `projects/${projectId}/chats`), {
        role: 'model',
        content: aiResponse,
        timestamp: serverTimestamp(),
        projectId
      });
      triggerSyntheticFeedback(projectId);
      trackEvent('inference_chat_complete', { projectId });
    } catch (error) {
      console.error('Chat failed:', error);
      toast.error("Message Failed", {
        description: "The AI was unable to respond. Please check your connection and try again."
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateLeads = async (industry: string) => {
    if (!projectId || !auth.currentUser) return;
    setIsGeneratingLeads(true);
    setActiveTab('chat');

    const prompt = `Generate 10 high-potential leads for a business in the ${industry} industry. 
    For each lead, provide:
    - Full Name
    - Platform (X, Reddit, LinkedIn, or Email)
    - Handle/Username
    - Role
    - Company
    - Context (Why they are a good lead)
    - Social Links (URLs for X, LinkedIn, Reddit, or Website)
    
    OUTPUT ONLY A JSON ARRAY of objects with these keys: name, platform, handle, role, company, context, socialLinks (object with x, linkedin, reddit, website keys).
    Do not include any other text.`;

    try {
      const response = await chatWithGemini([
        { role: 'user', content: prompt }
      ], "SYSTEM: You are a lead generation expert. Output ONLY valid JSON.");

      const generatedLeads = JSON.parse(response.replace(/```json|```/g, '').trim());
      
      for (const lead of generatedLeads) {
        await addDoc(collection(db, 'outreach'), {
          ...lead,
          status: 'New',
          projectId,
          ownerId: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          details: lead.context,
          contactInfo: lead.handle,
          notes: ''
        });
      }

      await addDoc(collection(db, `projects/${projectId}/chats`), {
        role: 'model',
        content: `Successfully generated 10 leads for the **${industry}** industry and populated the Outreach Tracker.`,
        timestamp: serverTimestamp(),
        projectId
      });

      toast.success("Leads Generated", {
        description: `10 leads for ${industry} have been added to your tracker.`
      });
    } catch (error) {
      console.error('Lead generation failed:', error);
      toast.error("Generation Failed");
    } finally {
      setIsGeneratingLeads(false);
    }
  };

  const handleSynthesizeOutreachBait = async () => {
    if (!projectId || !auth.currentUser) return;
    setIsTyping(true);
    setActiveTab('chat');

    const prompt = `Based on my project and the leads identified, synthesize 3 personalized outreach "bait" messages. 
    Each message should be tailored to a specific platform (X, LinkedIn, Reddit) and focus on solving a specific pain point.
    Format the output as a list of actionable outreach templates.`;

    try {
      const response = await chatWithGemini([
        { role: 'user', content: prompt }
      ], "SYSTEM: You are an outreach expert. Output ONLY valid Markdown.");

      await addDoc(collection(db, `projects/${projectId}/chats`), {
        role: 'model',
        content: `### 🎯 Outreach Bait Synthesized\n\n${response}`,
        timestamp: serverTimestamp(),
        projectId
      });

      toast.success("Outreach Bait Synthesized", {
        description: "Check the chat for your personalized outreach templates."
      });
    } catch (error) {
      console.error('Bait synthesis failed:', error);
      toast.error("Synthesis Failed");
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddTask = async (taskTitle: string) => {
    if (!projectId || !auth.currentUser) return;

    try {
      await addDoc(collection(db, `projects/${projectId}/tasks`), {
        title: taskTitle,
        status: 'todo',
        priority: 'medium',
        projectId,
        ownerId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
      trackEvent('task_created', { projectId });
    } catch (error) {
      console.error('Task failed:', error);
    }
  };

  const toggleTask = async (task: any) => {
    try {
      await updateDoc(doc(db, `projects/${projectId}/tasks`, task.id), {
        status: task.status === 'done' ? 'todo' : 'done'
      });
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  const handleSaveDoc = async () => {
    if (!projectId || !auth.currentUser) return;
    setIsSaving(true);

    try {
      if (document) {
        await updateDoc(doc(db, `projects/${projectId}/documents`, document.id), {
          content: docContent,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, `projects/${projectId}/documents`), {
          title: 'Main Synthesis',
          content: docContent,
          projectId,
          ownerId: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      toast.success("Document Saved");
    } catch (error) {
      console.error('Save failed:', error);
      toast.error("Save Failed");
    } finally {
      setIsSaving(false);
    }
  };

  const navigate = useNavigate();

  const handleAddLeadFromChat = async (content: string) => {
    if (!projectId || !auth.currentUser) return;

    toast.promise(
      (async () => {
        const prompt = `Extract lead information from this text: "${content}". 
        Return ONLY a JSON object with: name, platform, handle, role, company, context, socialLinks (object with x, linkedin, reddit, website keys).
        If a field is missing, use an empty string.`;

        const response = await chatWithGemini([
          { role: 'user', content: prompt }
        ], "SYSTEM: You are a data extraction expert. Output ONLY valid JSON.");

        const lead = JSON.parse(response.replace(/```json|```/g, '').trim());
        
        const docRef = await addDoc(collection(db, 'outreach'), {
          ...lead,
          status: 'New',
          projectId,
          ownerId: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          details: lead.context || content.slice(0, 200),
          contactInfo: lead.handle || 'Unknown',
          notes: 'Added from Think Lab Chat'
        });

        trackEvent('lead_added_from_chat', { projectId });
        
        // Navigate to outreach tracker with the new lead selected
        setTimeout(() => {
          navigate(`/studio/outreach?project=${projectId}&lead=${docRef.id}`);
        }, 1500);
      })(),
      {
        loading: 'Extracting lead data...',
        success: 'Lead added! Redirecting to Outreach Tracker...',
        error: 'Failed to add lead. Please try again.'
      }
    );
  };

  if (!projectId) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 font-mono uppercase text-xs tracking-widest">
        Select a project from the dashboard to begin inference.
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      <Toaster position="top-right" theme="dark" />
      {/* Module Header */}
      <header className="p-6 border-b border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
            <Sparkles className="text-zinc-100" size={20} />
          </div>
          <div>
            <h1 className="text-sm font-mono uppercase tracking-widest text-zinc-100">Think Lab</h1>
            <p className="text-[10px] text-zinc-500 font-sans">Strategic Planning & Task Intelligence</p>
          </div>
        </div>

        <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
          {[
            { id: 'chat', icon: MessageSquare, label: 'Chat' },
            { id: 'editor', icon: FileText, label: 'Editor' },
            { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
            { id: 'hunter', icon: Target, label: 'Hunter' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <tab.icon size={14} />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col"
            >
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 scroll-smooth no-scrollbar">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center">
                      <Sparkles className="text-zinc-500" size={32} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-sans font-bold text-zinc-100">How can I help you synthesize today?</h2>
                      <p className="text-sm text-zinc-500 leading-relaxed">I can help you architect project goals, refine research, or brainstorm new product directions.</p>
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] md:max-w-[75%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-600">
                          {msg.role === 'user' ? 'You' : 'Synthesis Engine'}
                        </span>
                      </div>
                      <div className={`p-6 md:p-8 rounded-[32px] ${
                        msg.role === 'user' 
                          ? 'bg-zinc-100 text-zinc-950 shadow-xl' 
                          : 'bg-zinc-900/50 text-zinc-300 border border-zinc-900'
                      }`}>
                        <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        {msg.role === 'model' && (msg.content.toLowerCase().includes('lead') || msg.content.toLowerCase().includes('name:')) && (
                          <div className="mt-6 pt-6 border-t border-zinc-800 flex justify-end">
                            <button 
                              onClick={() => handleAddLeadFromChat(msg.content)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-mono uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
                            >
                              <Plus size={14} /> Add Lead to Tracker
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-900/50 p-6 rounded-[32px] border border-zinc-900 flex gap-1.5">
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-zinc-500 rounded-full" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-zinc-500 rounded-full" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-zinc-500 rounded-full" />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 md:p-12 pt-0">
                <div className="max-w-4xl mx-auto w-full">
                  <ChatInput onSendMessage={handleSendMessage} isTyping={isTyping} />
                  <p className="mt-4 text-[9px] text-zinc-600 text-center font-mono uppercase tracking-widest">
                    Synthesis Engine can make mistakes. Verify critical architecture.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'editor' && (
            <motion.div 
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col p-6"
            >
              <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Synthesis Document</span>
                  <button 
                    onClick={handleSaveDoc}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 text-zinc-950 rounded-md text-[10px] font-mono uppercase tracking-widest hover:bg-zinc-300 transition-all"
                  >
                    <Save size={12} /> {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
                <textarea 
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Begin documenting your vision..."
                  className="flex-1 bg-transparent p-8 text-zinc-300 font-sans leading-relaxed resize-none focus:outline-none"
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div 
              key="tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col p-6 max-w-3xl mx-auto w-full"
            >
              <TaskInput onAddTask={handleAddTask} />

              <div className="space-y-3">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => toggleTask(task)}
                    className={`group flex items-center p-4 rounded-xl border transition-all cursor-pointer ${
                      task.status === 'done' 
                        ? 'bg-zinc-900/20 border-zinc-900 opacity-50' 
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="mr-4">
                      {task.status === 'done' 
                        ? <CheckCircle2 className="text-zinc-500" size={20} /> 
                        : <Circle className="text-zinc-700 group-hover:text-zinc-500" size={20} />
                      }
                    </div>
                    <span className={`flex-1 text-sm font-sans ${task.status === 'done' ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>
                      {task.title}
                    </span>
                    <div className={`px-2 py-1 rounded text-[8px] font-mono uppercase tracking-widest ${
                      task.priority === 'high' ? 'bg-red-950/30 text-red-500' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {task.priority}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {activeTab === 'hunter' && (
            <motion.div 
              key="hunter"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col p-6 overflow-y-auto relative"
            >
              {!profile?.isPro && (
                <PaywallOverlay 
                  title="Advanced Synthesis Required" 
                  description="The Hunter lab identifies pain signals and high-potential leads across social ecosystems. Pro Lab members get full access to lead scoring and automated outreach bait."
                />
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pain Signals */}
                <section>
                  <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2">
                    <Search size={14} /> Pain Signals Detected
                  </h2>
                  <div className="space-y-4">
                    {painSignals.map((signal) => (
                      <div key={signal.id} className="p-5 bg-zinc-900/30 border border-zinc-800 rounded-2xl group hover:border-zinc-700 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-zinc-800 rounded text-[8px] font-mono uppercase text-zinc-400">{signal.platform}</span>
                            <span className="text-[10px] font-medium text-zinc-100">{signal.user}</span>
                          </div>
                          <span className="text-[9px] font-mono uppercase text-blue-500 bg-blue-950/20 px-2 py-0.5 rounded">{signal.signal}</span>
                        </div>
                        <p className="text-xs text-zinc-400 font-sans italic leading-relaxed">"{signal.text}"</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* High-Potential Leads */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                      <Users size={14} /> High-Potential Leads
                    </h2>
                    <button 
                      onClick={() => handleGenerateLeads('SaaS & AI')}
                      disabled={isGeneratingLeads}
                      className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-lg text-[8px] font-mono uppercase tracking-widest transition-all"
                    >
                      {isGeneratingLeads ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                      Generate New
                    </button>
                  </div>
                  <div className="space-y-3">
                    {leads.map((lead) => (
                      <div key={lead.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                            <Users size={18} className="text-zinc-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-100">{lead.name}</p>
                            <p className="text-[10px] font-mono uppercase text-zinc-600">{lead.status}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-mono text-zinc-100">{lead.score}%</p>
                          <p className="text-[8px] font-mono uppercase text-zinc-600">Match Score</p>
                        </div>
                      </div>
                    ))}
                    {leads.length === 0 && (
                      <div className="text-center py-12 border border-dashed border-zinc-900 rounded-2xl">
                        <p className="text-[10px] font-mono uppercase text-zinc-700 tracking-widest italic">No leads identified yet.</p>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleSynthesizeOutreachBait}
                    className="w-full mt-6 py-4 border border-dashed border-zinc-800 rounded-xl text-zinc-500 font-mono uppercase text-[10px] tracking-widest hover:border-zinc-600 hover:text-zinc-300 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap size={14} /> Synthesize Outreach Bait
                  </button>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

