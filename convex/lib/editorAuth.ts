/**
 * The Convex-side security boundary for editorial functions. The Next.js
 * editor API routes hold the secret server-side; a direct call to a
 * secret-gated function without it fails regardless of the UI cookie.
 * Requires EDITOR_SECRET to be set on the Convex deployment
 * (`npx convex env set EDITOR_SECRET ...`).
 */
export function assertEditorSecret(secret: string): void {
  const expected = process.env.EDITOR_SECRET;
  if (!expected) {
    throw new Error("EDITOR_SECRET is not configured on this deployment");
  }
  if (!secret || secret !== expected) {
    throw new Error("Unauthorized");
  }
}
