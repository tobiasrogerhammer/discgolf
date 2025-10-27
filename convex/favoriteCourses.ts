import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get user's favorite courses
export const getUserFavorites = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favoriteCourses")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get course details for each favorite
    const coursesWithDetails = await Promise.all(
      favorites.map(async (favorite) => {
        const course = await ctx.db.get(favorite.courseId);
        return {
          ...favorite,
          course,
        };
      })
    );

    return coursesWithDetails.filter(item => item.course !== null);
  },
});

// Add course to favorites
export const addToFavorites = mutation({
  args: { 
    userId: v.id("users"), 
    courseId: v.id("courses") 
  },
  handler: async (ctx, args) => {
    // Check if already favorited
    const existing = await ctx.db
      .query("favoriteCourses")
      .withIndex("by_user_course", (q) => 
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .first();

    if (existing) {
      return existing._id; // Already favorited
    }

    return await ctx.db.insert("favoriteCourses", {
      userId: args.userId,
      courseId: args.courseId,
      createdAt: Date.now(),
    });
  },
});

// Remove course from favorites
export const removeFromFavorites = mutation({
  args: { 
    userId: v.id("users"), 
    courseId: v.id("courses") 
  },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favoriteCourses")
      .withIndex("by_user_course", (q) => 
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .first();

    if (favorite) {
      await ctx.db.delete(favorite._id);
      return true;
    }
    return false;
  },
});

// Check if course is favorited by user
export const isFavorited = query({
  args: { 
    userId: v.id("users"), 
    courseId: v.id("courses") 
  },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favoriteCourses")
      .withIndex("by_user_course", (q) => 
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .first();

    return !!favorite;
  },
});
