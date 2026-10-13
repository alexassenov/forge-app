/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, 
  ShieldAlert, 
  Zap, 
  BookOpen, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Camera,
  History,
  LayoutDashboard,
  Settings,
  Lock,
  Users,
  Target,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LogIn,
  Heart,
  MessageSquare,
  Trash2,
  Activity,
  User as UserIcon,
  Briefcase,
  Users2,
  Info,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Euro,
  Wallet,
  X,
  Sparkles,
  Share2,
  Shield,
  AlertTriangle,
  Bell,
  Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  generateSprintFromHighlight, 
  generateChallengeFromReflection, 
  generateFinancialQuote, 
  generateGatewayHabit, 
  parseBulkHighlights,
  searchBooks,
  generateBookQuotes,
  generateBookHighlight
} from './services/gemini';
import { 
  ForgeState, 
  SmallPromise, 
  Sprint, 
  Highlight, 
  AvatarState, 
  MonthlyHabit, 
  Goal, 
  Task, 
  CommunityPost, 
  UserProfile,
  Domain,
  DailyPlanItem,
  DailyReflection,
  Transaction,
  FinancialGoal,
  BadHabit,
  UrgeLog,
  Book,
  SavedQuote
} from './types';
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  increment,
  where
} from 'firebase/firestore';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// --- Utilities ---
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

// --- Components ---

const ErrorBoundary = ({ error, onDismiss }: { error: string, onDismiss?: () => void }) => {
  try {
    const info = JSON.parse(error);
    return (
      <div className="fixed bottom-24 left-4 right-4 z-50 bg-red-900/90 text-white p-4 rounded-sm border border-red-500 max-w-sm mx-auto">
        <div className="font-bold uppercase text-xs mb-1">System Error: {info.operationType}</div>
        <div className="text-[10px] opacity-80 break-all mb-2">{info.error}</div>
        <button onClick={onDismiss} className="text-[8px] uppercase tracking-widest opacity-50 hover:opacity-100 self-end">Dismiss</button>
      </div>
    );
  } catch {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-50 bg-red-900/90 text-white p-4 rounded-sm border border-red-500 max-w-sm mx-auto">
        <div className="font-bold uppercase text-xs mb-1">Error</div>
        <div className="text-[10px] opacity-80 mb-2">{error}</div>
        <button onClick={onDismiss} className="text-[8px] uppercase tracking-widest opacity-50 hover:opacity-100 self-end">Dismiss</button>
      </div>
    );
  }
};

const LoginScreen = ({ onGoogleSignIn }: { onGoogleSignIn: () => void }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 space-y-8 overflow-y-auto">
      <div className="text-center space-y-4 max-w-md">
        <div className="inline-block bg-forge-accent p-3 rounded-sm mb-4">
          <Flame size={48} className="text-forge-bg" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">Enter The Forge</h1>
        <p className="text-forge-accent text-xs uppercase tracking-[0.4em] font-bold">Identity Protocol v1.0</p>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="flex border-b border-forge-border">
          <button 
            onClick={() => setMode('login')}
            className={cn(
              "flex-1 py-3 text-[10px] uppercase tracking-[0.3em] font-black transition-colors",
              mode === 'login' ? "text-forge-accent border-b-2 border-forge-accent" : "text-forge-muted"
            )}
          >
            Login
          </button>
          <button 
            onClick={() => setMode('register')}
            className={cn(
              "flex-1 py-3 text-[10px] uppercase tracking-[0.3em] font-black transition-colors",
              mode === 'register' ? "text-forge-accent border-b-2 border-forge-accent" : "text-forge-muted"
            )}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'register' && (
            <input 
              type="text"
              placeholder="DISPLAY NAME"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full bg-black border border-forge-border p-4 text-sm focus:border-forge-accent outline-none uppercase tracking-widest"
            />
          )}
          <input 
            type="email"
            placeholder="EMAIL ADDRESS"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-black border border-forge-border p-4 text-sm focus:border-forge-accent outline-none uppercase tracking-widest"
          />
          <input 
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-black border border-forge-border p-4 text-sm focus:border-forge-accent outline-none uppercase tracking-widest"
          />
          
          {error && (
            <div className="text-[10px] text-red-500 uppercase tracking-widest font-bold bg-red-500/10 p-3 border border-red-500/30">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="forge-button-accent w-full py-4 flex items-center justify-center gap-3 group text-sm font-black tracking-[0.2em]"
          >
            {loading ? "PROCESSING..." : mode === 'login' ? "BEGIN TRANSFORMATION" : "FORGE ACCOUNT"}
          </button>
        </form>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-forge-border"></div>
          <span className="flex-shrink mx-4 text-[8px] uppercase tracking-widest text-forge-muted">OR</span>
          <div className="flex-grow border-t border-forge-border"></div>
        </div>

        <button 
          onClick={onGoogleSignIn}
          className="w-full py-4 border border-forge-border flex items-center justify-center gap-3 text-xs font-black tracking-[0.2em] hover:bg-white/5 transition-colors"
        >
          <LogIn size={16} /> CONTINUE WITH GOOGLE
        </button>

        <p className="text-[8px] text-center uppercase tracking-[0.2em] opacity-30">
          Secure Authentication Required to Access the Forge
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full max-w-md pt-8">
        <div className="forge-card border-forge-accent/30 bg-forge-accent/5 p-4">
          <h3 className="text-[10px] uppercase tracking-widest font-black mb-2 flex items-center gap-2">
            <Zap size={12} className="text-forge-accent" /> Master Your Identity
          </h3>
          <p className="text-[9px] text-forge-muted leading-relaxed uppercase tracking-wider">
            Forge a new version of yourself through consistent action. Stop being a spectator in your own life.
          </p>
        </div>
      </div>
    </div>
  );
};

