"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function FixExistingUsersPage() {
  const checkAllUsersAchievements = useMutation(api.achievements.checkAllUsersAchievements);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const handleFixExistingUsers = async () => {
    setLoading(true);
    setStatus("Checking achievements for all existing users...");
    try {
      const result = await checkAllUsersAchievements();
      setResults(result);
      setStatus(`Successfully processed ${result.totalUsers} users!`);
      toast({
        title: "Success",
        description: `Processed ${result.totalUsers} users and awarded achievements where applicable.`,
      });
    } catch (error: any) {
      setStatus(`Error processing users: ${error.message}`);
      toast({
        title: "Error",
        description: `Failed to process users: ${error.message}`,
        variant: "destructive",
      });
      console.error("Error processing users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin: Fix Achievements for Existing Users</CardTitle>
          <CardDescription>
            This page checks all existing users and awards achievements they should have earned based on their current stats.
            This is useful for users who were created before the achievements system was implemented.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleFixExistingUsers} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Processing..." : "Check & Award Achievements for All Users"}
          </Button>
          {status && (
            <p className={`text-sm ${status.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>
              {status}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
            <CardDescription>
              Summary of achievements awarded to existing users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {results.totalUsers}
                </div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.results.filter((r: any) => r.awardedCount > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Users with New Achievements</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">User Results:</h4>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {results.results.map((result: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {result.username || `User ${result.userId}`}
                      </div>
                      {result.error ? (
                        <div className="text-sm text-red-600">Error: {result.error}</div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {result.awardedCount > 0 
                            ? `Awarded ${result.awardedCount} achievement(s)` 
                            : 'No new achievements'
                          }
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {result.awardedCount > 0 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          +{result.awardedCount}
                        </Badge>
                      )}
                      {result.error && (
                        <Badge variant="destructive">Error</Badge>
                      )}
                      {!result.error && result.awardedCount === 0 && (
                        <Badge variant="outline">No Change</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary of awarded achievements */}
            {results.results.some((r: any) => r.achievements && r.achievements.length > 0) && (
              <div className="space-y-3">
                <h4 className="font-semibold">Achievements Awarded:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {results.results
                    .filter((r: any) => r.achievements && r.achievements.length > 0)
                    .map((result: any, index: number) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="font-medium text-green-800">
                          {result.username || `User ${result.userId}`}
                        </div>
                        <div className="text-sm text-green-600">
                          {result.achievements.join(', ')}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
