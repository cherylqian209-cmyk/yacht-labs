import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { callGeminiWithRetry } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Ship, RefreshCw, Terminal, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db, collection, addDoc, serverTimestamp } from '../firebase';
import { toast } from 'sonner';

const SYSTEM_PROMPT = `
You are the Synthesis Engine, a specialized technical instrument for Yacht Labs.
Your role is to transform user input into a structured, high-utility "Blueprint" that can be viewed as both a document and a presentation.

Follow these rules strictly:
1. Output ONLY in Markdown format.
2. Use horizontal rules (---) to separate major sections or "slides".
3. Each section should start with a clear H1 or H2 heading.
4. Use lists, tables, and callouts to organize information.
5. Code blocks should be used for all technical specifications, snippets, or data structures.
6. Ensure every section has enough content to be meaningful but is concise enough for a slide.
7. Maintain a professional, laboratory-like tone.
8. Avoid decorative fluff or conversational filler.
9. If the user asks a question, answer it within this technical blueprint structure.
`;

const LOADING_LOGS = [
  "Initializing synthesis engine...",
  "Accessing neural pathways...",
  "Parsing input parameters...",
  "Synthesizing data structures...",
  "Optimizing for structural intent...",
  "Generating blueprint...",
  "Finalizing resonance alignment..."
];

