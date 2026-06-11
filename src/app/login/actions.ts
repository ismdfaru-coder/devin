"use server";

import { redirect } from "next/navigation";
import {
  clearSessionCookie,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";

export async function login(
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const password = formData.get("password");
  if (typeof password !== "string" || !(await verifyPassword(password))) {
    return { error: "Incorrect password." };
  }
  await setSessionCookie();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}
