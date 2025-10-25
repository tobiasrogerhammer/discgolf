import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getFriends = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
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
    
    const friends = await Promise.all(
      allFriendships.map(async (friendship) => {
        const friendId = friendship.requesterId === args.userId 
          ? friendship.addresseeId 
          : friendship.requesterId;
        const friend = await ctx.db.get(friendId);
        return friend;
      })
    );

    return friends.filter(Boolean);
  },
});

export const getPendingRequests = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const pendingRequests = await ctx.db
      .query("friendships")
      .withIndex("by_addressee", (q) => q.eq("addresseeId", args.userId))
      .filter((q) => q.eq(q.field("status"), "PENDING"))
      .collect();

    const requestsWithUsers = await Promise.all(
      pendingRequests.map(async (request) => {
        const requester = await ctx.db.get(request.requesterId);
        return {
          ...request,
          requester,
        };
      })
    );

    return requestsWithUsers;
  },
});

export const inviteFriend = mutation({
  args: {
    requesterId: v.id("users"),
    addresseeEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const addressee = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.addresseeEmail))
      .first();

    if (!addressee) {
      throw new Error("User not found");
    }

    if (addressee._id === args.requesterId) {
      throw new Error("Cannot add yourself as a friend");
    }

    // Check if friendship already exists
    const existingFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_requester_addressee", (q) => 
        q.eq("requesterId", args.requesterId).eq("addresseeId", addressee._id)
      )
      .first();

    if (existingFriendship) {
      throw new Error("Friendship request already exists");
    }

    return await ctx.db.insert("friendships", {
      requesterId: args.requesterId,
      addresseeId: addressee._id,
      status: "PENDING",
      createdAt: Date.now(),
    });
  },
});

export const acceptFriend = mutation({
  args: { friendshipId: v.id("friendships") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.friendshipId, { status: "ACCEPTED" });
    return args.friendshipId;
  },
});

export const rejectFriend = mutation({
  args: { friendshipId: v.id("friendships") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.friendshipId);
    return args.friendshipId;
  },
});

export const inviteFriendByUsername = mutation({
  args: {
    requesterId: v.id("users"),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by username
    const addressee = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!addressee) {
      throw new Error("User not found");
    }

    if (addressee._id === args.requesterId) {
      throw new Error("Cannot add yourself as a friend");
    }

    // Check if friendship already exists
    const existingFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_requester_addressee", (q) => 
        q.eq("requesterId", args.requesterId).eq("addresseeId", addressee._id)
      )
      .first();

    if (existingFriendship) {
      throw new Error("Friendship request already exists");
    }

    return await ctx.db.insert("friendships", {
      requesterId: args.requesterId,
      addresseeId: addressee._id,
      status: "PENDING",
      createdAt: Date.now(),
    });
  },
});

export const checkUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return {
      exists: !!user,
      user,
    };
  },
});

export const checkUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    return {
      exists: !!user,
      user,
    };
  },
});

