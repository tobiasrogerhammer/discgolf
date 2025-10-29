import { query } from "./_generated/server";
import { v } from "convex/values";

// Minimal stats functions to allow deployment
export const getUserStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const rounds = await ctx.db
      .query("rounds")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      totalRounds: rounds.length,
      averageScore: 0,
      bestScore: 0,
    };
  },
});

export const getLeaderboard = query({
  args: { 
    timePeriod: v.optional(v.string()),
    courseId: v.optional(v.id("courses")),
    friendsOnly: v.optional(v.boolean()),
    userId: v.optional(v.id("users"))
  },
  handler: async (ctx, args) => {
    let users = await ctx.db.query("users").collect();
    
    // Filter to friends only if requested
    if (args.friendsOnly && args.userId) {
      const friendships = await ctx.db
        .query("friendships")
        .withIndex("by_requester", (q) => q.eq("requesterId", args.userId!))
        .filter((q) => q.eq(q.field("status"), "ACCEPTED"))
        .collect();

      const friendshipsAsAddressee = await ctx.db
        .query("friendships")
        .withIndex("by_addressee", (q) => q.eq("addresseeId", args.userId!))
        .filter((q) => q.eq(q.field("status"), "ACCEPTED"))
        .collect();

      const allFriendships = [...friendships, ...friendshipsAsAddressee];
      const friendIds = new Set(
        allFriendships.map(friendship => 
          friendship.requesterId === args.userId! 
            ? friendship.addresseeId 
            : friendship.requesterId
        )
      );
      friendIds.add(args.userId!); // Include current user
      
      users = users.filter(user => friendIds.has(user._id));
    }
    
    const leaderboard = await Promise.all(
      users.map(async (user) => {
        const rounds = await ctx.db
          .query("rounds")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        // Calculate average score from rounds
        let totalScore = 0;
        let roundsWithScores = 0;
        
        for (const round of rounds) {
          const scores = await ctx.db
            .query("scores")
            .withIndex("by_round", (q) => q.eq("roundId", round._id))
            .collect();
          
          if (scores.length > 0) {
            const roundTotal = scores.reduce((sum, score) => sum + score.strokes, 0);
            totalScore += roundTotal;
            roundsWithScores++;
          }
        }
        
        const averageScore = roundsWithScores > 0 ? totalScore / roundsWithScores : 0;

        // Extract name from email if no name/username is available
        const emailName = user.email ? user.email.split('@')[0] : 'User';
        
        return {
          userId: user._id,
          username: user.username || user.email,
          name: user.name || user.username || emailName,
          totalRounds: rounds.length,
          averageScore: averageScore,
        };
      })
    );

    return leaderboard.sort((a, b) => b.totalRounds - a.totalRounds);
  },
});

export const getAnalytics = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const rounds = await ctx.db
      .query("rounds")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      totalRounds: rounds.length,
      averageScore: 0,
      bestScore: 0,
      roundsThisMonth: 0,
      roundsThisYear: 0,
    };
  },
});
