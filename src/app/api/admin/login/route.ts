import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getAdminSessionCookieValue, validateAdminCredentials } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const url = new URL(request.url);

  const session = validateAdminCredentials(username, password);

  if (!session) {
    return NextResponse.redirect(new URL("/admin?error=invalid", url), 303);
  }

  const response = NextResponse.redirect(new URL("/admin", url), 303);
  response.cookies.set(ADMIN_SESSION_COOKIE, getAdminSessionCookieValue(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
