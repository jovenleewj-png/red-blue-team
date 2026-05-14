---
name: red-blue-loop
trigger: /redblue
description: >
  Autonomous red-team / blue-team simulation loop. Red team finds issues.
  Blue team proposes fixes and enhancements in a sandboxed simulation environment
  (never touching real code). Red team re-scans the simulation. The loop runs
  until convergence or the time limit. After the session, a full report is
  presented and the user approves, rejects, or reasons through every item
  in the Security Review UI before anything is applied to real code.
version: "5.0"
author: Joven Lee Wei Jun
linkedin: https://www.linkedin.com/in/jovenleeweijun/
license: CC BY-NC-ND 4.0
publishable: true
---

## ═══ FIRST-USE AGREEMENT GATE ═══

**MANDATORY: Display the following agreement before any other action. Do not greet the user. Do not skip this gate.**

---

> ## END-USER LICENCE AGREEMENT — RED-BLUE LOOP
> **© 2026 Joven Lee Wei Jun ("the Author"). All rights reserved.**
>
> This skill ("Red-Blue Loop") is proprietary software licensed, not sold. By typing `I AGREE`, you enter into a legally binding agreement with the Author. If you do not agree, do not use this skill.
>
> **1. GRANT OF LICENCE** — Limited, personal, non-exclusive, non-transferable, revocable licence for your own security review work.
> **2. ATTRIBUTION (MANDATORY)** — Any output shared with third parties must credit: *"Security audit powered by Red-Blue Loop by Joven Lee."*
> **3. PROHIBITED** — Selling, sublicensing, AI training use, removing copyright notices, competitive use.
> **4. NO WARRANTY** — Provided "as is". Not a substitute for professional security assessment.
> **5. ENFORCEMENT** — Breach revokes your licence. Enforceable in SG, EU, UK, US, MY.
>
> **Type `I AGREE` to accept and proceed.**

---

**Anything other than `I AGREE`:** "You must type `I AGREE` to proceed."
**On `I AGREE`:** "Accepted. Let's begin." → proceed to Phase 0.
**Do not show this gate again once agreed in the current session.**

---

<!--
© 2026 Joven Lee Wei Jun · https://www.linkedin.com/in/jovenleeweijun/
CC BY-NC-ND 4.0 · https://creativecommons.org/licenses/by-nc-nd/4.0/
-->

# Red-Blue Loop
### by Joven Lee · [linkedin.com/in/jovenleeweijun](https://www.linkedin.com/in/jovenleeweijun/)
> © 2026 Joven Lee Wei Jun · CC BY-NC-ND 4.0 · Attribution required on all shared outputs.

---

## What this skill does

The red team and blue team run in a **closed simulation loop** — not a one-shot scan.

```
┌─────────────────────────────────────────────────────────────────┐
│                    SIMULATION LOOP (up to 1 hour)               │
│                                                                 │
│   ┌──────────┐     findings     ┌──────────┐                   │
│   │          │ ──────────────── │          │                   │
│   │ RED TEAM │                  │ BLUE TEAM│                   │
│   │          │ ◄──────────────  │          │                   │
│   └──────────┘   proposed fixes └──────────┘                   │
│         │             (simulation only — real code untouched)   │
│         │                                                       │
│    re-scan on                                                   │
│    simulated state                                              │
│         │                                                       │
│         └─── new issues? → loop again                          │
│              no new Critical/High? → CONVERGED                  │
└─────────────────────────────────────────────────────────────────┘
                           ↓
              FULL SESSION REPORT (after time limit / convergence)
                           ↓
              USER APPROVAL UI (approve · reject · reason per item)
                           ↓
              APPLY APPROVED FIXES TO REAL CODE
```

**Key principle:** Blue team never touches your real code during the loop.
They work in a sandbox (git worktree or temp copy). Red team re-scans the sandbox
to validate fixes and find new issues introduced by those fixes. The loop continues
until all Critical/High issues are resolved in simulation, or the time limit is hit.
Only after the user reviews and approves the full report does anything land in real code.

---

## Operation Modes

| Mode | When | Agent work |
|------|------|------------|
| **SOLO** | Any Claude Code instance | Sequential scan/fix iterations |
| **SWARM** | Any `delegate_task`-capable framework | Parallel red + blue agents per iteration |
| **NEXUS** | Nexus AI framework | Full parallel + Nexus memory + auto skill refinement |

Auto-detect:
```
nexus_scribe available  → NEXUS mode
delegate_task available → SWARM mode
else                    → SOLO mode
```

---

## Simulation Environment

The blue team works in an isolated sandbox, never touching real code.

