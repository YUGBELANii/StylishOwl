import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin(nextPath: string) {
  const supabase = await createClient();

  // Verify the signed access token locally through Supabase's JWKS flow.
  // Unlike getUser(), getClaims() avoids an Auth API round trip on every admin navigation.
  const { data: { claims }, error } = await supabase.auth.getClaims();
  const appMetadata = claims?.app_metadata as { role?: string } | undefined;

  if (error || !claims?.sub || appMetadata?.role !== "admin") {
    redirect(`/account/login?next=${encodeURIComponent(nextPath)}`);
  }

  return { supabase, claims };
}
