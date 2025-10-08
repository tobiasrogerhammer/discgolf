"use client";
import { useEffect, useState } from "react";
import { formatDateEuropean } from "@/lib/dateUtils";

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  criteria: string;
  points: number;
};

type UserAchievement = {
  id: string;
  earnedAt: string;
  achievement: Achievement;
};

type Goal = {
  id: string;
  title: string;
  description?: string;
  type: string;
  target: number;
  current: number;
  deadline?: string;
  completed: boolean;
  createdAt: string;
};

export default function ProgressPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'ROUNDS',
    target: 0,
    deadline: ''
  });
  const [activeTab, setActiveTab] = useState<'achievements' | 'goals'>('achievements');

  useEffect(() => {
    fetchAchievements();
    fetchGoals();
  }, []);

  const fetchAchievements = async () => {
    try {
      const res = await fetch('/api/achievements');
      const data = await res.json();
      // Combine earned and available achievements
      const allAchievements = [...(data.earned || []).map((ua: any) => ua.achievement), ...(data.available || [])];
      setAchievements(allAchievements);
      setUserAchievements(data.earned || []);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    }
  };

  const fetchUserAchievements = async () => {
    // This is now handled in fetchAchievements
  };

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/goals');
      const data = await res.json();
      setGoals(data.goals || []);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    }
  };

  const createGoal = async () => {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal)
      });
      if (res.ok) {
        fetchGoals();
        setShowGoalForm(false);
        setNewGoal({ title: '', description: '', type: 'ROUNDS', target: 0, deadline: '' });
      }
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const updateGoal = async (id: string, current: number, completed: boolean) => {
    const res = await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, current, completed })
    });
    if (res.ok) {
      fetchGoals();
    }
  };

  const earnedAchievementIds = new Set(userAchievements.map(ua => ua.achievement.id));

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-[var(--header-color)]">Progress</h1>
      
      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'achievements'
              ? 'bg-[var(--color-brand)] text-[#002F45]'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'
          }`}
          onClick={() => setActiveTab('achievements')}
        >
          🏆 Achievements
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'goals'
              ? 'bg-[var(--color-brand)] text-[#002F45]'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'
          }`}
          onClick={() => setActiveTab('goals')}
        >
          🎯 Goals
        </button>
      </div>

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Achievements</h2>
            <div className="text-sm text-gray-600 dark:text-white">
              {userAchievements.length} / {achievements.length} earned
            </div>
          </div>

          <div className="grid gap-3">
            {achievements.length === 0 ? (
              <div className="card text-center py-8">
                <div className="text-gray-600 dark:text-white">No achievements available yet.</div>
              </div>
            ) : (
              achievements.map((achievement) => {
              const userAchievement = userAchievements.find(ua => ua.achievement.id === achievement.id);
              const isEarned = !!userAchievement;
              
              return (
                <div
                  key={achievement.id}
                  className={`card ${
                    isEarned 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">
                      {isEarned ? achievement.icon || '🏆' : '🔒'}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-semibold ${isEarned ? 'text-green-800 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'}`}>
                          {achievement.name}
                        </h3>
                        <span className="text-sm font-bold text-[var(--color-brand)]">
                          {achievement.points} pts
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${isEarned ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-500'}`}>
                        {achievement.description}
                      </p>
                      {isEarned && (
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-green-600 dark:text-green-400">
                            Earned {formatDateEuropean(userAchievement.earnedAt)}
                          </span>
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">
                            +{achievement.points} pts
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
            )}
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Goals</h2>
            <button
              className="btn btn-primary text-sm"
              onClick={() => setShowGoalForm(true)}
            >
              + New Goal
            </button>
          </div>

          {/* New Goal Form */}
          {showGoalForm && (
            <div className="card">
              <h3 className="font-semibold mb-3">Create New Goal</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <input
                    className="w-full border rounded p-2 bg-white dark:bg-white dark:text-black"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({...prev, title: e.target.value}))}
                    placeholder="e.g., Play 10 rounds this month"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <input
                    className="w-full border rounded p-2 bg-white dark:bg-white dark:text-black"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({...prev, description: e.target.value}))}
                    placeholder="Additional details..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <select
                      className="w-full border rounded p-2 bg-white dark:bg-white dark:text-black"
                      value={newGoal.type}
                      onChange={(e) => setNewGoal(prev => ({...prev, type: e.target.value}))}
                    >
                      <option value="ROUNDS">Rounds</option>
                      <option value="SCORE">Score</option>
                      <option value="COURSES">Courses</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Target</label>
                    <input
                      type="number"
                      className="w-full border rounded p-2 bg-white dark:bg-white dark:text-black"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal(prev => ({...prev, target: parseInt(e.target.value) || 0}))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Deadline (Optional)</label>
                  <input
                    type="date"
                    className="w-full border rounded p-2 bg-white dark:bg-white dark:text-black"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal(prev => ({...prev, deadline: e.target.value}))}
                  />
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary" onClick={createGoal}>
                    Create Goal
                  </button>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setShowGoalForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Goals List */}
          <div className="space-y-3">
            {goals.length === 0 ? (
              <div className="card text-center py-8">
                <div className="text-gray-600 dark:text-white">No goals created yet. Create your first goal above!</div>
              </div>
            ) : (
              goals.map((goal) => (
              <div key={goal.id} className={`card ${goal.completed ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{goal.title}</h3>
                      {goal.completed && <span className="text-green-600">✅</span>}
                    </div>
                    {goal.description && (
                      <p className="text-sm text-gray-600 dark:text-white mt-1">{goal.description}</p>
                    )}
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-white">
                        <span>Progress: {goal.current} / {goal.target}</span>
                        <span>{Math.round((goal.current / goal.target) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className="bg-[var(--color-brand)] h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    {goal.deadline && (
                      <div className="text-xs text-gray-600 dark:text-white mt-2">
                        Deadline: {formatDateEuropean(goal.deadline)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <input
                      type="number"
                      className="flex-1 border rounded p-2 text-sm bg-white dark:bg-white dark:text-black"
                      placeholder="Update progress"
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          updateGoal(goal.id, value, value >= goal.target);
                        }
                      }}
                    />
                    <button
                      className="btn btn-outline text-sm"
                      onClick={() => updateGoal(goal.id, goal.current, !goal.completed)}
                    >
                      {goal.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      )}
    </main>
  );
}