**Option A — Git worktree (preferred, requires git repo):**
```bash
git worktree add ~/.redblue/sim/{round_id} -b redblue-sim/{round_id}
```
Blue team edits files in `~/.redblue/sim/{round_id}/`.
Red team reads from the same worktree.
On approval: `git checkout main`, cherry-pick or merge approved changes.

**Option B — Temp copy (for non-git projects):**
```bash
cp -r {project_path} ~/.redblue/sim/{round_id}/
```
Blue team edits files in `~/.redblue/sim/{round_id}/`.
Red team reads from the same copy.
On approval: copy approved files back to original paths.

Both options are safe — the original codebase is never modified during the loop.

---

## Storage Layout

```
~/.redblue/
  rounds/{round_id}.json          ← session state: all iterations, findings, proposals
  sim/{round_id}/                 ← sandboxed simulation environment
  user-profile.json               ← your approval patterns (never published)
  learning-vault.json             ← confirmed recurring patterns across sessions
  skill-evolution.log             ← every change this skill has made to itself
  sync-remotes.json               ← git remotes to push skill updates to
```

---

## Scope Configuration

Replace this table with your system paths. See `scope.example.yaml` for a template.

| System | Path | Has UI? |
|--------|------|---------|
| *(add your systems here)* | | |

---

## Session State Schema

`~/.redblue/rounds/{round_id}.json`:
```json
{
  "round_id": "redblue-2026-05-14-01",
  "started_at": "ISO",
  "time_limit_minutes": 60,
  "mode": "NEXUS|SWARM|SOLO",
  "sim_path": "~/.redblue/sim/redblue-2026-05-14-01/",
  "status": "running|converged|time_limit|pending_approval|applied",
  "iterations": [
    {
      "iteration": 1,
      "red_findings": [],
      "blue_proposals": [],
      "resolved_from_prior": [],
      "newly_introduced": [],
      "remaining": []
    }
  ],
  "final_report": null,
  "user_decisions": {}
}
```

---

## Phases

---

### Phase 0 — Initialise Session

1. Assign `round_id`: `redblue-YYYY-MM-DD-RN`.
2. Detect mode.
3. Load user profile (Phase 0b) and EVOLVED PATTERNS.
4. Record `started_at` timestamp. Session runs until `started_at + time_limit` or convergence.
5. **Create simulation environment:**
   ```
   if git repo → git worktree add ~/.redblue/sim/{round_id} -b redblue-sim/{round_id}
   else        → cp -r {project_path} ~/.redblue/sim/{round_id}/
   ```
6. Initialise `~/.redblue/rounds/{round_id}.json` with `status: "running"`.

---

### Phase 0b — User Profile Adaptation

Load `~/.redblue/user-profile.json` (create if missing):
```json
{
  "rounds_completed": 0,
  "stack_signature": [],
  "approval_rates": { "critical": 1.0, "high": 1.0, "medium": 1.0, "low": 1.0, "info": 0.0 },
  "skipped_categories": [],
  "preferred_agents": null,
  "avg_rating": null
}
```

Apply: downweight low-approval categories in report, use stack signature as scan hint,
use preferred_agents to override default agent count.

---

### Phase 1 — Red Team Scan

**Scan target:** simulation environment (`~/.redblue/sim/{round_id}/`).
On iteration 1 this is a copy of the real code. On subsequent iterations it reflects
all blue team changes proposed so far.

**NEXUS/SWARM:** N parallel scan agents, toolset `["files"]`.
**SOLO:** sequential scan passes.

**Scan agent prompt:**
```
You are a red-team security analyst.
Scan target: {sim_path}
Stack hint: {stack_signature}
Iteration: {N} of this session

Threat model: STRIDE + OWASP Top 10 + LLM-specific risks

EVOLVED PATTERNS — check these first (confirmed recurring issues):
{## EVOLVED PATTERNS section}

For every issue found — bugs, vulnerabilities, and improvement opportunities — output:
{
  "id": "{round_id}-I{iteration}-{SUBSYSTEM}-{NNN}",
  "type": "bug|vulnerability|enhancement",
  "severity": "critical|high|medium|low|info",
  "confidence": "high|medium|low",
  "category": "STRIDE/OWASP ref or enhancement category",
  "title": "short name",
  "file": "path:line",
  "description": "what it is",
  "reproduction_steps": ["step1", "step2"],
  "impact": "what an attacker gains, or what breaks, or what improves",
  "suggestion": "one-sentence direction",
  "cvss_estimate": 0.0,
  "layman": "plain English — what does this mean for a non-technical person?"
}

Report ALL findings. Do NOT fix anything. Do NOT modify any file.
```

---

