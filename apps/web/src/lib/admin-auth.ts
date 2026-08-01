import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import type { User } from "@supabase/supabase-js";

export async function requireAdmin(): Promise<User | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !isAdminEmail(user.email)) return null;

  return user;
}
