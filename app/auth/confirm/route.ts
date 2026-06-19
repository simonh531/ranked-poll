import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    if (!error) {
      // Redirect user to specified page (defaults to homepage)
      return NextResponse.redirect(new URL(next, request.url));
    }
    
    console.error("Verification error:", error);
  }

  // Redirect to login page with an error state if verification fails
  return NextResponse.redirect(
    new URL("/login?error=verification_failed", request.url)
  );
}
