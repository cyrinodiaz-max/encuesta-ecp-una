import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type AdminRole = "superadmin" | "analista";

type AdminAccount = {
  username: string;
  password: string;
  role: AdminRole;
};

export type AdminSession = {
  username: string;
  role: AdminRole;
};

const DEFAULT_ADMIN_SESSION_SALT = "ecp-una-panel";

const DEFAULT_ADMIN_ACCOUNTS: AdminAccount[] = [
  { username: "AdminCPUNA", password: "EscuelaFDCS2026", role: "superadmin" },
  { username: "CECPUNA", password: "admin123", role: "analista" },
  { username: "admin", password: "admin1714", role: "superadmin" },
];

export const ADMIN_SESSION_COOKIE = "ecp-admin-session";

function getAdminAccounts() {
  const raw = process.env.ADMIN_ACCOUNTS_JSON?.trim();

  if (!raw) {
    return DEFAULT_ADMIN_ACCOUNTS;
  }

  try {
    const parsed = JSON.parse(raw) as AdminAccount[];

    if (!Array.isArray(parsed) || !parsed.length) {
      return DEFAULT_ADMIN_ACCOUNTS;
    }

    return parsed.filter(
      (account): account is AdminAccount =>
        typeof account?.username === "string" &&
        typeof account?.password === "string" &&
        (account?.role === "superadmin" || account?.role === "analista"),
    );
  } catch {
    return DEFAULT_ADMIN_ACCOUNTS;
  }
}

function getSessionSalt() {
  return process.env.ADMIN_SESSION_SALT?.trim() || DEFAULT_ADMIN_SESSION_SALT;
}

function normalizeUsername(username: string) {
  return username.trim().toUpperCase();
}

function encodeSessionPayload(session: AdminSession) {
  return Buffer.from(JSON.stringify(session)).toString("base64url");
}

function signSessionPayload(payload: string) {
  return createHmac("sha256", getSessionSalt()).update(payload).digest("hex");
}

function parseSessionCookieValue(cookieValue: string) {
  const [payload, signature] = cookieValue.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signSessionPayload(payload);
  const receivedBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (receivedBuffer.length !== expectedBuffer.length || !timingSafeEqual(receivedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;

    if (
      typeof session?.username !== "string" ||
      (session?.role !== "superadmin" && session?.role !== "analista")
    ) {
      return null;
    }

    const knownAccount = getAdminAccounts().find(
      (account) => normalizeUsername(account.username) === normalizeUsername(session.username) && account.role === session.role,
    );

    return knownAccount
      ? {
          username: knownAccount.username,
          role: knownAccount.role,
        }
      : null;
  } catch {
    return null;
  }
}

export function getAdminRoleLabel(role: AdminRole) {
  return role === "superadmin" ? "Superadmin" : "Analista";
}

export function validateAdminCredentials(username: string, password: string) {
  const matchedAccount = getAdminAccounts().find(
    (account) => normalizeUsername(account.username) === normalizeUsername(username) && account.password === password,
  );

  return matchedAccount
    ? {
        username: matchedAccount.username,
        role: matchedAccount.role,
      }
    : null;
}

export function getAdminSessionCookieValue(session: AdminSession) {
  const payload = encodeSessionPayload(session);
  return `${payload}.${signSessionPayload(payload)}`;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return cookieValue ? parseSessionCookieValue(cookieValue) : null;
}

export async function isAdminAuthenticated() {
  return Boolean(await getAdminSession());
}
