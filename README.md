# FORGE (Habit & Sprint Execution Engine)

> **"Every action you take is a vote for the type of person you wish to become."**  
> FORGE is an anti-procrastination, high-performance personal operating system designed to bridge the gap between consuming wisdom and taking relentless, consistent action.

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-orange.svg)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-8e44ad.svg)](https://ai.google.dev/)

---

## 📌 Съдържание
- [1. Философия и Концепция](#1-философия-и-концепция)
- [2. Основни Модули и Функционалности](#2-основни-модули-и-функционалности)
- [3. Технологичен Стек и Архитектура](#3-технологичен-стек-и-архитектура)
- [4. Модели на Данните (Data Schemas)](#4-модели-на-данните-data-schemas)
- [5. AI Интеграция и Промптове](#5-ai-интеграция-и-промптове)
- [6. Инструкции за Пресъздаване на Приложението (iOS / Antigravity)](#6-инструкции-за-пресъздаване-на-приложението-ios--antigravity)
- [7. Локално Стартиране и Разработка](#7-локално-стартиране-и-разработка)

---

## 1. Философия и Концепция

Повечето приложения за навици се провалят, защото предлагат обикновени списъци със задачи без контекст, психология и отчетност. **FORGE** обединява научни поведенчески рамки:

1. **James Clear (Atomic Habits):**
   - **Gateway Habits (2-Minute Rule):** Разглобяване на сложни навици в прогресивни стълбици (напр. *Облекли спортния екип* ➔ *5 мин ходене* ➔ *пълна тренировка*).
   - **Implementation Intentions:** Формулата *"Ще направя [ПОВЕДЕНИЕ] в [ЧАС] на [МЯСТО]"*.
   - **Identity Voting:** Всяко действие носи Identity точки, променяйки състоянието на аватара.

2. **Stoic Philosophy & Seneca Daily Debrief:**
   - Вечерна кратка рефлексия: Какво подобрих днес? Къде сбърках?
   - Автоматично генериране на анти-провал предизвикателство за следващия ден.

3. **Urge Surfing & Addiction Management (Alan Marlatt):**
   - Дневник на влеченията (Urge Log) с интензитет (1-10) и изход (*Resisted* / *Relapsed*).
   - Измерване на "чисти" дни и картографиране на тригерите.

4. **Active Knowledge Application (Anti-Collector Syndrome):**
   - Вместо пасивно трупане на цитати и откъси от книги, AI трансформира всеки цитат в **3- до 7-дневен екшън спринт (Sprint)** с измеримо дневно предизвикателство.

---

## 2. Основни Модули и Функционалности

### 2.1. Traction HUD (Preflight Check-In)
- Екранът за бърз преглед преди стартиране на деня.
- Показва текущото състояние на вътрешния аватар (`depleted`, `aligning`, `aligned`).
- Обобщава броя активни спринтове, висящите задачи за деня и спешните намеси.

### 2.2. Централен Dashboard (Табло за управление)
- **Identity & Avatar Engine:**
  - `depleted` (при ниска консистентност / скорошни рецидиви),
  - `aligning` (при изграждане на инерция),
  - `aligned` (при стабилни поредици и изпълнени обещания).
- **Daily Plan (Implementation Intentions):**
  - Списък с точни поведенчески котви (час, място, действие).
  - Бутони за отчетност: **Done** (Зелено) / **Not Done** (Червено) с отчитане на стрийк и последно изпълнение.
- **Active Sprints (Екшън спринтове):**
  - 7-дневни карти със статус за всеки ден (Day 1 до Day 7).
  - Свързаност с цитат/книга и конкретен принцип за действие.
- **Small Promises (Atomic Ladders):**
  - Стъпаловидно овладяване на трудни навици през микро-стъпки.
- **Monthly Habit Matrix:**
  - Месечна и седмична матрица за визуализация на консистентността във времето.
- **Bad Habit Tracker & Urge Surfing:**
  - Брояч на чисти дни без вредния навик.
  - Бутон *"Log Urge"* за записване на вълна на изкушение (интензитет 1-10, тригер, бележка).
- **Daily Reflection & Anti-Mistake Challenge:**
  - Вечерно вписване на подобрение и грешка.

### 2.3. Wisdom Library & Daily Review Queue (Readwise-style)
- **Daily Wisdom Review (5-Card Swiper):**
  - Случайно изтеглени 5 цитата от библиотеката за деня.
  - 3 действия за всяка карта:
    - `Archive` – Премахване от редовния цикъл.
    - `Keep` – Запазване за преговор.
    - `Forge Sprint` – AI моментално създава 7-дневен спринт от този цитат!
- **Library Catalog & Book Search:**
  - Търсене на заглавия, добавяне на книги към личната библиотека.
  - Автоматично генериране на основни цитати и акценти за добавените книги.
- **Bulk Highlight Import:**
  - Импортиране на суров текст (бележки от Kindle, статии) с интелигентно парсване на цитати и автори.

### 2.4. Goals & Deep Work Roadmap
- Йерархична организация по домейни:
  - `health` (Здраве и спорт)
  - `selfcare` (Ум, почивка, сън)
  - `relationships` (Отношения и семейство)
  - `work` (Кариера, код, бизнес)
  - `wealth` (Финанси и активи)
- Всяка цел съдържа под-задачи с чекбоксове и автоматично изчисляване на напредъка.

### 2.5. Wealth & Financial Discipline
- Лог на транзакции (Приходи и Разходи) по категории.
- Финансови цели с правила за автоматично разпределение (напр. 20% от всеки приход за фонд Спестявания).
- Стоически цитати за финансова дисциплина и устойчивост.

### 2.6. Community & Social Accountability
- Публичен фийд от постижения на общността в реално време:
  - Завършени спринтове, дълги поредици (streaks), постигнати цели.
  - Възможност за харесване (Likes) и споделяне на лични прозрения.

---

## 3. Технологичен Стек и Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                       FORGE CLIENT                          │
│  React 18 + Vite + TypeScript + Tailwind CSS + Lucide Icons │
│  Framer Motion (Animations) + Firebase Auth (Google & Pass) │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      EXPRESS BACKEND         │ │     FIREBASE FIRESTORE     │
│       (Node.js / tsx)        │ │  (Realtime Cloud Database) │
│ - AI Endpoints (/api/ai/*)   │ │ - Users & Profiles         │
│ - Secure Gemini SDK Proxy    │ │ - ForgeState Documents     │
│ - Book Search API            │ │ - Community Feed Posts     │
└──────────────┬───────────────┘ └────────────────────────────┘
               │
               ▼
┌──────────────────────────────┐
│       GOOGLE GEMINI API      │
│  gemini-2.5-flash / gemini-3 │
│  - Sprint generation         │
│  - Gateway habit breakdown   │
│  - Reflection challenges     │
│  - Bulk highlights parser    │
└──────────────────────────────┘
```

---

## 4. Модели на Данните (Data Schemas)

Пълните TypeScript интерфейси се намират в `src/types.ts`. Основните обекти са:

```typescript
export type AvatarState = 'depleted' | 'aligning' | 'aligned';
export type Domain = 'health' | 'selfcare' | 'relationships' | 'work' | 'wealth';

export interface Sprint {
  id: string;
  source: string;        // Автор/Книга
  highlight: string;     // Цитатът-вдъхновение
  principle: string;     // Извлеченият принцип
  challenge: string;     // Конкретното дневно действие
  durationDays: number;  // 3 до 7 дни
  startDate: number;     // Timestamp
  completedDays: number[]; // Индекси на завършените дни [0, 1, 2...]
  status: 'active' | 'completed' | 'failed';
  domain: Domain;
}

export interface DailyPlanItem {
  id: string;
  domain: Domain;
  behaviour: string;     // Действие
  time: string;          // Напр. "07:30"
  location: string;      // Напр. "Хол / Бюро"
  streak: number;        // Поредица
  lastCompleted: number | null; // Timestamp
}

export interface SmallPromise {
  id: string;
  habit: string;
  gateway: string;       // 2-минутен праг
  steps: string[];       // Прогресивни стъпки
  currentStepIndex: number;
  streak: number;
  lastCompleted: number | null;
  createdAt: number;
  domain: Domain;
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
  intensity: number;     // 1 до 10
  outcome: 'resisted' | 'relapsed';
  note?: string;
}

export interface DailyReflection {
  id: string;
  date: string;          // "YYYY-MM-DD"
  improvement: string;
  mistake: string;
  challenge: string | null;
  challengeCompleted?: boolean | null;
  timestamp: number;
}
```

---

## 5. AI Интеграция и Промптове

Всички AI повиквания минават през сигурен бекенд прокси в `server.ts` чрез `@google/genai`:

1. **Sprint Generator (`/api/ai/sprint`):**
   - **Вход:** `highlight`, `source`
   - **Промпт:** Извлича главното приложимо правило и формулира предизвикателство за 1, 3 или 7 дни.
   - **JSON Schema:** `{ principle: string, challenge: string, durationDays: number }`

2. **Reflection Challenge (`/api/ai/reflection`):**
   - **Вход:** `improvement`, `mistake`
   - **Промпт:** Анализира днешната грешка и създава превантивно действие за следващите 24 часа.
   - **JSON Schema:** `{ challenge: string }`

3. **Gateway Habit Builder (`/api/ai/gateway`):**
   - **Вход:** `habit` (напр. "Сутрешно тичане")
   - **Изход:** 2-минутно стартово действие + 3 прогресивни стъпки за надграждане.

---

## 6. Инструкции за Пресъздаване на Приложението (iOS / Antigravity)

Ако разработвате приложението отново в самостоятелна среда (напр. iOS с Swift / SwiftUI, React Native / Expo, Flutter или Antigravity):

### Архитектурен план:
1. **Навигация:**
   - Използвайте `TabView` с 5 основни таба:
     - ⚡ **Today / HUD:** Traction HUD, Daily Plan, Active Sprints, Small Promises.
     - 🎯 **Roadmap / Goals:** Домейни, цели и прогрес бар.
     - 📚 **Wisdom:** Daily Review Swiper, Library, Quotes.
     - 🛡️ **Discipline / Wealth:** Urge Surfing, Bad Habits, Finance Tracker.
     - 👥 **Community & Settings:** Feed, профил и локални настройки.

2. **Локално съхранение (Offline First):**
   - Използвайте **SwiftData** / **CoreData** (за iOS) или **WatermelonDB** / **SQLite** за нулева латентност.
   - Синхронизация със сървъра на заден фон (Background Sync).

3. **Haptic Feedback & Звуци:**
   - Добавете силен haptic feedback при маркиране на "Done" на задача (`.notificationFeedback(.success)`).
   - При "Log Urge -> Resisted" – силен насърчителен хаптичен пулс.

4. **Интерактивни уиджети (iOS Widgets / Lock Screen):**
   - Widget за отбелязване на днешните Implementation Intentions директно от Home / Lock Screen.
   - Брояч на чисти дни за вредните навици.

5. **Локални известия (Push Notifications):**
   - 08:00 – Morning Priming: Преглед на днешните задачи и активните спринтове.
   - 21:00 – Evening Debrief: Стоическа рефлексия (Подобрение & Грешка).

---

## 7. Локално Стартиране и Разработка

```bash
# 1. Инсталиране на зависимостите
npm install

# 2. Настройка на променливите на средата (.env)
GEMINI_API_KEY=your_gemini_api_key

# 3. Стартиране в разработка (Express + Vite на порт 3000)
npm run dev

# 4. Продукционен билд
npm run build
npm start
```

---

*Документът е генериран за репозиторито `alexassenov/forge-app` с пълни детайли за последваща разработка.*