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
  const [rounds, setRounds] = useState<any[]>([]);
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
      const [statsRes, insightsRes, roundsRes] = await Promise.all([
        fetch(`/api/stats?courseId=${courseId}`),
        fetch(`/api/insights?courseId=${courseId}&timePeriod=${timePeriod}`),
        fetch(`/api/rounds?courseId=${courseId}&timePeriod=${timePeriod}`)
      ]);
      const statsData = await statsRes.json();
      const insightsData = await insightsRes.json();
      const roundsData = await roundsRes.json();
      
      console.log('Rounds API response:', roundsData);
      console.log('Rounds array:', roundsData.rounds);
      
      setRows(statsData.rows ?? []);
      setInsights(insightsData.insights);
      setRounds(roundsData.rounds ?? []);
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
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold text-[var(--color-brand)]">{insights.averageScore}</div>
              <div className="text-sm text-gray-600 dark:text-white">Average Score</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-green-600">{insights.bestScore}</div>
              <div className="text-sm text-gray-600 dark:text-white">Best Score</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-[var(--color-brand)]">{insights.totalRounds}</div>
              <div className="text-sm text-gray-600 dark:text-white">Rounds Played</div>
            </div>
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


      {/* Detailed Stats Table - Collapsible */}
      <div className="card">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
            <h3 className="text-lg font-semibold text-[var(--header-color)]">📋 Detailed Hole Statistics</h3>
            <span className="text-2xl transition-transform group-open:rotate-90">▶</span>
          </summary>
          <div className="border-t">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-50 dark:bg-gray-800">
                  <th className="p-3 font-medium">Hole</th>
                  <th className="p-3 font-medium">Average Score</th>
                  <th className="p-3 font-medium">Par</th>
                  <th className="p-3 font-medium">Average Difference</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.hole} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3 font-medium">{r.hole}</td>
                    <td className="p-3">{r.avg.toFixed(1)}</td>
                    <td className="p-3">{r.par}</td>
                    <td className="p-3">
                      <span className={`font-medium ${(r.avg - r.par) < 0 ? 'text-green-600' : (r.avg - r.par) > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {(r.avg - r.par) > 0 ? '+' : ''}{(r.avg - r.par).toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>

      {/* Individual Rounds - Collapsible */}
      <div className="card">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
            <h3 className="text-lg font-semibold text-[var(--header-color)]">🏌️ Individual Rounds</h3>
            <span className="text-2xl transition-transform group-open:rotate-90">▶</span>
          </summary>
          <div className="border-t">
            {console.log('Rounds in render:', rounds, 'Length:', rounds.length)}
            <div className="p-2 text-xs text-gray-500">
              Debug: {rounds.length} rounds found
            </div>
            {rounds.length > 0 ? (
              <div className="space-y-2 p-4">
                {rounds.map((round, index) => (
                  <div key={round.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-lg">🏌️</div>
                      <div>
                        <div className="font-medium text-[var(--foreground)]">
                          Round #{rounds.length - index}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(round.startedAt).toLocaleDateString()} • {round.roundType}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-[var(--color-brand)]">
                          {round.totalStrokes}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">Total</div>
                      </div>
                      {round.rating && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {round.rating}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">Rating</div>
                        </div>
                      )}
                      {round.weather && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-600">
                            {round.weather.conditions}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">Weather</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-600 dark:text-gray-300">
                No rounds found for this course and time period.
              </div>
            )}
          </div>
        </details>
      </div>
    </main>
  );
}