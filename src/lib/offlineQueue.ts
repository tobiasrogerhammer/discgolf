// Enhanced offline queue for rounds, goals, and activities
export type QueuedRound = { 
  courseId: string; 
  strokesByHole: number[]; 
  roundType?: string;
  weather?: any;
  startedAt?: string; // ISO date string
  timestamp?: number; // Added for offline queue
};

export type QueuedGoal = {
  title: string;
  description?: string;
  type: string;
  target: number;
  deadline?: string;
  timestamp?: number; // Added for offline queue
};

export type QueuedActivity = {
  type: string;
  title: string;
  description?: string;
  data?: any;
  timestamp?: number; // Added for offline queue
};

const ROUNDS_KEY = "dg-offline-rounds";
const GOALS_KEY = "dg-offline-goals";
const ACTIVITIES_KEY = "dg-offline-activities";

// Round queue functions
export function enqueueRound(round: QueuedRound) {
  const existing: QueuedRound[] = JSON.parse(localStorage.getItem(ROUNDS_KEY) || "[]");
  existing.push({ ...round, timestamp: Date.now() });
  localStorage.setItem(ROUNDS_KEY, JSON.stringify(existing));
}

export function enqueueGoal(goal: QueuedGoal) {
  const existing: QueuedGoal[] = JSON.parse(localStorage.getItem(GOALS_KEY) || "[]");
  existing.push({ ...goal, timestamp: Date.now() });
  localStorage.setItem(GOALS_KEY, JSON.stringify(existing));
}

export function enqueueActivity(activity: QueuedActivity) {
  const existing: QueuedActivity[] = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || "[]");
  existing.push({ ...activity, timestamp: Date.now() });
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(existing));
}

export async function flushQueue() {
  const [rounds, goals, activities] = await Promise.all([
    flushRounds(),
    flushGoals(),
    flushActivities()
  ]);
  
  return { rounds, goals, activities };
}

async function flushRounds() {
  const existing: QueuedRound[] = JSON.parse(localStorage.getItem(ROUNDS_KEY) || "[]");
  const remaining: QueuedRound[] = [];
  
  for (const r of existing) {
    try {
      const res = await fetch("/api/rounds", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(r) 
      });
      if (!res.ok) remaining.push(r);
    } catch {
      remaining.push(r);
    }
  }
  
  localStorage.setItem(ROUNDS_KEY, JSON.stringify(remaining));
  return { synced: existing.length - remaining.length, failed: remaining.length };
}

async function flushGoals() {
  const existing: QueuedGoal[] = JSON.parse(localStorage.getItem(GOALS_KEY) || "[]");
  const remaining: QueuedGoal[] = [];
  
  for (const g of existing) {
    try {
      const res = await fetch("/api/goals", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(g) 
      });
      if (!res.ok) remaining.push(g);
    } catch {
      remaining.push(g);
    }
  }
  
  localStorage.setItem(GOALS_KEY, JSON.stringify(remaining));
  return { synced: existing.length - remaining.length, failed: remaining.length };
}

async function flushActivities() {
  const existing: QueuedActivity[] = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || "[]");
  const remaining: QueuedActivity[] = [];
  
  for (const a of existing) {
    try {
      const res = await fetch("/api/activities", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(a) 
      });
      if (!res.ok) remaining.push(a);
    } catch {
      remaining.push(a);
    }
  }
  
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(remaining));
  return { synced: existing.length - remaining.length, failed: remaining.length };
}

export function getOfflineQueueStatus() {
  const rounds = JSON.parse(localStorage.getItem(ROUNDS_KEY) || "[]");
  const goals = JSON.parse(localStorage.getItem(GOALS_KEY) || "[]");
  const activities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || "[]");
  
  return {
    rounds: rounds.length,
    goals: goals.length,
    activities: activities.length,
    total: rounds.length + goals.length + activities.length
  };
}

export function clearOfflineQueue() {
  localStorage.removeItem(ROUNDS_KEY);
  localStorage.removeItem(GOALS_KEY);
  localStorage.removeItem(ACTIVITIES_KEY);
}


