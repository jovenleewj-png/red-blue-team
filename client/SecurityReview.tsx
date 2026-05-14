import { useState, useEffect } from "react";

interface RoundSummary {
  round_id: string;
  date: string;
  status: string;
  finding_counts: Record<string, number>;
  total: number;
  approved: number;
}

interface Finding {
  id: string;
  severity: string;
  confidence: string;
  category: string;
  title: string;
  file: string;
  description: string;
  reproduction_steps?: string[];
  impact: string;
  remediation_hint: string;
  cvss_estimate: number;
  layman: string;
  decision: "pending" | "approved" | "rejected" | "deferred";
  reason: string;
}

interface Round {
  round_id: string;
  date: string;
  scan_coverage: string;
  agents_deployed: number;
  status: string;
  rating: number | null;
  finding_counts: Record<string, number>;
  findings: Finding[];
}

async function apiFetch(path: string, opts: RequestInit = {}) {
  const r = await fetch(path, { credentials: "include", ...opts });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

const SEV_COLOR: Record<string, string> = {
  critical: "#ff3b30",
  high: "#ff9f0a",
  medium: "#ffd60a",
  low: "#30d158",
  info: "#636366",
};

const SEV_BG: Record<string, string> = {
  critical: "rgba(255,59,48,0.12)",
  high: "rgba(255,159,10,0.12)",
  medium: "rgba(255,214,10,0.10)",
  low: "rgba(48,209,88,0.10)",
  info: "rgba(99,99,102,0.10)",
};

export default function SecurityReview() {
  const [rounds, setRounds] = useState<RoundSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, { decision: string; reason: string }>>({});
  const [rating, setRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { loadRounds(); }, []);
  useEffect(() => { if (selectedId) loadRound(selectedId); }, [selectedId]);

  async function loadRounds() {
    try {
      const data = await apiFetch("/api/security/rounds");
      setRounds(data.rounds || []);
      if (data.rounds?.length && !selectedId) setSelectedId(data.rounds[0].round_id);
    } catch { /* ignore */ }
  }

  async function loadRound(id: string) {
    try {
      const data: Round = await apiFetch(`/api/security/rounds/${id}`);
      setRound(data);
      const init: Record<string, { decision: string; reason: string }> = {};
      for (const f of data.findings) {
        init[f.id] = { decision: f.decision, reason: f.reason || "" };
      }
      setDecisions(init);
      setRating(data.rating);
    } catch { /* ignore */ }
  }

  async function saveFinding(findingId: string) {
    if (!selectedId) return;
    const d = decisions[findingId];
    if (!d || d.decision === "pending") return;
    try {
      await apiFetch(`/api/security/rounds/${selectedId}/findings/${findingId}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: d.decision, reason: d.reason }),
      });
      setMsg("Saved");
      setTimeout(() => setMsg(null), 1500);
    } catch (e: any) {
      setMsg("Save failed: " + e.message);
    }
  }

  async function submitRound(action: string) {
    if (!selectedId || submitting) return;
    setSubmitting(true);
    try {
      const deferredIds = Object.entries(decisions)
        .filter(([, v]) => v.decision === "deferred")
        .map(([k]) => k);

      await apiFetch(`/api/security/rounds/${selectedId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, skip_ids: deferredIds, rating }),
      });
      setMsg(action === "APPROVE" ? "Blue team dispatched." : action === "APPROVE_CRITICAL_ONLY" ? "Critical fixes dispatched." : "Round skipped.");
      loadRound(selectedId);
      loadRounds();
    } catch (e: any) {
      setMsg("Error: " + e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function setDecision(id: string, decision: string) {
    setDecisions(prev => ({ ...prev, [id]: { ...prev[id], decision } }));
  }

  function setReason(id: string, reason: string) {
    setDecisions(prev => ({ ...prev, [id]: { ...prev[id], reason } }));
  }

  const card: React.CSSProperties = {
    background: "rgba(28,28,30,0.8)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 20,
  };

  const btnBase: React.CSSProperties = {
    padding: "8px 16px", borderRadius: 8, border: "none",
    cursor: "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: 500,
  };

  const filteredFindings = round?.findings.filter(f => {
    if (filter === "all") return true;
    if (filter === "pending") return decisions[f.id]?.decision === "pending";
    return f.severity.toLowerCase() === filter;
  }) || [];

  const pendingCount = round?.findings.filter(f => decisions[f.id]?.decision === "pending").length || 0;
  const approvedCount = round?.findings.filter(f => decisions[f.id]?.decision === "approved").length || 0;
  const rejectedCount = round?.findings.filter(f => decisions[f.id]?.decision === "rejected").length || 0;

  if (rounds.length === 0) {
    return (
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Security Review</h1>
        <p style={{ color: "#a1a1a6", marginBottom: 32, fontSize: 15 }}>Red-blue loop approval gate</p>
        <div style={{ ...card, textAlign: "center", padding: 60, color: "#a1a1a6" }}>
          No security rounds found.<br />
          <span style={{ fontSize: 13, marginTop: 8, display: "block" }}>
            Run <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 4 }}>/redblue</code> in Nexus to start a scan.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Security Review</h1>
          <p style={{ color: "#a1a1a6", fontSize: 15, margin: 0 }}>Approve, reject, or defer findings before blue team is dispatched</p>
        </div>
        {msg && (
          <div style={{
            background: "rgba(48,209,88,0.15)", border: "1px solid rgba(48,209,88,0.3)",
            borderRadius: 8, padding: "8px 16px", fontSize: 13, color: "#30d158",
          }}>{msg}</div>
        )}
      </div>

      {/* Round selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {rounds.map(r => (
          <button
            key={r.round_id}
            onClick={() => setSelectedId(r.round_id)}
            style={{
              ...btnBase,
              background: selectedId === r.round_id ? "rgba(0,113,227,0.15)" : "rgba(255,255,255,0.06)",
              color: selectedId === r.round_id ? "#0071e3" : "#a1a1a6",
              border: selectedId === r.round_id ? "1px solid rgba(0,113,227,0.4)" : "1px solid rgba(255,255,255,0.1)",
              fontSize: 12,
            }}
          >
            {r.round_id}
            <span style={{
              marginLeft: 8, fontSize: 11,
              color: r.status === "dispatched" ? "#30d158" : r.status === "skipped" ? "#636366" : "#ff9f0a",
            }}>
              {r.status === "dispatched" ? "✓ done" : r.status === "skipped" ? "skipped" : `${r.total} findings`}
            </span>
          </button>
        ))}
      </div>

      {round && (
        <>
          {/* Stats bar */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { label: "Critical", key: "critical" },
              { label: "High", key: "high" },
              { label: "Medium", key: "medium" },
              { label: "Low", key: "low" },
            ].map(({ label, key }) => (
              <div key={key} style={{
                ...card,
                padding: "12px 20px",
                borderColor: SEV_COLOR[key] + "44",
                cursor: "pointer",
                background: filter === key ? SEV_BG[key] : "rgba(28,28,30,0.8)",
              }} onClick={() => setFilter(filter === key ? "all" : key)}>
                <div style={{ fontSize: 22, fontWeight: 700, color: SEV_COLOR[key] }}>
                  {round.finding_counts[key] || 0}
                </div>
                <div style={{ fontSize: 12, color: "#a1a1a6", marginTop: 2 }}>{label}</div>
              </div>
            ))}
            <div style={{ ...card, padding: "12px 20px", cursor: "pointer", background: filter === "pending" ? "rgba(255,255,255,0.06)" : "rgba(28,28,30,0.8)" }}
              onClick={() => setFilter(filter === "pending" ? "all" : "pending")}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#ff9f0a" }}>{pendingCount}</div>
              <div style={{ fontSize: 12, color: "#a1a1a6", marginTop: 2 }}>Pending</div>
            </div>
            <div style={{ ...card, padding: "12px 20px" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#30d158" }}>{approvedCount}</div>
              <div style={{ fontSize: 12, color: "#a1a1a6", marginTop: 2 }}>Approved</div>
            </div>
            <div style={{ ...card, padding: "12px 20px" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#636366" }}>{rejectedCount}</div>
              <div style={{ fontSize: 12, color: "#a1a1a6", marginTop: 2 }}>Rejected</div>
            </div>
          </div>

          {/* Findings */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            {filteredFindings.map(f => {
              const d = decisions[f.id] || { decision: "pending", reason: "" };
              const sev = f.severity.toLowerCase();
              const isExpanded = expanded === f.id;

              return (
                <div key={f.id} style={{
                  ...card,
                  borderColor: d.decision === "approved" ? "rgba(48,209,88,0.3)"
                    : d.decision === "rejected" ? "rgba(255,59,48,0.2)"
                    : d.decision === "deferred" ? "rgba(99,99,102,0.3)"
                    : SEV_COLOR[sev] + "33",
                  opacity: d.decision === "rejected" ? 0.6 : 1,
                }}>
                  {/* Header row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                          background: SEV_BG[sev], color: SEV_COLOR[sev],
                          textTransform: "uppercase", letterSpacing: "0.5px",
                        }}>{f.severity}</span>
                        <span style={{ fontSize: 11, color: "#636366" }}>CVSS {f.cvss_estimate}</span>
                        <span style={{ fontSize: 11, color: "#a1a1a6", fontFamily: "monospace" }}>{f.id}</span>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "#f5f5f7", marginBottom: 4 }}>{f.title}</div>
                      <div style={{ fontSize: 12, color: "#636366", fontFamily: "monospace" }}>{f.file}</div>
                    </div>

                    {/* Decision buttons */}
                    <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
                      {(["approved", "rejected", "deferred"] as const).map(opt => (
                        <button
                          key={opt}
                          onClick={() => setDecision(f.id, opt)}
                          style={{
                            ...btnBase, fontSize: 12, padding: "6px 12px",
                            background: d.decision === opt
                              ? opt === "approved" ? "rgba(48,209,88,0.2)"
                                : opt === "rejected" ? "rgba(255,59,48,0.2)"
                                : "rgba(99,99,102,0.2)"
                              : "rgba(255,255,255,0.05)",
                            color: d.decision === opt
                              ? opt === "approved" ? "#30d158"
                                : opt === "rejected" ? "#ff3b30"
                                : "#636366"
                              : "#636366",
                            border: d.decision === opt
                              ? `1px solid ${opt === "approved" ? "rgba(48,209,88,0.4)" : opt === "rejected" ? "rgba(255,59,48,0.4)" : "rgba(99,99,102,0.4)"}`
                              : "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          {opt === "approved" ? "✓ Approve" : opt === "rejected" ? "✗ Reject" : "→ Defer"}
                        </button>
                      ))}
                      {d.decision !== "pending" && (
                        <button
                          onClick={() => saveFinding(f.id)}
                          style={{ ...btnBase, background: "#0071e3", color: "#fff", fontSize: 12, padding: "6px 12px" }}
                        >Save</button>
                      )}
                      <button
                        onClick={() => setExpanded(isExpanded ? null : f.id)}
                        style={{
                          ...btnBase, background: "rgba(255,255,255,0.06)",
                          color: "#a1a1a6", fontSize: 12, padding: "6px 12px",
                        }}
                      >{isExpanded ? "▲ Less" : "▼ More"}</button>
                    </div>
                  </div>

                  {/* Layman explanation — always visible */}
                  <div style={{
                    marginTop: 12, padding: "12px 16px",
                    background: "rgba(255,255,255,0.03)", borderRadius: 8,
                    borderLeft: `3px solid ${SEV_COLOR[sev]}66`,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#636366", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
                      What this means
                    </div>
                    <div style={{ fontSize: 14, color: "#c7c7cc", lineHeight: 1.6 }}>{f.layman}</div>
                  </div>

                  {/* Reason input — shown when a decision is made */}
                  {d.decision !== "pending" && (
                    <div style={{ marginTop: 10 }}>
                      <input
                        value={d.reason}
                        onChange={e => setReason(f.id, e.target.value)}
                        placeholder={d.decision === "rejected" ? "Why are you rejecting this? (optional)" : d.decision === "deferred" ? "Why defer? (optional)" : "Any notes? (optional)"}
                        style={{
                          width: "100%", padding: "8px 12px", boxSizing: "border-box",
                          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 6, color: "#f5f5f7", fontSize: 13, fontFamily: "inherit", outline: "none",
                        }}
                      />
                    </div>
                  )}

                  {/* Expanded technical details */}
                  {isExpanded && (
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ fontSize: 13, color: "#c7c7cc", lineHeight: 1.7 }}>
                        <span style={{ color: "#636366", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 4 }}>Technical detail</span>
                        {f.description}
                      </div>
                      {f.reproduction_steps && f.reproduction_steps.length > 0 && (
                        <div>
                          <div style={{ color: "#636366", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>How to reproduce</div>
                          <ol style={{ margin: 0, paddingLeft: 20, color: "#c7c7cc", fontSize: 13, lineHeight: 1.8 }}>
                            {f.reproduction_steps.map((s, i) => <li key={i}>{s}</li>)}
                          </ol>
                        </div>
                      )}
                      <div>
                        <div style={{ color: "#636366", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Fix direction</div>
                        <div style={{ fontSize: 13, color: "#c7c7cc", padding: "8px 12px", background: "rgba(48,209,88,0.06)", borderRadius: 6, borderLeft: "3px solid rgba(48,209,88,0.4)" }}>
                          {f.remediation_hint}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit panel */}
          {round.status === "pending" && (
            <div style={{
              ...card,
              position: "sticky", bottom: 24,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              gap: 16, flexWrap: "wrap",
              background: "rgba(20,20,22,0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#a1a1a6" }}>Rate this round:</span>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setRating(rating === n ? null : n)} style={{
                    ...btnBase, padding: "6px 10px", fontSize: 15,
                    background: rating !== null && n <= rating ? "rgba(255,159,10,0.2)" : "rgba(255,255,255,0.05)",
                    color: rating !== null && n <= rating ? "#ff9f0a" : "#636366",
                    border: "1px solid transparent",
                  }}>★</button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#636366" }}>
                  {pendingCount > 0 ? `${pendingCount} still pending` : "All reviewed"}
                </span>
                <button
                  onClick={() => submitRound("SKIP_ALL")}
                  disabled={submitting}
                  style={{ ...btnBase, background: "rgba(255,255,255,0.06)", color: "#636366", border: "1px solid rgba(255,255,255,0.08)" }}
                >Skip this round</button>
                <button
                  onClick={() => submitRound("APPROVE_CRITICAL_ONLY")}
                  disabled={submitting}
                  style={{ ...btnBase, background: "rgba(255,59,48,0.15)", color: "#ff3b30", border: "1px solid rgba(255,59,48,0.3)" }}
                >Fix Criticals only</button>
                <button
                  onClick={() => submitRound("APPROVE")}
                  disabled={submitting}
                  style={{ ...btnBase, background: "#0071e3", color: "#fff", padding: "10px 24px" }}
                >
                  {submitting ? "Dispatching…" : `Approve & dispatch${approvedCount > 0 ? ` (${approvedCount})` : ""}`}
                </button>
              </div>
            </div>
          )}

          {round.status !== "pending" && (
            <div style={{
              ...card, textAlign: "center", padding: 24,
              borderColor: "rgba(48,209,88,0.3)", background: "rgba(48,209,88,0.05)",
            }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#30d158", marginBottom: 4 }}>
                {round.status === "dispatched" ? "Blue team dispatched" : "Round skipped"}
              </div>
              <div style={{ fontSize: 13, color: "#a1a1a6" }}>
                {round.status === "dispatched"
                  ? `${round.findings.filter(f => f.decision === "approved").length} findings approved for fixing`
                  : "No fixes dispatched this round"}
                {round.rating && ` · Rated ${round.rating}/5`}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
