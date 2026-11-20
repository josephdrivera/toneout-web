import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertEditorSecret } from "./lib/editorAuth";

/**
 * The admin area's running project log and its page of useful links.
 * Secret-gated like the other admin functions. Nothing here may hold
 * passwords or keys: everyone invited to the admin area can read it.
 */

const entryInput = v.object({
  date: v.string(),
  area: v.string(),
  title: v.string(),
  body: v.string(),
  author: v.string(),
});

const linkInput = v.object({
  group: v.string(),
  label: v.string(),
  url: v.string(),
  note: v.optional(v.string()),
  order: v.number(),
});

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const listEntries = query({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    return await ctx.db
      .query("projectLog")
      .withIndex("by_date")
      .order("desc")
      .take(500);
  },
});

export const addEntries = mutation({
  args: { secret: v.string(), entries: v.array(entryInput) },
  returns: v.number(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    let added = 0;
    for (const entry of args.entries) {
      const title = entry.title.trim();
      const body = entry.body.trim();
      if (!title || !body || !DATE_RE.test(entry.date)) continue;
      await ctx.db.insert("projectLog", {
        date: entry.date,
        area: entry.area.trim() || "General",
        title,
        body,
        author: entry.author.trim() || "Unknown",
        // Keeps entries added together in the order given.
        createdAt: Date.now() + added,
      });
      added += 1;
    }
    return added;
  },
});

export const removeEntry = mutation({
  args: { secret: v.string(), id: v.id("projectLog") },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    await ctx.db.delete(args.id);
    return null;
  },
});

export const listLinks = query({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    return await ctx.db.query("adminLinks").withIndex("by_group").take(300);
  },
});

export const addLinks = mutation({
  args: { secret: v.string(), links: v.array(linkInput) },
  returns: v.number(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    let added = 0;
    for (const link of args.links) {
      const label = link.label.trim();
      const url = link.url.trim();
      if (!label || !/^https?:\/\//.test(url)) continue;
      const note = link.note?.trim();
      await ctx.db.insert("adminLinks", {
        group: link.group.trim() || "Other",
        label,
        url,
        ...(note ? { note } : {}),
        order: link.order,
      });
      added += 1;
    }
    return added;
  },
});

export const removeLink = mutation({
  args: { secret: v.string(), id: v.id("adminLinks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertEditorSecret(args.secret);
    await ctx.db.delete(args.id);
    return null;
  },
});
