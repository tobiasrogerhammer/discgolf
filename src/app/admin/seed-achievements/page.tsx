"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function SeedAchievementsPage() {
  const seedAchievements = useMutation(api.achievements.seedAchievements);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSeedAchievements = async () => {
    setLoading(true);
    setStatus("Seeding achievements...");
    try {
      const result = await seedAchievements();
      setStatus(`Successfully seeded ${result.inserted} achievements!`);
      toast({
        title: "Success",
        description: `Seeded ${result.inserted} achievements in the database.`,
      });
    } catch (error: any) {
      setStatus(`Error seeding achievements: ${error.message}`);
      toast({
        title: "Error",
        description: `Failed to seed achievements: ${error.message}`,
        variant: "destructive",
      });
      console.error("Error seeding achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin: Seed Achievements</CardTitle>
          <CardDescription>
            This page allows you to manually seed the achievements data in the Convex database.
            This will clear existing achievements and insert the predefined achievement set.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleSeedAchievements} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Seeding..." : "Seed Achievements"}
          </Button>
          {status && (
            <p className={`text-sm ${status.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>
              {status}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
