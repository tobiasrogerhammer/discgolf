"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RoundData {
  _id: string;
  startedAt: number;
  totalStrokes?: number;
  course?: {
    _id: string;
    _creationTime: number;
    name: string;
    location?: string;
    description?: string;
    addressUrl?: string;
    estimatedLengthMeters?: number;
    latitude?: number;
    longitude?: number;
    difficulty?: string;
    createdAt: number;
    holes: number;
  } | null;
}

interface PerformanceChartProps {
  rounds: any[];
}

export function PerformanceChart({ rounds }: PerformanceChartProps) {
  // Sort rounds by date and prepare chart data
  const chartData = rounds
    .filter(round => round.totalStrokes && round.startedAt && round.course)
    .sort((a, b) => a.startedAt - b.startedAt)
    .map((round, index) => {
      // Calculate course par (assuming average par of 3 per hole)
      const coursePar = (round.course?.holes || 18) * 3;
      const scoreToPar = round.totalStrokes! - coursePar;
      
      return {
        round: index + 1,
        score: scoreToPar, // Score relative to par
        absoluteScore: round.totalStrokes,
        coursePar: coursePar,
        date: new Date(round.startedAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        course: round.course?.name || 'Unknown',
        fullDate: new Date(round.startedAt).toLocaleDateString()
      };
    });

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Chart</CardTitle>
          <CardDescription>
            Your score progression over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>No rounds to display</p>
              <p className="text-sm">Play some rounds to see your performance chart!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate average score for reference line
  const averageScore = chartData.reduce((sum, data) => sum + data.score, 0) / chartData.length;

  return (
    <Card>
        <CardHeader>
          <CardTitle>Performance Chart</CardTitle>
          <CardDescription>
            Your score relative to par over time (negative is better)
          </CardDescription>
        </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="round" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: 'currentColor', opacity: 0.3 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: 'currentColor', opacity: 0.3 }}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">Round {data.round}</p>
                        <p className="text-sm text-muted-foreground">{data.fullDate}</p>
                        <p className="text-sm">Score to Par: <span className="font-medium">{data.score > 0 ? '+' : ''}{data.score}</span></p>
                        <p className="text-sm">Total Strokes: <span className="font-medium">{data.absoluteScore}</span></p>
                        <p className="text-sm">Course: {data.course}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
              {/* Average line */}
              <Line 
                type="monotone" 
                dataKey={() => averageScore} 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="Average"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Chart Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-primary"></div>
            <span>Score to Par</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-muted-foreground border-dashed border-t border-muted-foreground"></div>
            <span>Average ({averageScore > 0 ? '+' : ''}{averageScore.toFixed(1)})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
