import { API_ENDPOINTS, ERROR_MESSAGES } from "./constants";
import { ApiResponse, WeatherData, Course, Round, StatsData } from "@/types";

// Generic API call wrapper
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || ERROR_MESSAGES.NETWORK_ERROR,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('API call failed:', error);
    return {
      success: false,
      error: ERROR_MESSAGES.NETWORK_ERROR,
    };
  }
}

// Course API calls
export const courseApi = {
  async getAll(): Promise<ApiResponse<Course[]>> {
    return apiCall<Course[]>(API_ENDPOINTS.COURSES);
  },

  async getById(id: string): Promise<ApiResponse<Course>> {
    return apiCall<Course>(`${API_ENDPOINTS.COURSES}/${id}`);
  },

  async search(query: string): Promise<ApiResponse<Course[]>> {
    return apiCall<Course[]>(`${API_ENDPOINTS.COURSES}/search?q=${encodeURIComponent(query)}`);
  },
};

// Round API calls
export const roundApi = {
  async save(roundData: {
    courseId: string;
    strokesByHole: number[];
    roundType: string;
    weather?: WeatherData;
    startedAt?: string;
  }): Promise<ApiResponse<Round>> {
    return apiCall<Round>(API_ENDPOINTS.ROUNDS, {
      method: 'POST',
      body: JSON.stringify(roundData),
    });
  },

  async getById(id: string): Promise<ApiResponse<Round>> {
    return apiCall<Round>(`${API_ENDPOINTS.ROUNDS}/${id}`);
  },

  async share(id: string): Promise<ApiResponse<{ shareUrl: string }>> {
    return apiCall<{ shareUrl: string }>(`${API_ENDPOINTS.ROUNDS}/${id}/share`, {
      method: 'POST',
    });
  },
};

// Stats API calls
export const statsApi = {
  async getCourseStats(courseId: string, timePeriod?: string): Promise<ApiResponse<StatsData>> {
    const url = timePeriod 
      ? `${API_ENDPOINTS.STATS}?courseId=${courseId}&timePeriod=${timePeriod}`
      : `${API_ENDPOINTS.STATS}?courseId=${courseId}`;
    return apiCall<StatsData>(url);
  },

  async getAnalytics(timePeriod?: string): Promise<ApiResponse<any>> {
    const url = timePeriod 
      ? `${API_ENDPOINTS.ANALYTICS}?timePeriod=${timePeriod}`
      : API_ENDPOINTS.ANALYTICS;
    return apiCall<any>(url);
  },
};

// Weather API calls
export const weatherApi = {
  async getWeather(latitude: number, longitude: number): Promise<ApiResponse<WeatherData>> {
    return apiCall<WeatherData>(API_ENDPOINTS.WEATHER, {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    });
  },
};

// Friend API calls
export const friendApi = {
  async getFriends(): Promise<ApiResponse<{ friends: any[] }>> {
    return apiCall<{ friends: any[] }>(API_ENDPOINTS.FRIENDS);
  },

  async inviteFriend(email: string): Promise<ApiResponse<void>> {
    return apiCall<void>(`${API_ENDPOINTS.FRIENDS}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async acceptFriend(friendshipId: string): Promise<ApiResponse<void>> {
    return apiCall<void>(`${API_ENDPOINTS.FRIENDS}/accept`, {
      method: 'POST',
      body: JSON.stringify({ friendshipId }),
    });
  },

  async getLeaderboard(timePeriod?: string): Promise<ApiResponse<any[]>> {
    const url = timePeriod 
      ? `${API_ENDPOINTS.LEADERBOARD}?timePeriod=${timePeriod}`
      : API_ENDPOINTS.LEADERBOARD;
    return apiCall<any[]>(url);
  },
};

// User API calls
export const userApi = {
  async checkUser(username?: string, email?: string): Promise<ApiResponse<{
    exists: boolean;
    user?: any;
    isAlreadyFriend?: boolean;
    isCurrentUser?: boolean;
    message?: string;
  }>> {
    return apiCall(API_ENDPOINTS.USERS_CHECK, {
      method: 'POST',
      body: JSON.stringify({ username, email }),
    });
  },
};

// Achievement API calls
export const achievementApi = {
  async getAchievements(): Promise<ApiResponse<{
    earned: any[];
    available: any[];
  }>> {
    return apiCall<{ earned: any[]; available: any[] }>(API_ENDPOINTS.ACHIEVEMENTS);
  },

  async earnAchievement(achievementId: string): Promise<ApiResponse<any>> {
    return apiCall<any>(API_ENDPOINTS.ACHIEVEMENTS, {
      method: 'POST',
      body: JSON.stringify({ achievementId }),
    });
  },
};

// Export API calls
export const exportApi = {
  async exportData(format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
    const response = await fetch(`${API_ENDPOINTS.EXPORT}?format=${format}`);
    if (!response.ok) {
      throw new Error('Export failed');
    }
    return response.blob();
  },

  async exportRounds(roundIds: string[]): Promise<Blob> {
    const response = await fetch(`${API_ENDPOINTS.EXPORT}/rounds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roundIds }),
    });
    if (!response.ok) {
      throw new Error('Export failed');
    }
    return response.blob();
  },
};
