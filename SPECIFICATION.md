# FORGE: Technical Specification & Blueprint for Rebuilding

> **Target Audience:** Engineering, Mobile Developers (Swift / iOS / Antigravity / React Native), Product Designers.  
> **Purpose:** Complete specification to reconstruct the entire FORGE application from scratch outside this environment.

---

## 1. Executive Summary & Design System

### 1.1 Core Value Proposition
FORGE is an anti-procrastination, identity-driven execution engine. Unlike passive to-do apps, it uses cognitive behavioral psychology:
- **Implementation Intentions** (*Peter Gollwitzer*): Pre-deciding when, where, and what action to take eliminates decision fatigue.
- **Micro-Gateway Habit Ladders** (*James Clear*): Breaking habits down into 2-minute starter actions before gradually increasing friction.
- **Urge Surfing & Delay Interval** (*Dr. Alan Marlatt*): Logging addiction impulses with intensity (1-10) to train distress tolerance and maintain clean streaks.
- **Wisdom-to-Sprint Transformation**: Converting quotes and book notes into active 3- to 7-day actionable sprints with daily challenges.
- **Seneca Daily Debrief**: Evening reflection identifying 1 concrete improvement and 1 mistake, feeding into tomorrow's AI challenge.

### 1.2 Design Philosophy & Visual Language
- **Theme:** Monochromatic Brutalism / Neo-Stoic Industrial (Dark Mode primary).
  - Background: Deep Void (`#050505` / `#0a0a0a`)
  - Accent: Electric Amber / Gold Flame (`#f59e0b` / `#d97706` / `#eab308`)
  - Ink & Text: High-contrast pure white (`#ffffff`) and slate secondary (`#94a3b8`)
  - Border: Subtle industrial borders (`#27272a` / `#18181b`)
- **Typography:**
  - Headers: Uppercase, tracking-widest, bold / black weight (mono or technical sans).
  - Body: Clean sans-serif (Inter or system SF Pro).
  - Metrics / Numbers: Monospaced (JetBrains Mono or SF Mono).
- **Haptic & Sound Feedback:**
  - Success feedback on checking off tasks.
  - Warning rumble on relapse logging.
  - Crisp click on tab and daily review cards.

---

## 2. Global State & Architecture

### 2.1 State Model (`ForgeState`)
The entire user state is modeled as an atomic or synchronized document:

```typescript
export interface ForgeState {
  avatarState: AvatarState;         // 'depleted' | 'aligning' | 'aligned'
  identityPoints: number;           // Gamified score incremented on completions
  sprints: Sprint[];                // Active and past sprints
  smallPromises: SmallPromise[];    // Atomic gateway habit ladders
  monthlyHabits: MonthlyHabit[];    // Monthly habit matrix
  goals: Goal[];                    // High-level domain goals with subtasks
  highlights: Highlight[];          // Saved wisdom quotes and book notes
  lastIntervention: number | null;  // Timestamp of last critical intervention
  dailyPlan: DailyPlanItem[];       // Implementation intentions (behavior, time, location)
  reflections: DailyReflection[];   // Daily evening reviews
  transactions: Transaction[];      // Wealth domain log
  financialGoals: FinancialGoal[];  // Wealth targets with allocation rules
  badHabits: BadHabit[];            // Breaking bad habits & triggers
  urgeLogs: UrgeLog[];              // Urge surfing events
  library: Book[];                  // Personal book catalog
  savedQuotes: SavedQuote[];        // Bookmark collection
  notificationsEnabled?: boolean;   // Push notification flag
}
```

### 2.2 Avatar State Machine
The Avatar represents the user's psychological alignment and consistency:
- **`depleted`**:
  - Triggers: Recent relapse in `badHabits`, less than 30% daily plan completion for 2 consecutive days, or inactive streaks.
  - UI Effect: Desaturated visual avatar, amber alert badge, prompt for immediate preflight alignment.
- **`aligning`**:
  - Triggers: 1-3 active streaks, completion of at least 1 sprint day or gateway habit step today.
  - UI Effect: Soft glowing border, progressive momentum counter.
- **`aligned`**:
  - Triggers: All daily plan items completed, active sprint day checked, 5+ day streak on core habits.
  - UI Effect: Full amber flame aura, identity point multiplier, victory banner.

---

## 3. Screen Specifications & Features

### Screen 1: Traction HUD (Preflight Check-In)
- **Role:** Screen shown on initial app opening each day before entering the main dashboard.
- **Components:**
  1. **Current Date & Identity Status:** Displays avatar state with current points.
  2. **Traction Score:** Percentage of today's daily plan already scheduled.
  3. **High-Priority Sprint Banner:** Displays the most urgent active sprint and its day challenge.
  4. **Call-to-Action:** Large button `ENTER FORGE` or `CONFIRM INTENTIONS`.