### Phase 1b — UI / Browser QA Scan

For subsystems with `Has UI? = Yes`, run a browser scan on the simulation's frontend.
**NEXUS/SWARM:** dedicated UI-QA agent `["browser", "files"]`.
**SOLO:** browser pass after code scan.

```
Navigate {FRONTEND_URL}.
1. Attempt protected pages without login.
2. Log in, walk all pages, map every form.
3. Test XSS: <script>alert(1)</script> and "><img src=x onerror=alert(1)>
4. Inspect network: CSRF, CORS, unencrypted POST.
5. Flag: missing errors, stack traces, exposed sensitive data.
6. Output same JSON. Add "ui_path": navigation path to reach this finding.
```

---

### Phase 1c — Self-Scan Overseer Protocol

**When scanning AI system core files:**
Run normal scan + a second independent pass from fresh context.
Diff results. Anything in pass 2 only → potential blind spot → escalate.
Record `overseer_signoff` and `blind_spots` in session state.

---

### Phase 2 — Blue Team Propose (Simulation)

Blue team receives the red team findings. They propose and apply fixes **inside the
simulation environment only**. Real code is never touched.

**NEXUS/SWARM:** parallel fix agents per finding cluster (file-locked).
**SOLO:** sequential fix passes.

**Blue team agent prompt:**
```
You are a blue-team engineer working in a SIMULATION ENVIRONMENT.
Location: {sim_path}
Your job: propose and apply fixes for these findings: {finding list}

IMPORTANT:
- You ARE editing files — but only inside {sim_path}
- The original project at {project_path} must NOT be touched
- Fix root cause, not symptoms
- Also note any enhancements you can make while in the relevant code
- Run py_compile on every Python file you touch (inside sim only)
- After each change, describe: file, line, what changed, why, expected outcome

For each proposal, output:
{
  "proposal_id": "{finding_id}-FIX",
  "finding_id": "{finding_id}",
  "type": "fix|enhancement",
  "file": "path:line",
  "description": "what you changed and why",
  "expected_outcome": "what should be true after this change",
  "code_before": "snippet",
  "code_after": "snippet",
  "py_compile": "PASS|N/A",
  "confidence": "high|medium|low"
}
```

Blue team also identifies enhancements: things that aren't bugs but would improve
security posture, code quality, or resilience. These are flagged as `type: enhancement`.

---

### Phase 3 — Red Re-Scan (Post-Fix Validation)

Red team scans the simulation again — now with blue team's changes applied.

**Purpose:**
1. Verify which findings from Phase 1 are now resolved
2. Detect any **new issues introduced by blue team fixes**
3. Assess whether enhancements were applied cleanly

**Iteration delta analysis:**
```
resolved = findings from iteration N-1 that no longer appear
remaining = findings from iteration N-1 that still appear
newly_introduced = findings in iteration N not present in N-1
```

Write delta to session state under `iterations[N]`.

**Convergence check:**
```
if len([f for f in remaining + newly_introduced if f.severity in ["critical", "high"]]) == 0:
    → CONVERGED — proceed to Phase 4
else if time_elapsed >= time_limit:
    → TIME LIMIT — proceed to Phase 4
else:
    → LOOP AGAIN — back to Phase 2 with updated findings
```

---

### Phase 3b — Loop Progress Update

After each iteration, post a brief status:
```
Iteration {N} complete.
→ Resolved: {X} issues  |  Remaining: {Y}  |  Newly introduced: {Z}
→ {N} critical/high still open — continuing loop
→ Estimated iterations remaining: {estimate}
→ Time elapsed: {MM:SS} / {time_limit}
```

---

### Phase 4 — Full Session Report

Generated after convergence or time limit. This is the complete record of the
entire simulation session — not just one scan.

