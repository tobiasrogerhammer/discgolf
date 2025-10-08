// API endpoints
export const API_ENDPOINTS = {
  COURSES: '/api/courses',
  ROUNDS: '/api/rounds',
  STATS: '/api/stats',
  FRIENDS: '/api/friends',
  WEATHER: '/api/weather',
  ACHIEVEMENTS: '/api/achievements',
  GOALS: '/api/goals',
  EXPORT: '/api/export',
  ANALYTICS: '/api/analytics',
  LEADERBOARD: '/api/leaderboard',
  USERS_CHECK: '/api/users/check',
} as const;

// Round types
export const ROUND_TYPES = {
  CASUAL: 'CASUAL',
  PRACTICE: 'PRACTICE', 
  TOURNAMENT: 'TOURNAMENT',
  COMPETITIVE: 'COMPETITIVE',
} as const;

// Weather conditions
export const WEATHER_CONDITIONS = {
  SUNNY: 'Sunny',
  CLOUDY: 'Cloudy',
  RAINY: 'Rainy',
  WINDY: 'Windy',
  FOGGY: 'Foggy',
  SNOWY: 'Snowy',
} as const;

// Wind directions
export const WIND_DIRECTIONS = {
  N: 'North',
  NE: 'Northeast',
  E: 'East',
  SE: 'Southeast',
  S: 'South',
  SW: 'Southwest',
  W: 'West',
  NW: 'Northwest',
} as const;

// Ekeberg rating table
export const EKEBERG_RATINGS = {
  54: 1000,
  55: 990,
  56: 980,
  57: 970,
  58: 960,
  59: 950,
  60: 940,
  61: 930,
  62: 920,
  63: 910,
  64: 900,
  65: 890,
  66: 880,
  67: 870,
  68: 860,
  69: 850,
  70: 840,
  71: 830,
  72: 820,
  73: 810,
  74: 800,
  75: 790,
  76: 780,
  77: 770,
  78: 760,
  79: 750,
  80: 740,
  81: 730,
  82: 720,
  83: 710,
  84: 700,
  85: 690,
  86: 680,
  87: 670,
  88: 660,
  89: 650,
  90: 640,
  91: 630,
  92: 620,
  93: 610,
  94: 600,
  95: 590,
  96: 580,
  97: 570,
  98: 560,
  99: 550,
  100: 540,
} as const;

// Chart configurations
export const CHART_CONFIG = {
  COLORS: {
    SCORE: '#002F45',
    PAR: '#E3A750',
    BACKGROUND: '#BCD4CC',
  },
  Y_AXIS_DEFAULT: [0, 10],
  Y_AXIS_MIN: 0,
} as const;

// UI constants
export const UI_CONSTANTS = {
  MOBILE_BREAKPOINT: 768,
  MAX_SEARCH_RESULTS: 10,
  DEBOUNCE_DELAY: 300,
  UPDATE_DEBOUNCE: 50,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  USER_NOT_FOUND: 'User not found',
  COURSE_NOT_FOUND: 'Course not found',
  ROUND_NOT_FOUND: 'Round not found',
  FRIEND_REQUEST_FAILED: 'Failed to send friend request',
  WEATHER_FETCH_FAILED: 'Failed to fetch weather data',
  SEARCH_FAILED: 'Search failed',
  SAVE_FAILED: 'Failed to save round',
  NETWORK_ERROR: 'Network error. Please check your connection.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  ROUND_SAVED: 'Round saved successfully!',
  FRIEND_REQUEST_SENT: 'Friend request sent!',
  FRIEND_REQUEST_ACCEPTED: 'Friend request accepted!',
  WEATHER_FETCHED: 'Weather data fetched successfully!',
} as const;

// Default values
export const DEFAULTS = {
  PAR: 3,
  HOLE_3_PAR: 4,
  MIN_SCORE: 1,
  MAX_HOLES: 18,
  DEFAULT_ROUND_TYPE: 'CASUAL' as const,
} as const;