const Avatar = ({ state, setToolInfo }: { state: AvatarState, setToolInfo: (info: { title: string, content: string } | null) => void }) => {
  const variants = {
    depleted: {
      scale: 0.9,
      opacity: 0.3,
      filter: 'blur(4px) grayscale(100%)',
      rotate: 0,
    },
    aligning: {
      scale: 1,
      opacity: 0.7,
      filter: 'blur(2px) grayscale(50%)',
      rotate: 180,
    },
    aligned: {
      scale: 1.1,
      opacity: 1,
      filter: 'blur(0px) grayscale(0%)',
      rotate: 360,
      boxShadow: '0 0 40px rgba(249, 115, 22, 0.4)',
    }
  };

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <motion.div
        animate={variants[state]}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute inset-0 border-4 border-forge-accent rounded-full"
      />
      <motion.div
        animate={variants[state]}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute inset-4 border-2 border-forge-ink rounded-full opacity-20"
      />
      <motion.div
        animate={{ rotate: state === 'aligned' ? 360 : 0 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        <Flame size={64} className={cn(
          "transition-colors duration-1000",
          state === 'depleted' ? 'text-forge-muted' : 
          state === 'aligning' ? 'text-forge-ink' : 'text-forge-accent'
        )} />
      </motion.div>
      
      <div className="absolute -bottom-8 text-center">
        <div className="flex items-center justify-center gap-1">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-50">Identity Status</span>
          <button 
            onClick={() => setToolInfo({
              title: "Identity Status",
              content: "Your current state of alignment. DEPLETED: Low momentum. ALIGNING: Building streaks. ALIGNED: Peak performance. Your status evolves based on your consistency and active sprints."
            })}
            className="text-forge-accent opacity-50 hover:opacity-100 transition-opacity"
          >
            <Info size={10} />
          </button>
        </div>
        <div className="text-xs uppercase tracking-widest font-black">{state}</div>
      </div>
    </div>
  );
};

const SprintCard = ({ sprint, onCompleteDay, onShare }: { 
  sprint: Sprint, 
  onCompleteDay: (id: string, day: number) => void,
  onShare: (sprint: Sprint) => void
}) => {
  return (
    <div className="forge-card space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-forge-accent font-bold">Active Sprint</span>
          <h3 className="text-lg font-bold leading-tight">{sprint.principle}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-widest opacity-50">Source</span>
            <div className="text-[10px] font-bold">{sprint.source}</div>
          </div>
          <button 
            onClick={() => onShare(sprint)}
            className="text-[8px] uppercase tracking-widest font-bold border border-forge-accent/30 px-2 py-1 hover:bg-forge-accent hover:text-forge-bg transition-colors"
          >
            Share Progress
          </button>
        </div>
      </div>
      
      <div className="bg-forge-muted/20 p-3 border-l-2 border-forge-accent italic text-sm">
        "{sprint.highlight}"
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
          <span>Challenge</span>
          <span>{sprint.completedDays.length}/{sprint.durationDays} Days</span>
        </div>
        <p className="text-sm border border-forge-border p-3 bg-black/30">{sprint.challenge}</p>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: sprint.durationDays }).map((_, i) => (
          <button
            key={i}
            onClick={() => onCompleteDay(sprint.id, i)}
            disabled={(sprint.completedDays || []).includes(i)}
            className={cn(
              "h-8 flex items-center justify-center border transition-all",
              (sprint.completedDays || []).includes(i) 
                ? "bg-forge-accent border-forge-accent text-forge-bg" 
                : "border-forge-border hover:border-forge-ink"
            )}
          >
            {(sprint.completedDays || []).includes(i) ? <CheckCircle2 size={14} /> : <span className="text-[10px]">{i + 1}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

const MonthlyTracker = ({ habit, onToggle, onShare }: { 
  habit: MonthlyHabit, 
  onToggle: (id: string, date: string) => void,
  onShare: (habit: MonthlyHabit) => void
}) => {
  const now = new Date();
  const days = getDaysInMonth(now.getFullYear(), now.getMonth());
  const todayStr = now.toISOString().split('T')[0];

  return (
    <div className="forge-card space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold uppercase tracking-widest">{habit.name}</h3>
          <button 
            onClick={() => onShare(habit)}
            className="text-[8px] uppercase tracking-widest font-bold opacity-50 hover:opacity-100 hover:text-forge-accent transition-all"
          >
            Share
          </button>
        </div>
        <span className="text-[10px] opacity-50">{now.toLocaleString('default', { month: 'long' })} {now.getFullYear()}</span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: days }).map((_, i) => {
          const date = new Date(now.getFullYear(), now.getMonth(), i + 1);
          const dateStr = date.toISOString().split('T')[0];
          const isCompleted = (habit.completions || []).includes(dateStr);
          const isToday = dateStr === todayStr;

          return (
            <button
              key={i}
              onClick={() => onToggle(habit.id, dateStr)}
              className={cn(
                "aspect-square flex items-center justify-center border text-[10px] transition-all",
                isCompleted ? "bg-forge-accent border-forge-accent text-forge-bg" : "border-forge-border hover:border-forge-ink",
                isToday && !isCompleted && "border-forge-accent/50"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const GoalCard = ({ goal, onAddTask, onToggleTask, onDeleteGoal, onShare }: { 
  goal: Goal, 
  onAddTask: (goalId: string, text: string) => void,
  onToggleTask: (goalId: string, taskId: string) => void,
  onDeleteGoal: (id: string) => void,
  onShare: (goal: Goal) => void
}) => {
  const [newTask, setNewTask] = useState('');
  const completedCount = (goal.tasks || []).filter(t => t.completed).length;
  const progress = (goal.tasks || []).length > 0 ? (completedCount / goal.tasks.length) * 100 : 0;

  return (
    <div className="forge-card space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold leading-tight">{goal.title}</h3>
            <button 
              onClick={() => onShare(goal)}
              className="flex items-center gap-1 px-2 py-1 bg-forge-accent/10 border border-forge-accent/20 rounded-sm text-[8px] uppercase tracking-widest font-black text-forge-accent hover:bg-forge-accent hover:text-forge-bg transition-all"
              title="Share progress with community"
            >
              <Share2 size={10} />
              Share Progress
            </button>
          </div>
          <p className="text-xs text-forge-muted">{goal.description}</p>
        </div>
        <button onClick={() => onDeleteGoal(goal.id)} className="text-forge-muted hover:text-red-500">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="h-1 bg-forge-border w-full rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-forge-accent"
        />
      </div>

      <div className="space-y-2">
        {(goal.tasks || []).map(task => (
          <div key={task.id} className="flex items-center gap-3 group">
            <button 
              onClick={() => onToggleTask(goal.id, task.id)}
              className={cn(
                "w-4 h-4 border flex items-center justify-center transition-colors",
                task.completed ? "bg-forge-accent border-forge-accent text-forge-bg" : "border-forge-border group-hover:border-forge-ink"
              )}
            >
              {task.completed && <CheckCircle2 size={10} />}
            </button>
            <span className={cn("text-xs", task.completed && "line-through opacity-50")}>{task.text}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input 
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newTask) {
              onAddTask(goal.id, newTask);
              setNewTask('');
            }
          }}
          placeholder="Add task..."
          className="flex-1 bg-black border border-forge-border px-3 py-1 text-xs outline-none focus:border-forge-accent"
        />
        <button 
          onClick={() => {
            if (newTask) {
              onAddTask(goal.id, newTask);
              setNewTask('');
            }
          }}
          className="forge-button px-2 py-1"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};

const DailyPlanCard = ({ item, onComplete, onUpdate }: { 
  item: DailyPlanItem, 
  onComplete: (id: string) => void,
  onUpdate: (id: string, updates: Partial<DailyPlanItem>) => void
}) => {
  const isCompletedToday = item.lastCompleted && new Date(item.lastCompleted).toDateString() === new Date().toDateString();

  return (
    <div className={cn(
      "forge-card space-y-4 transition-all",
      isCompletedToday && "border-forge-accent/50 bg-forge-accent/5"
    )}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-sm border flex items-center justify-center",
            isCompletedToday ? "bg-forge-accent border-forge-accent text-forge-bg" : "border-forge-border"
          )}>
            {isCompletedToday ? <CheckCircle2 size={16} /> : <Activity size={16} className="text-forge-muted" />}
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-forge-accent font-bold">{item.domain}</span>
            <div className="text-sm font-bold">I will {item.behaviour || "..."} at {item.time || "..."} in {item.location || "..."}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest opacity-50">Streak</div>
          <div className="text-lg font-black">{item.streak}</div>
        </div>
      </div>

      {!isCompletedToday ? (
        <div className="grid grid-cols-1 gap-2">
          <div className="grid grid-cols-3 gap-2">
            <input 
              className="bg-black border border-forge-border p-2 text-[10px] outline-none focus:border-forge-accent"
              placeholder="Behaviour"
              value={item.behaviour}
              onChange={(e) => onUpdate(item.id, { behaviour: e.target.value })}
            />
            <input 
              className="bg-black border border-forge-border p-2 text-[10px] outline-none focus:border-forge-accent"
              placeholder="Time"
              value={item.time}
              onChange={(e) => onUpdate(item.id, { time: e.target.value })}
            />
            <input 
              className="bg-black border border-forge-border p-2 text-[10px] outline-none focus:border-forge-accent"
              placeholder="Location"
              value={item.location}
              onChange={(e) => onUpdate(item.id, { location: e.target.value })}
            />
          </div>
          <button 
            onClick={() => onComplete(item.id)}
            disabled={!item.behaviour || !item.time || !item.location}
            className="forge-button-accent py-2 text-[10px] uppercase tracking-widest font-black"
          >
            Commit to Action
          </button>
        </div>
      ) : (
        <div className="text-[10px] uppercase tracking-widest text-forge-accent font-bold text-center py-2 border border-dashed border-forge-accent/30">
          Daily Commitment Forged
        </div>
      )}
    </div>
  );
};

const DailyReflectionSection = ({ 
  reflections, 
  onSave,
  onDelete,
  onToggleChallenge
}: { 
  reflections: DailyReflection[], 
  onSave: (improvement: string, mistake: string) => Promise<void>,
  onDelete: (id: string) => Promise<void>,
  onToggleChallenge: (id: string, completed: boolean) => Promise<void>
}) => {
  const [improvement, setImprovement] = useState('');
  const [mistake, setMistake] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  
  const todayReflection = reflections.find(r => r.date === today);
  const pendingChallenge = reflections
    .slice()
    .reverse()
    .find(r => r.date !== today && r.challenge && r.challengeCompleted === undefined);

  // Calculate progress
  const challengesWithStatus = reflections.filter(r => r.challenge && r.challengeCompleted !== undefined && r.challengeCompleted !== null);
  const doneCount = challengesWithStatus.filter(r => r.challengeCompleted).length;
  const totalCount = challengesWithStatus.length;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  const handleSave = async () => {
    if (!improvement || !mistake) return;
    setIsSaving(true);
    try {
      await onSave(improvement, mistake);
      setImprovement('');
      setMistake('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xs uppercase tracking-[0.3em] font-black opacity-50">Daily Reflection</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-24 h-1 bg-forge-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-forge-accent transition-all duration-500" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            <span className="text-[8px] uppercase tracking-widest font-bold opacity-50">{Math.round(progress)}% Mastery ({totalCount - doneCount} skipped)</span>
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="text-[10px] uppercase tracking-widest font-bold hover:text-forge-accent flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity"
          >
            <History size={12} />
            {showHistory ? 'Close History' : 'View History'}
          </button>
        </div>
      </div>

      {/* Today's Challenge (from previous days) */}
      {!showHistory && pendingChallenge && (
        <div className="forge-card p-6 space-y-4 border-forge-accent bg-forge-accent/10">
          <div className="flex items-center gap-2 text-forge-accent">
            <Zap size={16} />
            <span className="text-[10px] uppercase tracking-widest font-black">Active Challenge (from {pendingChallenge.date})</span>
          </div>
          <p className="text-lg font-black uppercase tracking-tight leading-tight">
            {pendingChallenge.challenge}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => onToggleChallenge(pendingChallenge.id, true)}
              className="flex-1 py-2 bg-forge-accent text-forge-bg text-[10px] uppercase font-black tracking-widest hover:opacity-90 transition-opacity"
            >
              Done
            </button>
            <button 
              onClick={() => onToggleChallenge(pendingChallenge.id, false)}
              className="flex-1 py-2 bg-red-500 text-white text-[10px] uppercase font-black tracking-widest hover:opacity-90 transition-opacity"
            >
              Not Done
            </button>
          </div>
        </div>
      )}

      {showHistory ? (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
          {reflections.length === 0 ? (
            <div className="text-[10px] uppercase tracking-widest opacity-30 text-center py-8 border border-dashed border-forge-border">No history yet</div>
          ) : (
            reflections.slice().reverse().map(r => (
              <div key={r.id} className="forge-card p-4 space-y-3 bg-white/5">
                <div className="flex justify-between items-center border-b border-forge-border pb-2">
                  <span className="text-[10px] font-black tracking-widest opacity-50 uppercase">{r.date}</span>
                </div>
                <div className="grid gap-3">
                  <div>
                    <div className="text-[8px] uppercase tracking-widest text-forge-accent font-black mb-1">Improvement</div>
                    <p className="text-xs leading-relaxed opacity-80">{r.improvement}</p>
                  </div>
                  <div>
                    <div className="text-[8px] uppercase tracking-widest text-red-500 font-black mb-1">Mistake</div>
                    <p className="text-xs leading-relaxed opacity-80">{r.mistake}</p>
                  </div>
                  {r.challenge && (
                    <div className={cn(
                      "p-2 rounded-sm border",
                      r.challengeCompleted === true ? "bg-forge-accent/10 border-forge-accent/20" : 
                      r.challengeCompleted === false ? "bg-red-500/10 border-red-500/20" : 
                      "bg-white/5 border-forge-border"
                    )}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-[8px] uppercase tracking-widest text-forge-accent font-black">Generated Challenge</div>
                        {r.challengeCompleted !== undefined && (
                          <span className={cn(
                            "text-[8px] uppercase tracking-widest font-black",
                            r.challengeCompleted ? "text-forge-accent" : "text-red-500"
                          )}>
                            {r.challengeCompleted ? 'Done' : 'Skipped'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs italic opacity-90">"{r.challenge}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : todayReflection ? (
        <div className="forge-card p-6 space-y-4 border-forge-accent/30 bg-forge-accent/5">
          <div className="flex items-center gap-2 text-forge-accent">
            <CheckCircle2 size={16} />
            <span className="text-[10px] uppercase tracking-widest font-black">Reflection Logged</span>
          </div>
          <div className="grid gap-4">
            <div>
              <div className="text-[8px] uppercase tracking-widest opacity-50 mb-1">Today's Focus</div>
              <p className="text-sm font-medium">{todayReflection.improvement}</p>
            </div>
            {todayReflection.challenge && (
              <div className="bg-forge-accent p-4 rounded-sm text-forge-bg">
                <div className="text-[8px] uppercase tracking-widest font-black mb-1 opacity-70">Tomorrow's Challenge</div>
                <p className="text-sm font-black leading-tight uppercase tracking-tight">{todayReflection.challenge}</p>
              </div>
            )}
          </div>
          <button
    onClick={() => onDelete(todayReflection.id)}
    className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-400 flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity"
  >
    <Trash2 size={12} />
    Delete
  </button>
        </div>
      ) : (
        <div className="forge-card p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black opacity-50">What could I improve today?</label>
              <textarea 
                value={improvement}
                onChange={(e) => setImprovement(e.target.value)}
                placeholder="Be specific about a behavior or mindset..."
                className="w-full bg-black border border-forge-border p-3 text-sm focus:border-forge-accent outline-none min-h-[80px] resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black opacity-50">What did I do wrong?</label>
              <textarea 
                value={mistake}
                onChange={(e) => setMistake(e.target.value)}
                placeholder="Own your failures. No excuses."
                className="w-full bg-black border border-forge-border p-3 text-sm focus:border-red-500 outline-none min-h-[80px] resize-none"
              />
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving || !improvement || !mistake}
            className="forge-button-accent w-full py-3 text-xs uppercase font-black tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-30"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-forge-bg border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Zap size={14} />
                Log Reflection & Forge Challenge
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
};

const WealthSection = ({ 
  transactions, 
  goals, 
  onAddTransaction, 
  onAddGoal,
  onDeleteTransaction,
  onDeleteGoal,
  onShareGoal
}: { 
  transactions: Transaction[], 
  goals: FinancialGoal[], 
  onAddTransaction: (type: 'income' | 'expense', amount: number, category: string) => void,
  onAddGoal: (title: string, target: number, ruleType: 'income' | 'expense', percentage: number) => void,
  onDeleteTransaction: (id: string) => void,
  onDeleteGoal: (id: string) => void,
  onShareGoal: (goal: FinancialGoal) => void
}) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalRuleType, setGoalRuleType] = useState<'income' | 'expense'>('income');
  const [goalPercentage, setGoalPercentage] = useState('10');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const today = new Date().toDateString();
  const dailyTransactions = transactions.filter(t => new Date(t.timestamp).toDateString() === today);
  const dailyIncome = dailyTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const dailyExpense = dailyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0,0,0,0);
  const weeklyTransactions = transactions.filter(t => t.timestamp >= startOfWeek.getTime());
  const weeklyIncome = weeklyTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const weeklyExpense = weeklyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  useEffect(() => {
    if (goals.length > 0 && !quote && !isGeneratingQuote) {
      const fetchQuote = async () => {
        setIsGeneratingQuote(true);
        try {
          const result = await generateFinancialQuote(goals.map(g => g.title));
          setQuote(result.quote);
        } catch (e) {
          console.error(e);
        } finally {
          setIsGeneratingQuote(false);
        }
      };
      fetchQuote();
    }
  }, [goals, quote, isGeneratingQuote]);

  const handleTransaction = (type: 'income' | 'expense') => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || !category) return;
    onAddTransaction(type, val, category);
    setAmount('');
    setCategory('');
  };

  const handleAddGoal = () => {
    const target = parseFloat(goalTarget);
    const pct = parseFloat(goalPercentage);
    if (!goalTitle || isNaN(target) || target <= 0 || isNaN(pct) || pct <= 0) return;
    onAddGoal(goalTitle, target, goalRuleType, pct);
    setGoalTitle('');
    setGoalTarget('');
    setShowGoalForm(false);
    setQuote(null); // Reset quote to trigger new one
  };

  return (
    <section className="space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <h2 className="text-xs uppercase tracking-[0.3em] font-black opacity-50">Wealth Protocol</h2>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-[8px] uppercase tracking-widest opacity-50">Net Balance</div>
            <div className={cn("text-lg font-black", netBalance >= 0 ? "text-forge-accent" : "text-red-500")}>
              {netBalance.toLocaleString()}€
            </div>
          </div>
        </div>
      </div>

      {quote && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 border-l-2 border-forge-accent bg-forge-accent/5 italic relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Euro size={40} />
          </div>
          <p className="text-sm font-medium opacity-80 leading-relaxed relative z-10">"{quote}"</p>
        </motion.div>
      )}

      {/* Daily/Weekly Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="forge-card p-4 border-forge-accent/20 bg-forge-accent/5">
          <div className="text-[8px] uppercase tracking-widest font-black text-forge-accent mb-2">Daily Pulse</div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[7px] uppercase opacity-50">Income</div>
              <div className="text-xs font-bold text-forge-accent">+{dailyIncome.toLocaleString()}€</div>
            </div>
            <div className="text-right">
              <div className="text-[7px] uppercase opacity-50">Spend</div>
              <div className="text-xs font-bold text-red-500">-{dailyExpense.toLocaleString()}€</div>
            </div>
          </div>
        </div>
        <div className="forge-card p-4 border-forge-accent/20 bg-forge-accent/5">
          <div className="text-[8px] uppercase tracking-widest font-black text-forge-accent mb-2">Weekly Pulse</div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[7px] uppercase opacity-50">Income</div>
              <div className="text-xs font-bold text-forge-accent">+{weeklyIncome.toLocaleString()}€</div>
            </div>
            <div className="text-right">
              <div className="text-[7px] uppercase opacity-50">Spend</div>
              <div className="text-xs font-bold text-red-500">-{weeklyExpense.toLocaleString()}€</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transaction Input */}
        <div className="forge-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={16} className="text-forge-accent" />
            <h3 className="text-[10px] uppercase tracking-widest font-black">Quick Ledger</h3>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input 
                type="number"
                placeholder="AMOUNT"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-24 bg-black border border-forge-border p-3 text-sm focus:border-forge-accent outline-none"
              />
              <input 
                type="text"
                placeholder="CATEGORY (E.G. GROCERIES, SALARY)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 bg-black border border-forge-border p-3 text-sm focus:border-forge-accent outline-none uppercase tracking-widest"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleTransaction('income')}
                className="bg-forge-accent text-forge-bg py-3 text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <TrendingUp size={14} />
                Income
              </button>
              <button 
                onClick={() => handleTransaction('expense')}
                className="bg-red-500 text-white py-3 text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <TrendingDown size={14} />
                Expense
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-forge-border space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
            {transactions.length === 0 ? (
              <div className="text-[10px] uppercase tracking-widest opacity-30 text-center py-4">No transactions logged</div>
            ) : (
              transactions.slice().reverse().map(t => (
                <div key={t.id} className="flex justify-between items-center text-[10px] uppercase tracking-widest group">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onDeleteTransaction(t.id)}
                      className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                    >
                      <X size={10} />
                    </button>
                    <div className="flex flex-col">
                      <span className="opacity-50 text-[7px]">{new Date(t.timestamp).toLocaleDateString()}</span>
                      <span className="opacity-80">{t.category}</span>
                    </div>
                  </div>
                  <span className={t.type === 'income' ? "text-forge-accent" : "text-red-500"}>
                    {t.type === 'income' ? '+' : '-'}{t.amount}€
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Goals & Progress */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <PiggyBank size={16} className="text-forge-accent" />
              <h3 className="text-[10px] uppercase tracking-widest font-black">The Vault</h3>
            </div>
            <button 
              onClick={() => setShowGoalForm(!showGoalForm)}
              className="text-[10px] uppercase tracking-widest font-black text-forge-accent hover:underline"
            >
              {showGoalForm ? 'Cancel' : '+ New Goal'}
            </button>
          </div>

          {showGoalForm && (
            <div className="forge-card p-4 space-y-3 bg-forge-accent/5 border-forge-accent/30">
              <input 
                placeholder="GOAL TITLE (e.g. ITALY VACATION)"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                className="w-full bg-black border border-forge-border p-3 text-sm outline-none focus:border-forge-accent uppercase tracking-widest"
              />
              <div className="flex gap-2">
                <input 
                  type="number"
                  placeholder="TARGET AMOUNT"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="flex-1 bg-black border border-forge-border p-3 text-sm outline-none focus:border-forge-accent"
                />
                <div className="flex-1 flex gap-1">
                  <input 
                    type="number"
                    placeholder="%"
                    value={goalPercentage}
                    onChange={(e) => setGoalPercentage(e.target.value)}
                    className="w-16 bg-black border border-forge-border p-3 text-sm outline-none focus:border-forge-accent"
                  />
                  <select 
                    value={goalRuleType}
                    onChange={(e) => setGoalRuleType(e.target.value as any)}
                    className="flex-1 bg-black border border-forge-border p-3 text-sm outline-none focus:border-forge-accent uppercase tracking-widest"
                  >
                    <option value="income">Of Income</option>
                    <option value="expense">Of Spend</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={handleAddGoal}
                className="w-full bg-forge-accent text-forge-bg py-2 text-[10px] uppercase font-black tracking-widest"
              >
                Establish Goal
              </button>
            </div>
          )}

          <div className="space-y-3">
            {goals.map(goal => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal.id} className="forge-card p-4 space-y-3 group relative">
                  <button 
                    onClick={() => onDeleteGoal(goal.id)}
                    className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 z-10"
                  >
                    <X size={12} />
                  </button>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest">{goal.title}</h4>
                        <button 
                          onClick={() => onShareGoal(goal)}
                          className="flex items-center gap-1 px-1.5 py-0.5 bg-forge-accent/10 border border-forge-accent/20 rounded-sm text-[7px] uppercase tracking-widest font-black text-forge-accent hover:bg-forge-accent hover:text-forge-bg transition-all"
                          title="Share progress"
                        >
                          <Share2 size={8} />
                          Share
                        </button>
                      </div>
                      <p className="text-[8px] uppercase opacity-50 tracking-tighter">
                        {goal.allocationRule.percentage}% {goal.allocationRule.type === 'income' ? 'Income Tax' : 'Spend Tax'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black">{Math.round(progress)}%</div>
                      <div className="text-[8px] uppercase opacity-50">{goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()}€</div>
                    </div>
                  </div>
                  <div className="h-1 bg-forge-border rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      className="h-full bg-forge-accent"
                    />
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && !showGoalForm && (
              <div className="text-center py-8 border border-dashed border-forge-border opacity-30 text-[10px] uppercase tracking-widest">
                No active financial goals
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const HabitGrid = ({ 
  habits, 
  onToggle, 
  onAdd,
  onDelete,
}: { 
  habits: MonthlyHabit[], 
  onToggle: (id: string, date: string) => void,
  onAdd: (name: string, domain: Domain) => void,
  onDelete: (id: string) => void,
}) => {
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDomain, setNewHabitDomain] = useState<Domain>('health');
  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const categories: Domain[] = ['health', 'selfcare', 'relationships', 'work'];

  const calculateStreak = (completions: string[]) => {
    if (!completions || completions.length === 0) return 0;
    const sortedDates = [...completions].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;
    let currentStreak = 1;
    let lastDate = sortedDates[0];
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(lastDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const expectedDate = prevDate.toISOString().split('T')[0];
      if (sortedDates[i] === expectedDate) {
        currentStreak++;
        lastDate = sortedDates[i];
      } else {
        break;
      }
    }
    return currentStreak;
  };

  const getWeekDays = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - dayOfWeek);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      return d;
    });
  };

  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xs uppercase tracking-[0.3em] font-black opacity-50 text-forge-accent">
            {viewMode === 'weekly' ? 'Weekly Consistency' : 'Monthly Evolution'}
          </h2>
          <div className="flex bg-forge-border/20 rounded-sm p-0.5">
            <button 
              onClick={() => setViewMode('weekly')}
              className={cn(
                "px-3 py-1 text-[8px] uppercase font-black transition-all",
                viewMode === 'weekly' ? "bg-forge-accent text-forge-bg" : "text-forge-muted hover:text-forge-ink"
              )}
            >
              Week
            </button>
            <button 
              onClick={() => setViewMode('monthly')}
              className={cn(
                "px-3 py-1 text-[8px] uppercase font-black transition-all",
                viewMode === 'monthly' ? "bg-forge-accent text-forge-bg" : "text-forge-muted hover:text-forge-ink"
              )}
            >
              Month
            </button>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-[10px] uppercase tracking-widest font-bold hover:text-forge-accent flex items-center gap-1"
        >
          {isAdding ? <XCircle size={12} /> : <Plus size={12} />}
          {isAdding ? 'Cancel' : 'Add Habit'}
        </button>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="forge-card p-4 space-y-4">
          <input 
            type="text" 
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Habit Name"
            className="w-full bg-black border border-forge-border p-3 text-sm focus:border-forge-accent outline-none"
          />
          <div className="flex gap-2">
            {categories.map(d => (
              <button
                key={d}
                onClick={() => setNewHabitDomain(d)}
                className={cn(
                  "flex-1 py-1 text-[8px] uppercase font-bold border transition-colors",
                  newHabitDomain === d ? "bg-forge-accent border-forge-accent text-forge-bg" : "border-forge-border text-forge-muted"
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <button 
            onClick={() => {
              if (newHabitName) {
                onAdd(newHabitName, newHabitDomain);
                setNewHabitName('');
                setIsAdding(false);
              }
            }}
            className="forge-button-accent w-full py-2 text-[10px] uppercase font-black"
          >
            Forge Habit
          </button>
        </motion.div>
      )}

      {viewMode === 'weekly' ? (
        <div className="space-y-6">
          {categories.map(category => {
            const categoryHabits = habits.filter(h => h.domain === category);
            if (categoryHabits.length === 0) return null;
            return (
              <div key={category} className="space-y-4">
                <div className="text-[10px] uppercase tracking-widest font-black text-forge-accent/50 border-b border-forge-border pb-1">
                  {category}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryHabits.map(h => {
                    const streak = calculateStreak(h.completions);
                    const weekDays = getWeekDays();
                    return (
                      <div key={h.id} className="forge-card p-4 space-y-4 group/habit">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-bold">{h.name}</h3>
                            <div className="flex items-center gap-1 mt-1">
                              <Flame size={12} className={cn(streak > 0 ? "text-forge-accent" : "text-forge-muted")} />
                              <span className={cn("text-[10px] font-black", streak > 0 ? "text-forge-accent" : "text-forge-muted")}>
                                {streak} DAY STREAK
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => onToggle(h.id, formatDate(new Date()))}
                              className={cn(
                                "w-8 h-8 rounded-sm border flex items-center justify-center transition-all",
                                h.completions.includes(formatDate(new Date())) 
                                  ? "bg-forge-accent border-forge-accent text-forge-bg" 
                                  : "border-forge-border hover:border-forge-accent/50"
                              )}
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button 
                              onClick={() => onDelete(h.id)}
                              className="w-8 h-8 rounded-sm border border-forge-border flex items-center justify-center text-red-500 opacity-0 group-hover/habit:opacity-100 transition-all hover:bg-red-500/10"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
                            <div key={i} className="text-center">
                              <div className="text-[8px] uppercase opacity-50 mb-1">{day}</div>
                              <div className={cn(
                                "h-6 rounded-sm border transition-all",
                                h.completions.includes(formatDate(weekDays[i])) 
                                  ? "bg-forge-accent border-forge-accent" 
                                  : "bg-forge-border/10 border-forge-border/30"
                              )} />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-forge-border/10 p-3 rounded-sm">
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              className="p-1 hover:text-forge-accent transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[10px] uppercase font-black tracking-widest">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              className="p-1 hover:text-forge-accent transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="space-y-8">
            {habits.map(h => (
              <div key={h.id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-1 h-4",
                      h.domain === 'health' && 'bg-red-500',
                      h.domain === 'selfcare' && 'bg-blue-500',
                      h.domain === 'relationships' && 'bg-green-500',
                      h.domain === 'work' && 'bg-yellow-500'
                    )} />
                    <h3 className="text-sm font-bold uppercase tracking-tight">{h.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame size={12} className="text-forge-accent" />
                    <span className="text-[10px] font-black text-forge-accent">{calculateStreak(h.completions)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="text-[8px] font-black text-center opacity-30 py-1">{d}</div>
                  ))}
                  {getMonthDays().map((date, i) => {
                    if (!date) return <div key={`empty-${i}`} className="h-8" />;
                    const dateStr = formatDate(date);
                    const isCompleted = h.completions.includes(dateStr);
                    const isToday = dateStr === formatDate(new Date());
                    return (
                      <button
                        key={dateStr}
                        onClick={() => onToggle(h.id, dateStr)}
                        className={cn(
                          "h-8 rounded-sm border transition-all flex items-center justify-center text-[10px] font-bold",
                          isCompleted 
                            ? "bg-forge-accent border-forge-accent text-forge-bg shadow-[0_0_10px_rgba(249,115,22,0.3)]" 
                            : "border-forge-border hover:border-forge-accent/50 text-forge-muted",
                          isToday && !isCompleted && "border-forge-accent/50 animate-pulse"
                        )}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SmallPromiseCard = ({ promise, onComplete, onShare, onDelete }: { 
  promise: SmallPromise, 
  onComplete: (id: string) => void,
  onShare: (promise: SmallPromise) => void,
  onDelete: (id: string) => void
}) => {
  const isCompletedToday = promise.lastCompleted && new Date(promise.lastCompleted).toDateString() === new Date().toDateString();
  const steps = promise.steps || [promise.gateway || ''];
  const currentStepIndex = promise.currentStepIndex || 0;
  const currentStepText = steps[currentStepIndex] || promise.gateway;
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className={cn(
      "forge-card flex items-center justify-between transition-all",
      isCompletedToday && "border-forge-accent/50 bg-forge-accent/5"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-sm border flex items-center justify-center transition-colors",
          isCompletedToday ? "bg-forge-accent border-forge-accent text-forge-bg" : "border-forge-border"
        )}>
          {isCompletedToday ? <CheckCircle2 size={20} /> : <Zap size={20} className="text-forge-muted" />}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h3 className="font-bold text-sm">{currentStepText}</h3>
              <span className="text-[8px] uppercase tracking-widest opacity-50">
                {isLastStep ? `Ultimate Goal: ${promise.habit}` : `Next Step: ${steps[currentStepIndex + 1] || promise.habit}`}
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onShare(promise)}
                className="text-[8px] uppercase tracking-widest font-bold opacity-50 hover:opacity-100 hover:text-forge-accent transition-all"
              >
                Share
              </button>
              <button 
                onClick={() => onDelete(promise.id)}
                className="text-[8px] uppercase tracking-widest font-bold opacity-50 hover:opacity-100 hover:text-red-500 transition-all"
              >
                Remove
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] uppercase tracking-widest opacity-50">Streak</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-2 h-1 rounded-full",
                    i < promise.streak % 7 ? "bg-forge-accent" : "bg-forge-border"
                  )} 
                />
              ))}
            </div>
            <span className="text-[10px] font-black text-forge-accent ml-1">{promise.streak}</span>
            <div className="ml-4 flex gap-1">
              {steps.map((_, i) => (
                <div 
                  key={i}
                  className={cn(
                    "w-1 h-1 rounded-full",
                    i <= currentStepIndex ? "bg-forge-accent" : "bg-forge-border"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onComplete(promise.id)}
        disabled={!!isCompletedToday}
        className={cn(
          "px-4 py-2 text-[10px] uppercase tracking-widest font-black border transition-all",
          isCompletedToday 
            ? "border-forge-accent text-forge-accent cursor-default" 
            : "border-forge-ink hover:bg-forge-ink hover:text-forge-bg"
        )}
      >
        {isCompletedToday ? "Forged" : isLastStep ? "Final Forge" : "Next Step"}
      </button>
    </div>
  );
};

const CommunityFeed = ({ posts, onLike }: { posts: CommunityPost[], onLike: (id: string) => void }) => {
  return (
    <div className="space-y-6">
      {(posts || []).map(post => (
        <div key={post.id} className="forge-card space-y-4">
          <div className="flex items-center gap-3">
            {post.userPhoto && (
              <img src={post.userPhoto} alt={post.userName} className="w-8 h-8 rounded-full border border-forge-border" referrerPolicy="no-referrer" />
            )}
            <div>
              <div className="text-xs font-bold">{post.userName}</div>
              <div className="text-[8px] uppercase tracking-widest opacity-50">{new Date(post.timestamp).toLocaleString()}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="text-[10px] uppercase px-2 py-0.5 bg-forge-accent/20 text-forge-accent font-bold rounded-full">
              {post.type.replace('_', ' ')}
            </span>
            <p className="text-sm leading-relaxed">{post.content}</p>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-forge-border">
            <button onClick={() => onLike(post.id)} className="flex items-center gap-1 text-xs hover:text-forge-accent transition-colors">
              <Heart size={14} className={post.likes > 0 ? "fill-forge-accent text-forge-accent" : ""} />
              <span>{post.likes}</span>
            </button>
            <button className="flex items-center gap-1 text-xs opacity-50 cursor-not-allowed">
              <MessageSquare size={14} />
              <span>0</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const StoicIntervenor = ({ onUnlock, goal, reason, title }: { onUnlock: () => void, goal?: string, reason?: string, title?: string }) => {
  const [countdown, setCountdown] = useState(5);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsUnlocked(true);
    }
  }, [countdown]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-forge-bg flex flex-center items-center justify-center p-8"
    >
      <div className="max-w-md w-full space-y-12 text-center">
        <div className="flex justify-center">
          <ShieldAlert size={80} className="text-forge-accent animate-pulse" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tighter uppercase glitch-text">{title || "Conscious Choice Required"}</h1>
          <p className="text-forge-muted text-sm uppercase tracking-widest">
            {reason || "You are attempting to bypass your evolution."}
          </p>
        </div>

        {goal && (
          <div className="forge-card border-forge-accent/50 bg-forge-accent/5">
            <span className="text-[10px] uppercase tracking-widest text-forge-accent font-bold">Current Focus</span>
            <p className="text-lg font-bold mt-2">{goal}</p>
          </div>
        )}

        <div className="space-y-6">
          <p className="text-xs italic opacity-70">"The impediment to action advances action. What stands in the way becomes the way." — Marcus Aurelius</p>
          
          <div className="flex flex-col gap-4">
            <button 
              onClick={onUnlock}
              className="forge-button-accent py-4 text-sm"
            >
              I will return to my work
            </button>
            
            <button 
              disabled={!isUnlocked}
              onClick={onUnlock}
              className={cn(
                "forge-button py-4 text-sm opacity-30 hover:opacity-100 transition-opacity",
                !isUnlocked && "cursor-not-allowed"
              )}
            >
              {isUnlocked ? "I understand I am avoiding my work" : `Unlocking in ${countdown}s...`}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DisciplineSection = ({ 
  habits, 
  onLogUrge, 
  onLogRelapse,
  setToolInfo,
  onAddHabit,
  onRemoveHabit,
  newHabitName,
  setNewHabitName,
  newHabitTrigger,
  setNewHabitTrigger
}: { 
  habits: BadHabit[], 
  onLogUrge: (habitId: string) => void, 
  onLogRelapse: (habitId: string) => void,
  setToolInfo: (info: { title: string, content: string } | null) => void,
  onAddHabit: () => void,
  onRemoveHabit: (habitId: string) => void,
  newHabitName: string,
  setNewHabitName: (name: string) => void,
  newHabitTrigger: string,
  setNewHabitTrigger: (trigger: string) => void
}) => {
  return (
    <section className="space-y-4">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <h2 className="text-xs uppercase tracking-[0.3em] font-black opacity-50">Fortress of Discipline</h2>
          <button 
            onClick={() => setToolInfo({
              title: "Fortress of Discipline",
              content: "Track your resistance against bad habits. Logging an urge earns you XP and triggers a stoic intervention. A relapse resets your streak. Stay strong, Forger."
            })}
            className="text-forge-accent opacity-50 hover:opacity-100 transition-opacity"
          >
            <Info size={12} />
          </button>
        </div>
      </div>

      <div className="forge-card p-4 bg-black/20 border-dashed border-forge-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input 
            type="text" 
            placeholder="Bad Habit Name (e.g. Smoking)"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            className="bg-black/40 border border-forge-border p-2 text-[10px] uppercase font-bold text-forge-ink focus:border-forge-accent outline-none"
          />
          <input 
            type="text" 
            placeholder="Trigger (e.g. Stress)"
            value={newHabitTrigger}
            onChange={(e) => setNewHabitTrigger(e.target.value)}
            className="bg-black/40 border border-forge-border p-2 text-[10px] uppercase font-bold text-forge-ink focus:border-forge-accent outline-none"
          />
        </div>
        <button 
          onClick={onAddHabit}
          className="w-full mt-3 py-2 bg-forge-border text-[10px] uppercase font-black hover:bg-forge-accent hover:text-forge-bg transition-all"
        >
          Add Bad Habit to Fortress
        </button>
      </div>

      <div className="grid gap-3">
        {habits.map(habit => (
          <div key={habit.id} className="forge-card p-4 space-y-4 border-l-4 border-l-forge-accent bg-black/40 relative group">
            <button 
              onClick={() => onRemoveHabit(habit.id)}
              className="absolute top-2 right-2 opacity-50 sm:opacity-0 sm:group-hover:opacity-50 hover:!opacity-100 transition-opacity text-red-500"
            >
              <Trash2 size={14} />
            </button>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter">{habit.name}</h3>
                <p className="text-[10px] text-forge-muted uppercase font-bold tracking-widest">Trigger: {habit.trigger}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-forge-accent leading-none">{habit.streakDays}</div>
                <div className="text-[8px] uppercase font-bold opacity-50">Day Streak</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => onLogUrge(habit.id)}
                className="flex items-center justify-center gap-2 py-3 bg-forge-accent/10 border border-forge-accent/30 text-forge-accent text-[10px] uppercase font-black hover:bg-forge-accent hover:text-forge-bg transition-all active:scale-95"
              >
                <Shield size={14} /> Log Urge
              </button>
              <button 
                onClick={() => onLogRelapse(habit.id)}
                className="flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] uppercase font-black hover:bg-red-500 hover:text-white transition-all active:scale-95"
              >
                <AlertTriangle size={14} /> Relapsed
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const LibrarySection = ({ 
  library, 
  savedQuotes, 
  onAddBook, 
  onRemoveBook, 
  onSaveQuote, 
  onDeleteQuote,
  onShareQuote
}: { 
  library: Book[], 
  savedQuotes: SavedQuote[], 
  onAddBook: (book: Book) => void, 
  onRemoveBook: (id: string) => void,
  onSaveQuote: (quote: SavedQuote) => void,
  onDeleteQuote: (id: string) => void,
  onShareQuote: (quote: SavedQuote) => void
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'library' | 'saved'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [feedQuotes, setFeedQuotes] = useState<SavedQuote[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchBooks(searchQuery);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const loadFeed = async () => {
    if (library.length === 0) return;
    setIsGenerating(true);
    try {
      const quotes = await generateBookQuotes(library.map(b => ({ title: b.title, author: b.author })));
      setFeedQuotes(quotes.map((q: any) => ({ ...q, id: Math.random().toString(36).substr(2, 9), savedAt: Date.now() })));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'feed' && feedQuotes.length === 0 && library.length > 0) {
      loadFeed();
    }
  }, [activeTab, library]);

  return (
    <section className="space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-xs uppercase tracking-[0.3em] font-black opacity-50">Wisdom Feed</h2>
          <h1 className="text-3xl font-black tracking-tighter uppercase">The Library</h1>
        </div>
      </div>

      <div className="flex border-b border-forge-border">
        {(['feed', 'library', 'saved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-[10px] uppercase tracking-[0.3em] font-black transition-colors",
              activeTab === tab ? "text-forge-accent border-forge-accent" : "text-forge-muted border-transparent"
            )}
            style={{ borderBottomWidth: activeTab === tab ? '2px' : '0px' }}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'feed' && (
          <motion.div 
            key="feed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {library.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <BookOpen size={48} className="mx-auto text-forge-muted opacity-20" />
                <p className="text-xs uppercase tracking-widest opacity-50">Add books to your library to generate wisdom</p>
                <button onClick={() => setActiveTab('library')} className="forge-button px-4 py-2 text-[10px]">Go to Library</button>
              </div>
            ) : (
              <>
                <div className="flex justify-end">
                  <button 
                    onClick={loadFeed} 
                    disabled={isGenerating}
                    className="text-[10px] uppercase tracking-widest font-black text-forge-accent flex items-center gap-2"
                  >
                    <Sparkles size={14} className={isGenerating ? "animate-spin" : ""} />
                    {isGenerating ? "Forging Wisdom..." : "Refresh Feed"}
                  </button>
                </div>
                <div className="space-y-4">
                  {feedQuotes.map((quote) => (
                    <div key={quote.id} className="forge-card p-6 space-y-4 group relative">
                      <p className="text-lg font-serif italic leading-relaxed">"{quote.text}"</p>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-xs font-black uppercase tracking-widest">{quote.author}</div>
                          <div className="text-[10px] opacity-50 uppercase tracking-tighter">{quote.bookTitle}</div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => onShareQuote(quote)}
                            className="p-2 border border-forge-border hover:border-forge-accent text-forge-accent transition-all"
                          >
                            <Share2 size={16} />
                          </button>
                          <button 
                            onClick={() => onSaveQuote(quote)}
                            disabled={savedQuotes.some(sq => sq.text === quote.text)}
                            className={cn(
                              "p-2 border transition-all",
                              savedQuotes.some(sq => sq.text === quote.text) 
                                ? "bg-forge-accent border-forge-accent text-forge-bg" 
                                : "border-forge-border hover:border-forge-accent text-forge-accent"
                            )}
                          >
                            <Archive size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'library' && (
          <motion.div 
            key="library"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex gap-2">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for books..."
                className="flex-1 bg-black border border-forge-border p-3 text-sm focus:border-forge-accent outline-none"
              />
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="forge-button px-4"
              >
                {isSearching ? <div className="w-4 h-4 border-2 border-forge-bg border-t-transparent rounded-full animate-spin" /> : <Plus size={18} />}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] uppercase tracking-widest font-black opacity-50">Search Results</h3>
                <div className="grid grid-cols-1 gap-3">
                  {searchResults.map(book => (
                    <div key={book.id} className="forge-card p-3 flex gap-4 items-center">
                      <img src={book.coverUrl} alt={book.title} className="w-12 h-16 object-cover border border-forge-border" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{book.title}</div>
                        <div className="text-[10px] opacity-50 truncate">{book.author}</div>
                      </div>
                      <button 
                        onClick={() => {
                          onAddBook({ ...book, addedAt: Date.now() });
                          setSearchResults(prev => prev.filter(b => b.id !== book.id));
                        }}
                        disabled={library.some(b => b.id === book.id)}
                        className="p-2 border border-forge-border hover:border-forge-accent text-forge-accent transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-[10px] uppercase tracking-widest font-black opacity-50">Your Library ({library.length})</h3>
              <div className="grid grid-cols-2 gap-4">
                {library.map(book => (
                  <div key={book.id} className="forge-card p-3 space-y-3 relative group">
                    <button 
                      onClick={() => onRemoveBook(book.id)}
                      className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                    <img src={book.coverUrl} alt={book.title} className="w-full aspect-[2/3] object-cover border border-forge-border" referrerPolicy="no-referrer" />
                    <div className="space-y-1">
                      <div className="text-xs font-bold truncate">{book.title}</div>
                      <div className="text-[10px] opacity-50 truncate">{book.author}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'saved' && (
          <motion.div 
            key="saved"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {savedQuotes.length === 0 ? (
              <div className="text-center py-12 opacity-30 text-[10px] uppercase tracking-widest">No saved quotes yet</div>
            ) : (
              savedQuotes.map(quote => (
                <div key={quote.id} className="forge-card p-6 space-y-4 relative group">
                  <button 
                    onClick={() => onDeleteQuote(quote.id)}
                    className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                  <p className="text-sm font-serif italic leading-relaxed">"{quote.text}"</p>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest">{quote.author}</div>
                    <div className="text-[8px] opacity-50 uppercase tracking-tighter">{quote.bookTitle}</div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => onShareQuote(quote)}
                      className="p-2 border border-forge-border hover:border-forge-accent text-forge-accent transition-all"
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const TractionHUD = ({ state, onAcknowledge }: { state: ForgeState, onAcknowledge: () => void }) => {
  const today = new Date().toISOString().split('T')[0];
  const userName = auth.currentUser?.displayName?.split(' ')[0] || 'Seeker';

  const quotes = [
    "The forge is hot. It's time to shape your destiny.",
    "Small wins are the building blocks of a new identity.",
    "Consistency is the only superpower that matters.",
    "Your future self is waiting for you to take the first step.",
    "Discipline is choosing between what you want now and what you want most.",
    "The only way to predict the future is to create it.",
    "Action is the antidote to anxiety.",
    "Focus on the process, and the results will follow."
  ];

  const randomQuote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

  const level = useMemo(() => {
    const lvl = Math.floor(Math.sqrt(state.identityPoints / 100));
    return Math.min(100, lvl);
  }, [state.identityPoints]);

  const xpForCurrentLevel = Math.pow(level, 2) * 100;
  const xpForNextLevel = Math.pow(level + 1, 2) * 100;
  const progressToNext = level === 100 ? 100 : ((state.identityPoints - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
  
  const balance = useMemo(() => {
    const scores = { health: 0, selfcare: 0, relationships: 0, work: 0 };
    
    // Small Promises
    state.smallPromises.forEach(p => {
      if (p.lastCompleted && new Date(p.lastCompleted).toDateString() === new Date().toDateString()) {
        scores[p.domain] += 1;
      }
    });
    
    // Monthly Habits
    state.monthlyHabits.forEach(h => {
      if (h.completions.includes(today)) {
        scores[h.domain] += 1;
      }
    });
    
    // Sprints
    state.sprints.forEach(s => {
      if (s.status === 'active') {
        const dayIndex = Math.floor((Date.now() - s.startDate) / (1000 * 60 * 60 * 24));
        if (s.completedDays.includes(dayIndex)) {
          scores[s.domain] += 2; // Sprints carry more weight
        }
      }
    });
    
    // Goals
    state.goals.forEach(g => {
      const completedToday = g.tasks.filter(t => t.completed && new Date(t.createdAt).toDateString() === new Date().toDateString()).length;
      scores[g.domain] += completedToday * 0.5;
    });

    // Daily Plan
    state.dailyPlan.forEach(item => {
      if (item.lastCompleted && new Date(item.lastCompleted).toDateString() === new Date().toDateString()) {
        scores[item.domain] += 1;
      }
    });

    const total = scores.health + scores.selfcare + scores.relationships + scores.work || 1;
    const selfScore = scores.health + scores.selfcare;
    
    return {
      health: (scores.health / total) * 100,
      selfcare: (scores.selfcare / total) * 100,
      self: (selfScore / total) * 100,
      relationships: (scores.relationships / total) * 100,
      work: (scores.work / total) * 100,
      raw: scores
    };
  }, [state]);

  const tractionScore = useMemo(() => {
    const totalPossible = 5; 
    const totalDone = balance.raw.health + balance.raw.selfcare + balance.raw.relationships + balance.raw.work;
    return Math.min(Math.round((totalDone / totalPossible) * 100), 100);
  }, [balance]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-8 space-y-12"
    >
      <div className="text-center space-y-4">
        <div className="space-y-1">
          <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-forge-accent">Pre-Flight HUD</h2>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Trinity Balance</h1>
        </div>
        <div className="space-y-1">
          <p className="text-lg font-bold">Hello, {userName}</p>
          <p className="text-[10px] uppercase tracking-widest text-forge-muted italic max-w-xs mx-auto">"{randomQuote}"</p>
        </div>
      </div>

        <div className="grid grid-cols-5 gap-4 w-full max-w-md">
          <div className="text-center">
            <div className="text-xl font-black">{Math.round(balance.health)}%</div>
            <div className="text-[8px] uppercase opacity-50">Health</div>
          </div>
          <div className="text-center border-l border-forge-border">
            <div className="text-xl font-black">{Math.round(balance.selfcare)}%</div>
            <div className="text-[8px] uppercase opacity-50">Selfcare</div>
          </div>
          <div className="text-center border-l border-forge-border">
            <div className="text-xl font-black">{Math.round(balance.work)}%</div>
            <div className="text-[8px] uppercase opacity-50">Work</div>
          </div>
          <div className="text-center border-l border-forge-border">
            <div className="text-xl font-black">{Math.round(balance.relationships)}%</div>
            <div className="text-[8px] uppercase opacity-50">Social</div>
          </div>
          <div className="text-center border-l border-forge-border">
            <div className="text-xl font-black">{state.financialGoals.length > 0 ? Math.round(state.financialGoals.reduce((acc, g) => acc + (g.currentAmount / g.targetAmount), 0) / state.financialGoals.length * 100) : 0}%</div>
            <div className="text-[8px] uppercase opacity-50">Wealth</div>
          </div>
        </div>

      <div className="space-y-6 w-full max-w-xs">
        <div className="flex justify-between items-end">
          <div className="text-[10px] uppercase font-bold opacity-50">Traction Score</div>
          <div className="text-3xl font-black text-forge-accent">{tractionScore}%</div>
        </div>
        <div className="h-1 bg-forge-border w-full rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${tractionScore}%` }}
            className="h-full bg-forge-accent"
          />
        </div>
      <div className="flex justify-between items-center text-[10px] uppercase font-bold">
          <div className="flex items-center gap-2">
            <span className="opacity-50">Identity Level</span>
            <span className="text-forge-accent font-black">LVL {level}</span>
          </div>
          <span className="text-forge-accent">{state.identityPoints} XP</span>
        </div>
        <div className="h-1 bg-forge-border w-full rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressToNext}%` }}
            className="h-full bg-forge-accent"
          />
        </div>
        {level < 100 && (
          <div className="text-[8px] uppercase tracking-widest text-forge-muted text-right">
            {Math.ceil(xpForNextLevel - state.identityPoints)} XP to next level
          </div>
        )}

        {/* Active Goals Connection */}
        <div className="pt-4 border-t border-forge-border space-y-3">
          <div className="text-[8px] uppercase tracking-[0.3em] font-black opacity-50 text-center">Active Objectives</div>
          <div className="grid grid-cols-1 gap-2">
            {state.goals.filter(g => g.status === 'active').slice(0, 2).map(g => (
              <div key={g.id} className="border border-forge-border p-2 flex justify-between items-center bg-white/5 rounded-sm">
                <span className="text-[10px] font-bold truncate pr-4">{g.title}</span>
                <span className="text-[8px] uppercase tracking-widest text-forge-accent font-black">{g.domain}</span>
              </div>
            ))}
            {state.goals.filter(g => g.status === 'active').length === 0 && (
              <div className="text-[8px] text-forge-muted text-center italic">No active objectives defined.</div>
            )}
          </div>
        </div>
      </div>

      <button 
        onClick={onAcknowledge}
        className="forge-button-accent w-full max-w-xs py-4 flex items-center justify-center gap-2 group"
      >
        Enter The Forge <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
};

const INITIAL_FORGE_STATE: ForgeState = {
  avatarState: 'depleted',
  sprints: [],
  smallPromises: [],
  monthlyHabits: [
    // Health
    { id: 'mh1', name: 'Drank 4 glasses water', completions: [], createdAt: Date.now(), domain: 'health' },
    { id: 'mh2', name: 'Took vitamins/supplements', completions: [], createdAt: Date.now(), domain: 'health' },
    { id: 'mh3', name: 'Slept 8 hours last night', completions: [], createdAt: Date.now(), domain: 'health' },
    { id: 'mh4', name: 'Performed skincare regime', completions: [], createdAt: Date.now(), domain: 'health' },
    { id: 'mh5', name: 'Avoided screens after 10pm', completions: [], createdAt: Date.now(), domain: 'health' },
    // Self-Care
    { id: 'msc1', name: 'Prepared home-cooked meal', completions: [], createdAt: Date.now(), domain: 'selfcare' },
    { id: 'msc2', name: 'Recited self-affirmations', completions: [], createdAt: Date.now(), domain: 'selfcare' },
    { id: 'msc3', name: 'Took enough breaks at work', completions: [], createdAt: Date.now(), domain: 'selfcare' },
    // Relationships
    { id: 'mr1', name: 'Told partner "I love you"', completions: [], createdAt: Date.now(), domain: 'relationships' },
    { id: 'mr2', name: 'Spent time with kids', completions: [], createdAt: Date.now(), domain: 'relationships' },
    { id: 'mr3', name: 'Showed vulnerability', completions: [], createdAt: Date.now(), domain: 'relationships' },
    { id: 'mr4', name: 'Showed gratitude', completions: [], createdAt: Date.now(), domain: 'relationships' },
    // Work
    { id: 'mw1', name: 'Contributed in meetings', completions: [], createdAt: Date.now(), domain: 'work' },
    { id: 'mw2', name: 'Arrived on time', completions: [], createdAt: Date.now(), domain: 'work' },
    { id: 'mw3', name: 'Complimented coworker', completions: [], createdAt: Date.now(), domain: 'work' },
  ],
  goals: [],
  highlights: [],
  lastIntervention: null,
  identityPoints: 0,
  dailyPlan: [
    { id: 'dp-health', domain: 'health', behaviour: '', time: '', location: '', streak: 0, lastCompleted: null },
    { id: 'dp-work', domain: 'work', behaviour: '', time: '', location: '', streak: 0, lastCompleted: null },
    { id: 'dp-relationships', domain: 'relationships', behaviour: '', time: '', location: '', streak: 0, lastCompleted: null },
  ],
  reflections: [],
  transactions: [],
  financialGoals: [],
  badHabits: [
    { id: 'bh1', name: 'Smoking', trigger: 'PC Work', lastRelapse: null, streakDays: 0, totalRelapses: 0, createdAt: Date.now() },
    { id: 'bh2', name: 'Alcohol', trigger: 'Social Events', lastRelapse: null, streakDays: 0, totalRelapses: 0, createdAt: Date.now() }
  ],
  urgeLogs: [],
  library: [],
  savedQuotes: [],
  notificationsEnabled: false
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [friendActionFeedback, setFriendActionFeedback] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'goals' | 'community' | 'preflight' | 'wealth' | 'settings' | 'daily-review' | 'library'>('preflight');
  const [dailyReviewQueue, setDailyReviewQueue] = useState<Highlight[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [toolInfo, setToolInfo] = useState<{ title: string, content: string } | null>(null);
  const [showSprintHistory, setShowSprintHistory] = useState(false);
  const [showNewSprintForm, setShowNewSprintForm] = useState(false);
  const [isIntervening, setIsIntervening] = useState(false);
  const [interventionTitle, setInterventionTitle] = useState<string>('');
  const [interventionReason, setInterventionReason] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [state, setState] = useState<ForgeState>(INITIAL_FORGE_STATE);
  const [newBadHabitName, setNewBadHabitName] = useState('');
  const [newBadHabitTrigger, setNewBadHabitTrigger] = useState('');

  const [newHighlight, setNewHighlight] = useState<{ text: string, source: string, domain: Domain }>({ text: '', source: '', domain: 'work' });
  const [sprintSource, setSprintSource] = useState<'manual' | 'saved' | 'book'>('manual');
  const [newGoal, setNewGoal] = useState<{ title: string, description: string, domain: Domain }>({ title: '', description: '', domain: 'work' });
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDomain, setNewHabitDomain] = useState<Domain>('health');

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      
      if (u) {
        // Sync profile to Firestore
        const userRef = doc(db, 'users', u.uid);
        setDoc(userRef, {
          uid: u.uid,
          displayName: u.displayName || 'Anonymous',
          photoURL: u.photoURL || '',
          joinedAt: Date.now()
        }, { merge: true }).catch(e => handleFirestoreError(e, OperationType.WRITE, 'users'));

        // Load state from Firestore
        const stateRef = doc(db, 'users', u.uid, 'data', 'state');
        try {
          const docSnap = await getDoc(stateRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as ForgeState;
            setState(prev => {
              const mergedPromises = (data.smallPromises || []).map((p: any) => ({
                ...p,
                steps: p.steps || [p.gateway || ''],
                currentStepIndex: p.currentStepIndex || 0
              }));
              INITIAL_FORGE_STATE.smallPromises.forEach(defaultPromise => {
                if (!mergedPromises.find(p => p.habit === defaultPromise.habit)) {
                  mergedPromises.push(defaultPromise);
                }
              });

              const mergedMonthlyHabits = [...(data.monthlyHabits || [])];
              INITIAL_FORGE_STATE.monthlyHabits.forEach(defaultHabit => {
                if (!mergedMonthlyHabits.find(h => h.name === defaultHabit.name)) {
                  mergedMonthlyHabits.push(defaultHabit);
                }
              });

              // Migration: Replace old "Porn" habit with "Alcohol" if it exists
              const mergedBadHabits = (data.badHabits || []).map(h => {
                if (h.name === 'Porn/Masturbation') {
                  return { ...h, name: 'Alcohol', trigger: 'Social Events' };
                }
                return h;
              });

              // Ensure default habits exist
              INITIAL_FORGE_STATE.badHabits.forEach(defaultHabit => {
                if (!mergedBadHabits.find(h => h.name === defaultHabit.name)) {
                  mergedBadHabits.push(defaultHabit);
                }
              });

              return { 
                ...prev, 
                ...data, 
                smallPromises: mergedPromises, 
                monthlyHabits: mergedMonthlyHabits,
                badHabits: mergedBadHabits,
                library: data.library || [],
                savedQuotes: data.savedQuotes || []
              };
            });
          } else {
            // Check localStorage for this specific user
            const saved = localStorage.getItem(`forge_state_${u.uid}`);
            if (saved) {
              setState(JSON.parse(saved));
            } else {
              // New user!
              setState(INITIAL_FORGE_STATE);
              setShowOnboarding(true);
            }
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, `users/${u.uid}/data/state`);
        }
      } else {
        // Logged out
        setState(INITIAL_FORGE_STATE);
      }
    });
    return () => unsubscribe();
  }, []);

  // Community Feed & Friends Listener
  useEffect(() => {
    if (!user) return;
    
    const qFriends = query(collection(db, 'friendships'), where('users', 'array-contains', user.uid));
    const unsubFriends = onSnapshot(qFriends, async (snapshot) => {
      const friendUids = snapshot.docs
        .filter(doc => doc.data().status === 'accepted')
        .map(doc => {
          const data = doc.data();
          return data.users.find((id: string) => id !== user.uid);
        })
        .filter(Boolean);
      
      if (friendUids.length > 0) {
        // Fetch friend profiles
        const qProfiles = query(collection(db, 'users'), where('uid', 'in', friendUids.slice(0, 10)));
        const profileSnap = await getDocs(qProfiles);
        setFriends(profileSnap.docs.map(doc => doc.data() as UserProfile));
      } else {
        setFriends([]);
      }

      // Fetch posts from friends + self
      const allowedUids = [user.uid, ...friendUids].slice(0, 10);
      const qPosts = query(
        collection(db, 'posts'), 
        where('userId', 'in', allowedUids),
        orderBy('timestamp', 'desc'), 
        limit(50)
      );
      
      const unsubPosts = onSnapshot(qPosts, (snapshot) => {
        const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityPost));
        setPosts(newPosts);
      }, (e) => handleFirestoreError(e, OperationType.LIST, 'posts'));

      return () => unsubPosts();
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'friendships'));

    return () => unsubFriends();
  }, [user]);

  // Friend Requests Listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'friendships'), where('users', 'array-contains', user.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const pendingRequests = snapshot.docs.filter(doc => doc.data().status === 'pending' && doc.data().requestedBy !== user.uid);
      
      const requestsWithProfiles = await Promise.all(pendingRequests.map(async (requestDoc) => {
        const data = requestDoc.data();
        const requesterUid = data.requestedBy;
        const profileSnap = await getDoc(doc(db, 'users', requesterUid));
        return {
          id: requestDoc.id,
          ...data,
          requesterProfile: profileSnap.exists() ? profileSnap.data() as UserProfile : null
        };
      }));
      
      setFriendRequests(requestsWithProfiles);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;
    try {
      const q = query(collection(db, 'users'), where('displayName', '>=', searchQuery), where('displayName', '<=', searchQuery + '\uf8ff'), limit(10));
      const snapshot = await getDocs(q);
      setSearchResults(snapshot.docs.map(doc => doc.data() as UserProfile).filter(u => u.uid !== user?.uid));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'users');
    }
  };

  const handleAddFriend = async (targetUid: string) => {
    if (!user) return;
    try {
      const friendshipId = [user.uid, targetUid].sort().join('_');
      await setDoc(doc(db, 'friendships', friendshipId), {
        users: [user.uid, targetUid],
        status: 'pending',
        timestamp: Date.now(),
        requestedBy: user.uid
      });
      setFriendActionFeedback("Friend request sent!");
      setTimeout(() => setFriendActionFeedback(null), 3000);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'friendships');
    }
  };

  const handleAcceptFriend = async (friendshipId: string) => {
    try {
      await updateDoc(doc(db, 'friendships', friendshipId), { status: 'accepted' });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'friendships');
    }
  };

  const handleAddBook = (book: Book) => {
    setState(prev => ({
      ...prev,
      library: [book, ...(prev.library || [])]
    }));
  };

  const handleRemoveBook = (id: string) => {
    setState(prev => ({
      ...prev,
      library: (prev.library || []).filter(b => b.id !== id)
    }));
  };

  const handleSaveQuote = (quote: SavedQuote) => {
    setState(prev => ({
      ...prev,
      savedQuotes: [quote, ...(prev.savedQuotes || [])]
    }));
  };

  const handleDeleteQuote = (id: string) => {
    setState(prev => ({
      ...prev,
      savedQuotes: (prev.savedQuotes || []).filter(q => q.id !== id)
    }));
  };

  const handleShareQuote = (quote: SavedQuote) => {
    shareToCommunity('insight', `Wisdom from ${quote.bookTitle} by ${quote.author}: "${quote.text}"`);
  };

  useEffect(() => {
    // Reset small promise steps if it's a new day
    const today = new Date().toDateString();
    setState(prev => {
      const needsReset = prev.smallPromises.some(p => {
        const lastActionDate = p.lastCompleted ? new Date(p.lastCompleted).toDateString() : null;
        const currentStepIndex = p.currentStepIndex || 0;
        return lastActionDate !== today && currentStepIndex !== 0;
      });

      if (!needsReset) return prev;

      return {
        ...prev,
        smallPromises: prev.smallPromises.map(p => {
          const lastActionDate = p.lastCompleted ? new Date(p.lastCompleted).toDateString() : null;
          if (lastActionDate !== today) {
            return { ...p, currentStepIndex: 0 };
          }
          return p;
        })
      };
    });
  }, []);

  // Update Bad Habit Streaks
  useEffect(() => {
    if (!state.badHabits || state.badHabits.length === 0) return;
    
    const now = Date.now();
    let changed = false;
    const updatedHabits = state.badHabits.map(h => {
      const start = h.lastRelapse || h.createdAt;
      const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
      if (days !== h.streakDays) {
        changed = true;
        return { ...h, streakDays: days };
      }
      return h;
    });

    if (changed) {
      setState(prev => ({ ...prev, badHabits: updatedHabits }));
    }
  }, [state.badHabits]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`forge_state_${user.uid}`, JSON.stringify(state));
      const stateRef = doc(db, 'users', user.uid, 'data', 'state');
      const timeoutId = setTimeout(() => {
        setDoc(stateRef, state, { merge: true }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/data/state`));
      }, 2000);
      return () => clearTimeout(timeoutId);
    }

    const totalStreak = state.smallPromises.reduce((acc, p) => acc + p.streak, 0);
    const activeSprints = state.sprints.filter(s => s.status === 'active').length;
    
    let newState: AvatarState = 'depleted';
    if (totalStreak > 10 || activeSprints > 2) newState = 'aligned';
    else if (totalStreak > 3 || activeSprints > 0) newState = 'aligning';
    
    if (newState !== state.avatarState) {
      setState(prev => ({ ...prev, avatarState: newState }));
    }
  }, [state, user]);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      setError(JSON.stringify(e));
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem(`forge_state_${user?.uid}`);
    signOut(auth);
    setState(INITIAL_FORGE_STATE);
  };

  const shareToCommunity = async (type: CommunityPost['type'], content: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        type,
        content,
        timestamp: Date.now(),
        likes: 0
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'posts');
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, { likes: increment(1) });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'posts');
    }
  };

  const startDailyReview = () => {
    if (state.highlights.length === 0) return;
    // Simple random selection for now, could be improved with spaced repetition logic
    const shuffled = [...state.highlights].sort(() => 0.5 - Math.random());
    setDailyReviewQueue(shuffled.slice(0, 5));
    setCurrentReviewIndex(0);
    setView('daily-review');
  };

  const handleReviewAction = async (action: 'keep' | 'archive' | 'forge') => {
    const currentHighlight = dailyReviewQueue[currentReviewIndex];
    if (!currentHighlight) return;

    if (action === 'archive') {
      setState(prev => ({
        ...prev,
        highlights: prev.highlights.filter(h => h.id !== currentHighlight.id)
      }));
    } else if (action === 'keep') {
      setState(prev => ({
        ...prev,
        highlights: prev.highlights.map(h => 
          h.id === currentHighlight.id ? { ...h, lastReviewed: Date.now() } : h
        )
      }));
    } else if (action === 'forge') {
      setIsGenerating(true);
      try {
        const result = await generateSprintFromHighlight(currentHighlight.text, currentHighlight.source);
        const sprint: Sprint = {
          id: Math.random().toString(36).substr(2, 9),
          source: currentHighlight.source,
          highlight: currentHighlight.text,
          principle: result.principle,
          challenge: result.challenge,
          durationDays: result.durationDays,
          startDate: Date.now(),
          completedDays: [],
          status: 'active',
          domain: 'work' // Default domain
        };
        setState(prev => ({
          ...prev,
          sprints: [sprint, ...prev.sprints],
          highlights: prev.highlights.map(h => 
            h.id === currentHighlight.id ? { ...h, lastReviewed: Date.now() } : h
          ),
          identityPoints: prev.identityPoints + 50
        }));
      } catch (error) {
        console.error("Failed to forge from review:", error);
      } finally {
        setIsGenerating(false);
      }
    }

    if (currentReviewIndex < dailyReviewQueue.length - 1) {
      setCurrentReviewIndex(prev => prev + 1);
    } else {
      setView('dashboard');
      setDailyReviewQueue([]);
    }
  };

  const handleBulkImport = async () => {
    if (!importText.trim()) return;
    setIsGenerating(true);
    setImportError(null);
    try {
      const results = await parseBulkHighlights(importText);
      if (results && Array.isArray(results)) {
        if (results.length === 0) {
          setImportError("No highlights found in the text. Make sure they follow the format: \"Quote\" — Source");
          return;
        }
        const newHighlights = results.map((r: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          text: r.text,
          source: r.source,
          date: Date.now()
        }));
        setState(prev => ({
          ...prev,
          highlights: [...newHighlights, ...prev.highlights]
        }));
        setShowImportModal(false);
        setImportText('');
      } else if (results && results.error) {
        setImportError(results.error);
      } else {
        setImportError("Failed to parse highlights. Please try a smaller selection of text.");
      }
    } catch (error) {
      console.error("Import failed:", error);
      setImportError("Something went wrong during the import. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSprint = async () => {
    if (!newHighlight.text || !newHighlight.source) return;
    setIsGenerating(true);
    try {
      const result = await generateSprintFromHighlight(newHighlight.text, newHighlight.source);
      const sprint: Sprint = {
        id: Math.random().toString(36).substr(2, 9),
        source: newHighlight.source,
        highlight: newHighlight.text,
        principle: result.principle,
        challenge: result.challenge,
        durationDays: result.durationDays,
        startDate: Date.now(),
        completedDays: [],
        status: 'active',
        domain: newHighlight.domain
      };
      setState(prev => ({
        ...prev,
        sprints: [sprint, ...prev.sprints],
        highlights: [{ id: sprint.id, text: sprint.highlight, source: sprint.source, date: Date.now() }, ...prev.highlights],
        identityPoints: prev.identityPoints + 50
      }));
      setNewHighlight({ text: '', source: '', domain: 'work' });
      setView('dashboard');
    } catch (error) {
      console.error("Failed to generate sprint:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteDay = (id: string, day: number) => {
    setState(prev => {
      const updatedSprints = prev.sprints.map(s => {
        if (s.id === id) {
          const newCompleted = [...s.completedDays, day];
          const isFinished = newCompleted.length === s.durationDays;
          if (isFinished) {
            shareToCommunity('sprint_completed', `Forged a new principle: ${s.principle}`);
          }
          return { ...s, completedDays: newCompleted, status: (isFinished ? 'completed' : 'active') as 'completed' | 'active' };
        }
        return s;
      });
      return { ...prev, sprints: updatedSprints, identityPoints: prev.identityPoints + 50 };
    });
  };

  const handleToggleMonthly = (id: string, dateStr: string) => {
    setState(prev => ({
      ...prev,
      monthlyHabits: prev.monthlyHabits.map(h => {
        if (h.id === id) {
          const completions = h.completions.includes(dateStr)
            ? h.completions.filter(d => d !== dateStr)
            : [...h.completions, dateStr];
          return { ...h, completions };
        }
        return h;
      }),
      identityPoints: prev.identityPoints + 10
    }));
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Login failed:", e);
    }
  };

  const handleAddGoal = () => {
    if (!newGoal.title) return;
    const goal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      title: newGoal.title,
      description: newGoal.description,
      tasks: [],
      createdAt: Date.now(),
      status: 'active',
      domain: newGoal.domain
    };
    setState(prev => ({ ...prev, goals: [goal, ...prev.goals] }));
    setNewGoal({ title: '', description: '', domain: 'work' });
    
    if (state.notificationsEnabled) {
      sendNotification("Objective Forged", `You've committed to: ${goal.title}. Stay focused!`);
    }
  };

  const handleRequestNotifications = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support notifications.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setState(prev => ({ ...prev, notificationsEnabled: true }));
      sendNotification("Notifications Enabled", "You will now receive reminders for your daily intentions and goals.");
    } else {
      alert("Permission denied. Please enable notifications in your browser settings.");
    }
  };

  const sendNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body,
            icon: 'https://picsum.photos/seed/forge/192/192',
            badge: 'https://picsum.photos/seed/forge/192/192'
          });
        });
      } else {
        new Notification(title, { body });
      }
    }
  };

  const handleAddTask = (goalId: string, text: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id === goalId) {
          const task: Task = { id: Math.random().toString(36).substr(2, 9), text, completed: false, createdAt: Date.now() };
          return { ...g, tasks: [...g.tasks, task] };
        }
        return g;
      }),
      identityPoints: prev.identityPoints + 5
    }));
  };

  const handleToggleTask = (goalId: string, taskId: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id === goalId) {
          const updatedTasks = g.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
          const allDone = updatedTasks.length > 0 && updatedTasks.every(t => t.completed);
          if (allDone && g.status !== 'achieved') {
            shareToCommunity('goal_achieved', `Achieved major goal: ${g.title}`);
          }
          return { ...g, tasks: updatedTasks, status: allDone ? 'achieved' : 'active' };
        }
        return g;
      }),
      identityPoints: prev.identityPoints + 10
    }));
  };

  const handleCompleteSmallPromise = (id: string) => {
    setState(prev => {
      const updatedPromises = prev.smallPromises.map(p => {
        if (p.id === id) {
          const isCompletedToday = p.lastCompleted && new Date(p.lastCompleted).toDateString() === new Date().toDateString();
          if (isCompletedToday) return p;
          
          const steps = p.steps || [p.gateway || ''];
          const currentStepIndex = p.currentStepIndex || 0;
          const isLastStep = currentStepIndex === steps.length - 1;

          if (isLastStep) {
            return { ...p, streak: p.streak + 1, lastCompleted: Date.now() };
          } else {
            return { ...p, currentStepIndex: currentStepIndex + 1 };
          }
        }
        return p;
      });

      if (state.notificationsEnabled) {
        const promise = prev.smallPromises.find(p => p.id === id);
        if (promise) {
          sendNotification("Victory!", `You've completed a step for: ${promise.habit}. Keep going!`);
        }
      }

      return { ...prev, smallPromises: updatedPromises, identityPoints: prev.identityPoints + 20 };
    });
  };

  const handleDeleteSmallPromise = (id: string) => {
    setState(prev => ({
      ...prev,
      smallPromises: prev.smallPromises.filter(p => p.id !== id)
    }));
  };

  const [newPromiseHabit, setNewPromiseHabit] = useState('');
  const [newPromiseGateway, setNewPromiseGateway] = useState('');
  const [newPromiseDomain, setNewPromiseDomain] = useState<Domain>('health');
  const [suggestedSteps, setSuggestedSteps] = useState<string[]>([]);
  const [isGeneratingGateway, setIsGeneratingGateway] = useState(false);

  const handleGenerateGateway = async () => {
    if (!newPromiseHabit) return;
    setIsGeneratingGateway(true);
    setError(null);
    try {
      const { gateway, steps } = await generateGatewayHabit(newPromiseHabit);
      setNewPromiseGateway(gateway);
      setSuggestedSteps(steps);
    } catch (error: any) {
      console.error("Error generating gateway:", error);
      const errorMsg = error?.message || "AI Forge failed to connect";
      setError(`${errorMsg}. Please check your connection.`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsGeneratingGateway(false);
    }
  };

  const handleLogUrge = async (habitId: string) => {
    if (!user) return;
    
    const now = Date.now();
    const today = new Date(now).toDateString();
    
    // Check if already logged today for this habit
    const alreadyLoggedToday = (state.urgeLogs || []).some(log => 
      log.habitId === habitId && 
      log.outcome === 'resisted' && 
      new Date(log.timestamp).toDateString() === today
    );

    const newUrge: UrgeLog = {
      id: Math.random().toString(36).substr(2, 9),
      habitId,
      timestamp: now,
      intensity: 5,
      outcome: 'resisted'
    };

    const updatedUrgeLogs = [...(state.urgeLogs || []), newUrge];
    
    // Reward for resisting
    const updatedPoints = state.identityPoints + 15;
    
    // Update streak if not already logged today
    const updatedHabits = (state.badHabits || []).map(h => {
      if (h.id === habitId && !alreadyLoggedToday) {
        return { ...h, streakDays: h.streakDays + 1 };
      }
      return h;
    });
    
    const newState = { 
      ...state, 
      urgeLogs: updatedUrgeLogs,
      identityPoints: updatedPoints,
      badHabits: updatedHabits
    };
    
    setState(newState);
    if (user) {
      const stateRef = doc(db, 'users', user.uid, 'data', 'state');
      await setDoc(stateRef, newState, { merge: true }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/data/state`));
    }
    
    // Trigger a stoic quote or intervention
    setInterventionTitle("Discipline Reinforced");
    setInterventionReason("Discipline is the bridge between goals and accomplishment. You have chosen the harder path. Stay the course.");
    setIsIntervening(true);
  };

  const handleLogRelapse = async (habitId: string) => {
    if (!user) return;
    
    const updatedHabits = (state.badHabits || []).map(h => {
      if (h.id === habitId) {
        return {
          ...h,
          lastRelapse: Date.now(),
          streakDays: 0,
          totalRelapses: h.totalRelapses + 1
        };
      }
      return h;
    });

    const newUrge: UrgeLog = {
      id: Math.random().toString(36).substr(2, 9),
      habitId,
      timestamp: Date.now(),
      intensity: 8,
      outcome: 'relapsed'
    };

    const updatedUrgeLogs = [...(state.urgeLogs || []), newUrge];
    
    const newState = { 
      ...state, 
      badHabits: updatedHabits,
      urgeLogs: updatedUrgeLogs
    };
    
    setState(newState);
    if (user) {
      const stateRef = doc(db, 'users', user.uid, 'data', 'state');
      await setDoc(stateRef, newState, { merge: true }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/data/state`));
    }
  };

  const handleAddBadHabit = async () => {
    if (!user || !newBadHabitName.trim()) return;
    
    const newHabit: BadHabit = {
      id: Math.random().toString(36).substr(2, 9),
      name: newBadHabitName,
      trigger: newBadHabitTrigger || 'Unknown',
      lastRelapse: null,
      streakDays: 0,
      totalRelapses: 0,
      createdAt: Date.now()
    };
    
    const newState = {
      ...state,
      badHabits: [...(state.badHabits || []), newHabit]
    };
    
    setState(newState);
    setNewBadHabitName('');
    setNewBadHabitTrigger('');
    
    if (user) {
      const stateRef = doc(db, 'users', user.uid, 'data', 'state');
      await setDoc(stateRef, newState, { merge: true }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/data/state`));
    }
  };

  const handleRemoveBadHabit = async (habitId: string) => {
    if (!user) return;
    
    const newState = {
      ...state,
      badHabits: (state.badHabits || []).filter(h => h.id !== habitId)
    };
    
    setState(newState);
    
    if (user) {
      const stateRef = doc(db, 'users', user.uid, 'data', 'state');
      await setDoc(stateRef, newState, { merge: true }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/data/state`));
    }
  };

  const handleAddSmallPromise = () => {
    if (!newPromiseHabit || !newPromiseGateway) return;
    
    const steps = [newPromiseGateway, ...suggestedSteps];
    if (steps[steps.length - 1] !== newPromiseHabit) {
      steps.push(newPromiseHabit);
    }

    const promise: SmallPromise = {
      id: Math.random().toString(36).substr(2, 9),
      habit: newPromiseHabit,
      gateway: newPromiseGateway,
      steps: steps,
      currentStepIndex: 0,
      streak: 0,
      lastCompleted: null,
      createdAt: Date.now(),
      domain: newPromiseDomain
    };
    setState(prev => ({ ...prev, smallPromises: [...prev.smallPromises, promise] }));
    setNewPromiseHabit('');
    setNewPromiseGateway('');
    setSuggestedSteps([]);
    
    if (state.notificationsEnabled) {
      sendNotification("Intention Forged", `You've committed to: ${promise.habit}. Start small!`);
    }
  };

  const handleAddTransaction = (type: 'income' | 'expense', amount: number, category: string) => {
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      amount,
      category,
      timestamp: Date.now()
    };

    setState(prev => {
      const newTransactions = [...prev.transactions, transaction];
      
      // Update financial goals based on allocation rules
      const newGoals = prev.financialGoals.map(goal => {
        if (goal.allocationRule.type === type) {
          const allocation = (amount * goal.allocationRule.percentage) / 100;
          return { ...goal, currentAmount: goal.currentAmount + allocation };
        }
        return goal;
      });

      return {
        ...prev,
        transactions: newTransactions,
        financialGoals: newGoals,
        identityPoints: prev.identityPoints + 10
      };
    });
  };

  const handleAddFinancialGoal = (title: string, target: number, ruleType: 'income' | 'expense', percentage: number) => {
    const goal: FinancialGoal = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      targetAmount: target,
      allocationRule: {
        type: ruleType,
        percentage
      },
      currentAmount: 0,
      createdAt: Date.now()
    };

    setState(prev => ({
      ...prev,
      financialGoals: [...prev.financialGoals, goal]
    }));
  };

  const handleDeleteTransaction = (id: string) => {
    setState(prev => {
      const transaction = prev.transactions.find(t => t.id === id);
      if (!transaction) return prev;

      // Revert goal progress
      const newGoals = prev.financialGoals.map(goal => {
        if (goal.allocationRule.type === transaction.type) {
          const allocation = (transaction.amount * goal.allocationRule.percentage) / 100;
          return { ...goal, currentAmount: Math.max(0, goal.currentAmount - allocation) };
        }
        return goal;
      });

      return {
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id),
        financialGoals: newGoals
      };
    });
  };

  const handleDeleteFinancialGoal = (id: string) => {
    setState(prev => ({
      ...prev,
      financialGoals: prev.financialGoals.filter(g => g.id !== id)
    }));
  };

  const handleSaveReflection = async (improvement: string, mistake: string) => {
    try {
      const result = await generateChallengeFromReflection(improvement, mistake);
      const reflection: DailyReflection = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        improvement,
        mistake,
        challenge: result.challenge,
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        reflections: [...prev.reflections, reflection],
        identityPoints: prev.identityPoints + 50
      }));

      shareToCommunity('insight', `Logged daily reflection. Tomorrow's challenge: ${result.challenge}`);
    } catch (error) {
      console.error("Failed to save reflection:", error);
    }
  };

  const handleDeleteReflection = async (id: string) => {
    setState(prev => ({
      ...prev,
      reflections: prev.reflections.filter(r => r.id !== id)
    }));
  };

  const handleToggleChallenge = async (id: string, completed: boolean) => {
    setState(prev => ({
      ...prev,
      reflections: prev.reflections.map(r => 
        r.id === id ? { ...r, challengeCompleted: completed } : r
      ),
      identityPoints: prev.identityPoints + (completed ? 100 : 0)
    }));
    
    if (completed) {
      shareToCommunity('insight', `Conquered my daily challenge! Mastery is built in the small wins.`);
    }
  };

  const handleCompleteDailyPlan = (id: string) => {
    setState(prev => ({
      ...prev,
      dailyPlan: prev.dailyPlan.map(item => {
        if (item.id === id) {
          const isCompletedToday = item.lastCompleted && new Date(item.lastCompleted).toDateString() === new Date().toDateString();
          if (isCompletedToday) return item;
          return { ...item, streak: item.streak + 1, lastCompleted: Date.now() };
        }
        return item;
      }),
      identityPoints: prev.identityPoints + 10
    }));
  };

  const handleUpdateDailyPlan = (id: string, updates: Partial<DailyPlanItem>) => {
    setState(prev => ({
      ...prev,
      dailyPlan: prev.dailyPlan.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };

  const handleAddMonthlyHabit = (name: string, domain: Domain) => {
    const newHabit: MonthlyHabit = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      completions: [],
      createdAt: Date.now(),
      domain
    };
    setState(prev => ({
      ...prev,
      monthlyHabits: [...prev.monthlyHabits, newHabit]
    }));
  };

  const handleDeleteMonthlyHabit = (id: string) => {
    setState(prev => ({
      ...prev,
      monthlyHabits: prev.monthlyHabits.filter(h => h.id !== id)
    }));
  };

  const activeSprint = useMemo(() => state.sprints.find(s => s.status === 'active'), [state.sprints]);
  const activePromise = useMemo(() => state.smallPromises.find(p => p.streak < 7) || state.smallPromises[0], [state.smallPromises]);

  const balance = useMemo(() => {
    const scores = { self: 0, work: 0, relationships: 0 };
    state.smallPromises.forEach(p => {
      if (p.lastCompleted && new Date(p.lastCompleted).toDateString() === new Date().toDateString()) {
        scores[p.domain] += 1;
      }
    });
    state.monthlyHabits.forEach(h => {
      if (h.completions.includes(new Date().toISOString().split('T')[0])) {
        scores[h.domain] += 1;
      }
    });
    state.sprints.forEach(s => {
      if (s.status === 'active') {
        const dayIndex = Math.floor((Date.now() - s.startDate) / (1000 * 60 * 60 * 24));
        if (s.completedDays.includes(dayIndex)) {
          scores[s.domain] += 2;
        }
      }
    });
    const total = scores.self + scores.work + scores.relationships || 1;
    return {
      self: (scores.self / total) * 100,
      work: (scores.work / total) * 100,
      relationships: (scores.relationships / total) * 100
    };
  }, [state]);

  useEffect(() => {
    // Trigger intervention if balance is extremely skewed after some work is done
    const totalDone = state.smallPromises.filter(p => p.lastCompleted && new Date(p.lastCompleted).toDateString() === new Date().toDateString()).length;
    if (totalDone > 3) {
      if (balance.work > 80 && balance.relationships < 10) {
        setInterventionTitle("Conscious Choice Required");
        setInterventionReason("You are becoming a machine. Your relationships are starving. Go talk to a human.");
        setIsIntervening(true);
      } else if (balance.self > 80 && balance.work < 10) {
        setInterventionTitle("Conscious Choice Required");
        setInterventionReason("Self-care is vital, but without work, there is no forge. Face the hardship.");
        setIsIntervening(true);
      }
    }
  }, [balance, state.smallPromises]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <div className="animate-pulse flex flex-col items-center space-y-2">
          <Flame size={48} className="text-forge-accent" />
          <div className="text-forge-accent font-black tracking-[0.5em] text-xs uppercase">Initializing Forge...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onGoogleSignIn={handleSignIn} />;
  }

  if (view === 'preflight') {
    return <TractionHUD state={state} onAcknowledge={() => setView('dashboard')} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatePresence>
        {isIntervening && (
          <StoicIntervenor 
            onUnlock={() => setIsIntervening(false)} 
            goal={activeSprint?.challenge || activePromise?.gateway}
            reason={interventionReason}
            title={interventionTitle}
          />
        )}
      </AnimatePresence>

      {error && <ErrorBoundary error={error} onDismiss={() => setError(null)} />}

      {/* Header */}
      <header className="border-b border-forge-border p-4 flex justify-between items-center bg-black/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-forge-accent p-1.5 rounded-sm">
            <Flame size={18} className="text-forge-bg" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase">Forge</h1>
        </div>
        
        <div className="flex gap-4 items-center">
          {user ? (
            <div className="flex items-center gap-3">
              {user.photoURL && (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-forge-border" referrerPolicy="no-referrer" />
              )}
              <button onClick={handleSignOut} className="text-forge-muted hover:text-forge-ink"><LogOut size={18} /></button>
            </div>
          ) : (
            <button onClick={handleSignIn} className="forge-button flex items-center gap-2"><LogIn size={14} /> Login</button>
          )}
          <button 
            onClick={() => setIsIntervening(true)}
            className="text-forge-muted hover:text-forge-accent transition-colors"
          >
            <ShieldAlert size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-8 pb-24">
        
        {view === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <section className="flex flex-col items-center py-8">
              <Avatar state={state.avatarState} setToolInfo={setToolInfo} />
            </section>

            {/* Daily Plan */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xs uppercase tracking-[0.3em] font-black opacity-50">Daily Intentions</h2>
                <button 
                  onClick={() => setToolInfo({
                    title: "Daily Intentions",
                    content: "Your daily battle plan. Define the 3-5 critical tasks that will move the needle today. Consistency in these small wins builds the momentum for major breakthroughs."
                  })}
                  className="text-forge-accent opacity-50 hover:opacity-100 transition-opacity"
                >
                  <Info size={12} />
                </button>
              </div>
              <div className="grid gap-3">
                {state.dailyPlan.map(item => (
                  <DailyPlanCard 
                    key={item.id} 
                    item={item} 
                    onComplete={handleCompleteDailyPlan}
                    onUpdate={handleUpdateDailyPlan}
                  />
                ))}
              </div>
            </section>

            {/* Daily Reflection */}
            <DailyReflectionSection 
              reflections={state.reflections} 
              onSave={handleSaveReflection} 
              onDelete={handleDeleteReflection}
              onToggleChallenge={handleToggleChallenge}
            />

            {/* Fortress of Discipline */}
            <DisciplineSection 
              habits={state.badHabits || []}
              onLogUrge={handleLogUrge}
              onLogRelapse={handleLogRelapse}
              setToolInfo={setToolInfo}
              onAddHabit={handleAddBadHabit}
              onRemoveHabit={handleRemoveBadHabit}
              newHabitName={newBadHabitName}
              setNewHabitName={setNewBadHabitName}
              newHabitTrigger={newBadHabitTrigger}
              setNewHabitTrigger={setNewBadHabitTrigger}
            />

            {/* Small Promise Tracker */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs uppercase tracking-[0.3em] font-black opacity-50">Small Promise Tracker</h2>
                  <button 
                    onClick={() => setToolInfo({
                      title: "Small Promises",
                      content: "The 2-minute rule. Every major habit starts with a 'gateway' action that takes less than 2 minutes. Tie your shoes to go for a run. Open your notebook to write. Master the art of showing up first."
                    })}
                    className="text-forge-accent opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <Info size={12} />
                  </button>
                </div>
              </div>

              <div className="forge-card space-y-4 border-dashed border-forge-accent/20">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex flex-1 gap-2">
                      <input 
                        type="text"
                        value={newPromiseHabit}
                        onChange={(e) => setNewPromiseHabit(e.target.value)}
                        placeholder="Ultimate Habit (e.g. Run 5km)"
                        className="flex-1 bg-black border border-forge-border p-3 text-sm focus:border-forge-accent outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if (!isGeneratingGateway && newPromiseHabit) {
                            handleGenerateGateway();
                          }
                        }}
                        disabled={isGeneratingGateway || !newPromiseHabit}
                        className="bg-forge-accent/10 border border-forge-accent/30 text-forge-accent px-4 min-h-[44px] flex items-center justify-center hover:bg-forge-accent hover:text-forge-bg active:scale-95 transition-all disabled:opacity-30 cursor-pointer touch-manipulation"
                        title="Generate 3-Step Plan"
                      >
                        {isGeneratingGateway ? (
                          <div className="flex items-center gap-2">
                            <Sparkles size={16} className="animate-pulse" />
                            <span className="text-[8px] uppercase font-black sm:hidden">...</span>
                          </div>
                        ) : (
                          <Sparkles size={16} />
                        )}
                      </button>
                    </div>
                    <select 
                      value={newPromiseDomain}
                      onChange={(e) => setNewPromiseDomain(e.target.value as Domain)}
                      className="bg-black border border-forge-border p-3 text-sm uppercase font-bold text-forge-accent outline-none"
                    >
                      {['health', 'work', 'selfcare', 'relationships'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {suggestedSteps.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-forge-accent/5 border border-forge-accent/20 p-3 space-y-2"
                    >
                      <div className="text-[8px] uppercase tracking-widest font-black text-forge-accent flex items-center gap-2">
                        <Zap size={10} /> 3-Step Progression Plan
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {suggestedSteps.map((step, i) => (
                          <div key={i} className="space-y-1">
                            <div className="text-[7px] opacity-50 uppercase font-bold">Step {i + 1}</div>
                            <div className="text-[9px] leading-tight font-medium">{step}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={newPromiseGateway}
                      onChange={(e) => setNewPromiseGateway(e.target.value)}
                      placeholder="2-Min Gateway (e.g. Tie shoes)"
                      className="flex-1 bg-black border border-forge-border p-3 text-sm focus:border-forge-accent outline-none"
                    />
                    <button 
                      onClick={handleAddSmallPromise}
                      className="forge-button px-6 py-2 text-[10px] uppercase font-bold"
                    >
                      Forge Promise
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {(state.smallPromises || []).map(promise => (
                  <SmallPromiseCard 
                    key={promise.id} 
                    promise={promise} 
                    onComplete={handleCompleteSmallPromise} 
                    onDelete={handleDeleteSmallPromise}
                    onShare={(p) => shareToCommunity('habit_progress', `Forged a small promise: ${p.gateway}. Gateway to ${p.habit}. Streak: ${p.streak} days.`)}
                  />
                ))}
              </div>
            </section>

            {/* Monthly Consistency Grid */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xs uppercase tracking-[0.3em] font-black opacity-50">Consistency Grid</h2>
                <button 
                  onClick={() => setToolInfo({
                    title: "Consistency Grid",
                    content: "Visual proof of your evolution. Track your daily non-negotiables. A single missed day is a slip; two missed days is the start of a new habit. Never miss twice."
                  })}
                  className="text-forge-accent opacity-50 hover:opacity-100 transition-opacity"
                >
                  <Info size={12} />
                </button>
              </div>
              <HabitGrid 
                habits={state.monthlyHabits} 
                onToggle={handleToggleMonthly}
                onAdd={handleAddMonthlyHabit}
                onDelete={handleDeleteMonthlyHabit}
              />
            </section>

            {/* Active Sprint */}
            <section className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs uppercase tracking-[0.3em] font-black opacity-50">Current Sprint</h2>
                  <button 
                    onClick={() => setToolInfo({
                      title: "Forge Sprints",
                      content: "7-day high-intensity challenges. Turn a passive highlight into an active habit. Complete all 7 days to earn massive Identity Points and permanently upgrade your character."
                    })}
                    className="text-forge-accent opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <Info size={12} />
                  </button>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowImportModal(true)} 
                    className="text-[10px] uppercase tracking-widest font-bold text-forge-accent hover:underline"
                  >
                    Import
                  </button>
                  {state.highlights.length > 0 && (
                    <button 
                      onClick={startDailyReview} 
                      className="text-[10px] uppercase tracking-widest font-bold text-forge-accent hover:underline"
                    >
                      Review Wisdom
                    </button>
                  )}
                  {state.sprints.length > 0 && (
                    <button 
                      onClick={() => setShowSprintHistory(!showSprintHistory)} 
                      className="text-[10px] uppercase tracking-widest font-bold hover:text-forge-accent"
                    >
                      {showSprintHistory ? 'Hide History' : 'History'}
                    </button>
                  )}
                  {!activeSprint && !showNewSprintForm && (
                    <button 
                      onClick={() => setShowNewSprintForm(true)} 
                      className="text-[10px] uppercase tracking-widest font-bold text-forge-accent"
                    >
                      + New Sprint
                    </button>
                  )}
                </div>
              </div>

              {showSprintHistory && state.sprints.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 border-l border-forge-border pl-4 py-2">
                  <div className="text-[8px] uppercase tracking-widest opacity-50 mb-2">Sprint History</div>
                  {state.sprints.slice().reverse().map(s => (
                    <div key={s.id} className="flex flex-col gap-2 text-[10px] opacity-70 border-b border-forge-border/30 pb-4 last:border-0">
                      <div className="flex justify-between items-start gap-4">
                        <span className="font-black uppercase tracking-widest text-[9px] text-forge-accent leading-tight flex-1">{s.principle}</span>
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded-sm uppercase font-black shrink-0",
                          s.status === 'completed' ? "bg-forge-accent/20 text-forge-accent" : "bg-forge-border text-forge-muted"
                        )}>
                          {s.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="bg-black/40 border-l-2 border-forge-border p-2">
                          <p className="text-[9px] leading-relaxed opacity-60 italic">"{s.highlight}"</p>
                        </div>
                        <p className="leading-relaxed font-bold text-forge-ink">Action: {s.challenge}</p>
                      </div>

                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[7px] uppercase tracking-tighter opacity-50 truncate max-w-[150px]">Source: {s.source}</span>
                        <span className="text-[8px] opacity-50 font-mono">{new Date(s.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeSprint ? (
                <SprintCard 
                  sprint={activeSprint} 
                  onCompleteDay={handleCompleteDay} 
                  onShare={(s) => shareToCommunity('sprint_progress', `Working on sprint: ${s.principle}. Progress: ${s.completedDays.length}/${s.durationDays} days. [Identity Points: ${state.identityPoints} XP]`)}
                />
              ) : showNewSprintForm ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="forge-card space-y-4 bg-forge-accent/5 border-forge-accent/30">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] uppercase tracking-widest font-black text-forge-accent">Forge New Sprint</h3>
                    <button onClick={() => setShowNewSprintForm(false)} className="text-forge-muted hover:text-forge-ink">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="flex border-b border-forge-border">
                    {(['manual', 'saved', 'book'] as const).map((source) => (
                      <button
                        key={source}
                        onClick={() => setSprintSource(source)}
                        className={cn(
                          "flex-1 py-2 text-[8px] uppercase tracking-[0.2em] font-black transition-colors",
                          sprintSource === source ? "text-forge-accent border-forge-accent" : "text-forge-muted border-transparent"
                        )}
                        style={{ borderBottomWidth: sprintSource === source ? '2px' : '0px' }}
                      >
                        {source}
                      </button>
                    ))}
                  </div>

                  {sprintSource === 'manual' && (
                    <>
                      <textarea 
                        value={newHighlight.text}
                        onChange={(e) => setNewHighlight(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="Paste a highlight from a book, article, or podcast..."
                        className="w-full bg-black border border-forge-border p-3 text-sm focus:border-forge-accent outline-none min-h-[100px]"
                      />
                      <input 
                        type="text"
                        value={newHighlight.source}
                        onChange={(e) => setNewHighlight(prev => ({ ...prev, source: e.target.value }))}
                        placeholder="Source..."
                        className="w-full bg-black border border-forge-border p-3 text-sm focus:border-forge-accent outline-none"
                      />
                    </>
                  )}

                  {sprintSource === 'saved' && (
                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                      {state.savedQuotes.length === 0 ? (
                        <p className="text-[10px] text-forge-muted text-center py-4 uppercase tracking-widest">No saved quotes</p>
                      ) : (
                        state.savedQuotes.map(quote => (
                          <button
                            key={quote.id}
                            onClick={() => setNewHighlight({ text: quote.text, source: `${quote.bookTitle} by ${quote.author}`, domain: 'work' })}
                            className={cn(
                              "w-full text-left p-3 border text-xs transition-all",
                              newHighlight.text === quote.text ? "border-forge-accent bg-forge-accent/10" : "border-forge-border hover:border-forge-accent/50"
                            )}
                          >
                            <p className="italic mb-1 line-clamp-2">"{quote.text}"</p>
                            <p className="text-[8px] uppercase opacity-50">{quote.bookTitle}</p>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {sprintSource === 'book' && (
                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                      {state.library.length === 0 ? (
                        <p className="text-[10px] text-forge-muted text-center py-4 uppercase tracking-widest">No books in library</p>
                      ) : (
                        state.library.map(book => (
                          <button
                            key={book.id}
                            onClick={async () => {
                              setIsGenerating(true);
                              try {
                                const result = await generateBookHighlight(book.title, book.author);
                                setNewHighlight({ text: result.text, source: result.source, domain: 'work' });
                              } catch (e) {
                                console.error(e);
                              } finally {
                                setIsGenerating(false);
                              }
                            }}
                            className={cn(
                              "w-full text-left p-3 border text-xs transition-all flex items-center gap-3",
                              newHighlight.source.includes(book.title) ? "border-forge-accent bg-forge-accent/10" : "border-forge-border hover:border-forge-accent/50"
                            )}
                          >
                            <img src={book.coverUrl} alt={book.title} className="w-8 h-12 object-cover border border-forge-border" referrerPolicy="no-referrer" />
                            <div>
                              <p className="font-bold">{book.title}</p>
                              <p className="text-[8px] uppercase opacity-50">{book.author}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {(['health', 'selfcare', 'relationships', 'work'] as Domain[]).map(d => (
                      <button
                        key={d}
                        onClick={() => setNewHighlight(prev => ({ ...prev, domain: d }))}
                        className={cn(
                          "flex-1 py-2 text-[10px] uppercase font-bold border transition-colors",
                          newHighlight.domain === d ? "bg-forge-accent border-forge-accent text-forge-bg" : "border-forge-border text-forge-muted"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={async () => {
                      await handleAddSprint();
                      setShowNewSprintForm(false);
                    }}
                    disabled={isGenerating || !newHighlight.text || !newHighlight.source}
                    className="forge-button-accent w-full py-4 text-xs font-black uppercase tracking-widest"
                  >
                    {isGenerating ? "Forging..." : "Generate AI Sprint"}
                  </button>
                </motion.div>
              ) : (
                <div className="forge-card border-dashed flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <BookOpen size={32} className="text-forge-muted" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest">No Active Sprint</p>
                    <p className="text-[10px] text-forge-muted max-w-[200px]">Start a 7-day challenge to build momentum and earn Identity Points.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowNewSprintForm(true)} className="forge-button-accent flex-1">Start New Sprint</button>
                    {state.highlights.length > 0 && (
                      <button onClick={startDailyReview} className="forge-button border-forge-accent text-forge-accent flex-1">Daily Review</button>
                    )}
                  </div>
                </div>
              )}
            </section>
          </motion.div>
        )}

        {view === 'daily-review' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xs uppercase tracking-[0.3em] font-black">Daily Wisdom Review</h2>
              <span className="text-[10px] font-mono opacity-50">{currentReviewIndex + 1} / {dailyReviewQueue.length}</span>
            </div>

            <AnimatePresence mode="wait">
              {dailyReviewQueue[currentReviewIndex] && (
                <motion.div 
                  key={dailyReviewQueue[currentReviewIndex].id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="forge-card min-h-[300px] flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    <div className="flex items-start gap-3">
                      <BookOpen size={16} className="text-forge-accent mt-1 flex-shrink-0" />
                      <p className="text-lg font-serif italic leading-relaxed text-forge-ink">
                        "{dailyReviewQueue[currentReviewIndex].text}"
                      </p>
                    </div>
                    <div className="pl-9">
                      <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">— {dailyReviewQueue[currentReviewIndex].source}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-8">
                    <button 
                      onClick={() => handleReviewAction('archive')}
                      className="flex flex-col items-center gap-2 p-4 border border-forge-border hover:bg-red-500/10 hover:border-red-500/50 transition-colors group"
                    >
                      <Trash2 size={20} className="text-forge-muted group-hover:text-red-500" />
                      <span className="text-[8px] uppercase font-black tracking-widest">Archive</span>
                    </button>
                    <button 
                      onClick={() => handleReviewAction('keep')}
                      className="flex flex-col items-center gap-2 p-4 border border-forge-border hover:bg-forge-accent/10 hover:border-forge-accent/50 transition-colors group"
                    >
                      <CheckCircle2 size={20} className="text-forge-muted group-hover:text-forge-accent" />
                      <span className="text-[8px] uppercase font-black tracking-widest">Keep</span>
                    </button>
                    <button 
                      onClick={() => handleReviewAction('forge')}
                      disabled={isGenerating}
                      className="flex flex-col items-center gap-2 p-4 bg-forge-accent text-forge-bg hover:bg-forge-accent/90 transition-colors"
                    >
                      {isGenerating ? (
                        <div className="w-5 h-5 border-2 border-forge-bg border-t-transparent animate-spin rounded-full" />
                      ) : (
                        <Zap size={20} />
                      )}
                      <span className="text-[8px] uppercase font-black tracking-widest">Forge Sprint</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={() => setView('dashboard')}
              className="w-full py-4 text-[10px] uppercase tracking-widest font-bold text-forge-muted hover:text-forge-ink transition-colors"
            >
              Cancel Review
            </button>
          </motion.div>
        )}

        {view === 'goals' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xs uppercase tracking-[0.3em] font-black">Define Long-Term Purpose</h2>
                <button 
                  onClick={() => setToolInfo({
                    title: "Long-Term Purpose",
                    content: "Goals are the destination. Sprints are the vehicle. Define your major life objectives across Health, Work, Relationships, and Self-Care. Break them down into actionable tasks."
                  })}
                  className="text-forge-accent opacity-50 hover:opacity-100 transition-opacity"
                >
                  <Info size={12} />
                </button>
              </div>
              <div className="forge-card space-y-4">
                <input 
                  type="text" 
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Goal Title (e.g. Run a Marathon)"
                  className="w-full bg-black border border-forge-border p-3 text-sm focus:border-forge-accent outline-none"
                />
                <textarea 
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Why does this matter?"
                  className="w-full bg-black border border-forge-border p-3 text-sm focus:border-forge-accent outline-none min-h-[80px]"
                />
                <div className="flex gap-2">
                  {(['health', 'selfcare', 'relationships', 'work'] as Domain[]).map(d => (
                    <button
                      key={d}
                      onClick={() => setNewGoal(prev => ({ ...prev, domain: d }))}
                      className={cn(
                        "flex-1 py-2 text-[10px] uppercase font-bold border transition-colors",
                        newGoal.domain === d ? "bg-forge-accent border-forge-accent text-forge-bg" : "border-forge-border text-forge-muted"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <button onClick={handleAddGoal} className="forge-button-accent w-full py-3">Add Goal</button>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-xs uppercase tracking-[0.3em] font-black opacity-50">Active Goals</h2>
              {(state.goals || []).map(goal => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  onAddTask={handleAddTask} 
                  onToggleTask={handleToggleTask}
                  onDeleteGoal={(id) => setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }))}
                  onShare={(g) => {
                    const completed = (g.tasks || []).filter(t => t.completed).length;
                    const total = (g.tasks || []).length;
                    shareToCommunity('goal_progress', `Working towards: ${g.title}. Progress: ${completed}/${total} tasks done. [Identity Points: ${state.identityPoints} XP]`);
                  }}
                />
              ))}
            </section>
          </motion.div>
        )}

        {view === 'community' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xs uppercase tracking-[0.3em] font-black">Community Feed</h2>
              {!user && <p className="text-[10px] text-forge-accent">Login to interact</p>}
            </div>

            {/* Friend Management */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search seekers..."
                  className="flex-1 bg-black border border-forge-border p-2 text-xs focus:border-forge-accent outline-none"
                />
                <button 
                  onClick={handleSearchUsers}
                  className="forge-button px-4 py-2 text-[10px] uppercase font-bold"
                >
                  Search
                </button>
              </div>

              <AnimatePresence>
                {friendActionFeedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] text-forge-accent font-black uppercase tracking-widest text-center py-2 bg-forge-accent/10 border border-forge-accent/20"
                  >
                    {friendActionFeedback}
                  </motion.div>
                )}
              </AnimatePresence>

              {searchResults.length > 0 && (
                <div className="space-y-2 border border-forge-border p-3 bg-white/5">
                  <div className="text-[8px] uppercase tracking-widest opacity-50 mb-2">Search Results</div>
                  {searchResults.map(u => (
                    <div key={u.uid} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {u.photoURL && (
                          <img src={u.photoURL} alt="" className="w-6 h-6 rounded-full border border-forge-border" referrerPolicy="no-referrer" />
                        )}
                        <span className="text-[10px] font-bold">{u.displayName}</span>
                      </div>
                      <button 
                        onClick={() => handleAddFriend(u.uid)}
                        className="text-[8px] uppercase tracking-widest text-forge-accent font-black hover:underline"
                      >
                        Add Friend
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {friendRequests.length > 0 && (
                <div className="space-y-2 border border-forge-accent/30 p-3 bg-forge-accent/5">
                  <div className="text-[8px] uppercase tracking-widest text-forge-accent font-black mb-2">Incoming Requests</div>
                  {friendRequests.map(req => (
                    <div key={req.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {req.requesterProfile?.photoURL && (
                          <img src={req.requesterProfile.photoURL} alt="" className="w-6 h-6 rounded-full border border-forge-border" referrerPolicy="no-referrer" />
                        )}
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold">{req.requesterProfile?.displayName || 'Unknown'}</span>
                          <span className="text-[7px] uppercase opacity-50">Wants to connect</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAcceptFriend(req.id)}
                        className="bg-forge-accent text-forge-bg px-2 py-1 text-[8px] uppercase font-black"
                      >
                        Accept
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {friends.length > 0 && (
                <div className="space-y-2 border border-forge-border p-3 bg-white/5">
                  <div className="text-[8px] uppercase tracking-widest opacity-50 mb-2">Your Circle ({friends.length})</div>
                  <div className="flex flex-wrap gap-3">
                    {friends.map(friend => (
                      <div key={friend.uid} className="flex flex-col items-center gap-1">
                        {friend.photoURL && (
                          <img 
                            src={friend.photoURL} 
                            alt={friend.displayName} 
                            className="w-8 h-8 rounded-full border border-forge-border" 
                            referrerPolicy="no-referrer"
                            title={friend.displayName}
                          />
                        )}
                        <span className="text-[7px] uppercase font-bold truncate w-8 text-center">{friend.displayName.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <CommunityFeed posts={posts} onLike={handleLikePost} />
          </motion.div>
        )}

        {view === 'wealth' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="text-xs uppercase tracking-[0.3em] font-black opacity-50">Wealth Protocol</h2>
                <button 
                  onClick={() => setToolInfo({
                    title: "Wealth Protocol",
                    content: "Financial discipline is a core pillar of evolution. Track your transactions and set financial goals. Your net worth is a reflection of your discipline and value creation."
                  })}
                  className="text-forge-accent opacity-50 hover:opacity-100 transition-opacity"
                >
                  <Info size={12} />
                </button>
              </div>
              <button 
                onClick={() => setView('dashboard')}
                className="text-[10px] uppercase tracking-widest font-bold hover:text-forge-accent"
              >
                Back to Forge
              </button>
            </div>

            <WealthSection 
              transactions={state.transactions}
              goals={state.financialGoals}
              onAddTransaction={handleAddTransaction}
              onAddGoal={handleAddFinancialGoal}
              onDeleteTransaction={handleDeleteTransaction}
              onDeleteGoal={handleDeleteFinancialGoal}
              onShareGoal={(g) => {
                const progress = Math.round((g.currentAmount / g.targetAmount) * 100);
                shareToCommunity('goal_progress', `Forging financial freedom: ${g.title}. Progress: ${progress}% (${g.currentAmount}€ / ${g.targetAmount}€). [Identity Points: ${state.identityPoints} XP]`);
              }}
            />
          </motion.div>
        )}

        {view === 'library' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <LibrarySection 
              library={state.library || []}
              savedQuotes={state.savedQuotes || []}
              onAddBook={handleAddBook}
              onRemoveBook={handleRemoveBook}
              onSaveQuote={handleSaveQuote}
              onDeleteQuote={handleDeleteQuote}
              onShareQuote={handleShareQuote}
            />
          </motion.div>
        )}

        {view === 'settings' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xs uppercase tracking-[0.3em] font-black opacity-50">System Settings</h2>
              <button 
                onClick={() => setView('dashboard')}
                className="text-[10px] uppercase tracking-widest font-bold hover:text-forge-accent"
              >
                Back to Forge
              </button>
            </div>

            <section className="space-y-4">
              <div className="forge-card p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <Bell size={16} className="text-forge-accent" />
                      iPhone Notifications
                    </h3>
                    <p className="text-[10px] text-forge-muted leading-relaxed">
                      Receive reminders for your daily intentions and goals. 
                      <br />
                      <span className="text-forge-accent italic">Note: On iPhone, you must add this app to your Home Screen first.</span>
                    </p>
                  </div>
                  <button 
                    onClick={handleRequestNotifications}
                    className={cn(
                      "px-4 py-2 text-[10px] uppercase font-black transition-all",
                      state.notificationsEnabled 
                        ? "bg-forge-accent/10 text-forge-accent border border-forge-accent/30" 
                        : "bg-forge-accent text-forge-bg"
                    )}
                  >
                    {state.notificationsEnabled ? "Enabled" : "Enable"}
                  </button>
                </div>

                {state.notificationsEnabled && (
                  <div className="pt-4 border-t border-forge-border">
                    <button 
                      onClick={() => sendNotification("Forge Reminder", "Stay focused on your daily intentions. Your goals are waiting.")}
                      className="text-[10px] uppercase tracking-widest font-bold text-forge-accent hover:underline"
                    >
                      Send Test Notification
                    </button>
                  </div>
                )}
              </div>

              <div className="forge-card p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest">Tutorial</h3>
                <p className="text-[10px] text-forge-muted">Need a refresher on how to use the Forge?</p>
                <button 
                  onClick={() => setShowOnboarding(true)}
                  className="forge-button w-full py-3 text-[10px] uppercase font-bold"
                >
                  Show Tutorial
                </button>
              </div>

              <div className="forge-card p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest">Account Status</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {user ? (
                      <>
                        {user.photoURL && (
                          <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full border border-forge-border" referrerPolicy="no-referrer" />
                        )}
                        <div>
                          <p className="text-xs font-bold">{user.displayName}</p>
                          <p className="text-[10px] text-forge-muted">{user.email}</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-forge-muted italic">Not logged in</p>
                    )}
                  </div>
                  {user ? (
                    <button onClick={() => auth.signOut()} className="text-[10px] uppercase font-black text-red-500 hover:underline">Logout</button>
                  ) : (
                    <button onClick={handleLogin} className="forge-button-accent">Login with Google</button>
                  )}
                </div>
              </div>
            </section>
          </motion.div>
        )}
        {/* Tool Info Modal */}
        <AnimatePresence>
          {toolInfo && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
              onClick={() => setToolInfo(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="forge-card w-full max-w-xs space-y-4 p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-forge-accent">{toolInfo.title}</h3>
                  <button onClick={() => setToolInfo(null)} className="text-forge-muted hover:text-forge-ink">
                    <X size={14} />
                  </button>
                </div>
                <p className="text-xs text-forge-muted leading-relaxed italic">
                  "{toolInfo.content}"
                </p>
                <button 
                  onClick={() => setToolInfo(null)}
                  className="forge-button w-full py-2 text-[8px] uppercase font-bold"
                >
                  Understood
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Import Modal */}
        <AnimatePresence>
          {showImportModal && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="forge-card w-full max-w-lg space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xs uppercase tracking-widest font-black text-forge-accent">Import Wisdom</h3>
                  <button onClick={() => setShowImportModal(false)} className="text-forge-muted hover:text-forge-ink">
                    <X size={18} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <p className="text-[10px] text-forge-muted leading-relaxed">
                    Paste your highlights below. Our AI will automatically extract the text and book titles for you.
                  </p>
                  <textarea 
                    value={importText}
                    onChange={(e) => {
                      setImportText(e.target.value);
                      setImportError(null);
                    }}
                    placeholder="Paste your highlights here..."
                    className="w-full bg-black border border-forge-border p-4 text-sm focus:border-forge-accent outline-none min-h-[300px] font-serif italic"
                  />
                  
                  {importError && (
                    <div className="flex items-center gap-2 text-red-500 text-[10px] uppercase font-bold">
                      <AlertTriangle size={12} />
                      {importError}
                    </div>
                  )}

                  <button 
                    onClick={handleBulkImport}
                    disabled={isGenerating || !importText.trim()}
                    className="forge-button-accent w-full py-4 text-xs font-black uppercase tracking-widest"
                  >
                    {isGenerating ? "Parsing Wisdom..." : "Import Highlights"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showOnboarding && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="forge-card w-full max-w-md space-y-8 p-8 text-center"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-forge-accent/20 rounded-full flex items-center justify-center animate-pulse">
                    <Flame size={32} className="text-forge-accent" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-xl font-black uppercase tracking-[0.2em] text-forge-ink">Welcome to The Forge</h2>
                  <p className="text-xs text-forge-muted leading-relaxed">
                    This is a space for high-intensity personal evolution. We bridge the gap between knowledge and action.
                  </p>
                </div>

                <div className="space-y-6 text-left max-h-[45vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-forge-accent scrollbar-track-transparent">
                  {[
                    {
                      title: "1. Claim Your Identity",
                      content: "Your status reflects your momentum: DEPLETED (low momentum), ALIGNING (building streaks), or ALIGNED (peak performance). Your identity evolves based on your consistency, and your \"bros\" are notified whenever your status changes."
                    },
                    {
                      title: "2. Define Daily Intentions",
                      content: "Identify 3-5 critical tasks that move the needle. Use the formula: \"I will [behavior] at [time] in [location].\" By specifying the exact context, you eliminate decision fatigue and the need for willpower—you simply execute."
                    },
                    {
                      title: "3. Master Small Promises",
                      content: "Use the 2-minute rule to start new habits. We generate a 3-step plan starting with a \"gateway action\"—like tying your shoes to go for a run. Master the art of showing up first; the rest follows."
                    },
                    {
                      title: "4. Build the Fortress of Discipline",
                      content: "Track your resistance against bad habits (smoking, alcohol, etc.). Logging an urge earns you XP and triggers a Stoic Intervention. Be warned: a relapse resets your streak. Stay strong, Forger."
                    },
                    {
                      title: "5. Refine via Daily Reflection",
                      content: "Answer two questions: \"What could I improve today?\" and \"What did I do wrong?\" Our AI analyzes your history and these answers to create custom challenges designed to patch the holes in your armor."
                    },
                    {
                      title: "6. Initiate Forge Sprints",
                      content: "Paste a quote from a book to generate a 7-day high-intensity challenge. This turns static theory into actionable skills, ensuring the wisdom you read actually changes how you live."
                    },
                    {
                      title: "7. Secure Your Daily Habits",
                      content: "Use the tracker for your non-negotiables. Visual proof of your evolution is key. Remember the Golden Rule: A single miss is a slip; two missed days is the start of a new (bad) habit. Never miss twice."
                    },
                    {
                      title: "8. Track Wealth & Vision",
                      content: "Manage your income and expenses toward specific goals, like a 10% fund for a trip to Italy. Map out long-term visions into subgoals and share your progress with the community to ensure total accountability."
                    }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-forge-border flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest">{step.title.split('. ')[1]}</p>
                        <p className="text-[9px] text-forge-muted leading-relaxed">{step.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setShowOnboarding(false)}
                  className="forge-button-accent w-full py-4 text-xs font-black uppercase tracking-widest"
                >
                  Begin Your Evolution
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-forge-border bg-black/90 backdrop-blur-lg p-2 z-40">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <NavButton active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard size={20} />} label="Forge" />
          <NavButton active={view === 'library'} onClick={() => setView('library')} icon={<BookOpen size={20} />} label="Library" />
          <NavButton active={view === 'goals'} onClick={() => setView('goals')} icon={<Target size={20} />} label="Goals" />
          <NavButton active={view === 'wealth'} onClick={() => setView('wealth')} icon={<Wallet size={20} />} label="Wealth" />
          <NavButton active={view === 'community'} onClick={() => setView('community')} icon={<Users size={20} />} label="Community" />
          <NavButton active={view === 'settings'} onClick={() => setView('settings')} icon={<Settings size={20} />} label="Settings" />
        </div>
      </nav>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 px-4 py-2 transition-colors",
      active ? "text-forge-accent" : "text-forge-muted hover:text-forge-ink"
    )}
  >
    {icon}
    <span className="text-[8px] uppercase tracking-widest font-bold">{label}</span>
  </button>
);
