import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get user preferences
export const getUserPreferences = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Return default preferences if none exist
    if (!preferences) {
      return {
        dashboardLayout: "DEFAULT" as const,
        enabledStats: ["totalRounds", "bestScore", "totalAces", "totalBirdies"],
        enabledShortcuts: ["newRound", "previousRounds", "stats", "friends"],
        statsOrder: ["totalRounds", "bestScore", "totalAces", "totalBirdies"],
        shortcutsOrder: ["newRound", "previousRounds", "stats", "friends"],
        showWelcomeMessage: true,
        showQuickActions: true,
        showRecentActivity: false,
      };
    }

    return preferences;
  },
});

// Update user preferences
export const updateUserPreferences = mutation({
  args: {
    userId: v.id("users"),
    dashboardLayout: v.optional(v.union(
      v.literal("COMPACT"),
      v.literal("DEFAULT"),
      v.literal("DETAILED")
    )),
    enabledStats: v.optional(v.array(v.string())),
    enabledShortcuts: v.optional(v.array(v.string())),
    statsOrder: v.optional(v.array(v.string())),
    shortcutsOrder: v.optional(v.array(v.string())),
    showWelcomeMessage: v.optional(v.boolean()),
    showQuickActions: v.optional(v.boolean()),
    showRecentActivity: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Create update data object with only the fields that are provided
    const updateData: any = {
      updatedAt: Date.now(),
    };

    // Only include fields that are actually provided
    if (args.dashboardLayout !== undefined) updateData.dashboardLayout = args.dashboardLayout;
    if (args.enabledStats !== undefined) updateData.enabledStats = args.enabledStats;
    if (args.enabledShortcuts !== undefined) updateData.enabledShortcuts = args.enabledShortcuts;
    if (args.statsOrder !== undefined) updateData.statsOrder = args.statsOrder;
    if (args.shortcutsOrder !== undefined) updateData.shortcutsOrder = args.shortcutsOrder;
    if (args.showWelcomeMessage !== undefined) updateData.showWelcomeMessage = args.showWelcomeMessage;
    if (args.showQuickActions !== undefined) updateData.showQuickActions = args.showQuickActions;
    if (args.showRecentActivity !== undefined) updateData.showRecentActivity = args.showRecentActivity;

    if (existing) {
      await ctx.db.patch(existing._id, updateData);
      return existing._id;
    } else {
      return await ctx.db.insert("userPreferences", {
        userId: args.userId,
        dashboardLayout: args.dashboardLayout || "DEFAULT",
        enabledStats: args.enabledStats || ["totalRounds", "bestScore", "totalAces", "totalBirdies"],
        enabledShortcuts: args.enabledShortcuts || ["newRound", "previousRounds", "stats", "friends"],
        statsOrder: args.statsOrder || ["totalRounds", "bestScore", "totalAces", "totalBirdies"],
        shortcutsOrder: args.shortcutsOrder || ["newRound", "previousRounds", "stats", "friends"],
        showWelcomeMessage: args.showWelcomeMessage ?? true,
        showQuickActions: args.showQuickActions ?? true,
        showRecentActivity: args.showRecentActivity ?? false,
        updatedAt: Date.now(),
      });
    }
  },
});

// Reset user preferences to defaults
export const resetUserPreferences = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const defaultPreferences = {
      userId: args.userId,
      dashboardLayout: "DEFAULT" as const,
      enabledStats: ["totalRounds", "bestScore", "totalAces", "totalBirdies"],
      enabledShortcuts: ["newRound", "previousRounds", "stats", "friends"],
      statsOrder: ["totalRounds", "bestScore", "totalAces", "totalBirdies"],
      shortcutsOrder: ["newRound", "previousRounds", "stats", "friends"],
      showWelcomeMessage: true,
      showQuickActions: true,
      showRecentActivity: false,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, defaultPreferences);
      return existing._id;
    } else {
      return await ctx.db.insert("userPreferences", defaultPreferences);
    }
  },
});
