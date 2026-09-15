import "server-only";
import { createClient } from "./supabase/serverSession";

export type Role =
  | { kind: "admin"; adminId: string; name: string }
  | { kind: "advisor"; advisorId: string; name: string }
  | { kind: "none" };

export async function getCurrentRole(): Promise<Role> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { kind: "none" };

  const { data: admin } = await supabase.from("admins").select("name").eq("auth_user_id", user.id).maybeSingle();
  if (admin) return { kind: "admin", adminId: user.id, name: admin.name };

  const { data: advisor } = await supabase.from("advisors").select("id, name").eq("auth_user_id", user.id).maybeSingle();
  if (advisor) return { kind: "advisor", advisorId: advisor.id, name: advisor.name };

  return { kind: "none" };
}
