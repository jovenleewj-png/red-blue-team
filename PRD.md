# Product Requirements Document
## Red-Blue Loop — Autonomous Security Simulation Skill

**Author:** Joven Lee Wei Jun · [linkedin.com/in/jovenleeweijun](https://www.linkedin.com/in/jovenleeweijun/)
**Version:** 5.0 · © 2026 Joven Lee Wei Jun

---

## Problem Statement

### The pain

Development teams ship code faster than they can audit it. Security is treated as a gate — one scan before a major release — not a continuous discipline. The result:

- Vulnerabilities accumulate silently between releases
- Security tools find problems but don't propose solutions
- Proposed fixes are applied to production without validating that they work or checking whether they introduce new problems
- The same vulnerability classes repeat across projects because fixes are never systematised into reusable knowledge

### The deeper problem: fixes that break things

The hardest part of security remediation isn't finding the bug — it's verifying the fix. A naive patch for an injection vulnerability can introduce a path traversal. Removing a hardcoded secret can break a startup sequence if the env var is not set. Most teams apply fixes and hope for the best. There's no feedback loop.

### The opportunity

A simulation environment changes the dynamic entirely. If fixes are proposed and validated in a sandbox — and the red team re-scans that sandbox — you get a closed feedback loop that converges on a correct solution before anything touches real code. The human only enters the loop at the end, reviewing a complete, already-validated set of changes.

---

## Goals

1. **Simulation-first** — blue team never touches real code during the loop
2. **Convergence-driven** — loop continues until all Critical/High issues are resolved in simulation, not just found once
3. **Full-session visibility** — at the end, the user sees the entire journey: what was found, what was tried, what worked, what remains
4. **Approval-gated** — zero changes applied to real code without explicit per-item human decision
5. **Explainable** — every item explained in plain English at approval time
6. **Self-improving** — the skill learns from each session and gets better at both finding and fixing
7. **Portable** — single Claude Code instance is sufficient; multi-agent scales up when available

---

## Non-Goals

- Not a penetration test (no active exploitation, no network attacks)
- Not a compliance framework (no SOC 2 / ISO 27001 reports)
- Not a runtime monitor (scans code at rest, not live systems)
- Not a replacement for human security engineers on high-stakes infrastructure

---

## Users

| User | Core need |
|------|-----------|
| Solo developer | Automated security loop that proposes and validates fixes, not just a list of findings |
| Engineering team | Repeatable simulation-based security review with approval records |
| AI agent builder | Audit LLM agent code for prompt injection, trust bypass, tool hijacking |
| Security professional | Auditable scan-fix-verify workflow they can hand off to a client |

---

## Functional Requirements

### Session lifecycle
- FR-01: Assign round_id and create isolated simulation environment on session start
- FR-02: Default session time limit: 60 minutes (configurable per invocation)
- FR-03: Detect operation mode (NEXUS / SWARM / SOLO) automatically
- FR-04: Persist full session state to `~/.redblue/rounds/{round_id}.json`
- FR-05: Post status update to user after each iteration

### Simulation environment
- FR-06: Create git worktree for git repos (`git worktree add`)
- FR-07: Fall back to directory copy for non-git projects
- FR-08: Simulation path must be fully isolated — no writes to real project path during loop
- FR-09: Clean up simulation after approved changes are applied

### Red team scan
- FR-10: Scan all subsystems in scope per iteration
- FR-11: Cover STRIDE threat model, OWASP Top 10, LLM-specific risks
- FR-12: Run browser/UI scan for subsystems with web frontends
- FR-13: Run independent overseer pass for AI system core files
- FR-14: Inject EVOLVED PATTERNS from skill into every scan prompt
- FR-15: Output structured JSON finding per issue: bug, vulnerability, or enhancement
- FR-16: Include plain-English layman explanation per finding

### Iteration delta
- FR-17: After each re-scan, compute: resolved / remaining / newly-introduced
- FR-18: Convergence condition: zero Critical/High in `remaining + newly_introduced`
- FR-19: Loop exits on convergence OR time limit — whichever comes first
- FR-20: Record per-iteration delta in session state

### Blue team (simulation)
- FR-21: Blue agents write actual code changes into the simulation environment only
- FR-22: File-lock enforced — no two agents touch the same file in the same iteration
- FR-23: Run `py_compile` on all Python files modified in simulation
- FR-24: Output structured proposal per change: code_before, code_after, expected_outcome
- FR-25: Blue team may also identify enhancements (not just bug fixes)

### Full session report
- FR-26: Report covers entire session: all iterations, all findings, all proposals
- FR-27: Report includes: start/end severity counts, risk delta, iteration history
- FR-28: Report lists proposed fixes with code diffs and confidence scores
- FR-29: Report lists remaining unresolved issues with reason
- FR-30: Report lists enhancements identified
- FR-31: Report lists issues newly introduced by blue team fixes

### Approval gate
- FR-32: Present report to Security Review UI (or text fallback)
- FR-33: Per-item decisions: approve / reject / defer + reason field
- FR-34: Round-level: APPROVE ALL / APPROVE CRITICAL+HIGH / SKIP SESSION
- FR-35: Agent explains each item in plain English before user decides
- FR-36: No changes applied until user submits decisions

### Apply approved changes
- FR-37: Copy approved files from simulation to real project path
- FR-38: `py_compile` on all Python files applied
- FR-39: Run final verification scan on modified real files
- FR-40: Report APPLIED / MISSING / REGRESSED per proposal
- FR-41: Clean up simulation environment after application

### Self-improvement
- FR-42: Log Critical/High fixes to learning vault after application
- FR-43: Detect patterns in 3+ sessions → add to EVOLVED PATTERNS
- FR-44: Mark dormant patterns (absent 5+ sessions)
- FR-45: Mark false-positive patterns (FP in 2+ sessions)
- FR-46: Adjust Phase 1 scan hints when classes of findings are repeatedly missed
- FR-47: Add Phase 2 warnings when fix types consistently introduce new bugs
- FR-48: Update user profile after every session
- FR-49: Auto-push evolved skill to all configured git remotes

---

## Non-Functional Requirements

- NFR-01: Real code is never modified during the simulation loop
- NFR-02: Simulation environment is fully isolated from the real project path
- NFR-03: Approval gate cannot be bypassed — no apply without explicit user decision
- NFR-04: File-lock prevents blue agent conflicts within an iteration
- NFR-05: All state stored locally in `~/.redblue/` — no external service required
- NFR-06: Push failures are non-blocking — logged and surfaced but loop continues
- NFR-07: No secrets, personal paths, or API keys in the skill file
- NFR-08: User profile is never published or committed to public repos

---

## Data Model

### Session state (`~/.redblue/rounds/{round_id}.json`)

```json
{
  "round_id": "redblue-2026-05-14-01",
  "started_at": "2026-05-14T08:00:00Z",
  "time_limit_minutes": 60,
  "mode": "NEXUS|SWARM|SOLO",
  "sim_path": "~/.redblue/sim/redblue-2026-05-14-01/",
  "sim_type": "worktree|copy",
  "status": "running|converged|time_limit|pending_approval|applied",
  "iterations": [
    {
      "iteration": 1,
      "started_at": "ISO",
      "red_findings": [],
      "blue_proposals": [],
      "resolved_from_prior": [],
      "newly_introduced": [],
      "remaining": [],
      "converged": false
    }
  ],
  "final_report": {},
  "user_decisions": {
    "{proposal_id}": {
      "decision": "approved|rejected|deferred",
      "reason": "",
      "decided_at": "ISO"
    }
  },
  "apply_results": {
    "{proposal_id}": "APPLIED|MISSING|REGRESSED"
  }
}
```

### Finding schema

```json
{
  "id": "redblue-2026-05-14-01-I1-AUTH-001",
  "type": "bug|vulnerability|enhancement",
  "severity": "critical|high|medium|low|info",
  "confidence": "high|medium|low",
  "category": "STRIDE/OWASP ref",
  "title": "short name",
  "file": "path:line",
  "description": "technical detail",
  "reproduction_steps": ["step1", "step2"],
  "impact": "what breaks or what improves",
  "suggestion": "one-sentence fix direction",
  "cvss_estimate": 7.5,
  "layman": "plain English explanation"
}
```

### Proposal schema

```json
{
  "proposal_id": "redblue-2026-05-14-01-I1-AUTH-001-FIX",
  "finding_id": "redblue-2026-05-14-01-I1-AUTH-001",
  "type": "fix|enhancement",
  "file": "server/auth.py:42",
  "description": "Added Depends(get_current_user) to admin_route",
  "expected_outcome": "Unauthenticated requests return 401",
  "code_before": "...",
  "code_after": "...",
  "py_compile": "PASS",
  "confidence": "high"
}
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Simulation isolation | 0 modifications to real code during loop |
| Convergence rate | ≥ 70% of sessions reach full convergence within time limit |
| Fix validation accuracy | ≥ 85% of approved fixes verified APPLIED in final scan |
| New-issue introduction rate | < 10% of blue team fixes introduce a new Critical/High |
| User approval rate | ≥ 60% of proposed fixes approved |
| Pattern growth | ≥ 1 new EVOLVED PATTERN per 5 sessions |
| False positive rate after 10 sessions | < 15% |

---

**© 2026 Joven Lee Wei Jun · [linkedin.com/in/jovenleeweijun](https://www.linkedin.com/in/jovenleeweijun/)**
