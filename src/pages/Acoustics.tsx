import React, { useState, useEffect, useMemo } from 'react';
import { Music, Mic2, Play, Activity, Volume2, Sparkles, Waves, Disc, MessageSquare, Twitter, TrendingUp, BarChart3, Heart, Bug, Star, MousePointer2, Loader2, Globe, AlertCircle, ShieldAlert, Pin, Send, Users, CheckCircle2, Clock, Share2, MessageCircle, ChevronRight, Layers, Edit2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, ScatterChart, Scatter, ZAxis, Cell, Legend } from 'recharts';
import { useSearchParams, Link } from 'react-router-dom';
import { db, collection, query, where, onSnapshot, orderBy, limit, auth } from '../firebase';
import SentimentEchoes, { SentimentEcho } from '../components/SentimentEchoes';
import UserInteractionPanel from '../components/UserInteractionPanel';

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

const mockData = [
  { name: 'Mon', vibe: 65 },
  { name: 'Tue', vibe: 72 },
  { name: 'Wed', vibe: 68 },
  { name: 'Thu', vibe: 85 },
  { name: 'Fri', vibe: 92 },
  { name: 'Sat', vibe: 88 },
  { name: 'Sun', vibe: 95 },
];

const mockEchoes: SentimentEcho[] = [
  {
    id: '1',
    content: "This looks like the tool I've been waiting for. Finally, someone gets it.",
    source: 'X',
    sentiment: 'Excitement',
    action: 'Tag as a High-Intent Lead',
    isPinned: true,
    author: '@alex_dev',
    timestamp: '2h ago'
  },
  {
    id: '2',
    content: "I don't get what Synthesis does. Is it just a code generator?",
    source: 'Reddit',
    sentiment: 'Confusion',
    action: 'Update dashboard copy to be simpler',
    isPinned: false,
    author: 'u/curious_builder',
    timestamp: '5h ago'
  },
  {
    id: '3',
    content: "Is this just another AI wrapper? I've seen 100 of these this week.",
    source: 'X',
    sentiment: 'Skepticism',
    action: 'Trigger a Behind the Scenes post showing the raw engine',
    isPinned: false,
    author: '@tech_skeptic',
    timestamp: '1d ago'
  },
  {
    id: '4',
    content: "This looks too expensive for a side project. $49/mo is steep.",
    source: 'Reddit',
    sentiment: 'Fear',
    action: "Highlight the 'Founder's Rate' discount",
    isPinned: false,
    author: 'u/broke_founder',
    timestamp: '2d ago'
  },
  {
    id: '5',
    content: "The UI is too blue. It hurts my eyes after 10 minutes.",
    source: 'Reddit',
    sentiment: 'Negative',
    action: 'Shift Outreach Velocity to LinkedIn (90% positive)',
    isPinned: false,
    author: 'u/ui_critic',
    timestamp: '3d ago'
  }
];

import { PaywallOverlay } from '../components/PaywallOverlay';

