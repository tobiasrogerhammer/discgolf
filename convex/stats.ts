import { query } from "./_generated/server";
import { v } from "convex/values";

export const getCourseStats = query({
  args: { 
    userId: v.id("users"),
    courseId: v.id("courses"),
    timePeriod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");

    const courseHoles = await ctx.db
      .query("courseHoles")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const rounds = await ctx.db
      .query("rounds")
      .withIndex("by_user_course", (q) => 
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .filter((q) => q.eq(q.field("completed"), true))
      .collect();

    if (rounds.length === 0) {
      return {
        courseId: args.courseId,
        courseName: course.name,
        averageScores: [],
        parByHole: courseHoles.map(hole => hole.par),
        totalRounds: 0,
        bestScore: 0,
        worstScore: 0,
        averageScore: 0,
      };
    }

    const scoresByHole: { [hole: number]: number[] } = {};
    const totalScores: number[] = [];

    for (const round of rounds) {
      const scores = await ctx.db
        .query("scores")
        .withIndex("by_round", (q) => q.eq("roundId", round._id))
        .collect();

      if (round.totalStrokes) {
        totalScores.push(round.totalStrokes);
      }

      for (const score of scores) {
        if (!scoresByHole[score.hole]) {
          scoresByHole[score.hole] = [];
        }
        scoresByHole[score.hole].push(score.strokes);
      }
    }

    const averageScores = courseHoles.map(hole => {
      const holeScores = scoresByHole[hole.hole] || [];
      return holeScores.length > 0 
        ? holeScores.reduce((sum, score) => sum + score, 0) / holeScores.length
        : 0;
    });

    const bestScore = Math.min(...totalScores);
    const worstScore = Math.max(...totalScores);
    const averageScore = totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length;

    return {
      courseId: args.courseId,
      courseName: course.name,
      averageScores,
      parByHole: courseHoles.map(hole => hole.par),
      totalRounds: rounds.length,
      bestScore,
      worstScore,
      averageScore,
    };
  },
});

export const getAnalytics = query({
  args: { 
    userId: v.id("users"),
    timePeriod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const rounds = await ctx.db
      .query("rounds")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("completed"), true))
      .collect();

    const totalRounds = rounds.length;
    const totalStrokes = rounds.reduce((sum, round) => sum + (round.totalStrokes || 0), 0);
    const averageScore = totalRounds > 0 ? totalStrokes / totalRounds : 0;

    // Get unique courses played
    const courseIds = new Set(rounds.map(round => round.courseId));
    const coursesPlayed = courseIds.size;

    // Get rounds by type
    const roundsByType = rounds.reduce((acc, round) => {
      acc[round.roundType] = (acc[round.roundType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRounds,
      totalStrokes,
      averageScore,
      coursesPlayed,
      roundsByType,
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
        .withIndex("by_requester", (q) => q.eq("requesterId", args.userId))
        .filter((q) => q.eq(q.field("status"), "ACCEPTED"))
        .collect();

      const friendshipsAsAddressee = await ctx.db
        .query("friendships")
        .withIndex("by_addressee", (q) => q.eq("addresseeId", args.userId))
        .filter((q) => q.eq(q.field("status"), "ACCEPTED"))
        .collect();

      const allFriendships = [...friendships, ...friendshipsAsAddressee];
      const friendIds = new Set(
        allFriendships.map(friendship => 
          friendship.requesterId === args.userId 
            ? friendship.addresseeId 
            : friendship.requesterId
        )
      );
      friendIds.add(args.userId); // Include current user
      
      users = users.filter(user => friendIds.has(user._id));
    }
    
    const leaderboard = await Promise.all(
      users.map(async (user) => {
        let rounds = await ctx.db
          .query("rounds")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .filter((q) => q.eq(q.field("completed"), true))
          .collect();

        // Filter by course if specified
        if (args.courseId) {
          rounds = rounds.filter(round => round.courseId === args.courseId);
        }

        if (rounds.length === 0) return null;

        const totalStrokes = rounds.reduce((sum, round) => sum + (round.totalStrokes || 0), 0);
        const averageScore = totalStrokes / rounds.length;
        const bestScore = Math.min(...rounds.map(round => round.totalStrokes || Infinity));

        return {
          user,
          totalRounds: rounds.length,
          averageScore,
          bestScore: bestScore === Infinity ? 0 : bestScore,
          recentRounds: rounds.length, // Could filter by time period here
        };
      })
    );

    return leaderboard
      .filter(Boolean)
      .sort((a, b) => a!.averageScore - b!.averageScore);
  },
});


