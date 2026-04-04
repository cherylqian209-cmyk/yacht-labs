import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Twitter, Globe, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, Pin, PinOff, ShieldAlert } from 'lucide-react';

export type EchoSentiment = 'Excitement' | 'Confusion' | 'Skepticism' | 'Fear' | 'Negative';

export interface SentimentEcho {
  id: string;
  content: string;
  source: 'X' | 'Reddit' | 'LinkedIn' | 'Direct';
  sentiment: EchoSentiment;
  action: string;
  isPinned: boolean;
  author: string;
  timestamp: string;
}

interface SentimentEchoesProps {
  echoes: SentimentEcho[];
  onPin: (id: string) => void;
}

export default function SentimentEchoes({ echoes, onPin }: SentimentEchoesProps) {
  const getSentimentColor = (sentiment: EchoSentiment) => {
    switch (sentiment) {
      case 'Excitement': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Confusion': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Skepticism': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Fear': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'Negative': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'X': return <Twitter size={14} />;
      case 'Reddit': return <MessageSquare size={14} />;
      case 'LinkedIn': return <Globe size={14} />;
      default: return <Globe size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      {echoes.map((echo, i) => (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          key={echo.id}
          className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-[24px] group relative overflow-hidden"
        >
          {/* Background Glow for Sentiment */}
          <div className={`absolute -right-20 -top-20 w-40 h-40 blur-[80px] opacity-10 rounded-full ${getSentimentColor(echo.sentiment).split(' ')[1]}`} />

          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                {echo.author[0]}
              </div>
              <div>
                <p className="text-[11px] font-medium text-zinc-200">{echo.author}</p>
                <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                  {getSourceIcon(echo.source)}
                  {echo.source} • {echo.timestamp}
                </div>
              </div>
            </div>
            
            <div className={`px-2 py-0.5 rounded-full border text-[9px] font-mono uppercase tracking-widest ${getSentimentColor(echo.sentiment)}`}>
              {echo.sentiment}
            </div>
          </div>

          <p className="text-sm text-zinc-300 font-sans leading-relaxed mb-6 italic">
            "{echo.content}"
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <TrendingUp size={10} />
              </div>
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                <span className="text-blue-400">Action:</span> {echo.action}
              </p>
            </div>

            <button
              onClick={() => onPin(echo.id)}
              className={`p-2 rounded-lg transition-colors ${echo.isPinned ? 'text-blue-400 bg-blue-400/10' : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800'}`}
              title={echo.isPinned ? "Pinned to Trust Bar" : "Pin to Trust Bar"}
            >
              {echo.isPinned ? <Pin size={14} /> : <PinOff size={14} />}
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
