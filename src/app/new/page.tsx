"use client";

import { useState } from "react";
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { FriendSelector } from '@/components/FriendSelector';
import { MultiPlayerScoreInput } from '@/components/MultiPlayerScoreInput';

interface Participant {
  id: string;
  type: 'user' | 'guest';
  name: string;
  email?: string;
  userId?: any; // Convex ID type
}

interface ScoreData {
  [participantId: string]: {
    [hole: number]: number;
  };
}

export default function NewGamePage() {
  const { user, currentUser } = useCurrentUser();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [roundType, setRoundType] = useState<string>("CASUAL");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [scores, setScores] = useState<ScoreData>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const courses = useQuery(api.courses.getAll);
  const courseHoles = useQuery(api.courses.getHoles, 
    selectedCourse ? { courseId: selectedCourse as any } : "skip"
  );
  
  const createRound = useMutation(api.rounds.create);
  const createGroupRound = useMutation(api.groupRounds.createGroupRound);
  
  const { toast } = useToast();

  const selectedCourseData = courses?.find(c => c._id === selectedCourse);

  const handleScoresChange = (newScores: ScoreData) => {
    setScores(newScores);
  };

  const handleRoundComplete = (complete: boolean) => {
    setIsRoundComplete(complete);
  };

  const handleSaveRound = async () => {
    if (!selectedCourse || !currentUser) {
      console.error('Missing required data:', { selectedCourse, currentUser });
      return;
    }

    console.log('Saving round with data:', {
      selectedCourse,
      currentUser: currentUser._id,
      participants: participants.length,
      scores: Object.keys(scores),
      roundType
    });

    setIsSaving(true);
    try {
      if (participants.length === 0) {
        // Single player round
        const playerScores = scores['you'] || {};
        const roundScores = courseHoles?.map((hole, index) => ({
          hole: hole.hole,
          strokes: playerScores[index] || hole.par,
        })) || [];

        await createRound({
          userId: currentUser._id,
          courseId: selectedCourse as any,
          roundType: roundType as any,
          scores: roundScores,
        });

        toast({
          title: "Round saved!",
          description: "Your disc golf round has been saved successfully.",
        });
      } else {
        // Group round
        const allParticipants = [
          {
            userId: currentUser._id,
            scores: courseHoles?.map((hole, index) => ({
              hole: hole.hole,
              strokes: scores['you']?.[index] || hole.par,
            })) || [],
          },
          ...participants.map(participant => ({
            userId: participant.userId as any,
            guestName: participant.type === 'guest' ? participant.name : undefined,
            guestEmail: participant.type === 'guest' ? participant.email : undefined,
            scores: courseHoles?.map((hole, index) => ({
              hole: hole.hole,
              strokes: scores[participant.id]?.[index] || hole.par,
            })) || [],
          }))
        ];

        await createGroupRound({
          userId: currentUser._id,
          courseId: selectedCourse as any,
          roundType: roundType as any,
          participants: allParticipants,
        });

        toast({
          title: "Group round saved!",
          description: `Round with ${participants.length + 1} players has been saved successfully.`,
        });
      }

      // Reset form
      setSelectedCourse(null);
      setParticipants([]);
      setScores({});
      setIsDialogOpen(false);
      setIsRoundComplete(false);
    } catch (error) {
      console.error("Error saving round:", error);
      toast({
        title: "Error",
        description: "Failed to save round. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Temporarily disabled for testing
  // if (!user || !currentUser) {
  //   return (
  //     <div className="p-4">
  //       <Card>
  //         <CardHeader>
  //           <CardTitle>Sign in required</CardTitle>
  //           <CardDescription>
  //             Please sign in to start tracking your disc golf rounds.
  //           </CardDescription>
  //         </CardHeader>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="p-4 space-y-6 snap-start">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">New Round</h1>
        <p className="text-[var(--muted-foreground)]">
          Start tracking a new disc golf round
        </p>
      </div>

      {/* Debug info */}
      <div className="p-4 bg-gray-100 rounded-lg text-sm">
        <p><strong>Debug Info:</strong></p>
        <p>Courses: {courses === undefined ? 'Loading...' : courses === null ? 'Error' : `${courses.length} courses loaded`}</p>
        <p>User: {user ? 'Authenticated' : 'Not authenticated'}</p>
        <p>CurrentUser: {currentUser === undefined ? 'Loading...' : currentUser === null ? 'Not found in DB' : 'Found in DB'}</p>
        <p>Participants: {participants.length}</p>
        <div className="mt-2">
          <Button 
            onClick={() => toast({
              title: "Test Toast",
              description: "This is a test toast notification.",
            })}
            size="sm"
          >
            Test Toast
          </Button>
        </div>
      </div>

      {/* Round Type Selection */}
      <Card className="snap-start">
        <CardHeader>
          <CardTitle>Round Type</CardTitle>
          <CardDescription>
            Choose the type of round you're playing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={roundType} onValueChange={setRoundType}>
            <SelectTrigger>
              <SelectValue placeholder="Select round type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASUAL">Casual</SelectItem>
              <SelectItem value="PRACTICE">Practice</SelectItem>
              <SelectItem value="TOURNAMENT">Tournament</SelectItem>
              <SelectItem value="COMPETITIVE">Competitive</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Course Selection */}
      {!selectedCourse ? (
        <Card className="snap-start">
          <CardHeader>
            <CardTitle>Select Course</CardTitle>
            <CardDescription>
              Choose a course to start your round
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-96 overflow-y-auto snap-y snap-mandatory space-y-2">
              {courses?.map((course) => (
                <div
                  key={course._id}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors snap-start"
                  onClick={() => setSelectedCourse(course._id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{course.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {course.holes} holes • {course.location}
                      </p>
                      {course.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {course.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {course.holes} holes
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Selected Course Info */}
          <Card className="snap-start">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{selectedCourseData?.name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCourse(null)}
                >
                  Change Course
                </Button>
              </CardTitle>
              <CardDescription>
                {selectedCourseData?.holes} holes • {selectedCourseData?.location}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Friend/Player Selection */}
          <FriendSelector 
            participants={participants}
            onParticipantsChange={setParticipants}
          />

          {/* Score Input */}
          {courseHoles && (
            <div className="snap-start">
              <MultiPlayerScoreInput
                participants={participants}
                courseHoles={courseHoles}
                onScoresChange={handleScoresChange}
                onRoundComplete={handleRoundComplete}
              />
            </div>
          )}

          {/* Round Status Message */}
          {courseHoles && !isRoundComplete && (
            <Card className="snap-start">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Complete all holes to save your round
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Navigate through all holes and enter scores for all players
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Round - Only show when round is complete */}
          {courseHoles && isRoundComplete && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg">
                  {participants.length === 0 ? 'Save Round' : `Save Group Round (${participants.length + 1} players)`}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Round</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to save this round? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveRound} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Round"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
}