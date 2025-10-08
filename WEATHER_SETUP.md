# Weather API Setup

To enable automatic weather detection for courses, you need to set up a free OpenWeatherMap API key.

## Steps:

1. **Get a free API key:**

   - Go to [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Get your API key from the dashboard

2. **Add to environment variables:**

   - Add `OPENWEATHER_API_KEY=your-api-key-here` to your `.env` file
   - Restart your development server

3. **Update course location:**

   - Click the "📍 Add Location Data for Weather" button on the New Game page
   - This will add latitude/longitude coordinates to the Ekeberg course

4. **Use weather auto-fetch:**
   - When starting a round, click the "🌤️ Auto-fetch" button
   - Weather conditions will be automatically populated

## Features:

- **Automatic weather detection** based on course location
- **Real-time data** including temperature, wind, humidity, pressure
- **Fallback to manual entry** if API is not configured
- **Offline support** - works without internet after initial setup

## API Limits:

- Free tier: 1,000 calls/day
- Perfect for personal use
- No credit card required
