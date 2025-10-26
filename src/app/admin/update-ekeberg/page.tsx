"use client";

import { useState } from "react";
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UpdateEkebergPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const updateEkebergCourse = useMutation(api.courses.updateEkebergCourse);

  const handleUpdateEkeberg = async () => {
    setIsUpdating(true);
    setResult(null);
    
    try {
      const result = await updateEkebergCourse();
      setResult(`Successfully updated Ekeberg course with ${result.holeIds.length} holes!`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Update Ekeberg Course</h1>
        <p className="text-muted-foreground">
          Update the Ekeberg course with correct hole data from the reference image
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ekeberg Course Data</CardTitle>
          <CardDescription>
            This will update the Ekeberg course with the correct hole par and distance data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>Expected Data:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>18 holes total</li>
              <li>Total distance: 3992 ft</li>
              <li>Par rating: 170</li>
              <li>Most holes between 148 ft - 294 ft</li>
              <li>Hole 3 is par 4, all others are par 3</li>
            </ul>
          </div>
          
          <Button 
            onClick={handleUpdateEkeberg}
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? "Updating..." : "Update Ekeberg Course Data"}
          </Button>
          
          {result && (
            <div className={`p-3 rounded-lg text-sm ${
              result.includes('Successfully') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {result}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
