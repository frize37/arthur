"use client";

import { useEffect, useRef, useState } from "react";
import { CaseMessage, fetchCaseMessages, sendCaseMessage } from "@/app/lib/caseMessages";

type Sender = { kind: "admin"; adminId: string; name: string } | { kind: "advisor"; advisorId: string; name: string };

export function CaseChat({ caseId, sender }: { caseId: string; sender: Sender }) {
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const msgs = await fetchCaseMessages(caseId);
      if (cancelled) return;
      setMessages(msgs);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function handleSend() {
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    const ok = await sendCaseMessage(caseId, sender, body);
    if (ok) {
      const msgs = await fetchCaseMessages(caseId);
      setMessages(msgs);
      setDraft("");
    }
    setSending(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        ref={listRef}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          maxHeight: 260,
          overflowY: "auto",
          padding: "4px 2px",
        }}
      >
        {loading ? (
          <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>טוען שיחה…</div>
        ) : messages.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>עדיין אין הודעות בתיק הזה.</div>
        ) : (
          messages.map((m) => {
            const isMine = m.senderKind === sender.kind && m.senderName === sender.name;
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: isMine ? "flex-start" : "flex-end",
                  maxWidth: "80%",
                  background: isMine ? "var(--teal-soft)" : "var(--surface-2)",
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  padding: "8px 12px",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 2 }}>
                  {m.senderName} {m.senderKind === "admin" ? "· צוות" : "· יועץ"}
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.45 }}>{m.body}</div>
                <div style={{ fontSize: 10, color: "var(--ink-faint)", marginTop: 3 }}>
                  {new Date(m.createdAt).toLocaleString("he-IL", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="כתבו הודעה…"
          style={{
            flex: 1,
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: "9px 12px",
            fontSize: 13.5,
            background: "var(--surface)",
            color: "var(--ink)",
          }}
        />
        <button type="button" className="btn btn-primary" disabled={sending || !draft.trim()} onClick={handleSend}>
          {sending ? "שולח…" : "שליחה"}
        </button>
      </div>
    </div>
  );
}
