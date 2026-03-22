/**
 * Returns a same-origin path safe to use after login, or null when untrusted.
 * Only relative paths starting with a single "/" are allowed (no protocol or "//").
 */
export function safeRedirectPath(
  value: FormDataEntryValue | string | null | undefined
): string | null {
  if (value == null) return null;
  const s = typeof value === "string" ? value : String(value);
  if (!s.startsWith("/") || s.startsWith("//")) return null;
  return s;
}
