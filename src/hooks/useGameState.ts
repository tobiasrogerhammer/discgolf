"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { Course, Player, RoundType, WeatherForm } from "@/types";
import { DEFAULTS } from "@/lib/constants";

export function useGameState() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseSearch, setCourseSearch] = useState<string>('');
  const [strokesByHole, setStrokesByHole] = useState<number[]>([]);
  const [started, setStarted] = useState(false);
  const [roundType, setRoundType] = useState<RoundType>('CASUAL');
  const [weather, setWeather] = useState<WeatherForm>({
    temperature: '',
    windSpeed: '',
    windDirection: '',
    conditions: '',
    humidity: '',
    pressure: ''
  });
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [showWeatherInputs, setShowWeatherInputs] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const updatingRef = useRef<Set<string>>(new Set());

  const selected = useMemo(() => 
    Array.isArray(courses) ? courses.find(c => c.id === courseId) || null : null, 
    [courses, courseId]
  );

  const filteredCourses = useMemo(() => {
    if (!courseSearch.trim()) return [];
    return courses.filter(course => 
      course.name.toLowerCase().includes(courseSearch.toLowerCase())
    );
  }, [courses, courseSearch]);

  const parByHole = useMemo(() => {
    if (!selected?.holePars) return Array(selected?.holes || 18).fill(DEFAULTS.PAR);
    return selected.holePars
      .sort((a, b) => a.hole - b.hole)
      .map(h => h.par);
  }, [selected]);

  const currentPlayer = useMemo(() => {
    const player = players[currentPlayerIdx] || null;
    console.log('Current player updated:', { 
      player, 
      currentPlayerIdx, 
      playersLength: players.length,
      playerScores: player?.scores,
      playersArray: players
    });
    return player;
  }, [players, currentPlayerIdx]);

  const totals = useMemo(() => {
    if (!currentPlayer || !Array.isArray(currentPlayer.scores)) return { score: 0, par: 0, toPar: 0 };
    
    const score = currentPlayer.scores.reduce((sum, score, i) => {
      return sum + (score ?? parByHole[i] ?? DEFAULTS.PAR);
    }, 0);
    
    const par = parByHole.reduce((sum, p) => sum + p, 0);
    const toPar = score - par;
    
    console.log('Totals calculated:', { score, par, toPar, currentPlayer: currentPlayer.scores });
    return { score, par, toPar };
  }, [currentPlayer, parByHole]);

  const data = useMemo(() => {
    if (!currentPlayer || !Array.isArray(currentPlayer.scores)) return [];
    
    const chartData = parByHole.map((par, i) => ({
      hole: i + 1,
      score: currentPlayer.scores[i] ?? par,
      par,
      toPar: (currentPlayer.scores[i] ?? par) - par
    }));
    
    console.log('Chart data calculated:', chartData);
    return chartData;
  }, [currentPlayer, parByHole]);

  const yMax = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return 10;
    const maxScore = Math.max(...data.map(d => d.score));
    return Math.max(10, maxScore + 2);
  }, [data]);

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses...');
      const res = await fetch('/api/courses');
      const data = await res.json();
      console.log('Courses API response:', data);
      const coursesData = Array.isArray(data.courses) ? data.courses : Array.isArray(data) ? data : [];
      console.log('Courses data:', coursesData);
      setCourses(coursesData);
      
      // Auto-select first course if none selected
      if (coursesData.length > 0 && !courseId) {
        console.log('Auto-selecting first course:', coursesData[0].id);
        setCourseId(coursesData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
    }
  };

  const fetchWeather = async () => {
    if (!selected?.latitude || !selected?.longitude) {
      alert('Course location not available for weather data');
      return;
    }

    setLoadingWeather(true);
    try {
      const res = await fetch(`/api/weather?lat=${selected.latitude}&lon=${selected.longitude}`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.weather) {
          setWeather({
            temperature: data.weather.temperature?.toString() || '',
            windSpeed: data.weather.windSpeed?.toString() || '',
            windDirection: data.weather.windDirection || '',
            conditions: data.weather.conditions || '',
            humidity: data.weather.humidity?.toString() || '',
            pressure: data.weather.pressure?.toString() || ''
          });
        } else {
          alert('Weather data not available');
        }
        setShowWeatherInputs(true);
      } else {
        alert('Failed to fetch weather data');
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      alert('Failed to fetch weather data');
    } finally {
      setLoadingWeather(false);
    }
  };

  const startRound = (selectedPlayers: Player[]) => {
    // Initialize players with par values for each hole
    const initializedPlayers = selectedPlayers.map(player => ({
      ...player,
      scores: parByHole.map(par => par) // Initialize with par values
    }));
    
    setPlayers(initializedPlayers);
    setCurrentPlayerIdx(0);
    setStarted(true);
    setShowStartModal(false);
    setShowWeatherInputs(false);
  };

  const cancelRound = () => {
    setPlayers([]);
    setCurrentPlayerIdx(0);
    setStarted(false);
    setShowStartModal(false);
    setShowWeatherInputs(false);
  };

  const updateScore = (playerIdx: number, holeIdx: number, newScore: number) => {
    setPlayers(prev => {
      const next = [...prev];
      next[playerIdx].scores[holeIdx] = newScore;
      return next;
    });
  };

  const incrementScore = (holeIdx: number) => {
    const currentPlayer = players[currentPlayerIdx];
    const playerId = currentPlayer?.id;
    const updateKey = `${playerId}-${holeIdx}-increment`;
    
    if (updatingRef.current.has(updateKey)) {
      console.log('Duplicate call prevented');
      return;
    }
    
    updatingRef.current.add(updateKey);
    
    console.log('Incrementing score for hole', holeIdx, 'current score:', currentPlayer?.scores[holeIdx]);
    
    setPlayers(prev => {
      console.log('setPlayers called with prev:', prev);
      const next = [...prev];
      const currentPlayer = next[currentPlayerIdx];
      if (!currentPlayer || !Array.isArray(currentPlayer.scores)) {
        console.log('No current player or scores array');
        return next;
      }
      
      // Create a new scores array to ensure React detects the change
      const newScores = [...currentPlayer.scores];
      if (newScores[holeIdx] === undefined) {
        newScores[holeIdx] = parByHole[holeIdx];
      }
      newScores[holeIdx] = newScores[holeIdx] + 1;
      
      // Update the player with the new scores array
      next[currentPlayerIdx] = {
        ...currentPlayer,
        scores: newScores
      };
      
      console.log('New score for hole', holeIdx, ':', newScores[holeIdx]);
      console.log('Updated players array:', next);
      return next;
    });
    
    setTimeout(() => {
      updatingRef.current.delete(updateKey);
    }, 50);
  };

  const decrementScore = (holeIdx: number) => {
    const currentPlayer = players[currentPlayerIdx];
    const playerId = currentPlayer?.id;
    const updateKey = `${playerId}-${holeIdx}-decrement`;
    
    if (updatingRef.current.has(updateKey)) {
      console.log('Duplicate call prevented');
      return;
    }
    
    updatingRef.current.add(updateKey);
    
    console.log('Decrementing score for hole', holeIdx, 'current score:', currentPlayer?.scores[holeIdx]);
    
    setPlayers(prev => {
      console.log('setPlayers called with prev (decrement):', prev);
      const next = [...prev];
      const currentPlayer = next[currentPlayerIdx];
      if (!currentPlayer || !Array.isArray(currentPlayer.scores)) {
        console.log('No current player or scores array (decrement)');
        return next;
      }
      
      // Create a new scores array to ensure React detects the change
      const newScores = [...currentPlayer.scores];
      if (newScores[holeIdx] === undefined) {
        newScores[holeIdx] = parByHole[holeIdx];
      }
      newScores[holeIdx] = Math.max(DEFAULTS.MIN_SCORE, newScores[holeIdx] - 1);
      
      // Update the player with the new scores array
      next[currentPlayerIdx] = {
        ...currentPlayer,
        scores: newScores
      };
      
      console.log('New score for hole', holeIdx, ':', newScores[holeIdx]);
      console.log('Updated players array (decrement):', next);
      return next;
    });
    
    setTimeout(() => {
      updatingRef.current.delete(updateKey);
    }, 50);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    // State
    courses,
    courseId,
    setCourseId,
    courseSearch,
    setCourseSearch,
    selected,
    started,
    roundType,
    setRoundType,
    weather,
    setWeather,
    loadingWeather,
    showWeatherInputs,
    setShowWeatherInputs,
    showStartModal,
    setShowStartModal,
    players,
    currentPlayerIdx,
    setCurrentPlayerIdx,
    
    // Computed values
    filteredCourses,
    parByHole,
    currentPlayer,
    totals,
    data,
    yMax,
    
    // Actions
    fetchWeather,
    startRound,
    cancelRound,
    updateScore,
    incrementScore,
    decrementScore,
  };
}
