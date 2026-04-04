import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  MessageSquare, 
  Mail, 
  Twitter, 
  Linkedin, 
  Globe, 
  Send, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  ChevronRight,
  Edit2,
  Save,
  X,
  Trash2,
  UserPlus,
  Loader2 as LucideLoader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth, collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from '../firebase';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { GoogleGenAI } from "@google/genai";
import { callGeminiWithRetry } from '../lib/gemini';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
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
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface Lead {
  id: string;
  name: string;
  platform: 'X' | 'Reddit' | 'LinkedIn' | 'Email';
  handle: string;
  status: 'New' | 'Contacted' | 'Responded' | 'Converted' | 'Lost';
  details: string;
  contactInfo: string;
  notes: string;
  role?: string;
  company?: string;
  context?: string;
  socialLinks?: {
    x?: string;
    linkedin?: string;
    reddit?: string;
    website?: string;
  };
  lastContacted?: any;
  personalizedMessage?: string;
  projectId: string;
  createdAt: any;
}

export default function OutreachTracker({ profile }: { profile: any }) {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const navigate = useNavigate();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);

  // New Lead Form State
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: '',
    platform: 'X',
    handle: '',
    status: 'New',
    details: '',
    contactInfo: '',
    notes: ''
  });

  const selectedLead = useMemo(() => 
    leads.find(l => l.id === selectedLeadId), 
    [leads, selectedLeadId]
  );

  useEffect(() => {
    const leadId = searchParams.get('lead');
    if (leadId) {
      setSelectedLeadId(leadId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!projectId || !auth.currentUser) return;

    const q = query(
      collection(db, 'outreach'),
      where('projectId', '==', projectId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Lead[];

      setLeads(leadsData);
      
      // Only set default if no lead is currently selected
      const urlLeadId = new URLSearchParams(window.location.search).get('lead');
      if (leadsData.length > 0 && !selectedLeadId && !urlLeadId) {
        setSelectedLeadId(leadsData[0].id);
      } else if (urlLeadId && !selectedLeadId) {
        setSelectedLeadId(urlLeadId);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'outreach');
    });

    return unsubscribe;
  }, [projectId, auth.currentUser, selectedLeadId]);

  const toggleSelectLead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDeleteLeads = async () => {
    if (selectedLeadIds.size === 0) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedLeadIds.size} leads?`);
    if (!confirmDelete) return;

    const toastId = toast.loading(`Deleting ${selectedLeadIds.size} leads...`);
    try {
      for (const id of selectedLeadIds) {
        await deleteDoc(doc(db, 'outreach', id));
      }
      setSelectedLeadIds(new Set());
      toast.success("Leads deleted successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete some leads", { id: toastId });
    }
  };

  const handleBulkUpdateStatus = async (status: Lead['status']) => {
    if (selectedLeadIds.size === 0) return;
    const toastId = toast.loading(`Updating ${selectedLeadIds.size} leads...`);
    try {
      for (const id of selectedLeadIds) {
        await updateDoc(doc(db, 'outreach', id), { status });
      }
      setSelectedLeadIds(new Set());
      toast.success("Leads updated successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to update some leads", { id: toastId });
    }
  };

  useEffect(() => {
    if (selectedLead && !selectedLead.personalizedMessage && !isGenerating) {
      generatePersonalizedMessage();
    }
  }, [selectedLeadId]);

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !auth.currentUser || !newLead.name || !newLead.handle) return;

    // Check for uniqueness
    const isDuplicate = leads.some(l => 
      (l.handle?.toLowerCase() || "") === newLead.handle?.toLowerCase() && 
      l.platform === newLead.platform
    );

    if (isDuplicate) {
      toast.error('Duplicate Lead', {
        description: `A lead with handle ${newLead.handle} already exists on ${newLead.platform}.`
      });
      return;
    }

    // Check plan limits
    const limit = profile?.isPro ? 10 : 3;
    if (leads.length >= limit) {
      toast.error('Lead Limit Reached', {
        description: `Your ${profile?.isPro ? 'Pro' : 'Free'} plan is limited to ${limit} leads.`,
        action: !profile?.isPro ? {
          label: "Upgrade",
          onClick: () => navigate('/studio/checkout')
        } : undefined
      });
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'outreach'), {
        ...newLead,
        projectId,
        createdAt: serverTimestamp(),
        status: 'New'
      });
      setIsAddingLead(false);
      setNewLead({
        name: '',
        platform: 'X',
        handle: '',
        status: 'New',
        details: '',
        contactInfo: '',
        notes: '',
        role: '',
        company: '',
        context: '',
        socialLinks: {
          x: '',
          linkedin: '',
          reddit: '',
          website: ''
        }
      });
      setSelectedLeadId(docRef.id);
      toast.success('Lead added successfully.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'outreach');
    }
  };

  const handleUpdateLead = async (updates: Partial<Lead>) => {
    if (!selectedLeadId) return;
    try {
      await updateDoc(doc(db, 'outreach', selectedLeadId), updates);
      toast.success('Lead updated.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `outreach/${selectedLeadId}`);
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'outreach', id));
      if (selectedLeadId === id) setSelectedLeadId(null);
      toast.success('Lead deleted.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `outreach/${id}`);
    }
  };

  const generatePersonalizedMessage = async () => {
    if (!selectedLead) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const prompt = `
        Generate a highly personalized outreach message for the following lead:
        Name: ${selectedLead.name}
        Platform: ${selectedLead.platform}
        Handle: ${selectedLead.handle}
        Details: ${selectedLead.details}
        Notes: ${selectedLead.notes}

        The product is "Yacht Labs", an AI-powered SaaS synthesis and deployment engine.
        Tone: Professional, helpful, concise, and slightly provocative (brutalist/modern vibe).
        Platform specific: If X, keep it short (DM style). If LinkedIn, more professional.
        
        Return ONLY the message text.
      `;

      const response = await callGeminiWithRetry(() => ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }]
      }));

      const message = response.text || "Failed to generate message.";
      await handleUpdateLead({ personalizedMessage: message });
      toast.success('Personalized message generated.');
    } catch (error) {
      console.error('Error generating message:', error);
      toast.error('Failed to generate message.');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredLeads = useMemo(() => {
    return leads
      .filter(l => {
        const matchesSearch = (l.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                            (l.handle?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        // Sort by created at desc
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
  }, [leads, searchTerm, statusFilter]);

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

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header */}
      <header className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <Link 
            to={`/studio/listen?project=${projectId}`}
            className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-sm font-mono uppercase tracking-widest text-zinc-100">Outreach Tracker</h1>
            <p className="text-[10px] text-zinc-500 font-sans italic">Managing {leads.length} leads across the global edge.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              const industry = prompt("Enter industry or niche for lead generation:", "SaaS Founders");
              if (industry) {
                navigate(`/studio/inference?project=${projectId}&action=generate_leads&industry=${encodeURIComponent(industry)}`);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg font-mono uppercase text-xs tracking-widest hover:bg-zinc-800 transition-all"
          >
            <Sparkles size={16} className="text-blue-500" /> Generate via Think
          </button>
          <button 
            onClick={() => setIsAddingLead(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-950 rounded-lg font-mono uppercase text-xs tracking-widest hover:bg-zinc-300 transition-all"
          >
            <UserPlus size={16} /> Add Lead
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Lead List */}
        <div className="w-96 border-r border-zinc-900 flex flex-col bg-zinc-950/30">
          <div className="p-4 border-b border-zinc-900 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {['all', 'New', 'Contacted', 'Responded', 'Converted', 'Lost'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest whitespace-nowrap transition-all ${
                    statusFilter === status 
                      ? 'bg-zinc-100 text-zinc-950' 
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredLeads.map(lead => (
              <div
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all group relative flex items-start gap-3 cursor-pointer ${
                  selectedLeadId === lead.id 
                    ? 'bg-zinc-900 border border-zinc-800' 
                    : 'hover:bg-zinc-900/50 border border-transparent'
                }`}
              >
                <div 
                  onClick={(e) => toggleSelectLead(lead.id, e)}
                  className={`mt-1 w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                    selectedLeadIds.has(lead.id) 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-zinc-700 group-hover:border-zinc-500'
                  }`}
                >
                  {selectedLeadIds.has(lead.id) && <CheckCircle2 size={10} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${
                        lead.platform === 'X' ? 'bg-zinc-800 text-zinc-100' :
                        lead.platform === 'Reddit' ? 'bg-orange-950/20 text-orange-500' :
                        lead.platform === 'LinkedIn' ? 'bg-blue-950/20 text-blue-500' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {lead.platform === 'X' ? <Twitter size={12} /> :
                         lead.platform === 'Reddit' ? <Globe size={12} /> :
                         lead.platform === 'LinkedIn' ? <Linkedin size={12} /> :
                         <Mail size={12} />}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{lead.platform}</span>
                    </div>
                    <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                      lead.status === 'New' ? 'border-blue-900 text-blue-500 bg-blue-950/20' :
                      lead.status === 'Contacted' ? 'border-amber-900 text-amber-500 bg-amber-950/20' :
                      lead.status === 'Responded' ? 'border-green-900 text-green-500 bg-green-950/20' :
                      lead.status === 'Converted' ? 'border-emerald-900 text-emerald-500 bg-emerald-950/20' :
                      'border-zinc-800 text-zinc-600 bg-zinc-900/50'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-zinc-100 mb-1 truncate">{lead.name}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono truncate">{lead.handle}</p>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLead(lead.id);
                  }}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {filteredLeads.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest">No leads found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Lead Details */}
        <div className="flex-1 overflow-y-auto bg-zinc-950/50">
          {selectedLead ? (
            <div className="max-w-4xl mx-auto p-12">
              <div className="flex items-start justify-between mb-12">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-[32px] flex items-center justify-center text-3xl font-mono text-zinc-500">
                    {selectedLead.name?.[0] || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-mono uppercase tracking-tighter">{selectedLead.name}</h2>
                      <button 
                        onClick={() => setIsEditingLead(!isEditingLead)}
                        className="p-2 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-500 hover:text-zinc-100"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                      <span className="flex items-center gap-1.5"><Globe size={14} /> {selectedLead.platform}</span>
                      <span className="flex items-center gap-1.5"><MessageSquare size={14} /> {selectedLead.handle}</span>
                      {selectedLead.role && <span className="flex items-center gap-1.5"><Users size={14} /> {selectedLead.role}</span>}
                      {selectedLead.company && <span className="flex items-center gap-1.5"><Globe size={14} /> {selectedLead.company}</span>}
                      <span className="flex items-center gap-1.5"><Clock size={14} /> Added {new Date(selectedLead.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-4">
                      {selectedLead.socialLinks?.x && (
                        <a href={selectedLead.socialLinks.x} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-100 transition-all">
                          <Twitter size={14} />
                        </a>
                      )}
                      {selectedLead.socialLinks?.linkedin && (
                        <a href={selectedLead.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-100 transition-all">
                          <Linkedin size={14} />
                        </a>
                      )}
                      {selectedLead.socialLinks?.reddit && (
                        <a href={selectedLead.socialLinks.reddit} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-100 transition-all">
                          <Globe size={14} />
                        </a>
                      )}
                      {selectedLead.socialLinks?.website && (
                        <a href={selectedLead.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-100 transition-all">
                          <Globe size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <select 
                    value={selectedLead.status}
                    onChange={(e) => handleUpdateLead({ status: e.target.value as any })}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-mono uppercase tracking-widest focus:outline-none focus:border-zinc-700"
                  >
                    {['New', 'Contacted', 'Responded', 'Converted', 'Lost'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Message Section */}
                  <section className="bg-zinc-900/30 border border-zinc-800 rounded-[32px] overflow-hidden">
                    <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                      <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-100 flex items-center gap-2">
                        <Sparkles size={14} className="text-blue-500" /> Personalized Message
                      </h3>
                      <button 
                        onClick={generatePersonalizedMessage}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-mono uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                      >
                        {isGenerating ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                        {selectedLead.personalizedMessage ? 'Regenerate' : 'Generate'}
                      </button>
                    </div>
                    <div className="p-8">
                      {selectedLead.personalizedMessage ? (
                        <div className="space-y-6">
                          <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl italic text-zinc-300 leading-relaxed">
                            "{selectedLead.personalizedMessage}"
                          </div>
                          <div className="flex justify-end gap-4">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(selectedLead.personalizedMessage || '');
                                toast.success('Copied to clipboard.');
                              }}
                              className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-zinc-100 transition-colors"
                            >
                              Copy Text
                            </button>
                            <button 
                              disabled={isSending}
                              onClick={async () => {
                                const platform = selectedLead.platform;
                                const handle = selectedLead.handle;
                                const message = selectedLead.personalizedMessage;
                                
                                setIsSending(true);
                                
                                // Agentic simulation
                                toast.promise(
                                  new Promise((resolve) => setTimeout(resolve, 2000)),
                                  {
                                    loading: `Agentic ${platform} Engine Initializing...`,
                                    success: () => {
                                      setIsSending(false);
                                      // Copy to clipboard
                                      navigator.clipboard.writeText(message || '');
                                      
                                      // Open platform
                                      let url = '';
                                      if (platform === 'X') {
                                        url = `https://x.com/${handle.replace('@', '')}`;
                                      } else if (platform === 'LinkedIn') {
                                        url = handle.startsWith('http') ? handle : `https://www.linkedin.com/in/${handle}`;
                                      } else if (platform === 'Reddit') {
                                        url = `https://www.reddit.com/u/${handle.replace('u/', '')}`;
                                      } else if (platform === 'Email') {
                                        url = `mailto:${handle}?subject=Yacht%20Labs%20Inquiry&body=${encodeURIComponent(message || '')}`;
                                      }
                                      
                                      if (url) window.open(url, '_blank');
                                      
                                      // Update status
                                      handleUpdateLead({ 
                                        status: 'Contacted', 
                                        lastContacted: serverTimestamp() 
                                      });
                                      
                                      return `Message copied & ${platform} profile opened.`;
                                    },
                                    error: 'Agentic Engine failed to initialize.',
                                  }
                                );
                              }}
                              className="flex items-center gap-2 px-6 py-3 bg-zinc-100 text-zinc-950 rounded-xl font-mono uppercase text-xs tracking-widest hover:bg-zinc-300 transition-all disabled:opacity-50"
                            >
                              {isSending ? <LucideLoader2 className="animate-spin" size={14} /> : <Send size={14} />} 
                              {isSending ? 'Sending Agentically...' : `Send via ${selectedLead.platform}`}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Sparkles size={32} className="text-zinc-800 mx-auto mb-4" />
                          <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest">No message generated yet.</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Details Section */}
                  <section className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Lead Context</h3>
                    <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl space-y-4">
                      {selectedLead.context && (
                        <div className="pb-4 border-b border-zinc-800/50">
                          <p className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Context</p>
                          <p className="text-sm text-zinc-300 leading-relaxed italic">{selectedLead.context}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Details</p>
                        <p className="text-sm text-zinc-300 leading-relaxed italic">
                          {selectedLead.details || 'No details provided.'}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  {/* Notes Section */}
                  <section className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-3xl">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-100 mb-4 flex items-center gap-2">
                      <Edit2 size={14} className="text-zinc-500" /> Internal Notes
                    </h3>
                    <textarea 
                      value={selectedLead.notes}
                      onChange={(e) => handleUpdateLead({ notes: e.target.value })}
                      placeholder="Add notes about this lead..."
                      className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 transition-colors resize-none mb-4"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono text-zinc-600 uppercase">Auto-saving...</span>
                      <button className="text-[10px] font-mono uppercase text-zinc-500 hover:text-zinc-100 transition-colors">
                        Clear Notes
                      </button>
                    </div>
                  </section>

                  {/* Contact Info */}
                  <section className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-3xl">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-100 mb-4 flex items-center gap-2">
                      <AlertCircle size={14} className="text-zinc-500" /> Contact Info
                    </h3>
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                      <p className="text-xs font-mono text-zinc-400 break-all">
                        {selectedLead.contactInfo || 'Not specified'}
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <Users size={48} className="text-zinc-800 mb-6" />
              <h2 className="text-xl font-mono uppercase tracking-tighter text-zinc-500 mb-2">No Lead Selected</h2>
              <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest">Select a lead from the sidebar to view details.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedLeadIds.size > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[150] bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-6"
          >
            <div className="flex items-center gap-3 pr-6 border-r border-zinc-800">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-mono text-xs font-bold">
                {selectedLeadIds.size}
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Leads Selected</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative group">
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all"
                >
                  Update Status
                </button>
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 space-y-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all">
                  {['New', 'Contacted', 'Responded', 'Converted', 'Lost'].map(s => (
                    <button 
                      key={s}
                      onClick={() => handleBulkUpdateStatus(s as any)}
                      className="w-full text-left px-3 py-2 text-[10px] font-mono uppercase text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={handleBulkDeleteLeads}
                className="flex items-center gap-2 px-4 py-2 bg-red-950/20 hover:bg-red-950/40 text-red-500 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all border border-red-900/20"
              >
                <Trash2 size={14} /> Delete
              </button>
              
              <button 
                onClick={() => setSelectedLeadIds(new Set())}
                className="p-2 text-zinc-500 hover:text-zinc-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Lead Modal */}
      <AnimatePresence>
        {isAddingLead && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-[32px] w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-mono uppercase tracking-tighter">Add New Lead</h2>
                <button onClick={() => setIsAddingLead(false)} className="text-zinc-500 hover:text-zinc-100">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddLead} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-zinc-500">Name</label>
                    <input 
                      required
                      type="text" 
                      value={newLead.name}
                      onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-zinc-500">Platform</label>
                    <select 
                      value={newLead.platform}
                      onChange={(e) => setNewLead({...newLead, platform: e.target.value as any})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-700"
                    >
                      <option value="X">X (Twitter)</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Reddit">Reddit</option>
                      <option value="Email">Email</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-zinc-500">Role</label>
                    <input 
                      type="text" 
                      value={newLead.role}
                      onChange={(e) => setNewLead({...newLead, role: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-700"
                      placeholder="e.g. CTO"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-zinc-500">Company</label>
                    <input 
                      type="text" 
                      value={newLead.company}
                      onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-700"
                      placeholder="e.g. Acme Inc"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-zinc-500">Handle / ID</label>
                  <input 
                    type="text" 
                    value={newLead.handle}
                    onChange={(e) => setNewLead({...newLead, handle: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-700"
                    placeholder="@username or u/username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-zinc-500">Social Links (JSON style or comma separated)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="X URL"
                      value={newLead.socialLinks?.x}
                      onChange={(e) => setNewLead({...newLead, socialLinks: {...newLead.socialLinks, x: e.target.value}})}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-[10px] focus:outline-none focus:border-zinc-700"
                    />
                    <input 
                      type="text" 
                      placeholder="LinkedIn URL"
                      value={newLead.socialLinks?.linkedin}
                      onChange={(e) => setNewLead({...newLead, socialLinks: {...newLead.socialLinks, linkedin: e.target.value}})}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-[10px] focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-zinc-500">Context / Reason</label>
                  <input 
                    type="text" 
                    value={newLead.context}
                    onChange={(e) => setNewLead({...newLead, context: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-700"
                    placeholder="Why are they a lead?"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-zinc-500">Details</label>
                  <textarea 
                    value={newLead.details}
                    onChange={(e) => setNewLead({...newLead, details: e.target.value})}
                    className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-700 resize-none"
                    placeholder="Additional info..."
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddingLead(false)}
                    className="flex-1 py-4 border border-zinc-800 rounded-2xl font-mono uppercase text-xs tracking-widest hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-zinc-100 text-zinc-950 rounded-2xl font-mono uppercase text-xs tracking-widest hover:bg-zinc-300 transition-colors"
                  >
                    Add Lead
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Lead Modal */}
      <AnimatePresence>
        {isEditingLead && selectedLead && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-[32px] w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-mono uppercase tracking-tighter">Edit Lead</h2>
                <button onClick={() => setIsEditingLead(false)} className="text-zinc-500 hover:text-zinc-100">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-zinc-500">Name</label>
                    <input 
                      type="text" 
                      defaultValue={selectedLead.name}
                      onBlur={(e) => handleUpdateLead({ name: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-zinc-500">Platform</label>
                    <select 
                      defaultValue={selectedLead.platform}
                      onChange={(e) => handleUpdateLead({ platform: e.target.value as any })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-700"
                    >
                      <option value="X">X (Twitter)</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Reddit">Reddit</option>
                      <option value="Email">Email</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-zinc-500">Role</label>
                    <input 
                      type="text" 
                      defaultValue={selectedLead.role}
                      onBlur={(e) => handleUpdateLead({ role: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-zinc-500">Company</label>
                    <input 
                      type="text" 
                      defaultValue={selectedLead.company}
                      onBlur={(e) => handleUpdateLead({ company: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-zinc-500">Handle / ID</label>
                  <input 
                    type="text" 
                    defaultValue={selectedLead.handle}
                    onBlur={(e) => handleUpdateLead({ handle: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-zinc-500">Context</label>
                  <input 
                    type="text" 
                    defaultValue={selectedLead.context}
                    onBlur={(e) => handleUpdateLead({ context: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-zinc-500">Details</label>
                  <textarea 
                    defaultValue={selectedLead.details}
                    onBlur={(e) => handleUpdateLead({ details: e.target.value })}
                    className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-700 resize-none"
                  />
                </div>
                <button 
                  onClick={() => setIsEditingLead(false)}
                  className="w-full py-4 bg-zinc-100 text-zinc-950 rounded-2xl font-mono uppercase text-xs tracking-widest hover:bg-zinc-300 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
