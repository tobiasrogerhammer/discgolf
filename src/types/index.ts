// Core domain types
export interface User {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  name: string;
  holes: number;
  description?: string | null;
  addressUrl?: string | null;
  estimatedLengthMeters?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  holePars?: CourseHole[];
}

export interface CourseHole {
  hole: number;
  par: number;
  distanceMeters?: number | null;
}

export interface Round {
  id: string;
  courseId: string;
  userId: string;
  totalStrokes: number;
  rating: number;
  roundType: RoundType;
  startedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  weather?: Weather;
  scores?: Score[];
}

export interface Score {
  id: string;
  roundId: string;
  hole: number;
  strokes: number;
}

export interface Weather {
  id: string;
  roundId: string;
  temperature?: number | null;
  windSpeed?: number | null;
  windDirection?: string | null;
  conditions?: string | null;
  humidity?: number | null;
  pressure?: number | null;
}

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt: Date;
  requester?: User;
  addressee?: User;
}

export interface Player {
  id: string;
  name: string;
  email: string;
  scores: number[];
}

// Enums
export type RoundType = 'CASUAL' | 'PRACTICE' | 'TOURNAMENT' | 'COMPETITIVE';
export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type GroupRole = 'ADMIN' | 'MEMBER';
export type ChallengeType = 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
export type GoalType = 'SCORE' | 'ROUNDS' | 'IMPROVEMENT';
export type ActivityType = 'ROUND_COMPLETED' | 'ACHIEVEMENT_EARNED' | 'GOAL_ACHIEVED' | 'FRIEND_ADDED';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: string;
  conditions: string;
  humidity: number;
  pressure: number;
}

export interface StatsData {
  courseId: string;
  courseName: string;
  averageScores: number[];
  parByHole: number[];
  totalRounds: number;
  bestScore: number;
  worstScore: number;
  averageScore: number;
}

export interface LeaderboardEntry {
  user: User;
  totalRounds: number;
  averageScore: number;
  bestScore: number;
  recentRounds: number;
}

// Form types
export interface WeatherForm {
  temperature: string;
  windSpeed: string;
  windDirection: string;
  conditions: string;
  humidity: string;
  pressure: string;
}

export interface SearchResult {
  id: string;
  name: string;
  email: string;
  isAlreadyFriend?: boolean;
  isCurrentUser?: boolean;
}

// Component props
export interface HeaderProps {
  title: string;
  chip?: string;
}

export interface BottomNavProps {
  currentPath?: string;
}

export interface ChartData {
  hole: number;
  score: number;
  par: number;
  toPar: number;
}

// State types
export interface GameState {
  courses: Course[];
  selectedCourse: Course | null;
  players: Player[];
  currentPlayerIdx: number;
  started: boolean;
  roundType: RoundType;
  weather: WeatherForm;
  showWeatherInputs: boolean;
  showStartModal: boolean;
}

export interface FriendState {
  friends: User[];
  selectedFriends: string[];
  searchResults: SearchResult[];
  searching: boolean;
  searchError: string;
}
