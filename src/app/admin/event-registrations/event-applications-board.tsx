"use client";

import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  eventId: string;
  applicantName: string;
  phone: string;
  age: number;
  gender: string;
  city: string;
  status: string;
  passToken: string | null;
  approvedAt: string | null;
  passDispatchedAt: string | null;
  checkedInAt: string | null;
  intelliforgeReceiptId: string | null;
  intelliforgeTicketUrl: string | null;
  intelliforgeTicketDownloadUrl: string | null;
  createdAt: string;
  event: { title: string; startsAt: string; whatsappGroupInviteUrl: string | null };
};

type ApiTotals = {
  pending: number;
  approved: number;
  rejected: number;
  passDispatched: number;
  listed: number;
};

function waDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function EventApplicationsBoard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [totals, setTotals] = useState<ApiTotals | null>(null);
  const [eventIdFilter, setEventIdFilter] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const q = eventIdFilter.trim() ? `?eventId=${encodeURIComponent(eventIdFilter.trim())}` : "";
    const res = await fetch(`/api/event-applications${q}`, { credentials: "include" });
    const body = await res.json();
    if (!res.ok || !body.ok) {
      setErr(body.error?.message ?? "Could not load");
      return;
    }
    setRows(body.data.applications);
    setTotals(body.data.totals);
  }, [eventIdFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function approve(id: string) {
    setBusy(id);
    const res = await fetch(`/api/event-applications/${id}/approve`, {
      method: "POST",
      credentials: "include",
    });
    const body = await res.json();
    setBusy(null);
    if (!res.ok || !body.ok) {
      alert(body.error?.message ?? "Approve failed");
      return;
    }
    const ig = body.data?.intelliforge as { status: string; message?: string } | undefined;
    if (ig?.status === "error") {
      alert(
        `Approved, but IntelliForge ticket failed: ${ig.message ?? "unknown error"}. Use "Mint IntelliForge ticket" to retry (requires INTELLIFORGE_API_KEY).`
      );
    }
    await load();
  }

  async function mintIntelliforge(id: string) {
    setBusy(id);
    const res = await fetch(`/api/event-applications/${id}/mint-intelliforge-ticket`, {
      method: "POST",
      credentials: "include",
    });
    const body = await res.json();
    setBusy(null);
    if (!res.ok || !body.ok) {
      alert(body.error?.message ?? "Mint ticket failed");
      return;
    }
    await load();
  }

  async function reject(id: string) {
    const reason = window.prompt("Optional note to store with rejection:", "");
    if (reason === null) return;
    setBusy(id);
    const res = await fetch(`/api/event-applications/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ reason: reason.trim() || undefined }),
    });
    const body = await res.json();
    setBusy(null);
    if (!res.ok || !body.ok) {
      alert(body.error?.message ?? "Reject failed");
      return;
    }
    await load();
  }

  async function markSent(id: string) {
    setBusy(id);
    const res = await fetch(`/api/event-applications/${id}/mark-pass-sent`, {
      method: "POST",
      credentials: "include",
    });
    const body = await res.json();
    setBusy(null);
    if (!res.ok || !body.ok) {
      alert(body.error?.message ?? "Update failed");
      return;
    }
    await load();
  }

  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-end">
        <label className="block text-xs font-bold uppercase text-magenta">
          Filter by event ID (optional)
          <input
            className="mt-1 block w-64 border rounded-card px-3 py-2 text-sm font-mono"
            value={eventIdFilter}
            onChange={(e) => setEventIdFilter(e.target.value)}
            placeholder="cuid…"
          />
        </label>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-full border border-violet px-4 py-2 text-sm font-bold text-violet"
        >
          Refresh
        </button>
      </div>

      {totals ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div className="rounded-card border border-paper-deep bg-paper-raised p-3">
            <p className="text-xs uppercase text-magenta">Pending review</p>
            <p className="text-2xl font-display text-violet">{totals.pending}</p>
          </div>
          <div className="rounded-card border border-paper-deep bg-paper-raised p-3">
            <p className="text-xs uppercase text-magenta">Approved</p>
            <p className="text-2xl font-display text-violet">{totals.approved}</p>
          </div>
          <div className="rounded-card border border-paper-deep bg-paper-raised p-3">
            <p className="text-xs uppercase text-magenta">Rejected</p>
            <p className="text-2xl font-display text-violet">{totals.rejected}</p>
          </div>
          <div className="rounded-card border border-paper-deep bg-paper-raised p-3">
            <p className="text-xs uppercase text-magenta">Pass sent (marked)</p>
            <p className="text-2xl font-display text-violet">{totals.passDispatched}</p>
          </div>
        </div>
      ) : null}

      {err ? <p className="text-sm text-magenta font-semibold">{err}</p> : null}

      <div className="overflow-x-auto rounded-card border border-paper-deep">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-paper-deep text-left text-xs uppercase text-magenta">
              <th className="p-2">Event</th>
              <th className="p-2">Participant</th>
              <th className="p-2">Status</th>
              <th className="p-2">Proof</th>
              <th className="p-2">Pass / WhatsApp</th>
              <th className="p-2">IntelliForge ticket</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const passHref =
                r.passToken && r.status === "APPROVED"
                  ? `/e/pass/${encodeURIComponent(r.passToken)}`
                  : null;
              const passAbsolute = passHref && origin ? `${origin}${passHref}` : null;
              const signedTicket = r.intelliforgeTicketUrl?.trim() || null;
              const signedPdf = r.intelliforgeTicketDownloadUrl?.trim() || null;
              const msg = [
                `Hi ${r.applicantName}! Your SSS Club pass for "${r.event.title}" is ready.`,
                passAbsolute ? `Pass: ${passAbsolute}` : "",
                signedTicket ? `Signed entry ticket: ${signedTicket}` : "",
                r.event.whatsappGroupInviteUrl ? `Group link: ${r.event.whatsappGroupInviteUrl}` : "",
              ]
                .filter(Boolean)
                .join(" ");
              const waHref =
                r.status === "APPROVED" && passAbsolute
                  ? `https://wa.me/${waDigits(r.phone)}?text=${encodeURIComponent(msg)}`
                  : null;

              return (
                <tr key={r.id} className="border-b border-paper-deep align-top">
                  <td className="p-2 max-w-[140px]">
                    <p className="font-semibold line-clamp-2">{r.event.title}</p>
                    <p className="text-[10px] font-mono text-ink/45 mt-1">{r.eventId}</p>
                  </td>
                  <td className="p-2">
                    <p className="font-medium">{r.applicantName}</p>
                    <p className="text-xs font-mono text-ink/70">{r.phone}</p>
                    <p className="text-xs text-ink/55">
                      {r.age} yrs · {r.gender} · {r.city}
                    </p>
                  </td>
                  <td className="p-2">
                    <span className="font-bold text-violet">{r.status}</span>
                    {r.passDispatchedAt ? (
                      <p className="text-[10px] text-ink/50 mt-1">Pass marked sent</p>
                    ) : null}
                    {r.checkedInAt ? <p className="text-[10px] text-energy mt-1">Checked in</p> : null}
                  </td>
                  <td className="p-2">
                    <a
                      href={`/api/event-applications/${r.id}/payment-proof`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-violet underline text-xs"
                    >
                      View screenshot
                    </a>
                  </td>
                  <td className="p-2 space-y-1">
                    {passHref ? (
                      <>
                        <a href={passHref} className="block text-xs text-violet underline break-all" target="_blank" rel="noreferrer">
                          Open pass
                        </a>
                        {waHref ? (
                          <a
                            href={waHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block rounded-full bg-energy/90 px-2 py-1 text-[10px] font-bold text-white"
                          >
                            Open WhatsApp (prefilled)
                          </a>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-xs text-ink/45">—</span>
                    )}
                  </td>
                  <td className="p-2 space-y-1 align-top">
                    {r.status === "APPROVED" && r.intelliforgeReceiptId ? (
                      <p className="text-[10px] font-mono text-ink/55">#{r.intelliforgeReceiptId}</p>
                    ) : null}
                    {signedTicket ? (
                      <>
                        <a
                          href={signedTicket}
                          className="block text-xs text-violet underline break-all"
                          target="_blank"
                          rel="noreferrer"
                        >
                          View signed ticket
                        </a>
                        {signedPdf ? (
                          <a
                            href={signedPdf}
                            className="block text-xs text-violet underline break-all"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Download PDF
                          </a>
                        ) : null}
                      </>
                    ) : r.status === "APPROVED" ? (
                      <span className="text-xs text-ink/45">Not minted</span>
                    ) : (
                      <span className="text-xs text-ink/45">—</span>
                    )}
                  </td>
                  <td className="p-2 space-y-1">
                    {r.status === "PENDING_REVIEW" ? (
                      <>
                        <button
                          type="button"
                          disabled={busy === r.id}
                          onClick={() => void approve(r.id)}
                          className="block w-full rounded bg-violet text-white text-xs py-1 font-bold disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busy === r.id}
                          onClick={() => void reject(r.id)}
                          className="block w-full rounded border border-magenta text-magenta text-xs py-1 font-bold disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    ) : null}
                    {r.status === "APPROVED" && !r.passDispatchedAt ? (
                      <button
                        type="button"
                        disabled={busy === r.id}
                        onClick={() => void markSent(r.id)}
                        className="block w-full rounded border border-violet text-violet text-xs py-1 font-bold disabled:opacity-50"
                      >
                        Mark pass + invite sent
                      </button>
                    ) : null}
                    {r.status === "APPROVED" && !r.intelliforgeTicketUrl ? (
                      <button
                        type="button"
                        disabled={busy === r.id}
                        onClick={() => void mintIntelliforge(r.id)}
                        className="block w-full rounded border border-paper-deep text-ink text-xs py-1 font-bold disabled:opacity-50 mt-1"
                        title="Requires INTELLIFORGE_API_KEY on the server"
                      >
                        Mint IntelliForge ticket
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 ? <p className="p-4 text-sm text-ink/55">No applications in this view.</p> : null}
      </div>
    </div>
  );
}
