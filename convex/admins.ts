import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertEditorSecret } from "./lib/editorAuth";

/**
 * Admin accounts for the private /admin area. Every function is gated by the
 * server-held secret: the Next.js admin API routes are the only callers, and
 * they do the password hashing and session handling. Convex only ever sees
 * hashes.
 */

const roleValidator = v.union(v.literal("owner"), v.literal("admin"));

const publicAdmin = v.object({
  _id: v.id("adminUsers"),
  email: v.string(),
  name: v.string(),
  role: roleValidator,
  disabled: v.boolean(),
  hasPassword: v.boolean(),
  hasInvite: v.boolean(),
  inviteExpiresAt: v.optional(v.number()),
  createdAt: v.number(),
  lastLoginAt: v.optional(v.number()),
});

export const count = query({
  args: { secret: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    return (await ctx.db.query("adminUsers").take(1)).length;
  },
});

/** First-run only: creates the owner. Refuses once any admin exists. */
export const createOwner = mutation({
  args: {
    secret: v.string(),
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
  },
  returns: v.union(v.id("adminUsers"), v.null()),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const existing = await ctx.db.query("adminUsers").take(1);
    if (existing.length > 0) return null;
    return await ctx.db.insert("adminUsers", {
      email: args.email.trim().toLowerCase(),
      name: args.name.trim(),
      role: "owner",
      passwordHash: args.passwordHash,
      disabled: false,
      createdAt: Date.now(),
    });
  },
});

/** For login: returns the stored hash so Next can verify the password. */
export const getForLogin = query({
  args: { secret: v.string(), email: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("adminUsers"),
      passwordHash: v.optional(v.string()),
      disabled: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const user = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email.trim().toLowerCase()))
      .unique();
    if (!user) return null;
    return {
      _id: user._id,
      passwordHash: user.passwordHash,
      disabled: user.disabled,
    };
  },
});

/** Session check on every admin request: is this person still allowed in? */
export const getById = query({
  args: { secret: v.string(), id: v.id("adminUsers") },
  returns: v.union(
    v.object({
      _id: v.id("adminUsers"),
      email: v.string(),
      name: v.string(),
      role: roleValidator,
      disabled: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const user = await ctx.db.get(args.id);
    if (!user) return null;
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      disabled: user.disabled,
    };
  },
});

export const recordLogin = mutation({
  args: { secret: v.string(), id: v.id("adminUsers") },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    await ctx.db.patch(args.id, { lastLoginAt: Date.now() });
    return null;
  },
});

export const list = query({
  args: { secret: v.string() },
  returns: v.array(publicAdmin),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const users = await ctx.db.query("adminUsers").take(100);
    return users.map((user) => ({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      disabled: user.disabled,
      hasPassword: Boolean(user.passwordHash),
      // Expiry is judged by the caller: cached queries must not read the clock.
      hasInvite: Boolean(user.inviteTokenHash),
      inviteExpiresAt: user.inviteExpiresAt,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    }));
  },
});

/**
 * Creates (or re-invites) an admin with a one-time invite token. The caller
 * generates the token and passes only its hash; the link is shown once.
 */
export const invite = mutation({
  args: {
    secret: v.string(),
    email: v.string(),
    name: v.string(),
    inviteTokenHash: v.string(),
    inviteExpiresAt: v.number(),
  },
  returns: v.union(v.id("adminUsers"), v.null()),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const email = args.email.trim().toLowerCase();
    const name = args.name.trim();
    if (!email || !name) return null;
    const existing = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) {
      if (existing.role === "owner") return null;
      await ctx.db.patch(existing._id, {
        name,
        inviteTokenHash: args.inviteTokenHash,
        inviteExpiresAt: args.inviteExpiresAt,
        disabled: false,
      });
      return existing._id;
    }
    return await ctx.db.insert("adminUsers", {
      email,
      name,
      role: "admin",
      inviteTokenHash: args.inviteTokenHash,
      inviteExpiresAt: args.inviteExpiresAt,
      disabled: false,
      createdAt: Date.now(),
    });
  },
});

/** Redeems an invite token: sets the password and burns the token. */
export const acceptInvite = mutation({
  args: {
    secret: v.string(),
    inviteTokenHash: v.string(),
    passwordHash: v.string(),
  },
  returns: v.union(v.id("adminUsers"), v.null()),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const user = await ctx.db
      .query("adminUsers")
      .withIndex("by_inviteTokenHash", (q) =>
        q.eq("inviteTokenHash", args.inviteTokenHash),
      )
      .unique();
    if (!user || user.disabled) return null;
    if ((user.inviteExpiresAt ?? 0) < Date.now()) return null;
    await ctx.db.patch(user._id, {
      passwordHash: args.passwordHash,
      inviteTokenHash: undefined,
      inviteExpiresAt: undefined,
    });
    return user._id;
  },
});

/** Owner accounts cannot be disabled, so nobody can lock the network out. */
export const setDisabled = mutation({
  args: { secret: v.string(), id: v.id("adminUsers"), disabled: v.boolean() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    const user = await ctx.db.get(args.id);
    if (!user || user.role === "owner") return false;
    await ctx.db.patch(args.id, {
      disabled: args.disabled,
      ...(args.disabled
        ? { inviteTokenHash: undefined, inviteExpiresAt: undefined }
        : {}),
    });
    return true;
  },
});
