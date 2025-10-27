"use client";

import { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast';
import { FriendSelector } from '@/components/FriendSelector';
import { Cloud, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Participant {
  id: string;
  type: 'user' | 'guest';
  name: string;
  email?: string;
  userId?: any;
}

interface WeatherData {
  temperature: number;
  windSpeed: number;
  conditions: string;
  humidity: number;
}

interface StartRoundModalProps {
  course: {
    _id: string;
    name: string;
    location?: string;
    holes: number;
    latitude?: number;
    longitude?: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (params: {
    courseId: string;
    roundType: string;
    participants: Participant[];
    weather?: WeatherData;
  }) => void;
}

export function StartRoundModal({ course, isOpen, onClose, onStartGame }: StartRoundModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [roundType, setRoundType] = useState<string>("CASUAL");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Fetch weather data when modal opens
  useEffect(() => {
    if (isOpen && course.latitude && course.longitude) {
      // Optionally fetch weather on open
    }
  }, [isOpen, course]);

  const handleFetchWeather = async () => {
    if (!course.latitude || !course.longitude) {
     
      return;
    }

    setIsLoadingWeather(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${course.latitude}&lon=${course.longitude}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Weather fetch failed');
      }
      
      const data = await response.json();
      
      setWeather({
        temperature: Math.round(data.main.temp),
        windSpeed: Math.round(data.wind?.speed || 0),
        conditions: data.weather[0]?.main || 'Clear',
        humidity: data.main.humidity || 0,
      });
      
    
    } catch (error) {
      console.error('Error fetching weather:', error);
      toast({
        title: "Weather Fetch Failed",
        description: "Could not fetch weather data. Please enter manually.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const handleStartGame = () => {
    onStartGame({
      courseId: course._id,
      roundType,
      participants,
      weather: weather || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-[95vw]">
        <DialogHeader>
          <DialogTitle>Start Round</DialogTitle>
          <DialogDescription>
            Configure your round settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Round Type Selection */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-around">
                <div>
                  <h3 className="font-semibold text-sm">Round Type</h3>
                </div>
                <Select value={roundType} onValueChange={setRoundType}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASUAL">Casual</SelectItem>
                    <SelectItem value="PRACTICE">Practice</SelectItem>
                    <SelectItem value="TOURNAMENT">Tournament</SelectItem>
                    <SelectItem value="COMPETITIVE">Competitive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Friend/Player Selection */}
          <FriendSelector 
            participants={participants}
            onParticipantsChange={setParticipants}
          />


          {/* Weather Selection */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-sm">Weather Conditions</h3>
                  <p className="text-xs text-muted-foreground">
                    Current weather at the course
                  </p>
                </div>
                
                {course.latitude && course.longitude ? (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={handleFetchWeather}
                      disabled={isLoadingWeather}
                      className="w-full"
                    >
                      <Cloud className="w-4 h-4 mr-2" />
                      {isLoadingWeather ? 'Fetching...' : 'Fetch Weather'}
                    </Button>
                    
                    {weather && (
                      <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="text-xs text-muted-foreground">Temperature</div>
                          <div className="text-sm font-semibold">{weather.temperature}°C</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Wind</div>
                          <div className="text-sm font-semibold">{weather.windSpeed} m/s</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Conditions</div>
                          <div className="text-sm font-semibold">{weather.conditions}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Humidity</div>
                          <div className="text-sm font-semibold">{weather.humidity}%</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Location data not available for this course
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Start Game Button */}
         
                <Button 
                  onClick={handleStartGame}
                  className="w-full h-12 text-base font-medium"
                >
                  Start Game
                </Button>
              </div>
      </DialogContent>
    </Dialog>
  );
}

