"use client";

import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function TestPage() {
  const { user, isLoaded } = useUser();
  const courses = useQuery(api.courses.getAll);
  const seedCourses = useMutation(api.seed.seedCourses);
  const { toast } = useToast();

  const testToast = () => {
    toast({
      title: "Test Toast",
      description: "This is a test notification!",
    });
  };

  const testSuccessToast = () => {
    toast({
      title: "Success!",
      description: "This is a success notification!",
    });
  };

  const testErrorToast = () => {
    toast({
      title: "Error",
      description: "This is an error notification!",
      variant: "destructive",
    });
  };

  const handleSeed = async () => {
    try {
      await seedCourses({});
      toast({
        title: "Success!",
        description: "Courses seeded successfully!",
      });
    } catch (error) {
      console.error('Error seeding courses:', error);
      toast({
        title: "Error",
        description: "Failed to seed courses",
        variant: "destructive",
      });
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Test Page</CardTitle>
            <CardDescription>
              Please sign in to test the application
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Test Page</h1>
        <p className="text-muted-foreground">
          Test the application components
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Name:</strong> {user?.fullName || 'Not set'}</p>
            <p><strong>Email:</strong> {user?.emailAddresses?.[0]?.emailAddress || 'No email'}</p>
            <p><strong>User ID:</strong> {user?.id || 'No user'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Toast Notifications Test</CardTitle>
          <CardDescription>
            Test the toast notification system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={testToast}>
              Test Default Toast
            </Button>
            <Button onClick={testSuccessToast} variant="outline">
              Test Success Toast
            </Button>
            <Button onClick={testErrorToast} variant="destructive">
              Test Error Toast
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Test</CardTitle>
          <CardDescription>
            Test Convex database connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleSeed}>
            Seed Sample Courses
          </Button>
          
          <div>
            <h3 className="font-semibold mb-2">Courses in Database:</h3>
            {courses ? (
              <div className="space-y-2">
                {courses.map((course: any) => (
                  <div key={course._id} className="p-2 border rounded">
                    <div className="font-medium">{course.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {course.holes} holes • {course.location}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>Loading courses...</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Clerk Authentication: Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${courses !== undefined ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span>Convex Database: {courses !== undefined ? 'Connected' : 'Not connected (run `npx convex dev`)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>shadcn/ui: Loaded</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Toast System: Working</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>1. Run <code className="bg-muted px-1 rounded">npx convex dev</code> to start the backend</p>
            <p>2. Set up your environment variables in <code className="bg-muted px-1 rounded">.env.local</code></p>
            <p>3. Configure your Clerk domain in <code className="bg-muted px-1 rounded">convex/auth.config.js</code></p>
            <p>4. Test the full application functionality</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}