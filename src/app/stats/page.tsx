"use client";
import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Legend } from "recharts";

type Course = { id: string; name: string };
type Insights = {
  totalRounds: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  improvement: number;
  bestHoles: Array<{ hole: number; par: number; averageScore: number; difference: number }>;
  worstHoles: Array<{ hole: number; par: number; averageScore: number; difference: number }>;
  weatherImpact: any;
  recentTrend: Array<{ date: string; score: number; roundType: string }>;
};

export default function StatsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [rows, setRows] = useState<{ hole: number; par: number; avg: number }[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [timePeriod, setTimePeriod] = useState('all');

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/courses");
      const data = await res.json();
      setCourses(data.courses);
      if (data.courses[0]) setCourseId(data.courses[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!courseId) return;
    (async () => {
      const [statsRes, insightsRes] = await Promise.all([
        fetch(`/api/stats?courseId=${courseId}`),
        fetch(`/api/insights?courseId=${courseId}&timePeriod=${timePeriod}`)
      ]);
      const statsData = await statsRes.json();
      const insightsData = await insightsRes.json();
      setRows(statsData.rows ?? []);
      setInsights(insightsData.insights);
    })();
  }, [courseId, timePeriod]);

  const data = useMemo(() => rows.map((r) => ({ name: `Hole ${r.hole}`, par: r.par, avg: r.avg })), [rows]);
  const yMax = useMemo(() => {
    const maxVal = data.length ? Math.max(...data.map((d) => Math.max(d.par, d.avg))) : 10;
    return Math.max(10, Math.ceil(maxVal));
  }, [data]);

  return (
    <main className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📊</span>
          <h1 className="text-2xl font-bold text-[var(--header-color)]">My Stats</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <select className="border rounded p-2 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600" value={courseId ?? ""} onChange={(e)=>setCourseId(e.target.value)}>
          {courses.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select className="border rounded p-2 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600" value={timePeriod} onChange={(e)=>setTimePeriod(e.target.value)}>
          <option value="all">All time</option>
          <option value="month">Last month</option>
          <option value="year">Last year</option>
        </select>
      </div>

      {/* Insights Overview */}
      {insights && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center p-4">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-[var(--color-brand)]">{insights.totalRounds}</div>
            <div className="text-sm text-gray-600 dark:text-white">Rounds Played</div>
          </div>
          <div className="card text-center p-4">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-[var(--color-brand)]">{insights.averageScore}</div>
            <div className="text-sm text-gray-600 dark:text-white">Average Score</div>
          </div>
          <div className="card text-center p-4">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-green-600">{insights.bestScore}</div>
            <div className="text-sm text-gray-600 dark:text-white">Best Score</div>
          </div>
          <div className="card text-center p-4">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-blue-600">{insights.improvement > 0 ? '+' : ''}{insights.improvement}</div>
            <div className="text-sm text-gray-600 dark:text-white">Improvement</div>
          </div>
        </div>
      )}

      {/* Performance Chart */}
      <div className="w-full card flex justify-center">
        <LineChart width={340} height={240} data={data}>
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, yMax]} allowDecimals={false} />
          <Legend />
          <Line type="monotone" dataKey="par" stroke="#22c55e" name="Par" />
          <Line type="monotone" dataKey="avg" stroke="#ef4444" name="Avg score" />
        </LineChart>
      </div>

      {/* Best/Worst Holes */}
      {insights && (insights.bestHoles.length > 0 || insights.worstHoles.length > 0) && (
        <div className="grid grid-cols-2 gap-2">
          <div className="card">
            <h3 className="font-semibold text-green-600 mb-2">Best Holes</h3>
            {insights.bestHoles.map((hole, i) => (
              <div key={i} className="text-sm">
                Hole {hole.hole}: {hole.averageScore.toFixed(1)} (Par {hole.par})
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="font-semibold text-red-600 mb-2">Worst Holes</h3>
            {insights.worstHoles.map((hole, i) => (
              <div key={i} className="text-sm">
                Hole {hole.hole}: {hole.averageScore.toFixed(1)} (Par {hole.par})
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Detailed Stats Table */}
      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Hole</th>
              <th className="p-2">Average Score</th>
              <th className="p-2">Par</th>
              <th className="p-2">Average Difference</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.hole} className="border-t">
                <td className="p-2">{r.hole}</td>
                <td className="p-2">{r.avg.toFixed(1)}</td>
                <td className="p-2">{r.par}</td>
                <td className="p-2">{(r.avg - r.par).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}