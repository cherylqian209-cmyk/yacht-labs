const now = Date.now()
const DAY = 24 * 60 * 60 * 1000

export const demoProject = {
  id: 'demo-project',
  name: 'TaskFlow',
  description: 'A simple project management tool for small teams with kanban boards, time tracking, and team collaboration',
  status: 'building',
  current_phase: 'build',
  tech_stack: {
    frontend: 'Next.js 14',
    database: 'Supabase',
    styling: 'Tailwind CSS',
    charts: 'Recharts',
    auth: 'Supabase Auth',
  },
  created_at: new Date(now - 3 * DAY).toISOString(),
  ship_date: new Date(now + 2 * DAY).toISOString(),

  think_phase: {
    status: 'complete',
    completed_at: new Date(now - 2 * DAY).toISOString(),

    analysis: {
      coreFeatures: [
        'User authentication and profiles',
        'Kanban board with drag-and-drop',
        'Task creation and editing',
        'Basic time tracking',
        'Team member management',
        'Dashboard with key metrics',
      ],
      niceToHave: [
        'Advanced filtering and search',
        'Custom fields and templates',
        'Gantt chart view',
        'File attachments',
        'Mobile apps',
        'Integrations (Slack, GitHub)',
      ],
      outOfScope: [
        'Real-time collaboration',
        'AI-powered insights',
        'White-label options',
        'Advanced reporting',
      ],
      techStack: {
        frontend: 'Next.js 14',
        database: 'Supabase',
        styling: 'Tailwind CSS',
        charts: 'Recharts',
        auth: 'Supabase Auth',
      },
      estimatedDays: 7,
      risks: [
        'Drag-and-drop complexity — budget extra 2–3h if edge cases arise. Mitigation: use react-beautiful-dnd.',
        'Real-time updates — Supabase realtime can be complex for first-time users. Mitigation: start with polling, add real-time in v2.',
      ],
    },

    tasks: [
      { id: 't-s1', title: 'Project initialization & dependencies', phase: 'setup', priority: 'high', estimated_hours: 0.5 },
      { id: 't-s2', title: 'Supabase configuration & database schema', phase: 'setup', priority: 'high', estimated_hours: 1 },
      { id: 't-b1', title: 'Authentication UI & flows', phase: 'build', priority: 'high', estimated_hours: 2 },
      { id: 't-b2', title: 'Dashboard layout component', phase: 'build', priority: 'high', estimated_hours: 1 },
      { id: 't-b3', title: 'Kanban board UI components', phase: 'build', priority: 'high', estimated_hours: 3 },
      { id: 't-b4', title: 'Task creation and editing', phase: 'build', priority: 'high', estimated_hours: 2 },
      { id: 't-b5', title: 'Time tracking functionality', phase: 'build', priority: 'medium', estimated_hours: 4 },
      { id: 't-b6', title: 'Team member management', phase: 'build', priority: 'medium', estimated_hours: 3 },
      { id: 't-b7', title: 'Dashboard metrics and charts', phase: 'build', priority: 'medium', estimated_hours: 3 },
      { id: 't-sh1', title: 'Deploy to Vercel', phase: 'ship', priority: 'high', estimated_hours: 1 },
      { id: 't-sh2', title: 'Configure environment variables', phase: 'ship', priority: 'high', estimated_hours: 0.5 },
    ],
  },

  build_phase: {
    status: 'in_progress',
    progress: 0.67,

    tasks: [
      {
        id: 'task-1',
        title: 'Project initialization & dependencies',
        description: 'Set up Next.js project, install required packages, configure Tailwind',
        phase: 'setup',
        status: 'complete',
        priority: 'high',
        estimated_hours: 0.5,
        actual_hours: 0.5,
        ai_generated: false,
        completed_at: new Date(now - 2.5 * DAY).toISOString(),
        code_generated: true,
        code_key: 'project_init',
      },
      {
        id: 'task-2',
        title: 'Supabase configuration & database schema',
        description: 'Create tables for users, projects, tasks, time_entries. Set up RLS policies.',
        phase: 'setup',
        status: 'complete',
        priority: 'high',
        estimated_hours: 1,
        actual_hours: 1.5,
        ai_generated: true,
        completed_at: new Date(now - 2.3 * DAY).toISOString(),
        code_generated: true,
        code_key: 'db_schema',
      },
      {
        id: 'task-3',
        title: 'Authentication UI & flows',
        description: 'Login, signup, password reset pages. Session management.',
        phase: 'build',
        status: 'complete',
        priority: 'high',
        estimated_hours: 2,
        actual_hours: 2,
        ai_generated: true,
        completed_at: new Date(now - 2 * DAY).toISOString(),
        code_generated: true,
        code_key: 'auth',
      },
      {
        id: 'task-4',
        title: 'Dashboard layout component',
        description: 'Main dashboard shell with sidebar navigation and header',
        phase: 'build',
        status: 'complete',
        priority: 'high',
        estimated_hours: 1,
        actual_hours: 1,
        ai_generated: true,
        completed_at: new Date(now - 1.8 * DAY).toISOString(),
        code_generated: true,
        code_key: 'layout',
      },
      {
        id: 'task-5',
        title: 'Kanban board UI components',
        description: 'Column component, card component, drag-and-drop setup',
        phase: 'build',
        status: 'complete',
        priority: 'high',
        estimated_hours: 3,
        actual_hours: 4,
        ai_generated: true,
        completed_at: new Date(now - 1.2 * DAY).toISOString(),
        code_generated: true,
        code_key: 'kanban',
      },
      {
        id: 'task-6',
        title: 'Task creation and editing',
        description: 'Modal for creating/editing tasks with form validation',
        phase: 'build',
        status: 'complete',
        priority: 'high',
        estimated_hours: 2,
        actual_hours: 2.5,
        ai_generated: true,
        completed_at: new Date(now - 0.8 * DAY).toISOString(),
        code_generated: true,
        code_key: 'task_modal',
      },
      {
        id: 'task-7',
        title: 'Time tracking functionality',
        description: 'Start/stop timer, time entry logging, display total time per task',
        phase: 'build',
        status: 'in_progress',
        priority: 'medium',
        estimated_hours: 4,
        actual_hours: 2,
        ai_generated: true,
        code_generated: true,
        code_key: 'time_tracking',
      },
      {
        id: 'task-8',
        title: 'Team member management',
        description: 'Invite users, assign roles, manage permissions',
        phase: 'build',
        status: 'pending',
        priority: 'medium',
        estimated_hours: 3,
        ai_generated: true,
        code_generated: false,
      },
      {
        id: 'task-9',
        title: 'Dashboard metrics and charts',
        description: 'Task completion trends, time tracking stats, team velocity',
        phase: 'build',
        status: 'pending',
        priority: 'medium',
        estimated_hours: 3,
        ai_generated: true,
        code_generated: false,
      },
      {
        id: 'task-10',
        title: 'Real-time updates (optional)',
        description: 'Supabase realtime subscriptions for live board updates',
        phase: 'build',
        status: 'pending',
        priority: 'low',
        estimated_hours: 2,
        ai_generated: true,
        code_generated: false,
      },
    ],
  },

  ship_phase: {
    status: 'ready',

    preflight_checks: [
      { id: 'tests', name: 'All tests passing', status: 'complete', detail: '23 tests · 0 failures' },
      { id: 'env', name: 'Environment variables configured', status: 'complete', detail: '8 secrets synced to Vercel' },
      { id: 'migrations', name: 'Database migrations ready', status: 'complete', detail: '5 migrations validated' },
      { id: 'domain', name: 'Custom domain', status: 'pending', detail: 'Can deploy to .vercel.app now' },
      { id: 'monitoring', name: 'Monitoring tools ready', status: 'complete', detail: 'Sentry configured' },
    ],

    deployment_recommendation:
      'Deploy now. All critical checks passed. Custom domain will update automatically after deployment.',
  },

  listen_phase: {
    status: 'pending',

    metrics: [
      { label: 'ACTIVE USERS', value: '—', trend: null, color: '#22c55e' },
      { label: 'PAGE LOAD', value: '—', trend: null, color: '#3b82f6' },
      { label: 'ERROR RATE', value: '—', trend: null, color: '#ef4444' },
      { label: 'SATISFACTION', value: '—', trend: null, color: '#f59e0b' },
    ],

    insights: [
      {
        type: 'warning',
        title: 'Onboarding Drop-off (preview)',
        description: 'After launch, AI will detect friction points in your signup flow and suggest targeted fixes.',
        impact: 'HIGH',
      },
      {
        type: 'success',
        title: 'Retention Signals (preview)',
        description: 'Habit-forming features will be surfaced based on real usage patterns after your first 50 users.',
        impact: 'MED',
      },
      {
        type: 'info',
        title: 'Feature Request Pattern (preview)',
        description: 'AI will cluster user feedback into actionable feature priorities ranked by potential impact.',
        impact: 'MED',
      },
    ],
  },

  repeat_phase: {
    status: 'pending',

    backlog: [
      {
        id: 'r-1',
        rank: 1,
        title: 'Reduce onboarding steps from 5 → 3',
        source: 'AI insight',
        impact: 'HIGH',
        effort: 'LOW',
        type: 'fix',
      },
      {
        id: 'r-2',
        rank: 2,
        title: 'Add CSV export for time reports',
        source: 'User feedback',
        impact: 'HIGH',
        effort: 'MED',
        type: 'feature',
      },
      {
        id: 'r-3',
        rank: 3,
        title: 'Fix drag-and-drop on mobile Safari',
        source: 'Error logs',
        impact: 'MED',
        effort: 'MED',
        type: 'fix',
      },
      {
        id: 'r-4',
        rank: 4,
        title: 'Dashboard load time optimization',
        source: 'AI insight',
        impact: 'MED',
        effort: 'LOW',
        type: 'performance',
      },
    ],
  },

  stats: {
    time_to_ship: '2 days',
    ai_assists: 23,
    code_generated: 2847,
    velocity_increase: 340,
  },
}