export default function Acoustics({ profile }: { profile: any }) {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const [builds, setBuilds] = useState<any[]>([]);
  const [selectedBuildId, setSelectedBuildId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [vibeScore, setVibeScore] = useState(0);
  const [echoes, setEchoes] = useState<SentimentEcho[]>(mockEchoes);
  const [outreach, setOutreach] = useState<any[]>([]);
  const [acousticsLogs, setAcousticsLogs] = useState<any[]>([]);

  const handlePin = (id: string) => {
    setEchoes(prev => prev.map(echo => 
      echo.id === id ? { ...echo, isPinned: !echo.isPinned } : echo
    ));
  };

  useEffect(() => {
    if (!projectId) return;

    // Fetch builds for selector
    const buildsQuery = query(collection(db, 'builds'), where('projectId', '==', projectId), orderBy('createdAt', 'desc'));
    const unsubBuilds = onSnapshot(buildsQuery, (snap) => {
      setBuilds(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'builds');
    });

    // Listen for feedback
    const feedbackQuery = query(
      collection(db, 'feedback'), 
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc'), 
      limit(20)
    );
    const unsubFeedback = onSnapshot(feedbackQuery, (snap) => {
      const feedbackData = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      setFeedback(feedbackData);
      
      // Update echoes from feedback with type 'echo'
      const realEchoes = feedbackData
        .filter(f => f.type === 'echo')
        .map(f => ({
          id: f.id,
          content: f.content,
          source: f.source || 'System',
          sentiment: f.sentiment || 'Neutral',
          action: f.action || 'No action required',
          isPinned: f.isPinned || false,
          author: f.author || 'Anonymous',
          timestamp: f.createdAt?.toDate ? f.createdAt.toDate().toLocaleTimeString() : 'Just now'
        }));
      
      if (realEchoes.length > 0) {
        // Merge with mock echoes but prioritize real ones
        const merged = [...realEchoes, ...mockEchoes].slice(0, 10);
        setEchoes(merged);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'feedback');
    });

    // Listen for surveys
    const surveysQuery = query(collection(db, 'surveys'), where('projectId', '==', projectId), orderBy('createdAt', 'desc'));
    const unsubSurveys = onSnapshot(surveysQuery, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setSurveys(data);
      
      // Calculate Vibe Score based on average rating
      if (data.length > 0) {
        const avg = data.reduce((acc, curr) => acc + (curr.rating || 0), 0) / data.length;
        setVibeScore(Math.round(avg * 10)); // Scale 1-10 to 1-100
      } else {
        setVibeScore(0);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'surveys');
    });

    // Listen for events (Heat Map)
    const eventsQuery = query(collection(db, 'events'), where('projectId', '==', projectId), limit(500));
    const unsubEvents = onSnapshot(eventsQuery, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'events');
    });

    // Listen for outreach
    const outreachQuery = query(collection(db, 'outreach'), where('projectId', '==', projectId), orderBy('createdAt', 'desc'), limit(10));
    const unsubOutreach = onSnapshot(outreachQuery, (snap) => {
      setOutreach(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'outreach');
    });

    // Listen for real-time acoustics echoes
    const acousticsQuery = query(
      collection(db, 'acoustics_logs'), 
      where('projectId', '==', projectId), 
      orderBy('timestamp', 'desc'), 
      limit(200)
    );
    const unsubAcoustics = onSnapshot(acousticsQuery, (snap) => {
      setAcousticsLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    }, (error) => {
      console.error('Acoustics listener failed:', error);
    });

    return () => {
      unsubBuilds();
      unsubFeedback();
      unsubSurveys();
      unsubEvents();
      unsubOutreach();
      unsubAcoustics();
    };
  }, [projectId]);

  // Filter logs and events by selected build
  const filteredLogs = useMemo(() => {
    if (selectedBuildId === 'all') return acousticsLogs;
    return acousticsLogs.filter(l => l.buildId === selectedBuildId);
  }, [acousticsLogs, selectedBuildId]);

  const filteredEvents = useMemo(() => {
    if (selectedBuildId === 'all') return events;
    return events.filter(e => e.buildId === selectedBuildId);
  }, [events, selectedBuildId]);

  // Aggregate event data for the chart
  const eventCounts = filteredEvents.reduce((acc: any, curr) => {
    acc[curr.eventName] = (acc[curr.eventName] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(eventCounts).map(([name, value]) => ({ name, value }));

  const acousticsLogsByType = filteredLogs.reduce((acc: any, curr) => {
    const event = curr.event || 'other';
    acc[event] = (acc[event] || 0) + 1;
    return acc;
  }, {});

  const pageLoads = filteredLogs.filter(l => l.event === 'page_load').length;
  const totalInteractions = filteredLogs.length;
  const resonanceRate = totalInteractions > 0 ? Math.round((filteredLogs.filter(l => l.event === 'click' || l.event === 'tap_click').length / totalInteractions) * 100) : 0;

  const interactionCategories = [
    {
      title: 'Core Navigation & Structure',
      events: ['tap_click', 'double_tap', 'hover', 'scroll', 'swipe', 'drag', 'drop', 'pinch', 'rotate'],
      icon: <Layers size={14} className="text-blue-500" />
    },
    {
      title: 'Input & Data Entry',
      events: ['input', 'change', 'submit', 'autofill', 'dropdown_selection', 'radio_selection', 'checkbox_selection', 'toggle_switch', 'date_picker', 'time_picker', 'file_upload'],
      icon: <Edit2 size={14} className="text-purple-500" />
    },
    {
      title: 'Feedback & System Responses',
      events: ['button_press', 'loading_spinner', 'progress_bar', 'toast', 'snackbar', 'modal', 'tooltip', 'inline_validation', 'haptic'],
      icon: <Activity size={14} className="text-green-500" />
    },
    {
      title: 'Content Interaction',
      events: ['expand_collapse', 'tabs_switching', 'carousel_scroll', 'video_play', 'video_pause', 'audio_play', 'audio_pause', 'play', 'pause'],
      icon: <Zap size={14} className="text-amber-500" />
    }
  ];

  if (!projectId) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 font-mono uppercase text-xs tracking-widest bg-zinc-950">
        Select a project from the dashboard to begin listening.
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      <header className="p-6 border-b border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
            <Waves className="text-zinc-100" size={20} />
          </div>
          <div>
            <h1 className="text-sm font-mono uppercase tracking-widest text-zinc-100">Listen: Vibe & Feedback</h1>
            <p className="text-[10px] text-zinc-500 font-sans italic">Make sure your brand is heard, not just seen.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Build:</span>
            <select 
              value={selectedBuildId}
              onChange={(e) => setSelectedBuildId(e.target.value)}
              className="bg-transparent text-[10px] font-mono uppercase tracking-widest text-zinc-100 focus:outline-none"
            >
              <option value="all">All Builds</option>
              {builds.map(b => (
                <option key={b.id} value={b.id}>{b.title || b.id.slice(0, 8)}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {!profile?.isPro && (
          <PaywallOverlay 
            title="Real-time Mission Control Required" 
            description="The Listen lab provides real-time sentiment analysis and user behavior tracking. Pro Lab members get full access to the Vibe Dashboard and Sentiment Echoes."
          />
        )}
        {/* Listening Controls */}
        <div className="w-80 border-r border-zinc-900 p-6 flex flex-col gap-8 overflow-y-auto">
          <section>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <Activity size={12} className="text-green-500" /> Live Interaction Stream
            </h3>
            <div className="space-y-3">
              {filteredLogs.length === 0 ? (
                <p className="text-[10px] text-zinc-600 italic">Waiting for interactions...</p>
              ) : (
                filteredLogs.slice(0, 10).map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={log.id} 
                    className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono text-blue-500 uppercase tracking-widest">{log.event}</span>
                      <span className="text-[8px] font-mono text-zinc-600">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[10px] text-zinc-300 font-medium italic truncate">
                      {log.data?.tagName ? `${log.data.tagName}: ${log.data.text || 'No text'}` : log.event}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <TrendingUp size={12} className="text-blue-500" /> Resonance Analysis
            </h3>
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-4">
              <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <p className="text-[9px] font-mono text-blue-400 uppercase tracking-widest mb-2">Inference Insight:</p>
                <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                  {resonanceRate > 20 ? 
                    "High interaction density detected. Users are actively exploring the prototype." : 
                    "Low interaction density. Consider simplifying the navigation or adding more clear CTAs."}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">Resonance Metrics</h3>
            <div className="space-y-6">
              {[
                { label: 'Sentiment', value: vibeScore > 70 ? 'Positive' : vibeScore > 40 ? 'Neutral' : 'Negative', color: vibeScore > 70 ? 'bg-green-500' : vibeScore > 40 ? 'bg-yellow-500' : 'bg-red-500', width: `${vibeScore}%` },
                { label: 'Resonance Rate', value: `${resonanceRate}%`, color: 'bg-blue-500', width: `${resonanceRate}%` },
                { label: 'Live Sonar', value: `${pageLoads} Loads`, color: 'bg-green-500', width: '100%' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{stat.label}</span>
                    <span className="text-[10px] font-mono text-zinc-100">{stat.value}</span>
                  </div>
                  <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className={`h-full ${stat.color}`} style={{ width: stat.width }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Vibe Dashboard */}
        <div className="flex-1 p-12 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-12">
            <UserInteractionPanel 
              logs={filteredLogs}
              vibeScore={vibeScore}
              resonanceRate={resonanceRate}
              pageLoads={pageLoads}
              echoes={echoes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
