"use client";

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function CleanupPage() {
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<any>(null);
  const { toast } = useToast();

  const cleanupOrphanedUsers = useMutation(api.users.cleanupOrphanedUsers);

  const handleCleanup = async () => {
    setIsCleaning(true);
    try {
      const result = await cleanupOrphanedUsers({});
      setCleanupResult(result);
      
      toast({
        title: "Cleanup completed",
        description: `Found ${result.potentiallyOrphaned} potentially orphaned users out of ${result.totalUsers} total users.`,
      });
    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: "Cleanup failed",
        description: "Failed to run cleanup. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Database Cleanup</h1>
        <p className="text-[var(--muted-foreground)]">
          Clean up orphaned user data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orphaned Users Cleanup</CardTitle>
          <CardDescription>
            This will identify users who haven't been active for 30+ days and might be orphaned.
            <br />
            <strong>Note:</strong> This is a read-only operation. It won't delete anything.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleCleanup} 
            disabled={isCleaning}
            variant="outline"
          >
            {isCleaning ? 'Running Cleanup...' : 'Check for Orphaned Users'}
          </Button>

          {cleanupResult && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Cleanup Results:</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Total Users:</strong> {cleanupResult.totalUsers}</p>
                <p><strong>Potentially Orphaned:</strong> {cleanupResult.potentiallyOrphaned}</p>
                
                {cleanupResult.orphanedUsers.length > 0 && (
                  <div>
                    <p className="font-medium mt-3">Orphaned Users:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {cleanupResult.orphanedUsers.map((user: any, index: number) => (
                        <li key={index}>
                          {user.email} (Last update: {new Date(user.lastUpdate).toLocaleDateString()})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual User Deletion</CardTitle>
          <CardDescription>
            To manually delete a user, you can use the Convex dashboard or call the deleteUser mutation directly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p>To delete a user manually:</p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Go to Convex Dashboard</li>
              <li>Find the user in the users table</li>
              <li>Call the deleteUser mutation with their clerkId</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
