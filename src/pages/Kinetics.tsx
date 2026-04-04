import React, { useState, useEffect, useMemo } from 'react';
import { Rocket, Zap, Activity, Globe, ShieldCheck, ArrowRight, Play, Server, Cpu, Send, ExternalLink, Loader2, CheckCircle2, Layers, X, Mail, MessageCircle, Share2, Clock, AlertCircle, Search, SortAsc, SortDesc, PenLine, Bold, Italic, Underline, Heading1, Heading2, Link as LinkIcon, Type as TypeIcon, Save, Eye, Edit3, FolderPlus, Folder, MoreVertical, Trash2, ChevronRight, ChevronDown, GripVertical, Move, Check, Smartphone, Tablet, Monitor, Layout, Maximize2, FileCode, FileText, Terminal, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { db, auth, collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, setDoc, orderBy } from '../firebase';
import { toast, Toaster } from 'sonner';
import { trackEvent } from '../lib/analytics';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

import { PaywallOverlay } from '../components/PaywallOverlay';

import { triggerSyntheticFeedback } from '../lib/feedback';

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

export default function Kinetics({ profile }: { profile: any }) {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const [isShipping, setIsShipping] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [outreachLogs, setOutreachLogs] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'build' | 'deployment' | null>(null);
  
  // Search and Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'build' | 'deployment' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [stagedDoc, setStagedDoc] = useState<any | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderNameValue, setEditFolderNameValue] = useState('');
  const [movingItemId, setMovingItemId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedDevice, setSelectedDevice] = useState(DEVICE_PRESETS.find(p => p.id === 'desktop-lg') || DEVICE_PRESETS[12]);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [actionsCount, setActionsCount] = useState(0);
  const [chatter, setChatter] = useState<any[]>([]);
  const [newChatter, setNewChatter] = useState('');
  const [isPostingChatter, setIsPostingChatter] = useState(false);

  useEffect(() => {
    if (!selectedId) {
      setChatter([]);
      return;
    }
    const q = query(
      collection(db, 'mission_chatter'),
      where('deploymentId', '==', selectedId),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setChatter(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.error('Chatter listener failed:', error);
    });
    return unsubscribe;
  }, [selectedId]);

  const handlePostChatter = async () => {
    if (!newChatter.trim() || !selectedId || !auth.currentUser) return;
    setIsPostingChatter(true);
    try {
      await addDoc(collection(db, 'mission_chatter'), {
        deploymentId: selectedId,
        text: newChatter.trim(),
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous Lab Member',
        userPhoto: auth.currentUser.photoURL,
        createdAt: serverTimestamp()
      });
      setNewChatter('');
      toast.success('Comment posted');
    } catch (error) {
      console.error('Post chatter failed:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsPostingChatter(false);
    }
  };

  useEffect(() => {
    const handlePulse = (e: MessageEvent) => {
      if (e.data?.type === 'ACOUSTICS_PULSE') {
        setActionsCount(prev => prev + 1);
        // Also track in analytics
        trackEvent('acoustics_pulse', { 
          event: e.data.event, 
          deploymentId: e.data.deploymentId 
        });
      }
    };
    window.addEventListener('message', handlePulse);
    return () => window.removeEventListener('message', handlePulse);
  }, []);

  const selectedItem = useMemo(() => {
    if (!selectedId || !selectedType) return null;
    if (selectedType === 'build') return documents.find(d => d.id === selectedId);
    return deployments.find(d => d.id === selectedId);
  }, [selectedId, selectedType, documents, deployments]);

  useEffect(() => {
    if (selectedItem) {
      if (!isModalOpen) setEditedContent(selectedItem.content || '');
      if (!isEditing) setEditTitleValue(selectedItem.title || '');
    }
  }, [selectedItem, isEditing, isModalOpen]);

  const filteredDocuments = useMemo(() => {
    let result = documents.filter(doc => 
      !deployments.some(dep => dep.documentId === doc.id) && // Filter out already deployed builds to avoid duplicates
      (doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    result.sort((a, b) => {
      if (sortBy === 'title') {
        const comparison = (a.title || '').localeCompare(b.title || '');
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
    
    return result;
  }, [documents, searchTerm, sortBy, sortOrder]);

  const filteredDeployments = useMemo(() => {
    let result = deployments.filter(dep => 
      dep.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    result.sort((a, b) => {
      if (sortBy === 'title') {
        const comparison = (a.title || '').localeCompare(b.title || '');
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const dateA = a.deployedAt?.seconds || 0;
        const dateB = b.deployedAt?.seconds || 0;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
    
    return result;
  }, [deployments, searchTerm, sortBy, sortOrder]);

  const handleRenameFolder = async (folderId: string) => {
    if (!editFolderNameValue.trim()) {
      setEditingFolderId(null);
      return;
    }
    try {
      await updateDoc(doc(db, 'folders', folderId), {
        name: editFolderNameValue.trim(),
        updatedAt: serverTimestamp()
      });
      setEditingFolderId(null);
      toast.success('Folder renamed');
    } catch (error) {
      console.error('Error renaming folder:', error);
      toast.error('Failed to rename folder');
    }
  };

  const handleUpdateItem = async () => {
    if (!selectedId || !selectedType || !projectId) return;
    const toastId = toast.loading('Updating...');
    try {
      if (selectedType === 'build') {
        await updateDoc(doc(db, `projects/${projectId}/documents`, selectedId), {
          title: editTitleValue,
          content: editedContent,
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(doc(db, 'deployments', selectedId), {
          title: editTitleValue,
          content: editedContent,
          updatedAt: serverTimestamp()
        });
      }
      setIsEditing(false);
      toast.success('Updated successfully', { id: toastId });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, selectedType === 'build' ? `projects/${projectId}/documents/${selectedId}` : `deployments/${selectedId}`);
      toast.error('Failed to update', { id: toastId });
    }
  };

  useEffect(() => {
    if (!projectId) return;

    const docsQuery = query(collection(db, `projects/${projectId}/documents`));
    const unsubDocs = onSnapshot(docsQuery, (snap) => {
      setDocuments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const depsQuery = query(collection(db, 'deployments'), where('projectId', '==', projectId));
    const unsubDeps = onSnapshot(depsQuery, (snap) => {
      setDeployments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const foldersQuery = query(collection(db, 'folders'), where('projectId', '==', projectId));
    const unsubFolders = onSnapshot(foldersQuery, (snap) => {
      setFolders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Simulated Outreach Data
    setOutreachLogs([
      { id: 1, target: '@dev_guru', platform: 'X', status: 'Sent', time: '10m ago' },
      { id: 2, target: 'u/saas_builder', platform: 'Reddit', status: 'Sent', time: '45m ago' },
      { id: 3, target: 'Sarah Chen', platform: 'LinkedIn', status: 'Queued', time: 'Scheduled' },
    ]);

    return () => {
      unsubDocs();
      unsubDeps();
      unsubFolders();
    };
  }, [projectId]);

  const handleShip = async (document: any) => {
    if (isShipping) return;
    setIsShipping(true);
    const toastId = toast.loading(`Deploying ${document.title}...`);

    try {
      const deploymentId = document.id;
      const brandedUrl = `https://yacht-labs.com/pub/${deploymentId}`;
      const liveUrl = `${window.location.origin}/pub/${deploymentId}`;

      try {
        await setDoc(doc(db, 'deployments', deploymentId), {
          projectId,
          documentId: document.id,
          title: document.title,
          content: stagedDoc?.id === document.id ? editedContent : document.content,
          status: 'Live',
          region: 'Global Edge',
          deployedAt: serverTimestamp(),
          url: brandedUrl,
          liveUrl: liveUrl,
          type: 'main'
        });
        setSelectedId(deploymentId);
        setSelectedType('deployment');
        setIsEditing(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `deployments/${deploymentId}`);
      }

      // If we edited the content, update the original document too
      if (stagedDoc?.id === document.id) {
        await updateDoc(doc(db, `projects/${projectId}/documents`, document.id), {
          content: editedContent,
          updatedAt: serverTimestamp()
        });
        setStagedDoc(null);
      }

      toast.success("Deployment Successful", {
        description: "Your project is now live at a public URL.",
        id: toastId
      });
      triggerSyntheticFeedback(projectId);
      trackEvent('ship_complete', { projectId, documentId: document.id });
    } catch (error: any) {
      console.error('Deployment failed:', error);
      toast.error("Deployment Failed", {
        description: error.message,
        id: toastId
      });
    } finally {
      setIsShipping(false);
    }
  };

  const handleDeleteDeployment = async (depId: string) => {
    if (!window.confirm("Are you sure you want to take this deployment offline and delete it?")) return;
    try {
      await deleteDoc(doc(db, 'deployments', depId));
      toast.success("Deployment removed");
      if (selectedId === depId) {
        setSelectedId(null);
        setSelectedType(null);
      }
    } catch (error) {
      toast.error("Failed to remove deployment");
    }
  };

  const handleDeleteBuild = async (docId: string) => {
    if (!projectId || !window.confirm("Are you sure you want to delete this build?")) return;
    try {
      await deleteDoc(doc(db, `projects/${projectId}/documents`, docId));
      toast.success("Build removed");
      if (selectedId === docId) {
        setSelectedId(null);
        setSelectedType(null);
      }
    } catch (error) {
      toast.error("Failed to remove build");
    }
  };

  const handleSaveItem = async () => {
    if (!selectedId || !selectedType || !projectId) return;
    try {
      if (selectedType === 'build') {
        await updateDoc(doc(db, `projects/${projectId}/documents`, selectedId), {
          title: editTitleValue,
          content: editedContent,
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(doc(db, 'deployments', selectedId), {
          title: editTitleValue,
          content: editedContent,
          updatedAt: serverTimestamp()
        });
      }
      setIsEditing(false);
      toast.success("Changes saved successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${selectedType}s/${selectedId}`);
      toast.error("Failed to save changes");
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !projectId) return;
    
    // Check plan limits
    const limit = profile?.isPro ? 3 : 1;
    if (folders.length >= limit) {
      toast.error('Folder Limit Reached', {
        description: `Your ${profile?.isPro ? 'Pro' : 'Free'} plan is limited to ${limit} folders.`,
        action: !profile?.isPro ? {
          label: "Upgrade",
          onClick: () => (window as any).location.href = '/studio/checkout'
        } : undefined
      });
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'folders'), {
        projectId,
        name: newFolderName,
        ownerId: auth.currentUser?.uid,
        createdAt: serverTimestamp()
      });
      setExpandedFolders(prev => {
        const next = new Set(prev);
        next.add(docRef.id);
        return next;
      });
      setNewFolderName('');
      setIsCreatingFolder(false);
      toast.success("Folder created successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'folders');
      toast.error("Failed to create folder");
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      // Unset folderId for all items in this folder
      const docsInFolder = documents.filter(d => d.folderId === folderId);
      const depsInFolder = deployments.filter(d => d.folderId === folderId);

      for (const d of docsInFolder) {
        await updateDoc(doc(db, `projects/${projectId}/documents`, d.id), { folderId: null });
      }
      for (const d of depsInFolder) {
        await updateDoc(doc(db, 'deployments', d.id), { folderId: null });
      }

      await deleteDoc(doc(db, 'folders', folderId));
      toast.success("Folder removed");
    } catch (error) {
      toast.error("Failed to remove folder");
    }
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const handleMoveToFolder = async (itemId: string, itemType: 'build' | 'deployment', folderId: string | null) => {
    if (!projectId) return;
    try {
      if (itemType === 'build') {
        await updateDoc(doc(db, `projects/${projectId}/documents`, itemId), { folderId });
      } else {
        await updateDoc(doc(db, 'deployments', itemId), { folderId });
      }
      toast.success('Item moved');
      setMovingItemId(null);
    } catch (error) {
      console.error('Error moving item:', error);
      toast.error('Failed to move item');
    }
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const beforeText = text.substring(0, start);
    const selection = text.substring(start, end);
    const afterText = text.substring(end);

    const newContent = `${beforeText}${before}${selection}${after}${afterText}`;
    setEditedContent(newContent);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const toggleSelectItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedItems.size} items?`);
    if (!confirmDelete) return;

    const toastId = toast.loading(`Deleting ${selectedItems.size} items...`);
    try {
      for (const id of selectedItems) {
        // Try deleting from both collections (one will fail silently or we can check type)
        const isBuild = documents.some(d => d.id === id);
        if (isBuild && projectId) {
          await deleteDoc(doc(db, `projects/${projectId}/documents`, id));
        } else {
          await deleteDoc(doc(db, 'deployments', id));
        }
      }
      setSelectedItems(new Set());
      toast.success("Items deleted successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete some items", { id: toastId });
    }
  };

  const handleBulkMove = async (folderId: string | null) => {
    if (selectedItems.size === 0 || !projectId) return;
    const toastId = toast.loading(`Moving ${selectedItems.size} items...`);
    try {
      for (const id of selectedItems) {
        const isBuild = documents.some(d => d.id === id);
        if (isBuild) {
          await updateDoc(doc(db, `projects/${projectId}/documents`, id), { folderId });
        } else {
          await updateDoc(doc(db, 'deployments', id), { folderId });
        }
      }
      setSelectedItems(new Set());
      setMovingItemId(null);
      toast.success("Items moved successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to move some items", { id: toastId });
    }
  };

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  if (!projectId) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 font-mono uppercase text-xs tracking-widest bg-zinc-950">
        Select a project from the dashboard to begin shipping.
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      <Toaster position="top-right" theme="dark" />
      <header className="p-6 border-b border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
            <Zap className="text-zinc-100" size={20} />
          </div>
          <div>
            <h1 className="text-sm font-mono uppercase tracking-widest text-zinc-100">Ship: The Engine</h1>
            <p className="text-[10px] text-zinc-500 font-sans italic">Ideas are static. Ship makes them move.</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Dashboard Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
          {/* Horizontal Tab Browser */}
          <div className="border-b border-zinc-900 bg-zinc-950/50 flex items-center px-6 h-14 gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 pr-4 border-r border-zinc-900">
              <button 
                onClick={() => setIsCreatingFolder(true)}
                className="p-2 text-zinc-500 hover:text-zinc-100 transition-colors"
                title="New Folder"
              >
                <FolderPlus size={16} />
              </button>
              <div className="relative w-48">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input 
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1 pl-8 pr-3 text-[10px] font-mono text-zinc-300 focus:outline-none focus:border-zinc-700 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Folders as Tabs */}
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => toggleFolder(folder.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all ${
                    expandedFolders.has(folder.id) ? 'bg-zinc-900 text-zinc-100 border border-zinc-800' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Folder size={12} />
                  {folder.name}
                </button>
              ))}
              
              <div className="w-px h-6 bg-zinc-900 mx-2" />

              {/* Builds as Tabs */}
              {filteredDocuments.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => {
                    setSelectedId(doc.id);
                    setSelectedType('build');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all whitespace-nowrap ${
                    selectedId === doc.id ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Layers size={12} />
                  {doc.title}
                </button>
              ))}

              {/* Deployments as Tabs */}
              {filteredDeployments.map(dep => (
                <button
                  key={dep.id}
                  onClick={() => {
                    setSelectedId(dep.id);
                    setSelectedType('deployment');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all whitespace-nowrap ${
                    selectedId === dep.id ? 'bg-green-500 text-green-950 font-bold' : 'text-green-500/50 hover:text-green-500'
                  }`}
                >
                  <Server size={12} />
                  {dep.title}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-12 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {selectedItem ? (
              <div className="space-y-8">
                {/* Header / Title Section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      selectedType === 'build' ? 'bg-zinc-900 text-zinc-100' : 'bg-green-950/20 text-green-500'
                    }`}>
                      {selectedType === 'build' ? <Layers size={24} /> : <Server size={24} />}
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="text"
                            value={editTitleValue}
                            onChange={(e) => {
                              setEditTitleValue(e.target.value);
                              // Instantaneous update in Firestore
                              if (selectedId && selectedType && projectId) {
                                const path = selectedType === 'build' ? `projects/${projectId}/documents/${selectedId}` : `deployments/${selectedId}`;
                                updateDoc(doc(db, path), { title: e.target.value });
                              }
                            }}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-lg font-sans font-medium text-zinc-100 focus:outline-none focus:border-zinc-700 w-full max-w-md"
                            autoFocus
                            onBlur={() => setIsEditing(false)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setIsEditing(false);
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setIsEditing(true)}>
                          <h2 className="text-xl font-sans font-medium text-zinc-100">{selectedItem.title}</h2>
                          <PenLine size={16} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">
                          {selectedType === 'build' ? 'Synthetic Build' : 'Active Deployment'}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">
                          {selectedItem.createdAt?.seconds ? new Date(selectedItem.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        if (selectedType === 'build') handleDeleteBuild(selectedId!);
                        else handleDeleteDeployment(selectedId!);
                      }}
                      className="p-2 text-zinc-700 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                    {selectedType === 'build' && (
                      <button 
                        onClick={() => handleShip(selectedItem)}
                        disabled={isShipping}
                        className={`px-6 py-2 rounded-xl font-mono uppercase text-[10px] font-bold tracking-widest transition-all flex items-center gap-2 ${
                          deployments.some(d => d.documentId === selectedId)
                            ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                            : 'bg-zinc-100 text-zinc-950 hover:bg-zinc-300'
                        }`}
                      >
                        {isShipping ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                        {deployments.some(d => d.documentId === selectedId) ? 'Re-deploy to Production' : 'Launch to Production'}
                      </button>
                    )}
                    {selectedType === 'deployment' && (
                      <a 
                        href={selectedItem.liveUrl || selectedItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2 bg-zinc-800 text-zinc-100 rounded-xl font-mono uppercase text-[10px] font-bold tracking-widest hover:bg-zinc-700 transition-all flex items-center gap-2"
                      >
                        <ExternalLink size={14} />
                        View Live
                      </a>
                    )}
                    <button 
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all flex items-center gap-2 ${
                        isPreviewMode ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {isPreviewMode ? <Edit3 size={14} /> : <Eye size={14} />}
                      {isPreviewMode ? 'Editor' : 'Preview'}
                    </button>
                    {isPreviewMode && (
                      <button
                        onClick={() => setIsFullscreen(true)}
                        disabled={!(selectedItem?.name?.toLowerCase().endsWith('.html') || selectedItem?.title?.toLowerCase().endsWith('.html'))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed`}
                      >
                        <Play size={14} fill="currentColor" /> Present
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Editor / Preview */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-[32px] overflow-hidden flex flex-col min-h-[600px]">
                  {!isPreviewMode && (
                    <div className="p-2 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-1 overflow-x-auto no-scrollbar">
                      <div className="flex items-center gap-2 px-3 mr-2 border-r border-zinc-800">
                        <Terminal size={14} className="text-zinc-500" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Code Editor</span>
                      </div>
                      <button onClick={() => insertText('<!-- ', ' -->')} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg" title="Comment"><FileCode size={16} /></button>
                      <button onClick={() => insertText('<div class="">', '</div>')} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg" title="Div Tag"><Layers size={16} /></button>
                      <div className="w-px h-4 bg-zinc-800 mx-1" />
                      <button onClick={() => insertText('**', '**')} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg" title="Bold"><Bold size={16} /></button>
                      <button onClick={() => insertText('_', '_')} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg" title="Italic"><Italic size={16} /></button>
                      <div className="w-px h-4 bg-zinc-800 mx-1" />
                      <button onClick={() => insertText('`', '`')} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg" title="Code"><TypeIcon size={16} /></button>
                      <div className="flex-1" />
                      <button 
                        onClick={handleUpdateItem}
                        className="flex items-center gap-2 px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-colors"
                      >
                        <Save size={14} />
                        Save
                      </button>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Expand Editor"
                      >
                        <Maximize2 size={16} />
                      </button>
                    </div>
                  )}

                  <div className="flex-1 flex overflow-hidden">
                    {!isPreviewMode && (
                      <div className="w-48 border-r border-zinc-800 bg-zinc-950/50 p-4 space-y-4">
                        <div>
                          <h4 className="text-[9px] font-mono uppercase tracking-widest text-zinc-600 mb-2">Files</h4>
                          <div className="space-y-1">
                            <button className="w-full flex items-center gap-2 px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-100">
                              <FileCode size={12} className="text-blue-500" />
                              index.html
                            </button>
                            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-zinc-500 hover:bg-zinc-900/50 rounded-lg text-[10px] font-mono transition-colors opacity-50 cursor-not-allowed">
                              <FileCode size={12} />
                              styles.css
                            </button>
                            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-zinc-500 hover:bg-zinc-900/50 rounded-lg text-[10px] font-mono transition-colors opacity-50 cursor-not-allowed">
                              <FileCode size={12} />
                              main.js
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className={`flex-1 overflow-y-auto ${isPreviewMode ? 'bg-zinc-900/20' : 'bg-zinc-950'}`}>
                      {isPreviewMode ? (
                        <div 
                          style={{ 
                            width: isFullscreen ? '100%' : (selectedDevice.width === '100%' ? '100%' : `${selectedDevice.width}px`),
                            margin: '0 auto',
                          }}
                          className={`synthesis-output max-w-none transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-[100] bg-white p-0' : 'bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden'}`}
                        >
                          {selectedItem?.name?.toLowerCase().endsWith('.html') || selectedItem?.title?.toLowerCase().endsWith('.html') || editedContent.includes('<!DOCTYPE html>') || editedContent.includes('<html') ? (
                            <div className={`relative w-full h-full ${isFullscreen ? '' : 'min-h-[600px]'}`}>
                              {isFullscreen && (
                                <button 
                                  onClick={() => setIsFullscreen(false)}
                                  className="absolute top-4 right-4 z-[110] p-2 bg-zinc-900/80 text-white rounded-full hover:bg-zinc-800 transition-all"
                                >
                                  <X size={24} />
                                </button>
                              )}
                              <iframe
                                srcDoc={editedContent}
                                style={{ 
                                  height: isFullscreen ? '100%' : (selectedDevice.height === '100%' ? '100%' : `${selectedDevice.height}px`),
                                  maxHeight: isFullscreen ? 'none' : '800px'
                                }}
                                className="w-full bg-white border-none"
                                title="Prototype Preview"
                                sandbox="allow-scripts allow-forms allow-popups allow-modals"
                              />
                            </div>
                          ) : (
                            <div className="p-8 md:p-12 bg-zinc-950 min-h-full prose prose-invert prose-zinc max-w-none">
                              <Markdown remarkPlugins={[remarkGfm]}>{editedContent}</Markdown>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative h-full flex flex-col">
                          <div className="absolute left-0 top-0 bottom-0 w-12 bg-zinc-900/30 border-r border-zinc-800 flex flex-col items-center py-4 gap-1 select-none pointer-events-none">
                            {Array.from({ length: Math.max(20, editedContent.split('\n').length) }).map((_, i) => (
                              <span key={i} className="text-[10px] font-mono text-zinc-700 leading-relaxed">{i + 1}</span>
                            ))}
                          </div>
                          <textarea 
                            id="content-editor"
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="flex-1 pl-16 pr-8 py-4 bg-transparent border-none focus:ring-0 text-zinc-300 font-mono text-sm leading-relaxed resize-none outline-none min-h-[500px]"
                            placeholder="<!-- Start coding your prototype... -->"
                            spellCheck={false}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metrics / Logs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">Real-time Metrics</h4>
                      <div className="flex items-center gap-8">
                        <div>
                          <p className="text-2xl font-sans font-medium text-blue-500">{actionsCount}</p>
                          <p className="text-[9px] font-mono uppercase text-zinc-600">Live Actions</p>
                        </div>
                        <div>
                          <p className="text-2xl font-sans font-medium text-zinc-100">{chatter.length}</p>
                          <p className="text-[9px] font-mono uppercase text-zinc-600">Comments</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">Content Metrics</h4>
                      <div className="flex items-center gap-8">
                        <div>
                          <p className="text-2xl font-sans font-medium text-zinc-100">{editedContent.length}</p>
                          <p className="text-[9px] font-mono uppercase text-zinc-600">Characters</p>
                        </div>
                        <div>
                          <p className="text-2xl font-sans font-medium text-zinc-100">{editedContent.split(/\s+/).filter(Boolean).length}</p>
                          <p className="text-[9px] font-mono uppercase text-zinc-600">Words</p>
                        </div>
                      </div>
                    </div>

                    {selectedType === 'deployment' && (
                      <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">Deployment Status</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-sans text-zinc-100">Live on Global Edge</span>
                          </div>
                          <button 
                            onClick={() => handleDeleteDeployment(selectedId)}
                            className="text-[9px] font-mono uppercase text-red-500 hover:text-red-400 transition-colors"
                          >
                            Take Offline
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mission Chatter Section */}
                  <div className="p-8 bg-zinc-900/20 border border-zinc-900 rounded-[32px] space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                          <MessageSquare size={16} className="text-zinc-500" />
                        </div>
                        <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-100">Mission Chatter</h3>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{chatter.length} Messages</span>
                    </div>

                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex-shrink-0 overflow-hidden border border-zinc-700">
                          {auth.currentUser?.photoURL ? (
                            <img src={auth.currentUser.photoURL} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-500 font-mono text-xs">
                              {auth.currentUser?.displayName?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-3">
                          <textarea 
                            value={newChatter}
                            onChange={(e) => setNewChatter(e.target.value)}
                            placeholder="Add a tactical note or feedback..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 resize-none min-h-[100px]"
                          />
                          <div className="flex justify-end">
                            <button 
                              onClick={handlePostChatter}
                              disabled={!newChatter.trim() || isPostingChatter}
                              className="flex items-center gap-2 px-6 py-2 bg-zinc-100 text-zinc-950 rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-zinc-300 disabled:opacity-50 transition-all"
                            >
                              {isPostingChatter ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                              Post Note
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                        {chatter.map((msg) => (
                          <div key={msg.id} className="flex gap-4 p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0 overflow-hidden border border-zinc-700">
                              {msg.userPhoto ? (
                                <img src={msg.userPhoto} alt={msg.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-500 font-mono text-[10px]">
                                  {msg.userName?.charAt(0) || 'U'}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-zinc-100">{msg.userName}</span>
                                <span className="text-[8px] font-mono text-zinc-600">
                                  {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400 leading-relaxed">{msg.text}</p>
                            </div>
                          </div>
                        ))}
                        {chatter.length === 0 && (
                          <div className="text-center py-12 border border-dashed border-zinc-900 rounded-2xl">
                            <p className="text-[10px] font-mono uppercase text-zinc-700 tracking-widest italic">No chatter recorded for this build.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
              </div>
            ) : (
              <div className="h-[70vh] flex flex-col items-center justify-center text-center p-12 border border-dashed border-zinc-900 rounded-[48px]">
                <div className="w-20 h-20 bg-zinc-900/50 rounded-3xl flex items-center justify-center mb-6">
                  <Rocket size={40} className="text-zinc-800" />
                </div>
                <h2 className="text-xl font-sans font-medium text-zinc-100 mb-2">Ready for Launch</h2>
                <p className="text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  Select a synthetic build from the sidebar to review, edit, and ship to the global edge network.
                </p>
              </div>
            )}

            <div className="mt-20">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500">Growth Outreach</h2>
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600">
                  <Globe size={12} />
                  <span>Global Edge Network</span>
                </div>
              </div>

            <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl mb-12 relative overflow-hidden">
              {!profile?.isPro && (
                <PaywallOverlay 
                  title="Autopilot Growth Engine" 
                  description="The Autopilot engine handles automated outreach and lead generation. Pro Lab members get 50+ automated invites per month."
                />
              )}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-mono uppercase tracking-widest flex items-center gap-2 text-zinc-400">
                  <Mail size={16} className="text-zinc-500" /> Growth Outreach
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono uppercase text-zinc-500">Rate Limit</span>
                    <span className="text-[10px] font-mono text-zinc-100">12 / 20 Invites</span>
                  </div>
                  <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="w-[60%] h-full bg-blue-500 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {outreachLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        log.platform === 'X' ? 'bg-zinc-900 text-zinc-100' :
                        log.platform === 'Reddit' ? 'bg-orange-950/20 text-orange-500' :
                        'bg-blue-950/20 text-blue-500'
                      }`}>
                        {log.platform === 'X' ? <MessageCircle size={14} /> :
                         log.platform === 'Reddit' ? <Share2 size={14} /> :
                         <Globe size={14} />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-100">{log.target}</p>
                        <p className="text-[9px] font-mono uppercase text-zinc-600">{log.platform} Outreach</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`text-[10px] font-mono uppercase ${
                          log.status === 'Sent' ? 'text-green-500' : 'text-amber-500'
                        }`}>{log.status}</p>
                        <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-700">
                          <Clock size={10} /> {log.time}
                        </div>
                      </div>
                      <button className="p-2 text-zinc-700 hover:text-zinc-100 transition-colors">
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
              <h3 className="text-sm font-mono uppercase tracking-widest mb-6 flex items-center gap-2 text-zinc-400">
                <Send size={16} className="text-zinc-500" /> Deployment Logs
              </h3>
              <div className="space-y-4">
                {deployments.length === 0 ? (
                  <p className="text-[10px] font-mono text-zinc-700 italic">Waiting for deployment activity...</p>
                ) : (
                  deployments.slice(0, 5).map((dep, i) => (
                    <div key={i} className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 border-l border-zinc-800 pl-4">
                      <span className="text-zinc-700">{new Date(dep.deployedAt?.seconds * 1000).toLocaleTimeString()}</span>
                      <span>Successfully deployed <span className="text-zinc-300">{dep.title}</span> to production edge.</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
      <AnimatePresence>
        {selectedItems.size > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-6"
          >
            <div className="flex items-center gap-3 pr-6 border-r border-zinc-800">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-mono text-xs font-bold">
                {selectedItems.size}
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Items Selected</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative group">
                <button 
                  onClick={() => setMovingItemId('bulk')}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all"
                >
                  <Move size={14} /> Move To
                </button>
                {movingItemId === 'bulk' && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 space-y-1">
                    <button 
                      onClick={() => handleBulkMove(null)}
                      className="w-full text-left px-3 py-2 text-[10px] font-mono uppercase text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Layers size={12} /> Uncategorized
                    </button>
                    {folders.map(f => (
                      <button 
                        key={f.id}
                        onClick={() => handleBulkMove(f.id)}
                        className="w-full text-left px-3 py-2 text-[10px] font-mono uppercase text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Folder size={12} /> {f.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-950/20 hover:bg-red-950/40 text-red-500 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all border border-red-900/20"
              >
                <Trash2 size={14} /> Delete
              </button>
              
              <button 
                onClick={() => setSelectedItems(new Set())}
                className="p-2 text-zinc-500 hover:text-zinc-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full h-full max-w-6xl bg-zinc-950 border border-zinc-800 rounded-[48px] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
                    <Terminal className="text-zinc-100" size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-100">{selectedItem?.title}</h2>
                    <p className="text-[10px] text-zinc-500 font-sans">Full Screen Code Editor</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
                    <button onClick={() => insertText('<!-- ', ' -->')} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg" title="Comment"><FileCode size={16} /></button>
                    <button onClick={() => insertText('<div class="">', '</div>')} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg" title="Div Tag"><Layers size={16} /></button>
                    <div className="w-px h-4 bg-zinc-800 mx-1" />
                    <button onClick={() => insertText('**', '**')} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg" title="Bold"><Bold size={16} /></button>
                    <button onClick={() => insertText('_', '_')} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg" title="Italic"><Italic size={16} /></button>
                    <div className="w-px h-4 bg-zinc-800 mx-1" />
                    <button onClick={() => insertText('`', '`')} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg" title="Code"><TypeIcon size={16} /></button>
                  </div>
                  <button 
                    onClick={handleUpdateItem}
                    className="flex items-center gap-2 px-6 py-2 bg-zinc-100 text-zinc-950 rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-zinc-300 transition-all"
                  >
                    <Save size={14} /> Save
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-zinc-500 hover:text-zinc-100 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              <div className="flex-1 flex overflow-hidden">
                <div className="w-48 border-r border-zinc-800 bg-zinc-950/50 p-6 space-y-4">
                  <div>
                    <h4 className="text-[9px] font-mono uppercase tracking-widest text-zinc-600 mb-2">Files</h4>
                    <div className="space-y-1">
                      <button className="w-full flex items-center gap-2 px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-100">
                        <FileCode size={12} className="text-blue-500" />
                        index.html
                      </button>
                      <button className="w-full flex items-center gap-2 px-2 py-1.5 text-zinc-500 hover:bg-zinc-900/50 rounded-lg text-[10px] font-mono transition-colors opacity-50 cursor-not-allowed">
                        <FileCode size={12} />
                        styles.css
                      </button>
                      <button className="w-full flex items-center gap-2 px-2 py-1.5 text-zinc-500 hover:bg-zinc-900/50 rounded-lg text-[10px] font-mono transition-colors opacity-50 cursor-not-allowed">
                        <FileCode size={12} />
                        main.js
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 relative bg-zinc-950 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-16 bg-zinc-900/30 border-r border-zinc-800 flex flex-col items-center py-8 gap-1 select-none pointer-events-none">
                    {Array.from({ length: Math.max(30, editedContent.split('\n').length) }).map((_, i) => (
                      <span key={i} className="text-[12px] font-mono text-zinc-700 leading-relaxed">{i + 1}</span>
                    ))}
                  </div>
                  <textarea 
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full h-full pl-20 pr-12 py-8 bg-transparent border-none focus:ring-0 text-zinc-300 font-mono text-lg leading-relaxed resize-none outline-none"
                    placeholder="<!-- Start coding your prototype... -->"
                    spellCheck={false}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FolderDroppable = ({ folder, children, expandedFolders, toggleFolder, editingFolderId, editFolderNameValue, setEditFolderNameValue, handleRenameFolder, setEditingFolderId, handleDeleteFolder, isRoot }: any) => {
  return (
    <div 
      className="space-y-2 rounded-xl transition-all duration-200 p-1"
    >
      {isRoot ? (
        <h4 className="text-[9px] font-mono uppercase tracking-widest text-zinc-700 mb-2 px-2 pt-4 border-t border-zinc-900/50">Uncategorized</h4>
      ) : (
        <div className="flex items-center justify-between p-2 hover:bg-zinc-900/50 rounded-xl group transition-colors">
          {editingFolderId === folder.id ? (
            <div className="flex items-center gap-2 flex-1 px-2">
              <input 
                type="text"
                value={editFolderNameValue}
                onChange={(e) => setEditFolderNameValue(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[11px] font-mono text-zinc-100 focus:outline-none focus:border-zinc-700 flex-1"
                autoFocus
                onBlur={() => handleRenameFolder(folder.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameFolder(folder.id);
                  if (e.key === 'Escape') setEditingFolderId(null);
                }}
              />
              <button onClick={() => handleRenameFolder(folder.id)} className="text-green-500 hover:text-green-400"><CheckCircle2 size={14} /></button>
              <button onClick={() => setEditingFolderId(null)} className="text-zinc-500 hover:text-zinc-300"><X size={14} /></button>
            </div>
          ) : (
            <div 
              className="flex items-center gap-2 cursor-pointer flex-1"
              onClick={() => toggleFolder(folder.id)}
            >
              {expandedFolders.has(folder.id) ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />}
              <Folder size={16} className="text-zinc-400" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-300">{folder.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button 
              onClick={() => {
                setEditingFolderId(folder.id);
                setEditFolderNameValue(folder.name);
              }}
              className="p-1 text-zinc-600 hover:text-zinc-300 transition-all"
            >
              <PenLine size={12} />
            </button>
            <button 
              onClick={() => handleDeleteFolder(folder.id)}
              className="p-1 text-zinc-600 hover:text-red-400 transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}
      
      {(expandedFolders.has(folder.id) || isRoot) && (
        <div className={`ml-4 pl-2 border-l border-zinc-900 space-y-2 py-2 ${isRoot ? 'ml-0 pl-0 border-none' : ''}`}>
          {children}
          {!isRoot && children.length === 0 && (
            <p className="text-[9px] text-zinc-700 italic py-1">Empty folder</p>
          )}
        </div>
      )}
    </div>
  );
};

const BuildCard = ({ doc, deployments, isShipping, isSelected, onClick, folders, onMove, isMoving, setMovingItemId, isSelectedForBulk, onToggleSelect, onDelete }: any) => {
  const isDeployed = deployments.some((d: any) => d.documentId === doc.id);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div 
      onClick={onClick}
      className={`p-3 border rounded-xl space-y-3 group transition-all cursor-pointer relative ${
        isSelected 
          ? 'bg-zinc-100 border-zinc-100' 
          : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Layers size={14} className={isSelected ? 'text-zinc-950' : 'text-zinc-500'} />
          <h4 className={`text-[10px] font-sans font-medium truncate ${isSelected ? 'text-zinc-950' : 'text-zinc-100'}`}>
            {doc.title}
          </h4>
        </div>
        <div className="flex items-center gap-1">
          {isDeployed && <CheckCircle2 size={12} className="text-green-500 shrink-0" />}
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className={`p-1 rounded hover:bg-zinc-800/50 transition-colors ${isSelected ? 'text-zinc-600' : 'text-zinc-500'}`}
            >
              <MoreVertical size={14} />
            </button>
            {showMenu && (
              <div className="absolute top-full right-0 z-50 mt-1 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(e);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-[9px] font-mono uppercase text-zinc-300 hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
                >
                  {isSelectedForBulk ? <CheckCircle2 size={12} className="text-blue-500" /> : <CheckCircle2 size={12} />}
                  {isSelectedForBulk ? 'Deselect' : 'Select'}
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMovingItemId(doc.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-[9px] font-mono uppercase text-zinc-300 hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
                >
                  <Move size={12} /> Move
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(doc.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-[9px] font-mono uppercase text-red-500 hover:bg-red-900/20 rounded transition-colors flex items-center gap-2"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className={`text-[8px] font-mono uppercase ${isSelected ? 'text-zinc-600' : 'text-zinc-500'}`}>
          {doc.createdAt?.seconds ? new Date(doc.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
        </span>
      </div>

      {isMoving && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-[8px] font-mono uppercase text-zinc-500 px-2 py-1">Move to:</p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onMove(doc.id, 'build', null);
            }}
            className="w-full text-left px-2 py-1.5 text-[9px] font-mono uppercase text-zinc-300 hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
          >
            <Layers size={10} /> Uncategorized
          </button>
          {folders.map((f: any) => (
            <button 
              key={f.id}
              onClick={(e) => {
                e.stopPropagation();
                onMove(doc.id, 'build', f.id);
              }}
              className="w-full text-left px-2 py-1.5 text-[9px] font-mono uppercase text-zinc-300 hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
            >
              <Folder size={10} /> {f.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const DeploymentSidebarCard = ({ dep, isSelected, onClick, folders, onMove, isMoving, setMovingItemId, isSelectedForBulk, onToggleSelect, onDelete }: any) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div 
      onClick={onClick}
      className={`p-3 border rounded-xl space-y-3 group transition-all cursor-pointer relative ${
        isSelected 
          ? 'bg-green-500 border-green-500' 
          : 'bg-green-950/10 border-green-900/20 hover:border-green-800/40'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Server size={14} className={isSelected ? 'text-green-950' : 'text-green-500'} />
          <h4 className={`text-[10px] font-sans font-medium truncate ${isSelected ? 'text-green-950' : 'text-zinc-100'}`}>
            {dep.title}
          </h4>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full bg-green-500 ${isSelected ? 'ring-2 ring-green-900' : 'animate-pulse'}`} />
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className={`p-1 rounded hover:bg-zinc-800/50 transition-colors ${isSelected ? 'text-green-900' : 'text-zinc-500'}`}
            >
              <MoreVertical size={14} />
            </button>
            {showMenu && (
              <div className="absolute top-full right-0 z-50 mt-1 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(e);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-[9px] font-mono uppercase text-zinc-300 hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
                >
                  {isSelectedForBulk ? <CheckCircle2 size={12} className="text-blue-500" /> : <CheckCircle2 size={12} />}
                  {isSelectedForBulk ? 'Deselect' : 'Select'}
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMovingItemId(dep.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-[9px] font-mono uppercase text-zinc-300 hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
                >
                  <Move size={12} /> Move
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(dep.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-[9px] font-mono uppercase text-red-500 hover:bg-red-900/20 rounded transition-colors flex items-center gap-2"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className={`text-[8px] font-mono uppercase ${isSelected ? 'text-green-900' : 'text-zinc-500'}`}>
          {dep.region}
        </span>
      </div>

      {isMoving && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-[8px] font-mono uppercase text-zinc-500 px-2 py-1">Move to:</p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onMove(dep.id, 'deployment', null);
            }}
            className="w-full text-left px-2 py-1.5 text-[9px] font-mono uppercase text-zinc-300 hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
          >
            <Layers size={10} /> Uncategorized
          </button>
          {folders.map((f: any) => (
            <button 
              key={f.id}
              onClick={(e) => {
                e.stopPropagation();
                onMove(dep.id, 'deployment', f.id);
              }}
              className="w-full text-left px-2 py-1.5 text-[9px] font-mono uppercase text-zinc-300 hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
            >
              <Folder size={10} /> {f.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
