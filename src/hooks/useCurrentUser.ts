import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useEffect } from 'react'

export function useCurrentUser() {
  const { user, isLoaded } = useUser()
  const currentUser = useQuery(api.users.getCurrentUser, 
    user ? { clerkId: user.id } : "skip"
  )
  const createUser = useMutation(api.users.createUser)
  const generateUsernameForUser = useMutation(api.users.generateUsernameForUser)

  // Automatically create user in Convex when they sign in with Clerk
  useEffect(() => {
    if (isLoaded && user && !currentUser) {
      // User is signed in with Clerk but doesn't exist in Convex database
      const email = user.emailAddresses[0]?.emailAddress || '';
      const name = user.fullName || '';
      
      // Generate username from email or name
      let username = '';
      if (name) {
        // Use name: "John Doe" -> "john_doe"
        username = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      } else if (email) {
        // Use email: "john@example.com" -> "john"
        username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      }
      
      // Add random number if username is too short or empty
      if (username.length < 3) {
        username = `user_${Math.random().toString(36).substr(2, 6)}`;
      }
      
      createUser({
        email: email,
        username: username,
        name: name || undefined,
        image: user.imageUrl || undefined,
        clerkId: user.id,
      }).catch((error) => {
        console.error('Failed to create user in Convex:', error)
      })
    }
  }, [isLoaded, user, currentUser, createUser])

  // Automatically generate username for existing users who don't have one
  useEffect(() => {
    if (isLoaded && user && currentUser && !currentUser.username) {
      // User exists in Convex but doesn't have a username
      generateUsernameForUser({
        clerkId: user.id,
      }).catch((error) => {
        console.error('Failed to generate username for user:', error)
      })
    }
  }, [isLoaded, user, currentUser, generateUsernameForUser])

  return {
    user,
    currentUser,
    isLoaded,
  }
}