export const demoCodeExamples: Record<string, string> = {
  auth: `// components/auth/LoginForm.tsx — AI-generated
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full px-3 py-2 border rounded-md"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full px-3 py-2 border rounded-md"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-purple-600 text-white rounded-md"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}`,

  kanban: `// components/kanban/KanbanBoard.tsx — AI-generated
'use client';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const COLUMNS = ['Todo', 'In Progress', 'Done'];

export default function KanbanBoard({ tasks, onDragEnd }: Props) {
  const columns = COLUMNS.map((col) => ({
    id: col,
    tasks: tasks.filter((t) => t.status === col),
  }));

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-72">
            <div className="bg-gray-100 rounded-lg p-3">
              <h3 className="font-semibold mb-3 text-sm">{column.id}</h3>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={\`space-y-2 min-h-[100px] rounded \${
                      snapshot.isDraggingOver ? 'bg-purple-50' : ''
                    }\`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-3 rounded shadow-sm text-sm"
                          >
                            {task.title}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}`,

  db_schema: `-- Supabase schema — AI-generated
CREATE TABLE tasks (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  uuid REFERENCES projects(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  status      text DEFAULT 'todo'
                CHECK (status IN ('todo','in_progress','done','blocked')),
  priority    text DEFAULT 'medium'
                CHECK (priority IN ('low','medium','high')),
  assigned_to uuid REFERENCES auth.users(id),
  estimated_h numeric,
  actual_h    numeric,
  created_at  timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Row level security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their project tasks"
  ON tasks FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Time entries
CREATE TABLE time_entries (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id    uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES auth.users(id),
  started_at timestamptz NOT NULL,
  stopped_at timestamptz,
  duration_s integer GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (stopped_at - started_at))::integer
  ) STORED
);`,

  time_tracking: `// hooks/useTimer.ts — AI-generated
import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function useTimer(taskId: string) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const entryId = useRef<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const start = async () => {
    const { data } = await supabase
      .from('time_entries')
      .insert({ task_id: taskId, started_at: new Date().toISOString() })
      .select('id')
      .single();
    entryId.current = data?.id ?? null;
    setRunning(true);
  };

  const stop = async () => {
    if (!entryId.current) return;
    await supabase
      .from('time_entries')
      .update({ stopped_at: new Date().toISOString() })
      .eq('id', entryId.current);
    entryId.current = null;
    setRunning(false);
  };

  const fmt = (s: number) =>
    [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
      .map((n) => String(n).padStart(2, '0'))
      .join(':');

  return { running, elapsed, fmt: fmt(elapsed), start, stop };
}`,

  layout: `// app/dashboard/layout.tsx — AI-generated
import Link from 'next/link';
import { LayoutDashboard, KanbanSquare, Clock, Users, Settings } from 'lucide-react';

const nav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/board', label: 'Board', icon: KanbanSquare },
  { href: '/dashboard/time', label: 'Time', icon: Clock },
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <span className="font-bold text-purple-600">TaskFlow</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm
                         text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}`,

  project_init: `# Project initialization — AI-generated shell script

npx create-next-app@latest taskflow \\
  --typescript \\
  --tailwind \\
  --app \\
  --src-dir \\
  --import-alias "@/*"

cd taskflow

npm install \\
  @supabase/supabase-js \\
  @supabase/auth-helpers-nextjs \\
  react-beautiful-dnd \\
  recharts \\
  lucide-react \\
  date-fns

npm install -D @types/react-beautiful-dnd

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EOF`,

  task_modal: `// components/tasks/TaskModal.tsx — AI-generated
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  onSave: (task: Partial<Task>) => void;
  onClose: () => void;
  initial?: Partial<Task>;
}

export default function TaskModal({ onSave, onClose, initial = {} }: Props) {
  const [title, setTitle] = useState(initial.title ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [priority, setPriority] = useState(initial.priority ?? 'medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description, priority });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">{initial.id ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button type="submit"
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}`,
}
