import { createClient } from "@/lib/supabase/client";

export interface CaseMessage {
  id: string;
  senderKind: "admin" | "advisor";
  senderName: string;
  body: string;
  createdAt: string;
}

export async function fetchCaseMessages(caseId: string): Promise<CaseMessage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("case_messages")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true });
  if (error || !data) {
    console.error("Failed to fetch case messages:", error?.message);
    return [];
  }
  return data.map((row) => ({
    id: row.id,
    senderKind: row.sender_kind,
    senderName: row.sender_name,
    body: row.body,
    createdAt: row.created_at,
  }));
}

export async function sendCaseMessage(
  caseId: string,
  sender:
    | { kind: "admin"; adminId: string; name: string }
    | { kind: "advisor"; advisorId: string; name: string },
  body: string
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("case_messages").insert({
    case_id: caseId,
    sender_kind: sender.kind,
    sender_admin: sender.kind === "admin" ? sender.adminId : null,
    sender_advisor: sender.kind === "advisor" ? sender.advisorId : null,
    sender_name: sender.name,
    body,
  });
  if (error) {
    console.error("Failed to send case message:", error.message);
    return false;
  }
  return true;
}
