export type AvatarState = 'depleted' | 'aligning' | 'aligned';
export type Domain = 'health' | 'selfcare' | 'relationships' | 'work' | 'wealth';

export interface Sprint {
  id: string;
  source: string;
  highlight: string;
  principle: string;
  challenge: string;
  durationDays: number;
  startDate: number;
  completedDays: number[]; // indices of days completed
  status: 'active' | 'completed' | 'failed';
  domain: Domain;
}

export interface SmallPromise {
  id: string;
  habit: string;
  gateway: string;
  steps: string[];
  currentStepIndex: number;
  streak: number;
  lastCompleted: number | null; // timestamp
  createdAt: number;
  domain: Domain;
}

export interface Highlight {
  id: string;
  text: string;
  source: string;
  date: number;
  lastReviewed?: number;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  createdAt: number;
  status: 'active' | 'achieved';
  domain: Domain;
}

export interface MonthlyHabit {
  id: string;
  name: string;
  completions: string[]; // ISO date strings "YYYY-MM-DD"
  createdAt: number;
  domain: Domain;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  type: 'sprint_completed' | 'sprint_progress' | 'habit_streak' | 'habit_progress' | 'goal_achieved' | 'goal_progress' | 'insight';
  content: string;
  timestamp: number;
  likes: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  joinedAt: number;
}

export interface DailyPlanItem {
  id: string;
  domain: Domain;
  behaviour: string;
  time: string;
  location: string;
  streak: number;
  lastCompleted: number | null; // timestamp
}

export interface DailyReflection {
  id: string;
  date: string; // ISO date string "YYYY-MM-DD"
  improvement: string;
  mistake: string;
  challenge: string | null;
  challengeCompleted?: boolean | null;
  timestamp: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  timestamp: number;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  allocationRule: {
    type: 'income' | 'expense';
    percentage: number;
  };
  currentAmount: number;
  createdAt: number;
}

export interface BadHabit {
  id: string;
  name: string;
  trigger: string;
  lastRelapse: number | null;
  streakDays: number;
  totalRelapses: number;
  createdAt: number;
}

export interface UrgeLog {
  id: string;
  habitId: string;
  timestamp: number;
  intensity: number;
  outcome: 'resisted' | 'relapsed';
  note?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  addedAt: number;
}

export interface SavedQuote {
  id: string;
  text: string;
  author: string;
  bookTitle: string;
  savedAt: number;
}

export interface ForgeState {
  avatarState: AvatarState;
  sprints: Sprint[];
  smallPromises: SmallPromise[];
  monthlyHabits: MonthlyHabit[];
  goals: Goal[];
  highlights: Highlight[];
  lastIntervention: number | null;
  identityPoints: number;
  dailyPlan: DailyPlanItem[];
  reflections: DailyReflection[];
  transactions: Transaction[];
  financialGoals: FinancialGoal[];
  badHabits: BadHabit[];
  urgeLogs: UrgeLog[];
  library: Book[];
  savedQuotes: SavedQuote[];
  notificationsEnabled?: boolean;
}