### Screen 2: Dashboard (Main Tab)
- **Sections:**
  1. **Avatar Status Header:**
     - Avatar state icon with flame aura.
     - Identity points counter.
     - Quick action buttons (Start Daily Review, New Sprint, Log Urge).
  2. **Daily Plan (Implementation Intentions):**
     - Displays cards with format:  
       `I will [BEHAVIOUR]`  
       `At [TIME] in [LOCATION]`
     - Two distinct action buttons on each card:
       - **Done (Green check)**: Marks `lastCompleted = Date.now()`, increments `streak`, awards 10 Identity Points.
       - **Not Done (Red/Slate cross)**: Resets streak to 0, flags item for review.
     - Add new item modal: Inputs for Domain, Behaviour, Time (TimePicker), Location.
  3. **Active Sprints (3 to 7-Day Challenges):**
     - Horizontal or vertical cards displaying:
       - Source quote / book origin.
       - Core Principle.
       - Challenge text.
       - Day Progress Indicator (Dots or numbered chips 1 through 7):
         - Gray = Upcoming
         - Amber = Completed
         - Current day pulsates.
     - Checking off the current day updates `completedDays` array. When all days match `durationDays`, sprint marks `status = 'completed'` and prompts public share.
  4. **Small Promises (Gateway Habit Ladders):**
     - Each card displays:
       - Habit Title.
       - Current Gateway Step (e.g. "Step 1: Put on shoes and walk for 2 mins").
       - Current Step Index of total steps.
       - Button to "Promote Step" or "Check Done for Today".
  5. **Monthly Habit Matrix:**
     - Toggle between **Weekly Consistency** and **Monthly Evolution**.
     - Calendar heat map matrix (days of month grid). Filled cells indicate days where the habit was performed.
  6. **Bad Habits & Urge Surfing Panel:**
     - Displays tracked bad habits (e.g., "Phone scrolling before sleep", "Sugar cravings").
     - Clean Days Streak Counter.
     - **"Log Urge" Action:**
       - Opens modal with:
         - Urge Intensity Slider (1 to 10).
         - Identified Trigger.
         - Quick timer (Delay 10 minutes to surf the urge).
         - Two outcome buttons:
           - **Resisted:** Logs urge as resisted, keeps clean streak alive, awards 15 Identity Points!
           - **Relapsed:** Logs relapse, resets `streakDays = 0`, updates `lastRelapse = Date.now()`, shifts Avatar to `depleted`.
  7. **Daily Evening Stoic Debrief:**
     - Two prompt fields:
       - *"What is one specific improvement you made today?"*
       - *"What was your primary mistake or point of friction today?"*
     - Button `Forge Tomorrow's Anti-Failure Challenge`:
       - Sends inputs to Gemini AI (`/api/ai/reflection`).
       - Returns a concrete, targeted challenge for tomorrow morning.

### Screen 3: Wisdom Library & Daily Review
- **Daily Review Queue (Readwise Experience):**
  - Shuffles 5 random highlights from the library.
  - Card swipe or bottom actions:
    - **Archive:** Removes quote from active rotation.
    - **Keep:** Re-queues for future reviews.
    - **Forge Sprint (AI Magic):** Sends quote to Gemini (`/api/ai/sprint`). Automatically converts the wisdom into an active sprint with title, principle, and daily challenge!
- **Library Catalog:**
  - Search books via Google Books API.
  - Add books to user catalog.
  - AI button: "Extract Top Principles" to populate highlights automatically.
- **Bulk Import:**
  - Text area for pasting Kindle / Apple Books / Readwise export clippings.
  - AI parser splits clippings into structured highlights with author and source attribution.

### Screen 4: Goals & Roadmap (Domain-based)
- **Domains:** Health, Selfcare, Relationships, Work, Wealth.
- **Goal Cards:**
  - Title and Description.
  - Subtask list with reorderable checklist.
  - Progress bar dynamically computed from `completedTasks / totalTasks * 100`.
  - Achieved badge when 100% complete.

### Screen 5: Wealth Discipline
- **Financial Balance & Transactions:**
  - Income vs Expense logger.
  - Automatic category breakdown.
- **Financial Rule Allocation:**
  - Target goals (e.g. "Emergency Fund", "Investment Index").
  - Auto-allocation percentage (e.g. 20% of every incoming transaction automatically allocates toward the target).
- **Stoic Wealth Principles:**
  - Contextual mindset quotes generated dynamically based on active goals.

