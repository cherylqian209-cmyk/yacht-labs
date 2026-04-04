import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, BrainCircuit, Terminal, BookOpen, Sparkles, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

interface ThoughtStreamProps {
  content: string;
  theme?: 'terminal' | 'academic' | 'modern';
}

export const ThoughtStream: React.FC<ThoughtStreamProps> = ({ content, theme = 'modern' }) => {
  const [expandedBlocks, setExpandedBlocks] = useState<Record<number, boolean>>({});

  const toggleBlock = (index: number) => {
    setExpandedBlocks(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Logic to parse <thought> or [inference] blocks
  // We'll use a simple split/regex for now to identify these blocks
  const parts = content.split(/(<thought>[\s\S]*?<\/thought>|\[inference\][\s\S]*?\[\/inference\])/gi);

  const themeClasses = {
    terminal: 'bg-black text-green-500 font-mono selection:bg-green-500 selection:text-black',
    academic: 'bg-[#fdfcf0] text-zinc-900 font-serif selection:bg-zinc-900 selection:text-white border-zinc-200',
    modern: 'bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-100 selection:text-zinc-950 border-zinc-900'
  };

  const thoughtClasses = {
    terminal: 'bg-zinc-900/50 border-zinc-800 text-green-400/70',
    academic: 'bg-zinc-100/50 border-zinc-200 text-zinc-600 italic',
    modern: 'bg-zinc-900/30 border-zinc-800 text-zinc-500 italic'
  };

  return (
    <div className={`w-full min-h-full p-8 rounded-2xl border transition-all duration-500 ${themeClasses[theme]}`}>
      <div className="max-w-none space-y-6">
        {parts.map((part, idx) => {
          const isThought = part.toLowerCase().startsWith('<thought>') || part.toLowerCase().startsWith('[inference]');
          
          if (isThought) {
            const cleanText = part
              .replace(/<\/?thought>/gi, '')
              .replace(/\[\/?inference\]/gi, '')
              .trim();
            
            const isExpanded = expandedBlocks[idx] ?? false;

            return (
              <div key={idx} className={`rounded-xl border overflow-hidden transition-all ${thoughtClasses[theme]}`}>
                <button 
                  onClick={() => toggleBlock(idx)}
                  className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BrainCircuit size={14} className={theme === 'terminal' ? 'text-green-500' : 'text-zinc-400'} />
                    <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">
                      {theme === 'terminal' ? 'Inference Trace' : 'Thinking Process'}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 pt-2 border-t border-inherit"
                    >
                      <div className="text-xs leading-relaxed opacity-80">
                        <Markdown remarkPlugins={[remarkGfm]}>{cleanText}</Markdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          return (
            <div key={idx} className="max-w-none">
              <Markdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 {...props} />,
                  h2: ({node, ...props}) => <h2 {...props} />,
                  h3: ({node, ...props}) => <h3 {...props} />,
                  p: ({node, ...props}) => <p {...props} />,
                  code: ({node, ...props}) => {
                    const isInline = !props.className?.includes('language-');
                    return isInline 
                      ? <code {...props} />
                      : <pre><code {...props} /></pre>;
                  },
                  ul: ({node, ...props}) => <ul {...props} />,
                  li: ({node, ...props}) => <li {...props} />,
                  blockquote: ({node, ...props}) => <blockquote {...props} />,
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto">
                      <table {...props} />
                    </div>
                  ),
                  th: ({node, ...props}) => <th {...props} />,
                  td: ({node, ...props}) => <td {...props} />,
                }}
              >
                {part}
              </Markdown>
            </div>
          );
        })}
      </div>
    </div>
  );
};
