import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db, doc, getDoc, collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp, onSnapshot, auth } from '../firebase';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Zap, Layers, Share2, Copy, Check, FileText, ChevronRight, MessageSquare, Send, User, Download, Eye, Code, Smartphone, Tablet, Monitor, Layout, Maximize2, X as CloseIcon, Activity, AlertCircle, ShieldAlert } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const DEVICE_PRESETS = [
  { id: 'iphone', name: 'iPhone (iOS)', width: 390, height: 844, icon: Smartphone, category: 'Mobile' },
  { id: 'iphone-se', name: 'iPhone SE', width: 375, height: 667, icon: Smartphone, category: 'Mobile' },
  { id: 'iphone-plus', name: 'iPhone Plus', width: 428, height: 926, icon: Smartphone, category: 'Mobile' },
  { id: 'android-small', name: 'Small Android', width: 360, height: 640, icon: Smartphone, category: 'Mobile' },
  { id: 'android-std', name: 'Standard Android', width: 360, height: 800, icon: Smartphone, category: 'Mobile' },
  { id: 'android-large', name: 'Large Android', width: 412, height: 915, icon: Smartphone, category: 'Mobile' },
  { id: 'ipad-mini', name: 'iPad Mini', width: 768, height: 1024, icon: Tablet, category: 'Tablet' },
  { id: 'ipad-air', name: 'iPad Air', width: 820, height: 1180, icon: Tablet, category: 'Tablet' },
  { id: 'ipad-pro-11', name: 'iPad Pro 11"', width: 834, height: 1194, icon: Tablet, category: 'Tablet' },
  { id: 'ipad-pro-12', name: 'iPad Pro 12.9"', width: 1024, height: 1366, icon: Tablet, category: 'Tablet' },
  { id: 'laptop-small', name: 'Small Laptop', width: 1280, height: 800, icon: Monitor, category: 'Desktop' },
  { id: 'desktop-std', name: 'Standard Desktop', width: 1440, height: 900, icon: Monitor, category: 'Desktop' },
  { id: 'desktop-large', name: 'Large Desktop', width: 1920, height: 1080, icon: Monitor, category: 'Desktop' },
  { id: 'responsive', name: 'Responsive', width: '100%', height: '100%', icon: Layout, category: 'Desktop' },
];

interface ParsedFile {
  name: string;
  content: string;
}

