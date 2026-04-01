import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { RelationKey } from "@/lib/types";

export type AdminAccessScope = RelationKey | "all";

type AdminAccount = {
  username: string;
  password: string;
  access: AdminAccessScope;
};

export type AdminSession = {
  username: string;
  access: AdminAccessScope;
};

const DEFAULT_ADMIN_SESSION_SALT = "ecp-una-panel";

const DEFAULT_ADMIN_ACCOUNTS: AdminAccount[] = [
  { username: "Egresados", password: "ESC-CP123", access: "egresado" },
  { username: "Docente", password: "ESC-CP1714", access: "docente" },
  { username: "Administrativo", password: "ESC-CP-ADMIN", access: "all" },
  { username: "CECPUNA", password: "ESC-CP-CECPUNA", access: "estudiante" },
];

export const ADMIN_SESSION_COOKIE = "ecp-admin-session";

function isRelationKey(value: string): value is RelationKey {
  return value === "estudiante" || value === "docente" || value === "funcionario" || value === "egresado";
}

function isAccessScope(value: string): value is AdminAccessScope {
  return value === "all" || isRelationKey(value);
}

function normalizeAccount(raw: unknown): AdminAccount | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as {
    username?: unknown;
    password?: unknown;
    access?: unknown;
    role?: unknown;
  };

  const username = typeof candidate.username === "string" ? candidate.username : "";
  const password = typeof candidate.password === "string" ? candidate.password : "";
  const directAccess = typeof candidate.access === "string" && isAccessScope(candidate.access) ? candidate.access : null;
  const legacyAccess =
    candidate.role === "superadmin"
      ? "all"
      : typeof candidate.role === "string" && isRelationKey(candidate.role)
        ? candidate.role
        : null;
  const access = directAccess ?? legacyAccess;

  if (!username || !password || !access) {
    return null;
  }

  return {
    username,
    password,
    access,
  };
}

function getAdminAccounts() {
  const raw = process.env.ADMIN_ACCOUNTS_JSON?.trim();

  if (!raw) {
    return DEFAULT_ADMIN_ACCOUNTS;
  }

  try {
    const parsed = JSON.parse(raw) as unknown[];

    if (!Array.isArray(parsed) || !parsed.length) {
      return DEFAULT_ADMIN_ACCOUNTS;
    }

    const normalized = parsed.map(normalizeAccount).filter((account): account is AdminAccount => Boolean(account));
    return normalized.length ? normalized : DEFAULT_ADMIN_ACCOUNTS;
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

    if (typeof session?.username !== "string" || !isAccessScope(session?.access)) {
      return null;
    }

    const knownAccount = getAdminAccounts().find(
      (account) =>
        normalizeUsername(account.username) === normalizeUsername(session.username) && account.access === session.access,
    );

    return knownAccount
      ? {
          username: knownAccount.username,
          access: knownAccount.access,
        }
      : null;
  } catch {
    return null;
  }
}

export function getAdminRoleLabel(access: AdminAccessScope) {
  if (access === "all") {
    return "Acceso completo";
  }

  if (access === "estudiante") {
    return "Solo estudiantes";
  }

  if (access === "docente") {
    return "Solo docentes";
  }

  if (access === "funcionario") {
    return "Solo funcionarios";
  }

  return "Solo egresados";
}

export function getAdminAccessTitle(access: AdminAccessScope) {
  if (access === "all") {
    return "Panel general";
  }

  if (access === "estudiante") {
    return "Panel de estudiantes";
  }

  if (access === "docente") {
    return "Panel de docentes";
  }

  if (access === "funcionario") {
    return "Panel de funcionarios";
  }

  return "Panel de egresados";
}

export function getAdminDefaultPath(access: AdminAccessScope) {
  return access === "all" ? "/admin" : `/admin?relation=${access}`;
}

export function canAccessRelation(session: AdminSession, relation: RelationKey) {
  return session.access === "all" || session.access === relation;
}

export function validateAdminCredentials(username: string, password: string) {
  const matchedAccount = getAdminAccounts().find(
    (account) => normalizeUsername(account.username) === normalizeUsername(username) && account.password === password,
  );

  return matchedAccount
    ? {
        username: matchedAccount.username,
        access: matchedAccount.access,
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
