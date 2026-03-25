import { createHash } from "node:crypto";
import { cookies } from "next/headers";

const DEFAULT_ADMIN_USERNAME = "CECPUNA";
const DEFAULT_ADMIN_PASSWORD = "admin123";
const DEFAULT_ADMIN_SESSION_SALT = "ecp-una-panel";

export const ADMIN_USERNAME = (process.env.ADMIN_USER?.trim() || DEFAULT_ADMIN_USERNAME).toUpperCase();
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD;
export const ADMIN_SESSION_COOKIE = "ecp-admin-session";

function getSessionSignature() {
  const sessionSalt = process.env.ADMIN_SESSION_SALT?.trim() || DEFAULT_ADMIN_SESSION_SALT;
  return createHash("sha256").update(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}:${sessionSalt}`).digest("hex");
}

export function validateAdminCredentials(username: string, password: string) {
  return username.trim().toUpperCase() === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function getAdminSessionCookieValue() {
  return getSessionSignature();
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === getSessionSignature();
}
