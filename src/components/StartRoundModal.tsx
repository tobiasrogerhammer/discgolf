"use client";
import { useState } from "react";
import { RoundType, WeatherForm, Player, SearchResult } from "@/types";
import { ROUND_TYPES, WEATHER_CONDITIONS, WIND_DIRECTIONS } from "@/lib/constants";

interface StartRoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (players: Player[], roundType: RoundType, weather: WeatherForm) => void;
  friends: any[];
  selectedFriends: string[];
  onToggleFriend: (friendId: string) => void;
  searchResults: SearchResult[];
  userSearch: string;
  onUserSearchChange: (value: string) => void;
  onAddPlayer: (user: SearchResult) => void;
  searching: boolean;
  searchError: string;
  selectedCourse: any;
  onFetchWeather: () => void;
  loadingWeather: boolean;
  weather: WeatherForm;
  setWeather: (weather: WeatherForm) => void;
}

export default function StartRoundModal({
  isOpen,
  onClose,
  onStart,
  friends,
  selectedFriends,
  onToggleFriend,
  searchResults,
  userSearch,
  onUserSearchChange,
  onAddPlayer,
  searching,
  searchError,
  selectedCourse,
  onFetchWeather,
  loadingWeather,
  weather,
  setWeather
}: StartRoundModalProps) {
  const [roundType, setRoundType] = useState<RoundType>('CASUAL');
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [showWeatherInputs, setShowWeatherInputs] = useState(false);

  const handleAutoWeather = () => {
    setShowWeatherInputs(true);
    onFetchWeather();
  };

  const handleStart = () => {
    // Create players array with current user and selected friends
    const players: Player[] = [
      {
        id: 'current-user',
        name: 'You',
        email: '',
        scores: [] // Will be initialized with par values in useGameState
      },
      ...selectedPlayers.map(player => ({
        ...player,
        scores: [] // Will be initialized with par values in useGameState
      }))
    ];
    
    onStart(players, roundType, weather);
    onClose();
  };

  const addPlayer = (user: SearchResult) => {
    const newPlayer: Player = {
      id: user.id,
      name: user.name,
      email: user.email,
      scores: []
    };
    
    if (!selectedPlayers.find(p => p.id === user.id)) {
      setSelectedPlayers(prev => [...prev, newPlayer]);
    }
    onUserSearchChange('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 dark:border-gray-600 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border">
        <h2 className="text-xl font-bold text-[var(--header-color)] mb-4">Start New Round</h2>
        
        {/* Round Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Round Type
          </label>
          <select
            value={roundType}
            onChange={(e) => setRoundType(e.target.value as RoundType)}
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-[var(--foreground)]"
          >
            {Object.entries(ROUND_TYPES).map(([key, value]) => (
              <option key={key} value={value}>{value}</option>
            ))}
          </select>
        </div>

        {/* Add Players */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Add Players to Round (Optional)
          </label>
          <input
            type="text"
            placeholder="Search by username or email..."
            value={userSearch}
            onChange={(e) => onUserSearchChange(e.target.value)}
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 text-[var(--foreground)] mb-2"
          />
          
          {searching && <div className="text-sm text-gray-500">Searching...</div>}
          {searchError && <div className="text-sm text-red-500">{searchError}</div>}
          
          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  <button
                    onClick={() => addPlayer(user)}
                    className="btn btn-sm btn-primary"
                    disabled={user.isAlreadyFriend}
                  >
                    {user.isAlreadyFriend ? 'Already Friends' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weather Conditions */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Weather Conditions
            </label>
            {selectedCourse?.latitude && selectedCourse?.longitude && !showWeatherInputs && (
              <button
                onClick={handleAutoWeather}
                disabled={loadingWeather}
                className="btn btn-sm btn-outline"
              >
                {loadingWeather ? 'Loading...' : '🌤️ Auto Weather'}
              </button>
            )}
            {!selectedCourse?.latitude && !showWeatherInputs && (
              <button
                onClick={() => setShowWeatherInputs(true)}
                className="btn btn-sm btn-outline"
              >
                📝 Manual Input
              </button>
            )}
            {showWeatherInputs && (
              <button
                onClick={() => setShowWeatherInputs(false)}
                className="btn btn-sm btn-outline"
              >
                🚫 Hide
              </button>
            )}
          </div>
          {showWeatherInputs && (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Temperature (°C)"
                value={weather.temperature}
                onChange={(e) => setWeather({...weather, temperature: e.target.value})}
                className="p-2 border rounded bg-white dark:bg-gray-700 text-[var(--foreground)]"
              />
              <input
                type="text"
                placeholder="Wind Speed (m/s)"
                value={weather.windSpeed}
                onChange={(e) => setWeather({...weather, windSpeed: e.target.value})}
                className="p-2 border rounded bg-white dark:bg-gray-700 text-[var(--foreground)]"
              />
              <select
                value={weather.windDirection}
                onChange={(e) => setWeather({...weather, windDirection: e.target.value})}
                className="p-2 border rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 text-[var(--foreground)]"
              >
                <option value="">Wind Direction</option>
                {Object.entries(WIND_DIRECTIONS).map(([key, value]) => (
                  <option key={key} value={value}>{value}</option>
                ))}
              </select>
              <select
                value={weather.conditions}
                onChange={(e) => setWeather({...weather, conditions: e.target.value})}
                className="p-2 border rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 text-[var(--foreground)]"
              >
                <option value="">Conditions</option>
                {Object.values(WEATHER_CONDITIONS).map((condition) => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Humidity (%)"
                value={weather.humidity}
                onChange={(e) => setWeather({...weather, humidity: e.target.value})}
                className="p-2 border rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 text-[var(--foreground)]"
              />
              <input
                type="text"
                placeholder="Pressure (hPa)"
                value={weather.pressure}
                onChange={(e) => setWeather({...weather, pressure: e.target.value})}
                className="p-2 border rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 text-[var(--foreground)]"
              />
            </div>
          )}
        </div>

        {/* Selected Players */}
        {selectedPlayers.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Selected Players
            </label>
            <div className="space-y-1">
              {selectedPlayers.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 rounded border">
                  <span>{player.name}</span>
                  <button
                    onClick={() => setSelectedPlayers(prev => prev.filter(p => p.id !== player.id))}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="btn btn-outline flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="btn btn-primary flex-1"
          >
            Start Round
          </button>
        </div>
      </div>
    </div>
  );
}
