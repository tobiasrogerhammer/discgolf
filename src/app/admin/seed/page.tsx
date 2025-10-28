"use client";

import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResults, setSeedResults] = useState<{
    courses?: any;
    achievements?: any;
  } | null>(null);

  const seedCourses = useMutation(api.seed.seedCourses);
  const seedAchievements = useMutation(api.achievements.seedAchievements);

  const handleSeedCourses = async () => {
    setIsSeeding(true);
    try {
      const result = await seedCourses({});
      setSeedResults(prev => ({ ...prev, courses: result }));
    } catch (error) {
      console.error('Error seeding courses:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeedAchievements = async () => {
    setIsSeeding(true);
    try {
      const result = await seedAchievements();
      setSeedResults(prev => ({ ...prev, achievements: result }));
    } catch (error) {
      console.error('Error seeding achievements:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeedAll = async () => {
    setIsSeeding(true);
    try {
      const coursesResult = await seedCourses({});
      const achievementsResult = await seedAchievements();
      setSeedResults({
        courses: coursesResult,
        achievements: achievementsResult
      });
    } catch (error) {
      console.error('Error seeding all:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Database Seeding</h1>
        <p className="text-[var(--muted-foreground)]">
          Seed your database with sample data
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Courses Seed */}
        <Card>
          <CardHeader>
            <CardTitle>Seed Courses</CardTitle>
            <CardDescription>
              Add sample disc golf courses (Ekeberg, Krokhol, Stovner)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSeedCourses} 
              disabled={isSeeding}
              className="w-full"
            >
              {isSeeding ? 'Seeding...' : 'Seed Courses'}
            </Button>
            {seedResults?.courses && (
              <div className="mt-2 text-sm text-green-600">
                ✅ Courses seeded successfully
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements Seed */}
        <Card>
          <CardHeader>
            <CardTitle>Seed Achievements</CardTitle>
            <CardDescription>
              Add 10 different achievements for users to unlock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSeedAchievements} 
              disabled={isSeeding}
              className="w-full"
            >
              {isSeeding ? 'Seeding...' : 'Seed Achievements'}
            </Button>
            {seedResults?.achievements && (
              <div className="mt-2 text-sm text-green-600">
                ✅ {seedResults.achievements.inserted} achievements seeded
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Seed All */}
      <Card>
        <CardHeader>
          <CardTitle>Seed Everything</CardTitle>
          <CardDescription>
            Seed all sample data at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleSeedAll} 
            disabled={isSeeding}
            className="w-full"
            variant="default"
          >
            {isSeeding ? 'Seeding All...' : 'Seed All Data'}
          </Button>
          {seedResults && (
            <div className="mt-2 text-sm text-green-600">
              ✅ All data seeded successfully
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {seedResults && (
        <Card>
          <CardHeader>
            <CardTitle>Seed Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(seedResults, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
