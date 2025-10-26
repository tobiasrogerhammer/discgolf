import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Test function to verify goals module is working
export const testGoals = query({
  args: {},
  handler: async (ctx) => {
    return "Goals module is working!";
  },
});

// Get all goals for a user
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get monthly rounds goal for a user
export const getMonthlyRoundsGoal = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    try {
      const goals = await ctx.db
        .query("goals")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("type"), "ROUNDS_PLAYED"))
        .collect();

      // Find the most recent monthly goal
      const monthlyGoal = goals.find(goal => {
        if (!goal.deadline) return false;
        const goalDate = new Date(goal.deadline);
        const currentDate = new Date();
        return goalDate.getMonth() === currentDate.getMonth() && 
               goalDate.getFullYear() === currentDate.getFullYear();
      });

      return monthlyGoal || null;
    } catch (error) {
      console.error("Error in getMonthlyRoundsGoal:", error);
      return null;
    }
  },
});

// Create or update monthly rounds goal
export const setMonthlyRoundsGoal = mutation({
  args: { 
    userId: v.id("users"),
    target: v.number()
  },
  handler: async (ctx, args) => {
    // Check if user already has a monthly goal for this month
    const existingGoal = await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("type"), "ROUNDS_PLAYED"))
      .collect();

    const currentDate = new Date();
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const monthlyGoal = existingGoal.find(goal => {
      if (!goal.deadline) return false;
      const goalDate = new Date(goal.deadline);
      return goalDate.getMonth() === currentDate.getMonth() && 
             goalDate.getFullYear() === currentDate.getFullYear();
    });

    if (monthlyGoal) {
      // Update existing goal
      await ctx.db.patch(monthlyGoal._id, {
        target: args.target,
        current: monthlyGoal.current, // Keep current progress
      });
      return monthlyGoal._id;
    } else {
      // Create new goal
      const goalId = await ctx.db.insert("goals", {
        userId: args.userId,
        title: "Monthly Rounds Goal",
        description: `Play ${args.target} rounds this month`,
        type: "ROUNDS_PLAYED",
        target: args.target,
        current: 0,
        deadline: endOfMonth.getTime(),
        completed: false,
        createdAt: Date.now(),
      });
      return goalId;
    }
  },
});

// Update goal progress (called when rounds are completed)
export const updateProgress = mutation({
  args: { 
    userId: v.id("users"),
    goalType: v.union(
      v.literal("ROUNDS_PLAYED"),
      v.literal("COURSES_PLAYED"),
      v.literal("SCORE_IMPROVEMENT")
    )
  },
  handler: async (ctx, args) => {
    const goals = await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("type"), args.goalType))
      .collect();

    for (const goal of goals) {
      let newCurrent = goal.current;

      if (args.goalType === "ROUNDS_PLAYED") {
        // Count rounds for current month
        const rounds = await ctx.db
          .query("rounds")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .collect();

        const currentDate = new Date();
        const monthlyRounds = rounds.filter(round => {
          const roundDate = new Date(round.startedAt);
          return roundDate.getMonth() === currentDate.getMonth() && 
                 roundDate.getFullYear() === currentDate.getFullYear();
        }).length;

        newCurrent = monthlyRounds;
      }

      // Check if goal is completed
      const completed = newCurrent >= goal.target;

      await ctx.db.patch(goal._id, {
        current: newCurrent,
        completed,
      });
    }
  },
});

// Create a custom goal
export const createCustomGoal = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    target: v.number(),
    deadline: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const goalId = await ctx.db.insert("goals", {
      userId: args.userId,
      title: args.title,
      description: args.description,
      type: "CUSTOM",
      target: args.target,
      current: 0,
      deadline: args.deadline,
      completed: false,
      createdAt: Date.now(),
    });
    return goalId;
  },
});

// Delete a goal
export const deleteGoal = mutation({
  args: { goalId: v.id("goals") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.goalId);
  },
});
