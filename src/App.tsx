import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useLocation,
  Link
} from 'react-router-dom';
import { auth, onAuthStateChanged, signOut, db, doc, onSnapshot, collection, query, where, getDocs } from './firebase';
import { ErrorBoundary } from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import Studio from './pages/Studio';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Inference from './pages/Inference';
import Synthesis from './pages/Synthesis';
import Kinetics from './pages/Kinetics';
import Acoustics from './pages/Acoustics';
import Automation from './pages/Automation';
import Onboarding from './pages/Onboarding';
import OutreachTracker from './pages/OutreachTracker';
import PublicView from './pages/PublicView';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { useParams } from 'react-router-dom';
import UITour from './components/UITour';
import FeedbackButton from './components/FeedbackButton';
import SentimentSurvey from './components/SentimentSurvey';
import { trackEvent } from './lib/analytics';
import { Toaster } from 'sonner';
import { 
  LayoutDashboard, 
  Sparkles, 
  Layers, 
  Zap, 
  Waves, 
  Repeat, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ user }: { user: any }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const navItems = [
    { name: 'Dashboard', path: '/studio', icon: LayoutDashboard },
    { name: 'Think', path: '/studio/think', icon: Sparkles },
    { name: 'Build', path: '/studio/build', icon: Layers },
    { name: 'Ship', path: '/studio/ship', icon: Zap },
    { name: 'Listen', path: '/studio/listen', icon: Waves },
    { name: 'Repeat', path: '/studio/repeat', icon: Repeat },
  ];

  return (
    <div 
      id="sidebar-nav"
      className={`h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}
    >
      <div className="p-6 flex items-center justify-between">
        {isOpen && (
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-3 gap-0.5 w-5 h-5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className={`w-full h-full ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-800'}`} />
              ))}
            </div>
            <span className="font-mono text-xl tracking-tighter uppercase text-zinc-100">Yacht Labs</span>
          </div>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-400 hover:text-zinc-100">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-8">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const projectId = new URLSearchParams(location.search).get('project');
          const pathWithProject = projectId ? `${item.path}?project=${projectId}` : item.path;
          
          return (
            <Link
              key={item.path}
              to={pathWithProject}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
              }`}
            >
              <item.icon size={20} />
              {isOpen && <span className="ml-4 font-sans text-sm font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center mb-4">
          <img src={user?.photoURL || ''} alt="" className="w-8 h-8 rounded-full bg-zinc-800" />
          {isOpen && (
            <div className="ml-3 overflow-hidden">
              <p className="text-xs font-medium text-zinc-100 truncate">{user?.displayName}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <button 
          onClick={() => signOut(auth)}
          className="w-full flex items-center p-3 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          {isOpen && <span className="ml-4 font-sans text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

const ThreadRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/studio/outreach?lead=${id}`} replace />;
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingSurvey, setPendingSurvey] = useState<{ id: string, projectId: string } | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  // Check for pending surveys (deployments > 24h old)
  useEffect(() => {
    if (!user) return;

    const checkSurveys = async () => {
      try {
        const q = query(
          collection(db, 'deployments'),
          where('surveyCompleted', '!=', true)
        );
        
        const querySnapshot = await getDocs(q);
        const now = new Date().getTime();
        const oneDayInMs = 24 * 60 * 60 * 1000;

        const overdueDeployment = querySnapshot.docs.find(doc => {
          const data = doc.data();
          const deployedAt = data.deployedAt?.seconds * 1000;
          // Only show survey if it's been 24 hours since deployment
          return deployedAt && (now - deployedAt) > oneDayInMs;
        });

        if (overdueDeployment) {
          setPendingSurvey({
            id: overdueDeployment.id,
            projectId: overdueDeployment.data().projectId
          });
        }
      } catch (error) {
        console.error("Error checking surveys:", error);
      }
    };

    checkSurveys();
  }, [user]);

  useEffect(() => {
    if (user) {
      const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          setProfile({ onboarded: false });
        }
        setLoading(false);
      });
      return unsubscribeProfile;
    }
  }, [user]);

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

  return (
    <ErrorBoundary>
      <Router>
        <AppContent 
          user={user} 
          profile={profile} 
          pendingSurvey={pendingSurvey} 
          setPendingSurvey={setPendingSurvey} 
        />
      </Router>
    </ErrorBoundary>
  );
}

function AppContent({ user, profile, pendingSurvey, setPendingSurvey }: any) {
  const location = useLocation();
  const [lastBuild, setLastBuild] = useState<{ brief: string | null, files: { name: string, content: string }[], docId: string | null } | null>(null);

  // Track page views
  useEffect(() => {
    trackEvent('page_view', { path: location.pathname });
  }, [location.pathname]);

  return (
    <>
      <Toaster position="top-right" theme="dark" />
      <FeedbackButton user={user} />
      {pendingSurvey && (
        <SentimentSurvey 
          deploymentId={pendingSurvey.id} 
          projectId={pendingSurvey.projectId} 
          onClose={() => setPendingSurvey(null)} 
        />
      )}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/studio" /> : <LandingPage />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/pub/:id" element={<PublicView />} />
        <Route path="/thread/:id" element={<ThreadRedirect />} />
        <Route 
          path="/studio/*" 
          element={
            user ? (
              profile?.onboarded ? (
                <div className="flex bg-zinc-950 min-h-screen">
                  <Sidebar user={user} />
                  <main id="main-canvas" className="flex-1 overflow-auto relative">
                    <UITour />
                    <Routes>
                      <Route index element={<Studio profile={profile} />} />
                      <Route path="checkout" element={<Checkout user={user} profile={profile} />} />
                      <Route path="success" element={<Success />} />
                      <Route path="think" element={<Inference profile={profile} />} />
                      <Route path="build" element={<Synthesis profile={profile} lastBuild={lastBuild} setLastBuild={setLastBuild} />} />
                      <Route path="ship" element={<Kinetics profile={profile} />} />
                      <Route path="listen" element={<Acoustics profile={profile} />} />
                      <Route path="outreach" element={<OutreachTracker profile={profile} />} />
                      <Route path="repeat" element={<Automation profile={profile} />} />
                    </Routes>
                  </main>
                </div>
              ) : (
                <Onboarding />
              )
            ) : (
              <Navigate to="/" />
            )
          } 
        />
      </Routes>
    </>
  );
}
