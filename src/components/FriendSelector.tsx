"use client";

import { useState } from "react";
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, User, UserPlus, X, Search } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface Participant {
  id: string;
  type: 'user' | 'guest';
  name: string;
  email?: string;
  userId?: any; // Convex ID type
}

interface FriendSelectorProps {
  participants: Participant[];
  onParticipantsChange: (participants: Participant[]) => void;
}

export function FriendSelector({ participants, onParticipantsChange }: FriendSelectorProps) {
  const { currentUser } = useCurrentUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const friends = useQuery(api.friends.getFriends, 
    currentUser ? { userId: currentUser._id } : "skip"
  );
  
  // Filter friends based on search query
  const filteredFriends = friends?.filter(friend => {
    if (!friend) return false;
    const name = friend.username || friend.name || friend.email || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const addFriend = (friend: any) => {
    const newParticipant: Participant = {
      id: `user-${friend._id}`,
      type: 'user',
      name: friend.username || friend.name || friend.email,
      email: friend.email,
      userId: friend._id,
    };

    // Check if already added
    if (participants.some(p => p.userId === friend._id)) {
      return;
    }

    onParticipantsChange([...participants, newParticipant]);
  };

  const addGuest = () => {
    if (!guestName.trim()) return;

    const newParticipant: Participant = {
      id: `guest-${Date.now()}`,
      type: 'guest',
      name: guestName.trim(),
      email: guestEmail.trim() || undefined,
    };

    onParticipantsChange([...participants, newParticipant]);
    setGuestName('');
    setGuestEmail('');
    setIsDialogOpen(false);
  };


  const removeParticipant = (id: string) => {
    onParticipantsChange(participants.filter(p => p.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Playing With
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Participants */}
        {participants.length > 0 && (
          <div className="space-y-2">
            <Label>Participants ({participants.length + 1})</Label>
            <div className="space-y-2">
              {/* Main player */}
              <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">You</span>
                  <Badge variant="secondary">Host</Badge>
                </div>
              </div>
              
              {/* Other participants */}
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {participant.type === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    <span className="font-medium">{participant.name}</span>
                    <Badge variant={participant.type === 'user' ? 'default' : 'outline'}>
                      {participant.type === 'user' ? 'Friend' : 'Guest'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParticipant(participant.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Participants */}
        <div className="space-y-3">
          {/* Add Friends - Search Bar */}
          {friends && friends.length > 0 && (
            <div className="space-y-2">
              <Label>Add Friends</Label>
              <div className="relative">
                <Input
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-8"
                />
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              
              {/* Only show results when searching */}
              {searchQuery && (
                <>
                  {/* Filtered Friends List */}
                  {filteredFriends
                    .filter(friend => friend && !participants.some(p => p.userId === friend._id))
                    .length > 0 ? (
                    <div className="max-h-32 overflow-y-auto space-y-2">
                      {filteredFriends
                        .filter(friend => friend && !participants.some(p => p.userId === friend._id))
                        .map((friend) => (
                          <div
                            key={friend?._id}
                            className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => friend && addFriend(friend)}
                          >
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium text-sm">{friend?.username || friend?.name || friend?.email}</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No friends found matching "{searchQuery}"
                    </div>
                  )}
                </>
              )}
            </div>
          )}


          {/* Add Guest */}
          <div className="space-y-2">
            <Label>Add Guest</Label>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Guest Player
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Guest Player</DialogTitle>
                  <DialogDescription>
                    Add a guest player who doesn't have an account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="guestName">Name *</Label>
                    <Input
                      id="guestName"
                      placeholder="Enter guest name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="guestEmail">Email (optional)</Label>
                    <Input
                      id="guestEmail"
                      type="email"
                      placeholder="Enter guest email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </div>
                  <Button onClick={addGuest} disabled={!guestName.trim()}>
                    Add Guest
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
