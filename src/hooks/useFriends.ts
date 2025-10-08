"use client";
import { useState, useEffect } from "react";
import { User, SearchResult } from "@/types";
import { UI_CONSTANTS } from "@/lib/constants";

export function useFriends() {
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [friendSearch, setFriendSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const fetchFriends = async () => {
    try {
      const res = await fetch('/api/friends');
      if (res.ok) {
        const data = await res.json();
        setFriends(Array.isArray(data.friends) ? data.friends : []);
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error);
      setFriends([]);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setSearchError('');

    try {
      const res = await fetch('/api/users/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: query, email: query })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.exists && !data.isCurrentUser && data.user) {
          setSearchResults([{
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            isAlreadyFriend: data.isAlreadyFriend,
            isCurrentUser: data.isCurrentUser
          }]);
        } else {
          setSearchResults([]);
          if (data.isCurrentUser) {
            setSearchError('Cannot add yourself');
          } else {
            setSearchError('User not found');
          }
        }
      } else {
        setSearchError('Search failed');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Search failed');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addFriend = (friendId: string) => {
    if (!selectedFriends.includes(friendId)) {
      setSelectedFriends(prev => [...prev, friendId]);
    }
  };

  const removeFriend = (friendId: string) => {
    setSelectedFriends(prev => prev.filter(id => id !== friendId));
  };

  const toggleFriend = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      removeFriend(friendId);
    } else {
      addFriend(friendId);
    }
  };

  const clearSearch = () => {
    setUserSearch('');
    setFriendSearch('');
    setSearchResults([]);
    setSearchError('');
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userSearch.trim()) {
        searchUsers(userSearch);
      } else {
        setSearchResults([]);
        setSearchError('');
      }
    }, UI_CONSTANTS.DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [userSearch]);

  useEffect(() => {
    fetchFriends();
  }, []);

  return {
    // State
    friends,
    selectedFriends,
    setSelectedFriends,
    friendSearch,
    setFriendSearch,
    userSearch,
    setUserSearch,
    searchResults,
    searching,
    searchError,
    
    // Actions
    fetchFriends,
    searchUsers,
    addFriend,
    removeFriend,
    toggleFriend,
    clearSearch,
  };
}
