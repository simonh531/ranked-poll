"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface LoginActionState {
  error: string;
  success: boolean;
}

export default async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const email = formData.get("email");

  if (!email || typeof email !== "string" || !email.trim()) {
    return { error: "Email is required.", success: false };
  }

  // Simple email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { error: "Please enter a valid email address.", success: false };
  }

  const supabase = await createClient();
  const reqHeaders = await headers();
  const host = reqHeaders.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const origin = `${protocol}://${host}`;
  const emailRedirectTo = `${origin}/auth/confirm`;

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    console.error("Magic link request failed:", error.message);
    return {
      error: error.message || "Failed to send magic link. Please try again.",
      success: false,
    };
  }

  return { error: "", success: true };
}
