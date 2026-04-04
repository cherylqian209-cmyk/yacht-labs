import React from 'react';
import { motion } from 'framer-motion';
import { Activity, MousePointer2, Layers, Edit2, Zap, TrendingUp, BarChart3, Sparkles } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, XAxis, YAxis, ZAxis, Tooltip, Scatter, Cell } from 'recharts';

interface UserInteractionPanelProps {
  logs: any[];
  vibeScore: number;
  resonanceRate: number;
  pageLoads: number;
  echoes: any[];
}

export default function UserInteractionPanel({ logs, vibeScore, resonanceRate, pageLoads, echoes }: UserInteractionPanelProps) {
  const acousticsLogsByType = logs.reduce((acc: any, curr) => {
    const event = curr.event || 'other';
    acc[event] = (acc[event] || 0) + 1;
    return acc;
  }, {});

  const interactionCategories = [
    {
      title: 'Navigation & Structure',
      events: ['tap_click', 'double_tap', 'hover', 'scroll', 'swipe', 'drag', 'drop', 'pinch', 'rotate'],
      icon: <Layers size={14} className="text-blue-500" />
    },
    {
      title: 'Input & Data Entry',
      events: ['input', 'change', 'submit', 'autofill', 'dropdown_selection', 'radio_selection', 'checkbox_selection', 'toggle_switch', 'date_picker', 'time_picker', 'file_upload'],
      icon: <Edit2 size={14} className="text-purple-500" />
    },
    {
      title: 'Feedback & System',
      events: ['button_press', 'loading_spinner', 'progress_bar', 'toast', 'snackbar', 'modal', 'tooltip', 'inline_validation', 'haptic'],
      icon: <Activity size={14} className="text-green-500" />
    },
    {
      title: 'Content Interaction',
      events: ['expand_collapse', 'tabs_switching', 'carousel_scroll', 'video_play', 'video_pause', 'audio_play', 'audio_pause', 'play', 'pause'],
      icon: <Zap size={14} className="text-amber-500" />
    }
  ];

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-[32px] overflow-hidden">
      <div className="p-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
        <div>
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-100">Interaction Intelligence</h2>
          <p className="text-[10px] text-zinc-500 font-sans italic">Consolidated behavioral analytics and interaction density.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <Activity size={10} className="text-blue-500" />
            <span className="text-[8px] font-mono text-blue-400 uppercase tracking-widest">Live Monitoring</span>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Key Metrics */}
          <div className="lg:col-span-3 space-y-6">
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">Resonance Score</h3>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-mono text-zinc-100">{vibeScore}</span>
                <span className="text-xs text-zinc-500 mb-1">/ 100</span>
              </div>
              <div className="mt-4 h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${vibeScore > 70 ? 'bg-green-500' : vibeScore > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                  style={{ width: `${vibeScore}%` }} 
                />
              </div>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">Interaction Density</h3>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-mono text-zinc-100">{logs.length}</span>
                <span className="text-xs text-zinc-500 mb-1">events</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 italic">
                {resonanceRate > 20 ? "High engagement detected." : "Low engagement detected."}
              </p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">Resonance Rate</h3>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-mono text-zinc-100">{resonanceRate}%</span>
              </div>
              <div className="mt-4 h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${resonanceRate}%` }} />
              </div>
            </div>
          </div>

          {/* Middle: Heat Map */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 relative min-h-[300px]">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-100 mb-4 flex items-center gap-2">
                <MousePointer2 size={14} className="text-zinc-500" /> Interaction Heat Map
              </h3>
              <div className="absolute inset-x-6 bottom-6 top-16">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <XAxis type="number" dataKey="x" name="X" hide domain={[0, 'auto']} />
                    <YAxis type="number" dataKey="y" name="Y" hide domain={[0, 'auto']} reversed />
                    <ZAxis type="number" dataKey="z" range={[50, 400]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                      itemStyle={{ color: '#f4f4f5', fontSize: '10px', fontFamily: 'monospace' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg shadow-xl">
                              <p className="text-[10px] font-mono text-zinc-100 uppercase">{data.event}</p>
                              <p className="text-[8px] font-mono text-zinc-500">X: {Math.round(data.x)} Y: {Math.round(data.y)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter 
                      name="Interactions" 
                      data={logs
                        .filter(l => l.data?.x !== undefined && l.data?.y !== undefined)
                        .map(l => ({ 
                          x: l.data.x, 
                          y: l.data.y, 
                          z: l.event === 'tap_click' ? 2 : 1,
                          event: l.event 
                        }))} 
                    >
                      {logs
                        .filter(l => l.data?.x !== undefined && l.data?.y !== undefined)
                        .map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.event === 'tap_click' ? '#ef4444' : entry.event === 'hover' ? '#3b82f6' : '#10b981'} 
                            fillOpacity={entry.event === 'tap_click' ? 0.6 : 0.3}
                          />
                        ))
                      }
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute bottom-4 right-4 flex gap-4 bg-zinc-900/80 p-2 rounded-lg border border-zinc-800 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-[8px] font-mono text-zinc-400 uppercase">Clicks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-[8px] font-mono text-zinc-400 uppercase">Hovers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Categories */}
          <div className="lg:col-span-4 grid grid-cols-1 gap-4">
            {interactionCategories.map((category, idx) => (
              <div key={idx} className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                    {category.icon}
                  </div>
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-100">{category.title}</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {category.events.slice(0, 3).map(event => (
                    <div key={event} className="flex flex-col">
                      <span className="text-[8px] font-mono uppercase text-zinc-600 truncate">{event.replace(/_/g, ' ')}</span>
                      <span className="text-xs font-mono text-zinc-100">{acousticsLogsByType[event] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Sentiment Echoes */}
        <div className="border-t border-zinc-800 pt-8">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-100 mb-6 flex items-center gap-2">
            <Sparkles size={14} className="text-blue-500" /> Sentiment Echoes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {echoes.slice(0, 3).map((echo) => (
              <div key={echo.id} className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono uppercase tracking-widest ${
                      echo.sentiment === 'Excitement' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                      echo.sentiment === 'Confusion' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                      'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    }`}>
                      {echo.sentiment}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{echo.source}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600">{echo.timestamp}</span>
                </div>
                <p className="text-xs text-zinc-300 italic leading-relaxed">"{echo.content}"</p>
                <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{echo.author}</span>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-blue-500 uppercase tracking-widest">
                    Action <TrendingUp size={10} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