export default function PublicView() {
  const { id } = useParams();
  const [deployment, setDeployment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [files, setFiles] = useState<ParsedFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('preview');
  const [selectedDevice, setSelectedDevice] = useState(DEVICE_PRESETS.find(d => d.id === 'responsive') || DEVICE_PRESETS[0]);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [startTime] = useState(Date.now());
  const [acousticsLogs, setAcousticsLogs] = useState<any[]>([]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!id) return;
    const q = query(
      collection(db, 'acoustics_logs'),
      where('deploymentId', '==', id),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsub = onSnapshot(q, (snap) => {
      setAcousticsLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [id]);

  useEffect(() => {
    // Track time spent on unmount
    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      if (timeSpent > 5) { // Only track if they stayed for more than 5 seconds
        trackEcho('time_spent', { seconds: timeSpent });
      }
    };
  }, [startTime]);

  useEffect(() => {
    if (!id) return;
    const q = query(
      collection(db, 'mission_chatter'),
      where('deploymentId', '==', id),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [id]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Authentication Required", {
        description: "Please sign in to join the conversation."
      });
      return;
    }
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      await addDoc(collection(db, 'mission_chatter'), {
        deploymentId: id,
        text: newComment.trim(),
        userId: user.uid,
        userName: user.displayName || 'Anonymous Lab Member',
        userPhoto: user.photoURL,
        createdAt: serverTimestamp()
      });
      setNewComment('');
      toast.success("Comment posted");
    } catch (error) {
      console.error("Comment failed:", error);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const trackEcho = async (eventType: string, metadata = {}) => {
    if (!deployment?.projectId || !id) return;
    try {
      await addDoc(collection(db, 'acoustics_logs'), {
        projectId: deployment.projectId,
        deploymentId: id,
        event: eventType,
        data: metadata,
        timestamp: new Date().toISOString(),
        location: 'Global Edge',
        userAgent: navigator.userAgent,
        path: window.location.pathname
      });
    } catch (error) {
      console.error('Echo failed:', error);
    }
  };

  useEffect(() => {
    if (viewMode !== 'preview') return;

    const handleInteraction = (e: any) => {
      const type = e.type;
      const target = e.target as HTMLElement;
      
      // Basic filtering to avoid spam
      if (type === 'mousemove') return;

      // Map event types to user-friendly names if needed
      let eventName = type;
      if (type === 'click') eventName = 'tap_click';
      if (type === 'dblclick') eventName = 'double_tap';
      if (type === 'mouseenter') eventName = 'hover';
      if (type === 'wheel' || type === 'scroll') eventName = 'scroll';
      if (type === 'touchstart' || type === 'touchmove' || type === 'touchend') {
        // Simple swipe detection could go here, but for now we track raw touch
        eventName = 'touch_interaction';
      }

      trackEcho(eventName, {
        tagName: target.tagName,
        id: target.id,
        className: target.className,
        text: target.innerText?.slice(0, 30),
        value: (target as HTMLInputElement).value,
        type: (target as HTMLInputElement).type,
        checked: (target as HTMLInputElement).checked,
        x: e.clientX,
        y: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight
      });

      // Send pulse to parent for real-time dashboard updates
      window.parent.postMessage({
        type: 'ACOUSTICS_PULSE',
        event: eventName,
        deploymentId: id,
        timestamp: new Date().toISOString()
      }, '*');
    };

    const events = [
      'click', 'dblclick', 'contextmenu', 
      'mousedown', 'mouseup', 'mouseenter', 'mouseleave',
      'touchstart', 'touchend', 'touchmove',
      'keydown', 'scroll', 'wheel', 'change', 'input', 'submit',
      'dragstart', 'dragend', 'drop', 'play', 'pause'
    ];

    events.forEach(name => window.addEventListener(name, handleInteraction, true));
    return () => events.forEach(name => window.removeEventListener(name, handleInteraction, true));
  }, [viewMode, deployment]);

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
    const parts = cleaned.split(/\[FILE: (.*?)\]/);
    const parsedFiles: ParsedFile[] = [];
    
    if (parts[0].trim()) {
      parsedFiles.push({ name: 'Architecture', content: parts[0].trim() });
    }
    
    for (let i = 1; i < parts.length; i += 2) {
      const name = parts[i];
      const content = parts[i + 1]?.trim() || '';
      parsedFiles.push({ name, content });
    }
    
    // Sort index.html to the top
    return parsedFiles.sort((a, b) => {
      if (a.name.toLowerCase() === 'index.html') return -1;
      if (b.name.toLowerCase() === 'index.html') return 1;
      return 0;
    });
  };

  useEffect(() => {
    const fetchDeployment = async () => {
      if (!id) return;
      try {
        let data: any = null;
        // 1. Try to fetch by ID directly (Document ID)
        const docRef = doc(db, 'deployments', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          data = docSnap.data();
        } else {
          // 2. If not found, try to fetch the latest deployment for this Project ID
          const q = query(
            collection(db, 'deployments'),
            where('projectId', '==', id),
            orderBy('deployedAt', 'desc'),
            limit(1)
          );
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            data = querySnap.docs[0].data();
          }
        }

        if (data) {
          setDeployment(data);
          const parsed = parseFiles(data.content);
          setFiles(parsed);
          
          // Track page load
          fetch('/api/acoustics/echo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: data.projectId,
              event: 'page_load',
              data: { url: window.location.href },
              timestamp: new Date().toISOString()
            })
          }).catch(console.error);
        }
      } catch (error) {
        console.error('Error fetching deployment:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeployment();
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const file = files[activeFileIndex];
    if (!file) return;
    
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    trackEcho('asset_download', { file: file.name });
    toast.success(`Downloading ${file.name}`);
  };

  const isHtml = (filename: string) => filename.toLowerCase().endsWith('.html');

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-100 rounded-full"
        />
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <Globe size={48} className="text-zinc-900 mb-6" />
        <h1 className="text-xl font-mono uppercase tracking-widest text-zinc-100 mb-2">404: Not Found</h1>
        <p className="text-sm text-zinc-500 max-w-xs">This deployment does not exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-100 selection:text-zinc-950">
      <Toaster position="top-right" theme="dark" />
      
      {/* Public Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-zinc-100" />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest font-bold hidden md:block">Yacht Labs / Public</span>
            </div>

            <div className="h-6 w-px bg-zinc-900 hidden md:block" />

            <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all ${
                  viewMode === 'code' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Code size={12} /> Code
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all ${
                  viewMode === 'preview' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Eye size={12} /> Preview
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {viewMode === 'preview' && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button 
                    onClick={() => setShowDeviceMenu(!showDeviceMenu)}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-[10px] font-mono uppercase tracking-widest hover:bg-zinc-800 transition-all"
                  >
                    <selectedDevice.icon size={12} />
                    <span className="hidden sm:inline">{selectedDevice.name}</span>
                  </button>

                  <AnimatePresence>
                    {showDeviceMenu && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 right-0 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl z-50 max-h-[400px] overflow-y-auto"
                      >
                        {['Mobile', 'Tablet', 'Desktop'].map(category => (
                          <div key={category} className="mb-2 last:mb-0">
                            <div className="px-3 py-1 text-[8px] font-mono uppercase text-zinc-600 tracking-[0.2em]">{category}</div>
                            {DEVICE_PRESETS.filter(d => d.category === category).map(device => (
                              <button
                                key={device.id}
                                onClick={() => {
                                  setSelectedDevice(device);
                                  setShowDeviceMenu(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all ${
                                  selectedDevice.id === device.id ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <device.icon size={12} />
                                  {device.name}
                                </div>
                                <span className="text-[8px] opacity-50">{device.width}×{device.height}</span>
                              </button>
                            ))}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={() => setIsFullscreen(true)}
                  className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-100 rounded-xl transition-all"
                  title="Presentation Mode"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            )}
            <button
              onClick={handleDownload}
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all"
            >
              <Download size={12} /> Download
            </button>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-950 rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-zinc-300 transition-all"
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] gap-12">
          {/* Sidebar */}
          <aside className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 text-zinc-500">
                <Globe size={14} />
                <span className="text-[10px] font-mono uppercase tracking-widest">Live on Global Edge</span>
              </div>
              <h1 className="text-2xl font-sans font-bold tracking-tight leading-tight">
                {deployment.title}
              </h1>
              <div className="flex flex-col gap-2 pt-4 border-t border-zinc-900">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-widest">Deployed At</span>
                  <span className="text-xs text-zinc-300">{new Date(deployment.deployedAt?.seconds * 1000).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>

            <nav className="space-y-2">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-4">Project Assets</h3>
              {files.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveFileIndex(idx);
                    trackEcho('asset_view', { file: file.name });
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                    activeFileIndex === idx 
                      ? 'bg-zinc-100 text-zinc-950' 
                      : 'bg-zinc-900/30 text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
                  }`}
                >
                  <FileText size={14} />
                  <span className="text-[10px] font-mono uppercase tracking-widest truncate">{file.name}</span>
                  {activeFileIndex === idx && <ChevronRight size={12} className="ml-auto" />}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="space-y-8 lg:col-span-2">
            <motion.div 
              key={`${activeFileIndex}-${viewMode}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`synthesis-output max-w-none bg-zinc-900/30 border border-zinc-900 rounded-[32px] overflow-hidden font-sans text-sm leading-relaxed min-h-[600px] transition-all duration-300 ${
                viewMode === 'code' ? 'p-8 md:p-12' : ''
              }`}
            >
              {viewMode === 'code' ? (
                <pre className="text-zinc-300 font-mono whitespace-pre-wrap text-xs leading-relaxed">
                  {files[activeFileIndex]?.content || ''}
                </pre>
              ) : (
                <div className="relative w-full h-full min-h-[600px] flex items-center justify-center bg-zinc-900/20 overflow-auto">
                  <div 
                    style={{ 
                      width: selectedDevice.width, 
                      height: selectedDevice.height,
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }}
                    className="bg-white shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    {isHtml(files[activeFileIndex]?.name || '') ? (
                      <iframe
                        srcDoc={files[activeFileIndex]?.content}
                        className="w-full h-full bg-white border-none"
                        title="Prototype Preview"
                        sandbox="allow-scripts allow-forms allow-popups allow-modals"
                      />
                    ) : (
                      <div className="p-8 md:p-12 bg-zinc-950 min-h-full prose prose-invert prose-zinc max-w-none">
                        <Markdown remarkPlugins={[remarkGfm]}>
                          {files[activeFileIndex]?.content || ''}
                        </Markdown>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            <AnimatePresence>
              {isFullscreen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col"
                >
                  <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                        <Zap size={16} className="text-zinc-100" />
                      </div>
                      <span className="text-xs font-mono uppercase tracking-widest font-bold">Presenting: {deployment.title}</span>
                    </div>
                    <button 
                      onClick={() => setIsFullscreen(false)}
                      className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-100 rounded-xl transition-all"
                    >
                      <CloseIcon size={20} />
                    </button>
                  </div>
                  <div className="flex-1 bg-white">
                    {isHtml(files[activeFileIndex]?.name || '') ? (
                      <iframe
                        srcDoc={files[activeFileIndex]?.content}
                        className="w-full h-full border-none"
                        title="Prototype Presentation"
                        sandbox="allow-scripts allow-forms allow-popups allow-modals"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-950 overflow-auto p-12 md:p-24 prose prose-invert prose-zinc max-w-none">
                        <Markdown remarkPlugins={[remarkGfm]}>
                          {files[activeFileIndex]?.content || ''}
                        </Markdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Comments Section */}
            <section className="space-y-8 pt-12 border-t border-zinc-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare size={20} className="text-zinc-500" />
                  <h2 className="text-xl font-sans font-bold tracking-tight">Conversation</h2>
                </div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">{comments.length} Comments</span>
              </div>

              {user ? (
                <form onSubmit={handleCommentSubmit} className="relative">
                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add to the conversation..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 resize-none min-h-[120px] transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="absolute bottom-4 right-4 flex items-center gap-2 px-6 py-2 bg-zinc-100 text-zinc-950 rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-zinc-300 transition-all disabled:opacity-50"
                  >
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                    <Send size={14} />
                  </button>
                </form>
              ) : (
                <div className="p-8 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl text-center space-y-4">
                  <User size={24} className="text-zinc-700 mx-auto" />
                  <p className="text-sm text-zinc-500">Sign in to join the conversation and share your feedback.</p>
                </div>
              )}

              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {comments.map((comment) => (
                    <motion.div 
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-6 bg-zinc-900/20 border border-zinc-900 rounded-2xl space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {comment.userPhoto ? (
                            <img src={comment.userPhoto} alt={comment.userName} className="w-8 h-8 rounded-full border border-zinc-800" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                              <User size={14} className="text-zinc-500" />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-medium text-zinc-100">{comment.userName}</p>
                            <p className="text-[9px] font-mono uppercase text-zinc-600">
                              {comment.createdAt?.seconds ? new Date(comment.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed">{comment.text}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {comments.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-[10px] font-mono uppercase text-zinc-700 tracking-widest italic">No comments yet. Be the first to speak.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Footer */}
            <footer className="pt-12 border-t border-zinc-900 text-center space-y-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                Generated & Deployed via Yacht Labs Assembler
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">System Status: Operational</span>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