export const SynthesisEngine: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'document' | 'presentation'>('document');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [logIndex, setLogIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isShipping, setIsShipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSynthesizing) {
      const interval = setInterval(() => {
        setLogIndex((prev) => (prev + 1) % LOADING_LOGS.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isSynthesizing]);

  const handleSynthesize = async () => {
    if (!input.trim()) return;
    
    setIsSynthesizing(true);
    setError(null);
    setOutput(null);
    setCurrentSlide(0);
    setLogIndex(0);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await callGeminiWithRetry(() => ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: input,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.7,
        },
      }));

      const text = response.text;
      if (text) {
        setOutput(text);
      } else {
        throw new Error("No output generated from synthesis engine.");
      }
    } catch (err: any) {
      console.error("Synthesis failed:", err);
      setError(err.message || "An unknown error occurred during synthesis.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    }
  };

  const handleShip = async () => {
    if (!output || !auth.currentUser) return;
    
    setIsShipping(true);
    try {
      const docRef = await addDoc(collection(db, 'blueprints'), {
        title: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
        content: output,
        ownerId: auth.currentUser.uid,
        isPublic: true,
        createdAt: serverTimestamp(),
      });
      
      const publicUrl = `${window.location.origin}/pub/${docRef.id}`;
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Blueprint shipped! Public URL copied to clipboard.");
    } catch (err: any) {
      console.error("Shipping failed:", err);
      toast.error("Failed to ship blueprint: " + err.message);
    } finally {
      setIsShipping(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Input Module */}
      <div className="bg-navy/50 border border-lab-blue/30 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-lab-blue">
          <Terminal className="w-4 h-4" />
          Input Parameters
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter concept for synthesis..."
          className="w-full bg-black/30 border border-lab-blue/20 rounded-lg p-4 text-white font-mono text-sm focus:outline-none focus:border-electric transition-colors resize-none h-32"
          disabled={isSynthesizing}
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSynthesize}
            disabled={isSynthesizing || !input.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-lab-blue text-navy font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-electric transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSynthesizing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            )}
            {isSynthesizing ? "Synthesizing..." : "Synthesize"}
          </button>
        </div>
      </div>

      {/* Output Module */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {isSynthesizing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center gap-6 bg-navy/30 border border-lab-blue/10 rounded-xl p-12"
            >
              <div className="relative">
                <div className="w-16 h-16 border-2 border-lab-blue/20 border-t-electric rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-electric/20 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="text-electric text-sm font-mono tracking-widest uppercase animate-pulse">
                  {LOADING_LOGS[logIndex]}
                </div>
                <div className="text-lab-blue/50 text-[10px] font-mono uppercase tracking-widest">
                  Processing neural inference...
                </div>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 flex flex-col items-center gap-4 text-center"
            >
              <AlertCircle className="w-12 h-12 text-red-500" />
              <div className="flex flex-col gap-1">
                <h3 className="text-red-500 font-bold uppercase tracking-widest">Synthesis Error</h3>
                <p className="text-red-400/70 text-xs font-mono">{error}</p>
              </div>
              <button
                onClick={handleSynthesize}
                className="mt-4 px-6 py-2 border border-red-500/30 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 transition-colors rounded-lg"
              >
                Retry Synthesis
              </button>
            </motion.div>
          ) : output ? (
            <motion.div
              key="output"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col h-full gap-4"
            >
              {/* Utility Bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-navy/80 border border-lab-blue/20 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-lab-blue">
                    <Terminal className="w-3 h-3" />
                    Blueprint Generated
                  </div>
                  <div className="h-4 w-px bg-lab-blue/20" />
                  <div className="flex bg-black/40 p-0.5 rounded-md border border-lab-blue/10">
                    <button
                      onClick={() => setViewMode('document')}
                      className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded transition-all ${viewMode === 'document' ? 'bg-lab-blue text-navy' : 'text-lab-blue/60 hover:text-lab-blue'}`}
                    >
                      Document
                    </button>
                    <button
                      onClick={() => setViewMode('presentation')}
                      className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded transition-all ${viewMode === 'presentation' ? 'bg-lab-blue text-navy' : 'text-lab-blue/60 hover:text-lab-blue'}`}
                    >
                      Presentation
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 bg-lab-blue/10 text-electric text-[10px] font-bold uppercase tracking-widest rounded hover:bg-lab-blue/20 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={handleShip}
                    disabled={isShipping}
                    className="flex items-center gap-2 px-3 py-1.5 bg-electric text-navy text-[10px] font-bold uppercase tracking-widest rounded hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {isShipping ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Ship className="w-3 h-3" />}
                    {isShipping ? "Shipping..." : "Ship"}
                  </button>
                  <button
                    onClick={handleSynthesize}
                    className="flex items-center gap-2 px-3 py-1.5 bg-lab-blue/10 text-lab-blue text-[10px] font-bold uppercase tracking-widest rounded hover:bg-lab-blue/20 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Re-Synthesize
                  </button>
                </div>
              </div>

              {/* Markdown Content */}
              <div 
                ref={outputRef}
                className="flex-1 overflow-y-auto bg-black/20 border border-lab-blue/10 rounded-xl p-8 synthesis-output custom-scrollbar"
              >
                {viewMode === 'document' ? (
                  <div className="prose prose-invert prose-lab max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {output}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 flex items-center justify-center p-12 bg-navy/20 rounded-2xl border border-lab-blue/5 relative overflow-hidden group">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentSlide}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="w-full max-w-2xl prose prose-invert prose-lab-lg text-center"
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {output.split(/\n---\n/)[currentSlide] || ""}
                          </ReactMarkdown>
                        </motion.div>
                      </AnimatePresence>
                      
                      {/* Slide Navigation Overlay */}
                      <div className="absolute inset-y-0 left-0 w-24 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                          disabled={currentSlide === 0}
                          className="p-3 bg-navy/80 border border-lab-blue/20 rounded-full text-lab-blue hover:bg-lab-blue hover:text-navy disabled:opacity-20 transition-all"
                        >
                          <RefreshCw className="w-4 h-4 -rotate-90" />
                        </button>
                      </div>
                      <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setCurrentSlide(prev => Math.min(output.split(/\n---\n/).length - 1, prev + 1))}
                          disabled={currentSlide === output.split(/\n---\n/).length - 1}
                          className="p-3 bg-navy/80 border border-lab-blue/20 rounded-full text-lab-blue hover:bg-lab-blue hover:text-navy disabled:opacity-20 transition-all"
                        >
                          <RefreshCw className="w-4 h-4 rotate-90" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between px-4">
                      <div className="flex gap-1">
                        {output.split(/\n---\n/).map((_, i) => (
                          <div 
                            key={i}
                            className={`h-1 w-8 rounded-full transition-all ${i === currentSlide ? 'bg-electric' : 'bg-lab-blue/20'}`}
                          />
                        ))}
                      </div>
                      <div className="text-[10px] font-mono text-lab-blue/40 uppercase tracking-widest">
                        Slide {currentSlide + 1} / {output.split(/\n---\n/).length}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4 bg-navy/20 border border-dashed border-lab-blue/20 rounded-xl p-12 text-center">
              <Terminal className="w-12 h-12 text-lab-blue/20" />
              <div className="flex flex-col gap-1">
                <h3 className="text-lab-blue/40 font-bold uppercase tracking-widest">Waiting for Synthesis</h3>
                <p className="text-lab-blue/30 text-[10px] font-mono uppercase tracking-widest">
                  Enter parameters above to initialize synthesis engine
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
