// Core domain types
export interface User {
  _id: string;
  name: string | null;
  email: string;
  image?: string | null;
  clerkId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Course {
  _id: string;
  name: string;
  holes: number;
  location?: string | null;
  description?: string | null;
  addressUrl?: string | null;
  estimatedLengthMeters?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  difficulty?: string | null;
  createdAt: number;
}

export interface CourseHole {
  _id: string;
  courseId: string;
  hole: number;
  par: number;
  distanceMeters?: number | null;
}

export interface Round {
  _id: string;
  courseId: string;
  userId: string;
  totalStrokes?: number | null;
  rating?: number | null;
  roundType: RoundType;
  startedAt: number;
  completed: boolean;
  notes?: string | null;
  shared: boolean;
  groupRoundId?: string | null;
  course?: Course;
  scores?: Score[];
  weather?: Weather;
}

export interface Score {
  _id: string;
  roundId: string;
  hole: number;
  strokes: number;
}

export interface Weather {
  _id: string;
  roundId: string;
  temperature?: number | null;
  windSpeed?: number | null;
  windDirection?: string | null;
  conditions?: string | null;
  humidity?: number | null;
  pressure?: number | null;
}

export interface Friendship {
  _id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: number;
  requester?: User;
  addressee?: User;
}

export interface Player {
  _id: string;
  name: string;
  email: string;
  scores: number[];
}

// Enums
export type RoundType = 'CASUAL' | 'PRACTICE' | 'TOURNAMENT' | 'COMPETITIVE';
export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'BLOCKED';
export type GroupRole = 'ADMIN' | 'MEMBER';
export type ChallengeType = 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
export type GoalType = 'SCORE_IMPROVEMENT' | 'ROUNDS_PLAYED' | 'COURSES_PLAYED' | 'DISTANCE_THROWN' | 'PUTTING_ACCURACY' | 'CUSTOM';
export type ActivityType = 'ROUND_COMPLETED' | 'ACHIEVEMENT_EARNED' | 'GOAL_COMPLETED' | 'FRIEND_ADDED' | 'CHALLENGE_COMPLETED' | 'PERSONAL_BEST';

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
