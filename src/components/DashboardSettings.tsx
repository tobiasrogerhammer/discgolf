"use client";

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Settings, RotateCcw, Save, Layout, BarChart3, Zap } from 'lucide-react';

interface DashboardSettingsProps {
  onClose?: () => void;
}

const AVAILABLE_STATS = [
  { key: 'totalRounds', label: 'Total Rounds', icon: '📊' },
  { key: 'bestScore', label: 'Best Score', icon: '🏆' },
  { key: 'totalAces', label: 'Aces', icon: '🎯' },
  { key: 'totalBirdies', label: 'Birdies', icon: '🐦' },
  { key: 'averageScore', label: 'Average Score', icon: '📈' },
  { key: 'consistency', label: 'Consistency', icon: '🎯' },
  { key: 'improvement', label: 'Improvement', icon: '📊' },
  { key: 'coursesPlayed', label: 'Courses Played', icon: '🏌️' },
  { key: 'streak', label: 'Current Streak', icon: '🔥' },
];

const AVAILABLE_SHORTCUTS = [
  { key: 'newRound', label: 'New Round', icon: '🥏', href: '/new' },
  { key: 'previousRounds', label: 'Previous Rounds', icon: '📋', href: '/rounds' },
  { key: 'stats', label: 'Stats', icon: '📊', href: '/stats' },
  { key: 'friends', label: 'Friends', icon: '👥', href: '/friends' },
  { key: 'profile', label: 'Profile', icon: '👤', href: '/profile' },
];

export function DashboardSettings({ onClose }: DashboardSettingsProps) {
  const { currentUser } = useCurrentUser();
  const { toast } = useToast();
  
  const preferences = useQuery(api.userPreferences.getUserPreferences, 
    currentUser ? { userId: currentUser._id } : "skip"
  );
  
  const updatePreferences = useMutation(api.userPreferences.updateUserPreferences);
  const resetPreferences = useMutation(api.userPreferences.resetUserPreferences);
  
  const [isLoading, setIsLoading] = useState(false);
  const [localPreferences, setLocalPreferences] = useState(preferences);

  // Update local state when preferences load
  useState(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  });

  const handleStatToggle = (statKey: string) => {
    if (!localPreferences) return;
    
    const isEnabled = localPreferences.enabledStats.includes(statKey);
    const newEnabledStats = isEnabled
      ? localPreferences.enabledStats.filter(s => s !== statKey)
      : [...localPreferences.enabledStats, statKey];
    
    setLocalPreferences({
      ...localPreferences,
      enabledStats: newEnabledStats,
      statsOrder: newEnabledStats,
    });
  };

  const handleShortcutToggle = (shortcutKey: string) => {
    if (!localPreferences) return;
    
    const isEnabled = localPreferences.enabledShortcuts.includes(shortcutKey);
    const newEnabledShortcuts = isEnabled
      ? localPreferences.enabledShortcuts.filter(s => s !== shortcutKey)
      : [...localPreferences.enabledShortcuts, shortcutKey];
    
    setLocalPreferences({
      ...localPreferences,
      enabledShortcuts: newEnabledShortcuts,
      shortcutsOrder: newEnabledShortcuts,
    });
  };

  const handleSave = async () => {
    if (!currentUser || !localPreferences) return;
    
    setIsLoading(true);
    try {
      await updatePreferences({
        userId: currentUser._id,
        dashboardLayout: localPreferences.dashboardLayout,
        enabledStats: localPreferences.enabledStats,
        enabledShortcuts: localPreferences.enabledShortcuts,
        statsOrder: localPreferences.statsOrder,
        shortcutsOrder: localPreferences.shortcutsOrder,
        showWelcomeMessage: localPreferences.showWelcomeMessage,
        showQuickActions: localPreferences.showQuickActions,
        showRecentActivity: localPreferences.showRecentActivity,
      });
      
      toast({
        title: "Settings Saved!",
        description: "Your dashboard preferences have been updated.",
      });
      
      onClose?.();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      await resetPreferences({ userId: currentUser._id });
      
      toast({
        title: "Settings Reset!",
        description: "Your dashboard has been reset to default settings.",
      });
      
      // Reload preferences
      window.location.reload();
    } catch (error) {
      console.error('Error resetting preferences:', error);
      toast({
        title: "Error",
        description: "Failed to reset preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!localPreferences) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2"></div>
          <div className="text-sm text-muted-foreground">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Dashboard Settings</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Layout Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Layout
          </CardTitle>
          <CardDescription>
            Choose how your dashboard is displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Dashboard Style</label>
            <Select
              value={localPreferences.dashboardLayout}
              onValueChange={(value) => setLocalPreferences({
                ...localPreferences,
                dashboardLayout: value as "COMPACT" | "DEFAULT" | "DETAILED"
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPACT">Compact - Minimal stats and shortcuts</SelectItem>
                <SelectItem value="DEFAULT">Default - Balanced layout</SelectItem>
                <SelectItem value="DETAILED">Detailed - More stats and information</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Welcome Message</label>
                <p className="text-xs text-muted-foreground">Show personalized welcome message</p>
              </div>
              <Switch
                checked={localPreferences.showWelcomeMessage}
                onCheckedChange={(checked) => setLocalPreferences({
                  ...localPreferences,
                  showWelcomeMessage: checked
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Quick Actions</label>
                <p className="text-xs text-muted-foreground">Show quick action buttons</p>
              </div>
              <Switch
                checked={localPreferences.showQuickActions}
                onCheckedChange={(checked) => setLocalPreferences({
                  ...localPreferences,
                  showQuickActions: checked
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Recent Activity</label>
                <p className="text-xs text-muted-foreground">Show recent rounds and achievements</p>
              </div>
              <Switch
                checked={localPreferences.showRecentActivity}
                onCheckedChange={(checked) => setLocalPreferences({
                  ...localPreferences,
                  showRecentActivity: checked
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </CardTitle>
          <CardDescription>
            Choose which statistics to display on your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {AVAILABLE_STATS.map((stat) => {
              const isEnabled = localPreferences.enabledStats.includes(stat.key);
              return (
                <div
                  key={stat.key}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isEnabled 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-muted-foreground'
                  }`}
                  onClick={() => handleStatToggle(stat.key)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{stat.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{stat.label}</div>
                    </div>
                    {isEnabled && (
                      <Badge variant="secondary" className="text-xs">
                        Enabled
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Shortcuts Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Shortcuts
          </CardTitle>
          <CardDescription>
            Choose which shortcuts to display on your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {AVAILABLE_SHORTCUTS.map((shortcut) => {
              const isEnabled = localPreferences.enabledShortcuts.includes(shortcut.key);
              return (
                <div
                  key={shortcut.key}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isEnabled 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-muted-foreground'
                  }`}
                  onClick={() => handleShortcutToggle(shortcut.key)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{shortcut.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{shortcut.label}</div>
                    </div>
                    {isEnabled && (
                      <Badge variant="secondary" className="text-xs">
                        Enabled
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
