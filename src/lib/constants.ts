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

// Default values
export const DEFAULTS = {
  PAR: 3,
  HOLE_3_PAR: 4,
  MIN_SCORE: 1,
  MAX_HOLES: 18,
  DEFAULT_ROUND_TYPE: 'CASUAL' as const,
} as const;