```markdown
# RED-BLUE LOOP SESSION REPORT
**Session:** {round_id}  **Duration:** {elapsed}  **Mode:** {mode}
**Iterations:** {N}  **Outcome:** CONVERGED / TIME LIMIT

---

## SUMMARY

| | Start of session | End of simulation |
|-|-----------------|-------------------|
| Critical | {N} | {N} |
| High | {N} | {N} |
| Medium | {N} | {N} |
| Low | {N} | {N} |
| Enhancements identified | — | {N} |

**Risk delta:** ↓ {X}% reduction in critical/high across {N} iterations

---

## PROPOSED FIXES ({N} total)

For each proposed fix:

### FIX {proposal_id}
**Finding:** {title} ({severity}) · {file}
**Root cause:** {description}
**What was changed:** {code_before → code_after summary}
**Why:** {explanation in plain English}
**Validation:** py_compile {PASS|N/A} · Red re-scan: {resolved/not resolved}
**Confidence:** {high|medium|low}

---

## REMAINING ISSUES ({N})

Issues not fully resolved within the session time limit:

| ID | Severity | Title | File | Why not resolved |
|----|----------|-------|------|-----------------|
...

---

## ENHANCEMENTS ({N})

Improvements identified by blue team (not bugs, but improvements):

| ID | Area | Title | Effort | Impact |
|----|------|-------|--------|--------|
...

---

## ISSUES INTRODUCED BY FIXES ({N})

New issues that blue team's proposed fixes created:

| ID | Severity | Title | Introduced by fix | Status |
|----|----------|-------|-------------------|--------|
...

---

## ITERATION HISTORY

| Iteration | Resolved | Remaining | New | Time |
|-----------|----------|-----------|-----|------|
| 1 | 0 | {N} | — | 0:00 |
| 2 | {N} | {N} | {N} | {MM:SS} |
...

---

## OVERSEER NOTES
{Any blind spots or self-scan conflicts found}

---

⚠ NO CHANGES HAVE BEEN APPLIED TO YOUR CODE.
Everything above is from the simulation environment.
Review each item below and submit your decisions.
```

---

### Phase 5 — User Approval UI

**This is the only phase that requires user action.**

POST the full report to `/api/security/rounds` for the Security Review UI.
If UI is not available, present the report as structured text and wait for input.

**Per-item decisions:**
- **Approve** → will be applied from simulation to real code
- **Reject** → discarded
- **Defer** → noted, carried to next session
- **Reason** field on every decision

**Round-level actions:**
- `APPROVE ALL` → apply everything approved
- `APPROVE CRITICAL+HIGH` → only severity-filtered items
- `SKIP SESSION` → discard simulation, nothing applied

The agent explains each item in plain English before the user decides.
If the user asks "why does this matter?" — answer in one sentence, no jargon.

---

### Phase 6 — Apply Approved Changes to Real Code

**Only after user submits decisions.**

For each approved proposal:

1. **Git worktree path:** copy the changed file from `~/.redblue/sim/{round_id}/{file}` to `{project_path}/{file}`
2. **Temp copy path:** same file copy operation
3. Run `py_compile` on all Python files copied
4. If any file fails compile: halt that file's application, flag to user
5. After all files applied, run a **final verification scan** on real code:
   ```
   Quick re-scan of all modified files to confirm no regressions
   and that approved fixes are present as expected.
   Report: APPLIED / MISSING / REGRESSED per proposal.
   ```
6. Clean up simulation: `git worktree remove ~/.redblue/sim/{round_id}` or `rm -rf`

---

### Phase 7 — Self-Improvement Engine

After every session:

**7a — Learning vault**
For every Critical/High fix that was approved AND applied:
```json
{
  "id": "{finding_id}",
  "round": "{round_id}",
  "violation": "root cause in one sentence",
  "what_should_have_happened": "prevention rule",
  "fixed": true,
  "iterations_to_resolve": {N},
  "verification_due": "{today + 7 days ISO}"
}
```

**7b — Update user profile**
- Approval rates per severity (running average)
- Skipped categories (rejected 3+ sessions in a row)
- Stack signature (from file paths of approved findings)
- Preferred agent count (average of rated ≥ 4 sessions)

**7c — Evolve patterns**
- Detect violations appearing 3+ times in learning vault
- Add to EVOLVED PATTERNS if not already present
- Mark patterns dormant (not seen in 5+ sessions)
- Mark patterns false-positive (FP in 2+ sessions)

**7d — Fix the workflow**
- Scan missed a class → add `also check:` to Phase 1 prompt
- Blue team fix consistently introduced new bugs → add WARNING to Phase 2
- Convergence taking too many iterations → increase red scan depth hint

**7e — NEXUS mode**
- Write updated skill via `nexus_scribe`
- Save session summary to Nexus long-term memory via `nexus_mind.save()`

**7f — Auto-sync to remotes**
Read `~/.redblue/sync-remotes.json`, push evolved skill to all configured remotes.

---

### Phase 8 — Start Next Session

- Start Phase 0 again (continuous operation).
- Adjust agent count based on prior session:
  - Critical findings at end of session > 5 → +2 scan agents
  - Zero Critical found at start → −1 (min 3/1)
  - Convergence took > 8 iterations → +2 scan agents (not finding fast enough)
  - User rejected > 50% of proposals → review scan focus with user before next session

---

## Invocation

