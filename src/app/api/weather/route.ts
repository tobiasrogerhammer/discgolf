import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude required" }, { status: 400 });
  }

  try {
    // Using OpenWeatherMap API (free tier)
    // You'll need to add OPENWEATHER_API_KEY to your .env file
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: "Weather API not configured. Please add OPENWEATHER_API_KEY to environment variables.",
        fallback: true
      }, { status: 200 });
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    // Convert wind direction from degrees to compass direction
    const windDegrees = data.wind?.deg || 0;
    const windDirection = getWindDirection(windDegrees);

    // Map weather conditions to our format
    const conditions = mapWeatherCondition(data.weather[0]?.main);

    return NextResponse.json({
      weather: {
        temperature: Math.round(data.main.temp),
        windSpeed: Math.round((data.wind?.speed || 0) * 3.6), // Convert m/s to km/h
        windDirection,
        conditions,
        humidity: Math.round(data.main.humidity),
        pressure: Math.round(data.main.pressure)
      }
    });

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json({ 
      error: "Failed to fetch weather data" 
    }, { status: 500 });
  }
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function mapWeatherCondition(condition: string): string {
  const conditionMap: Record<string, string> = {
    'Clear': 'Sunny',
    'Clouds': 'Cloudy',
    'Rain': 'Rainy',
    'Drizzle': 'Rainy',
    'Thunderstorm': 'Rainy',
    'Snow': 'Rainy',
    'Mist': 'Foggy',
    'Fog': 'Foggy',
    'Haze': 'Foggy',
    'Dust': 'Foggy',
    'Sand': 'Foggy',
    'Ash': 'Foggy',
    'Squall': 'Windy',
    'Tornado': 'Windy'
  };
  
  return conditionMap[condition] || 'Cloudy';
}