### Screen 6: Community & Social Accountability
- **Realtime Feed:**
  - Displays milestones: "Alex completed Day 5 of Sprint: Deep Work!", "Maria reached 21-day streak on Gateway Habit".
  - One-tap Likes with optimistic UI update.
  - Share modal: User can publish any completed sprint or reflection to the feed.

### Screen 7: Settings & Notifications
- Account management (Sign in with Apple, Google, or Email/Password).
- Daily push notification scheduling:
  - Morning Priming Time (Default: 07:30).
  - Evening Debrief Time (Default: 21:30).
- Data Export (JSON export of entire `ForgeState`).

---

## 4. API Endpoints & AI Integration

When rebuilding the backend, implement these lightweight endpoints:

### 1. `POST /api/ai/sprint`
- **Request:**
  ```json
  {
    "highlight": "The impediment to action advances action. What stands in the way becomes the way.",
    "source": "Marcus Aurelius, Meditations"
  }
  ```
- **Gemini Prompt:**
  ```
  Extract the core actionable principle from this highlight and generate a short-term challenge (1, 3, or 7 days).
  Source: {source}
  Highlight: "{highlight}"
  Return JSON schema: { principle: string, challenge: string, durationDays: number }
  ```
- **Response:**
  ```json
  {
    "principle": "Obstacle Inversion",
    "challenge": "Identify your biggest blocker today. Turn it into your primary training ground by tackling it first thing in the morning for 45 minutes.",
    "durationDays: 3
  }
  ```

### 2. `POST /api/ai/reflection`
- **Request:**
  ```json
  {
    "improvement": "I avoided social media until noon and finished the project proposal.",
    "mistake": "I stayed up past midnight scrolling on my tablet."
  }
  ```
- **Gemini Prompt:**
  ```
  Generate a specific, actionable challenge for tomorrow based on:
  Improvement: "{improvement}"
  Mistake: "{mistake}"
  Return JSON schema: { challenge: string }
  ```
- **Response:**
  ```json
  {
    "challenge": "Place the tablet in another room by 21:00. Replace screen time with 15 minutes of physical book reading."
  }
  ```

### 3. `POST /api/ai/gateway`
- **Request:**
  ```json
  {
    "habit": "Strength training 4 times a week"
  }
  ```
- **Prompt Logic:** Deconstructs the habit into a 2-minute gateway action followed by 3 progressive steps.

---

## 5. Mobile Implementation Blueprint (iOS / Swift / Antigravity)

If rebuilding natively in **SwiftUI**:

### Recommended Project Structure
```
ForgeApp/
├── App/
│   ├── ForgeApp.swift
│   └── AppState.swift              // @Observable or StateObject
├── Models/
│   ├── ForgeState.swift
│   ├── Sprint.swift
│   ├── DailyPlanItem.swift
│   ├── SmallPromise.swift
│   ├── BadHabit.swift
│   └── Reflection.swift
├── Views/
│   ├── MainTabView.swift
│   ├── HUD/
│   │   └── TractionHUDView.swift
│   ├── Dashboard/
│   │   ├── DashboardView.swift
│   │   ├── DailyPlanCard.swift     // Done / Not Done interactive buttons
│   │   ├── SprintCardView.swift
│   │   ├── HabitLadderView.swift
│   │   └── UrgeSurfModal.swift
│   ├── Wisdom/
│   │   ├── WisdomDeckView.swift    // Card swiper for 5 daily quotes
│   │   └── LibraryListView.swift
│   ├── Roadmap/
│   │   └── GoalsHierarchyView.swift
│   └── Wealth/
│       └── WealthOverviewView.swift
├── Services/
│   ├── AIService.swift             // URLSession calls to /api/ai
│   ├── NotificationManager.swift   // UNUserNotificationCenter
│   └── StorageManager.swift        // SwiftData or CoreData
└── DesignSystem/
    ├── Colors.swift                // Amber accent, deep void background
    └── Components/
        ├── ForgeButton.swift
        └── FlameBadge.swift
```

### Essential iOS Features to Leverage
1. **Interactive Lock Screen Widgets:**  
   Allow the user to tap "Done" on their Implementation Intentions straight from the iOS Lock Screen using `AppIntent`.
2. **Interactive Live Activities:**  
   During a Deep Work Sprint or an active 10-minute "Urge Surfing" delay interval, render a Live Activity on the Dynamic Island showing remaining seconds.
3. **Sensory Feedback:**  
   Use `UIImpactFeedbackGenerator(style: .rigid)` on completing habit steps and `UINotificationFeedbackGenerator().notificationOccurred(.success)` on completing a sprint.
4. **Local Notifications:**  
   Schedule recurring local notifications at user-specified morning and evening times so the app stays functional completely offline.
