"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle } from "lucide-react";

interface CourseImportData {
  name: string;
  location: string;
  holeCount: number;
  difficulty: string;
  holes: Array<{
    hole: number;
    par: number;
    distanceMeters?: number;
  }>;
}

export function CourseImportForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState("");
  const [parsedCourses, setParsedCourses] = useState<CourseImportData[]>([]);
  
  const createCourse = useMutation(api.courses.create);
  const createCourseHoles = useMutation(api.courses.createHoles);
  const { toast } = useToast();

  const parseCourseData = (text: string): CourseImportData[] => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const courses: CourseImportData[] = [];
    let currentCourse: Partial<CourseImportData> = {};
    let currentHoles: Array<{ hole: number; par: number; distanceMeters?: number }> = [];

    for (const line of lines) {
      // Course name
      if (line.match(/^[A-Za-z\s]+$/)) {
        if (currentCourse.name) {
          courses.push({
            ...currentCourse as CourseImportData,
            holes: currentHoles
          });
        }
        currentCourse = { name: line };
        currentHoles = [];
      }
      // Location
      else if (line.includes(',') && !line.includes('Hole')) {
        currentCourse.location = line;
      }
      // Hole data (format: "Hole 1: Par 3, 280m" or "1: 3, 280m")
      else if (line.match(/^(Hole\s+)?\d+:/)) {
        const match = line.match(/(?:Hole\s+)?(\d+):\s*(?:Par\s+)?(\d+)(?:,\s*(\d+)(?:m|meters?)?)?/i);
        if (match) {
          const hole = parseInt(match[1]);
          const par = parseInt(match[2]);
          const distance = match[3] ? parseInt(match[3]) : undefined;
          currentHoles.push({ hole, par, distanceMeters: distance });
        }
      }
      // Difficulty
      else if (line.match(/^(Beginner|Intermediate|Advanced|Expert)$/i)) {
        currentCourse.difficulty = line;
      }
      // Number of holes
      else if (line.match(/^\d+\s+holes?$/i)) {
        currentCourse.holeCount = parseInt(line.match(/\d+/)?.[0] || '18');
      }
    }

    // Add the last course
    if (currentCourse.name) {
      courses.push({
        ...currentCourse as CourseImportData,
        holes: currentHoles
      });
    }

    return courses;
  };

  const handleParse = () => {
    try {
      const courses = parseCourseData(importText);
      setParsedCourses(courses);
      
      if (courses.length === 0) {
        toast({
          title: "No courses found",
          description: "Could not parse any courses from the text. Check the format.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Courses parsed successfully",
          description: `Found ${courses.length} course(s) ready to import.`,
        });
      }
    } catch (error) {
      console.error("Error parsing courses:", error);
      toast({
        title: "Parse error",
        description: "Failed to parse course data. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (parsedCourses.length === 0) return;

    setIsImporting(true);
    let successCount = 0;

    try {
      for (const courseData of parsedCourses) {
        try {
          // Create the course
          const courseId = await createCourse({
            name: courseData.name,
            location: courseData.location,
            holes: courseData.holes.length,
            difficulty: courseData.difficulty,
            estimatedLengthMeters: courseData.holes.reduce((sum, hole) => sum + (hole.distanceMeters || 0), 0)
          });

          // Create the holes
          await createCourseHoles({
            courseId: courseId as any,
            holes: courseData.holes
          });

          successCount++;
        } catch (error) {
          console.error(`Error importing course ${courseData.name}:`, error);
        }
      }

      toast({
        title: "Import completed",
        description: `Successfully imported ${successCount} out of ${parsedCourses.length} courses.`,
      });

      setImportText("");
      setParsedCourses([]);
      onSuccess?.();
    } catch (error) {
      console.error("Error importing courses:", error);
      toast({
        title: "Import error",
        description: "Failed to import courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Courses
        </CardTitle>
        <CardDescription>
          Import multiple courses from text data (course name, location, hole details)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Import Instructions */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Format Instructions:</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Course name on its own line</p>
            <p>• Location (City, Country)</p>
            <p>• Difficulty: Beginner, Intermediate, Advanced, or Expert</p>
            <p>• Hole details: "Hole 1: Par 3, 280m" or "1: 3, 280m"</p>
            <p>• Separate courses with blank lines</p>
          </div>
        </div>

        {/* Example */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Example:</h4>
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
{`Ekeberg Disc Golf Course
Oslo, Norway
Intermediate
Hole 1: Par 3, 280m
Hole 2: Par 3, 320m
Hole 3: Par 4, 450m

Krokhol Disc Golf Course
Sandvika, Norway
Advanced
Hole 1: Par 3, 350m
Hole 2: Par 4, 480m`}
          </pre>
        </div>

        {/* Import Text Area */}
        <div className="space-y-2">
          <Label htmlFor="import-text">Course Data</Label>
          <Textarea
            id="import-text"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste course data here..."
            rows={10}
            className="font-mono text-sm"
          />
        </div>

        {/* Parse Button */}
        <Button onClick={handleParse} disabled={!importText.trim()}>
          <FileText className="h-4 w-4 mr-2" />
          Parse Courses
        </Button>

        {/* Parsed Courses Preview */}
        {parsedCourses.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">Parsed Courses ({parsedCourses.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {parsedCourses.map((course, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">{course.name}</h5>
                      <p className="text-sm text-muted-foreground">
                        {course.location} • {course.holes.length} holes • {course.difficulty}
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </Card>
              ))}
            </div>

            {/* Import Button */}
            <Button 
              onClick={handleImport} 
              disabled={isImporting}
              className="w-full"
            >
              {isImporting ? "Importing..." : `Import ${parsedCourses.length} Courses`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
