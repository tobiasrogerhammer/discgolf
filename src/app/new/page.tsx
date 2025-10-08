"use client";
import { useState } from "react";
import { enqueueRound, flushQueue } from "@/lib/offlineQueue";
import { useGameState } from "@/hooks/useGameState";
import { useFriends } from "@/hooks/useFriends";
import { roundApi } from "@/lib/api";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants";
import Header from "@/components/Header";
import CoursePreview from "@/components/CoursePreview";
import StartRoundModal from "@/components/StartRoundModal";
import ScoreInput from "@/components/ScoreInput";
import PlayerSelector from "@/components/PlayerSelector";
import PlayerScoresSummary from "@/components/PlayerScoresSummary";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";

export default function NewGamePage() {
  const [currentHole, setCurrentHole] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Custom hooks
  const gameState = useGameState();
  const friendsState = useFriends();
  
  // Debug gameState
  console.log('GameState object:', {
    hasIncrementScore: typeof gameState.incrementScore === 'function',
    hasDecrementScore: typeof gameState.decrementScore === 'function',
    currentPlayer: gameState.currentPlayer,
    players: gameState.players,
    started: gameState.started
  });

  // Save round function
  const saveRound = async () => {
    if (!gameState.selected || !gameState.currentPlayer) return;

    setSaving(true);
    setError(null);

    try {
      const roundData = {
        courseId: gameState.selected.id,
        strokesByHole: gameState.currentPlayer.scores,
        roundType: gameState.roundType,
        weather: Object.values(gameState.weather).some(v => v) ? {
          temperature: gameState.weather.temperature ? parseFloat(gameState.weather.temperature) : 0,
          windSpeed: gameState.weather.windSpeed ? parseFloat(gameState.weather.windSpeed) : 0,
          windDirection: gameState.weather.windDirection || '',
          conditions: gameState.weather.conditions || '',
          humidity: gameState.weather.humidity ? parseFloat(gameState.weather.humidity) : 0,
          pressure: gameState.weather.pressure ? parseFloat(gameState.weather.pressure) : 0,
        } : undefined,
        startedAt: new Date().toISOString()
      };

      const result = await roundApi.save(roundData);
      
      if (result.success) {
        alert(SUCCESS_MESSAGES.ROUND_SAVED);
        gameState.cancelRound();
        setCurrentHole(0);
      } else {
        setError(result.error || ERROR_MESSAGES.SAVE_FAILED);
      }
    } catch (error) {
      console.error('Save error:', error);
      setError(ERROR_MESSAGES.SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  };

  // Add location data
  const addLocationData = async () => {
    if (!gameState.selected) return;

    try {
      const res = await fetch('/api/courses/update-ekeberg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: gameState.selected.id })
      });

      if (res.ok) {
        alert('Location data added! You can now fetch weather data.');
        // Refresh courses to get updated data
        window.location.reload();
      } else {
        alert('Failed to add location data');
      }
    } catch (error) {
      console.error('Location update error:', error);
      alert('Failed to add location data');
    }
  };

  // Navigation functions
  const nextHole = () => {
    if (currentHole < (gameState.selected?.holes || 18) - 1) {
      setCurrentHole(currentHole + 1);
    }
  };

  const prevHole = () => {
    if (currentHole > 0) {
      setCurrentHole(currentHole - 1);
    }
  };

  // Handle start round
  const handleStartRound = (players: any[], roundType: any, weather: any) => {
    gameState.startRound(players);
    setCurrentHole(0);
  };

  if (error) {
    return (
      <div className="p-4">
        <Header title="Error" />
        <div className="card text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => setError(null)}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-4 space-y-4">
        <Header title="New Game" />
        
        {!gameState.started ? (
          // Course Selection and Preview Section
          <div className="space-y-4">
            {/* Course Selection */}
            {gameState.courses.length > 0 ? (
              <div className="card">
                <h2 className="text-lg font-semibold dark:text-white text-[var(--header-color)] mb-3">Search Course</h2>
                  <input
                    type="text"
                    placeholder="Search for a course..."
                    value={gameState.courseSearch || ''}
                    onChange={(e) => gameState.setCourseSearch(e.target.value)}
                    className="w-full p-3 border rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 text-[var(--foreground)] mb-2"
                  />
                
                {/* Course Search Results */}
                {gameState.courseSearch && (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {gameState.filteredCourses.map((course) => (
                        <button
                          key={course.id}
                          onClick={() => {
                            gameState.setCourseId(course.id);
                            gameState.setCourseSearch('');
                          }}
                          className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded border"
                        >
                        <div className="font-medium">{course.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {course.holes} holes • Par {course.holePars?.reduce((sum, hole) => sum + hole.par, 0) || course.holes * 3}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="card text-center">
                <LoadingSpinner text="Loading courses..." />
              </div>
            )}

            {/* Course Preview */}
            {gameState.selected && (
              <CoursePreview
                course={gameState.selected}
                onStartRound={() => gameState.setShowStartModal(true)}
                onAddLocation={addLocationData}
              />
            )}
          </div>
        ) : (
          // Active Round Section - Single combined card
          <div className="card">
            {/* Top Header */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">🥏</span>
                <h1 className="text-xl font-bold dark:text-white text-[var(--header-color)]">
                  {gameState.selected?.name}
                </h1>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1">
                  Hole {currentHole + 1} of {gameState.selected?.holes}
                </span>
                <span className="flex items-center gap-1">
                  Par {gameState.parByHole[currentHole]}
                </span>
                <span className="flex items-center gap-1">
                  {gameState.selected?.holePars?.find(h => h.hole === currentHole + 1)?.distanceMeters || 'N/A'}m
                </span>
              </div>
            </div>
            
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-6 p-3 bg-white dark:bg-gray-800 ">
              <button
                onClick={() => {
                  gameState.cancelRound();
                  setCurrentHole(0);
                }}
                className="btn btn-outline bg-white dark:bg-white dark:text-black flex items-center gap-2"
              >
                <span>❌</span>
                Cancel
              </button>
              <div className="text-center">
                <div className="text-lg font-bold text-[var(--header-color)] flex items-center gap-2">
                  Hole {currentHole + 1}
                </div>
              </div>
              <button
                onClick={saveRound}
                disabled={saving}
                className="btn btn-primary flex items-center gap-2"
              >
                <span>{saving ? '⏳' : '💾'}</span>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>

            {/* Score VS Par Graph */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[var(--header-color)] mb-3 flex items-center gap-2">
                <span>📊</span>
                Score VS Par
              </h3>
              <div className="w-full h-48">
                <LineChart
                  width={350}
                  height={200}
                  data={gameState.data}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <Line type="monotone" dataKey="score" stroke="#ff6b35" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="par" stroke="#4ade80" strokeWidth={2} strokeDasharray="5 5" />
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis dataKey="hole" />
                  <YAxis domain={[0, gameState.yMax]} />
                </LineChart>
              </div>
              
                  {/* Total Scores Summary */}
                  <div className="text-center text-sm text-gray-600 dark:text-gray-300 mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex justify-center items-center gap-4">
                      <span className="flex items-center gap-1">
                        <span>🎯</span>
                        <strong>Total: {gameState.totals.score}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>🏆</span>
                        <strong>Par: {gameState.totals.par}</strong>
                      </span>
                      <span className={`flex items-center gap-1 ${gameState.totals.score - gameState.totals.par < 0 ? 'text-green-600' : gameState.totals.score - gameState.totals.par > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        <span>{gameState.totals.score - gameState.totals.par < 0 ? '⬇️' : gameState.totals.score - gameState.totals.par > 0 ? '⬆️' : '➡️'}</span>
                        <strong>VS Par: {gameState.totals.score - gameState.totals.par}</strong>
                      </span>
                    </div>
                  </div>
            </div>

            {/* Score Adjustment Controls */}
            <div className="mb-6">
              <div className="flex justify-center items-center space-x-8 py-6 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 rounded-lg border">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Decrement button clicked, currentHole:', currentHole);
                    gameState.decrementScore(currentHole);
                  }}
                  className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center text-2xl font-bold transition-colors shadow-md"
                >
                  ➖
                </button>
                <div className="text-center">
                  <div className="text-5xl font-bold text-[var(--header-color)] mb-2">
                    {gameState.currentPlayer?.scores?.[currentHole] ?? gameState.parByHole[currentHole]}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <span>🎯</span>
                    Par {gameState.parByHole[currentHole]}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Increment button clicked, currentHole:', currentHole);
                    gameState.incrementScore(currentHole);
                  }}
                  className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-2xl font-bold transition-colors shadow-md"
                >
                  ➕
                </button>
              </div>
            </div>

            {/* Player Scores Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[var(--header-color)] mb-3 flex items-center gap-2">
                <span>👥</span>
                Player Scores
              </h3>
              <div className="space-y-2">
                {gameState.players.map((player, idx) => (
                  <div key={player.id} className={`flex justify-between items-center p-3 rounded-lg ${idx === gameState.currentPlayerIdx ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-700' : 'bg-gray-50 dark:bg-gray-700 dark:border-gray-600 border'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{idx === gameState.currentPlayerIdx ? '🎯' : '👤'}</span>
                      <span className="font-medium text-[var(--foreground)]">{player.name}</span>
                      {idx === gameState.currentPlayerIdx && <span className="text-xs bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded-full">Current</span>}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <span>🎯</span>
                        {gameState.totals.score}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>🏆</span>
                        Par {gameState.totals.par}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex justify-between gap-2">
              <button
                onClick={() => setCurrentHole(Math.max(0, currentHole - 1))}
                disabled={currentHole === 0}
                className="btn btn-outline bg-white dark:bg-white dark:text-black flex-1 flex items-center justify-center gap-2"
              >
                <span>⬅️</span>
                Previous
              </button>
              <div className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 rounded-lg border">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {currentHole + 1} / {gameState.selected?.holes || 18}
                </span>
              </div>
              <button
                onClick={() => setCurrentHole(Math.min((gameState.selected?.holes || 18) - 1, currentHole + 1))}
                disabled={currentHole === (gameState.selected?.holes || 18) - 1}
                className="btn btn-outline bg-white dark:bg-white dark:text-black flex-1 flex items-center justify-center gap-2"
              >
                Next
                <span>➡️</span>
              </button>
            </div>
          </div>
        )}

        {/* Start Round Modal */}
        <StartRoundModal
          isOpen={gameState.showStartModal}
          onClose={() => gameState.setShowStartModal(false)}
          onStart={handleStartRound}
          friends={friendsState.friends}
          selectedFriends={friendsState.selectedFriends}
          onToggleFriend={friendsState.toggleFriend}
          searchResults={friendsState.searchResults}
          userSearch={friendsState.userSearch}
          onUserSearchChange={friendsState.setUserSearch}
          onAddPlayer={(user) => {
            const newPlayer = {
              id: user.id,
              name: user.name,
              email: user.email,
              scores: []
            };
            // Add to selected players logic would go here
          }}
          searching={friendsState.searching}
          searchError={friendsState.searchError}
          selectedCourse={gameState.selected}
          onFetchWeather={gameState.fetchWeather}
          loadingWeather={gameState.loadingWeather}
          weather={gameState.weather}
          setWeather={gameState.setWeather}
        />
      </div>
    </ErrorBoundary>
  );
}