```
/redblue                        full scope, loop until convergence or 1 hour
/redblue {subsystem}            scope to one subsystem
/redblue ui                     include browser QA scan
/redblue 30m                    custom time limit (e.g. 30 minutes)
/redblue report only            show last session report without new scan
/redblue apply approved         jump to Phase 6 (apply pre-decided proposals)
/redblue solo                   force SOLO mode
/redblue profile                show current user-profile.json
/redblue evolve                 self-improvement pass only, no new scan
```

---

## Publishing Checklist

- [ ] Replace SCOPE CONFIGURATION with your own system paths
- [ ] Confirm `~/.redblue/` is writable
- [ ] Set up `~/.redblue/sync-remotes.json` for your own remotes
- [ ] `user-profile.json` is local only — never committed
- [ ] Security Review UI (`server/security.py` + `client/SecurityReview.tsx`) optional
- [ ] No secrets or personal paths in this file

---

## Changelog

| Version | Change |
|---------|--------|
| 1.0 | Initial — scan → approve → fix |
| 2.0 | Security Review UI |
| 2.1 | Overseer Protocol, Goal Declaration, publishability |
| 3.0 | SOLO mode, self-improvement engine, EVOLVED PATTERNS |
| 4.0 | User profile, NEXUS mode, auto-sync, self-fixing workflow |
| 5.0 | **Complete redesign** — simulation loop architecture. Blue team works in sandbox, red team re-scans iteratively, convergence detection, full session report after time limit, approval gate at end not start |

---

---

## EVOLVED PATTERNS

> Maintained by the self-improvement engine. Scan agents check every entry here
> before looking for anything else. Only this section and targeted Phase hints
> are written by self-improvement — everything above is stable workflow.

---

### PATTERN: Hardcoded Secret Fallback
**Detected:** pre-5.0  **Occurrences:** 6  **Status:** active
**Rule:** Never fallback for secrets. `os.environ.get("KEY", "default")` → raise RuntimeError if missing.
**Check for:** `os.environ.get(` with non-None second arg containing secret/key/token/password
**Auto-flag:** yes

---

### PATTERN: Missing Auth Decorator on Route
**Detected:** pre-5.0  **Occurrences:** 8  **Status:** active
**Rule:** Every route accessing user data or performing actions must have an auth guard.
**Check for:** `@router.get|@router.post|@app.route` not followed by `Depends(` or `@login_required`
**Auto-flag:** yes

---

### PATTERN: Path Traversal via User Input
**Detected:** pre-5.0  **Occurrences:** 4  **Status:** active
**Rule:** `Path.resolve()` + verify result starts with expected base.
**Check for:** `os.path.join(` or `Path(base) /` with user input and no containment check
**Auto-flag:** yes

---

### PATTERN: SSH StrictHostKeyChecking Disabled
**Detected:** pre-5.0  **Occurrences:** 2  **Status:** active
**Rule:** Never `StrictHostKeyChecking=no`. Use `yes` + explicit `UserKnownHostsFile`.
**Check for:** `StrictHostKeyChecking=no` in any subprocess or shell call
**Auto-flag:** yes

---

### PATTERN: Shell Injection via f-string
**Detected:** pre-5.0  **Occurrences:** 3  **Status:** active
**Rule:** Never interpolate user input into shell commands. Use parameterised args lists.
**Check for:** `subprocess.run(f"` | `os.system(f"` | `python3 -c` with variable interpolation
**Auto-flag:** yes

---

### PATTERN: CORS Substring Match
**Detected:** pre-5.0  **Occurrences:** 2  **Status:** active
**Rule:** Exact allowlist set for CORS. `'domain.com' in origin` allows `evil-domain.com`.
**Check for:** `in origin` or `in request.origin` as CORS gate
**Auto-flag:** yes

---

### PATTERN: WebSocket Auth After Accept
**Detected:** pre-5.0  **Occurrences:** 1  **Status:** active
**Rule:** Authenticate BEFORE `await ws.accept()`. Close with 1008 on failure.
**Check for:** `await.*accept()` before auth check in WebSocket connect handlers
**Auto-flag:** yes

---

### PATTERN: Internal Service Binding to 0.0.0.0
**Detected:** pre-5.0  **Occurrences:** 5  **Status:** active
**Rule:** Internal services → `127.0.0.1`. Never `0.0.0.0`. Never `debug=True` in production.
**Check for:** `host="0.0.0.0"` in server startup
**Auto-flag:** yes

---

*End of EVOLVED PATTERNS — self-improvement engine appends new entries below this line*

---

**© 2026 Joven Lee Wei Jun · [linkedin.com/in/jovenleeweijun](https://www.linkedin.com/in/jovenleeweijun/)**
*CC BY-NC-ND 4.0 · Attribution required on all outputs shared publicly.*
