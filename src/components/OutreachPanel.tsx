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

export default function OutreachPanel({ profile, projectId }: { profile: any, projectId: string }) {
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
      
      if (leadsData.length > 0 && !selectedLeadId) {
        setSelectedLeadId(leadsData[0].id);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'outreach');
    });

    return unsubscribe;
  }, [projectId, auth.currentUser]);

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

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !auth.currentUser || !newLead.name || !newLead.handle) return;

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
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
  }, [leads, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-transparent">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-100 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-transparent text-zinc-100 overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Lead List */}
        <div className="w-80 border-r border-zinc-900 flex flex-col bg-zinc-950/30">
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
                  </div>
                  <h3 className="text-sm font-medium text-zinc-100 mb-1 truncate">{lead.name}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono truncate">{lead.handle}</p>
                </div>
              </div>
            ))}
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
                    </div>
                  </div>
                </div>
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
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
                        {isGenerating ? <LucideLoader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
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
                                toast.promise(
                                  new Promise((resolve) => setTimeout(resolve, 2000)),
                                  {
                                    loading: `Agentic ${platform} Engine Initializing...`,
                                    success: () => {
                                      setIsSending(false);
                                      navigator.clipboard.writeText(message || '');
                                      let url = '';
                                      if (platform === 'X') url = `https://x.com/${handle.replace('@', '')}`;
                                      else if (platform === 'LinkedIn') url = handle.startsWith('http') ? handle : `https://www.linkedin.com/in/${handle}`;
                                      else if (platform === 'Reddit') url = `https://www.reddit.com/u/${handle.replace('u/', '')}`;
                                      else if (platform === 'Email') url = `mailto:${handle}?subject=Yacht%20Labs%20Inquiry&body=${encodeURIComponent(message || '')}`;
                                      if (url) window.open(url, '_blank');
                                      handleUpdateLead({ status: 'Contacted', lastContacted: serverTimestamp() });
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
                </div>

                <div className="space-y-8">
                  <section className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-3xl">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-100 mb-4 flex items-center gap-2">
                      <Edit2 size={14} className="text-zinc-500" /> Internal Notes
                    </h3>
                    <textarea 
                      value={selectedLead.notes}
                      onChange={(e) => handleUpdateLead({ notes: e.target.value })}
                      placeholder="Add notes..."
                      className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    />
                  </section>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <Users size={48} className="text-zinc-800 mb-6" />
              <h2 className="text-xl font-mono uppercase tracking-tighter text-zinc-500 mb-2">No Lead Selected</h2>
            </div>
          )}
        </div>
      </div>

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
              <form onSubmit={handleAddLead} className="space-y-6">
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
                      <option value="X">X / Twitter</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Reddit">Reddit</option>
                      <option value="Email">Email</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-zinc-500">Handle / URL</label>
                  <input 
                    required
                    type="text" 
                    value={newLead.handle}
                    onChange={(e) => setNewLead({...newLead, handle: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-700"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-zinc-100 text-zinc-950 rounded-2xl font-mono uppercase text-xs tracking-widest hover:bg-zinc-300 transition-all"
                >
                  Create Lead
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
