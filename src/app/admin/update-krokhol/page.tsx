"use client";

import { useState } from "react";
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function UpdateKrokholPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  const updateKrokholCourse = useMutation(api.courses.updateKrokholCourse);

  const handleUpdateKrokhol = async () => {
    setIsUpdating(true);
    try {
      const result = await updateKrokholCourse();
      toast({
        title: "Success!",
        description: `Krokhol course updated successfully. Course ID: ${result.courseId}`,
      });
    } catch (error) {
      console.error("Error updating Krokhol course:", error);
      toast({
        title: "Error",
        description: "Failed to update Krokhol course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Update Krokhol Course</h1>
        <p className="text-muted-foreground">
          Update the Krokhol Blue Layout course with correct hole data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Krokhol Blue Layout Data</CardTitle>
          <CardDescription>
            This will update the course with the correct hole distances and par values from the layout map.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Course Stats:</strong>
              <ul className="mt-2 space-y-1">
                <li>• 18 holes</li>
                <li>• 6975 ft total (2125m)</li>
                <li>• Par 226</li>
                <li>• Long - highly technical</li>
                <li>• Est. play time: 2h 28m</li>
                <li>• Distance range: 230 ft - 620 ft</li>
              </ul>
            </div>
            <div>
              <strong>Hole Details:</strong>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• Holes 1-9: Mixed par 3-5</li>
                <li>• Holes 10-18: Mixed par 3-5</li>
                <li>• Longest: Hole 16 (758 ft)</li>
                <li>• Shortest: Hole 15 (217 ft)</li>
                <li>• Par 5 holes: 8, 16</li>
                <li>• Par 4 holes: 2, 7, 12, 18</li>
              </ul>
            </div>
          </div>

          <Button 
            onClick={handleUpdateKrokhol}
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? "Updating..." : "Update Krokhol Course"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
