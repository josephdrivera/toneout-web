import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    hostType: v.union(v.literal("firehouse"), v.literal("home")),
    name: v.string(),
    department: v.optional(v.string()),
    town: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    role: v.optional(v.string()),
    message: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const department = args.department?.trim();
    const town = args.town.trim();
    const email = args.email.trim().toLowerCase();
    if (!name || !town || !email) {
      return { success: false };
    }
    if (args.hostType === "firehouse" && !department) {
      return { success: false };
    }
    const phone = args.phone?.trim();
    const role = args.role?.trim();
    const message = args.message?.trim();

    await ctx.db.insert("demoRequests", {
      hostType: args.hostType,
      name,
      ...(department ? { department } : {}),
      town,
      email,
      ...(phone ? { phone } : {}),
      ...(role ? { role } : {}),
      ...(message ? { message } : {}),
      submittedAt: Date.now(),
    });

    return { success: true };
  },
});
