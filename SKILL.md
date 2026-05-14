---
name: red-blue-loop
trigger: /redblue
description: >
  Autonomous quality simulation loop. Red team finds issues across three domains:
  security vulnerabilities, functional correctness, and UI/UX quality. Blue team
  proposes fixes and improvements in a sandboxed simulation. The skill learns
  in real-time between iterations — every new pattern discovered is immediately
  injected into the next scan, so the loop compounds its own intelligence as it
  runs. After the session, a full report goes to the approval UI. Nothing lands
  in real code until the user decides.
version: "6.0"
author: Joven Lee Wei Jun
linkedin: https://www.linkedin.com/in/jovenleeweijun/
license: CC BY-NC-ND 4.0
publishable: true
---

## ═══ FIRST-USE AGREEMENT GATE ═══

**MANDATORY: Display this agreement before any other action. Do not skip.**

---

> ## END-USER LICENCE AGREEMENT — RED-BLUE LOOP
> **© 2026 Joven Lee Wei Jun ("the Author"). All rights reserved.**
>
> By typing `I AGREE`, you enter a legally binding agreement. If you do not agree, do not use this skill.
>
> **1. GRANT** — Personal, non-exclusive, non-transferable licence for your own work.
> **2. ATTRIBUTION (MANDATORY)** — Any output shared with third parties must credit: *"Quality audit powered by Red-Blue Loop by Joven Lee."*
> **3. PROHIBITED** — Selling, sublicensing, AI training use, removing copyright notices, competitive use.
> **4. NO WARRANTY** — Not a substitute for professional security or QA assessment.
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

## What this skill covers

Red-Blue Loop is not a security scanner. It is a **quality simulation loop** across three domains:

| Domain | Red Team asks | Blue Team proposes |
|--------|--------------|-------------------|
| 🔴 **Security** | What can be attacked, exploited, or abused? | Patches, hardening, access controls |
| 🟡 **Functional** | Does the code actually do what it's supposed to? | Bug fixes, edge case handling, error paths |
| 🔵 **UI / UX** | Is this interface logical, intuitive, and user-friendly? | Flow improvements, missing feedback, confusing interactions |

Every scan covers all three domains simultaneously. A finding can be a SQL injection, a wrong output from a calculation, or a button that doesn't explain what it does — all are first-class issues.

---

## The simulation loop

```
                    ┌─────────────────────────────────────────┐
                    │                                         │
                    ▼                                         │
              RED TEAM SCAN ──► [real-time learning] ──► EVOLVED PATTERNS
                    │                                         ▲
                    │ findings                                │
                    ▼                                         │
              BLUE TEAM PROPOSE ──► [real-time learning] ────┘
                    │
                    │ changes applied to simulation
                    ▼
              SIMULATION ENVIRONMENT (your real code is never touched)
                    │
                    │ re-scan
                    └─────────────────────────────────────────┘
                    
              When convergence or time limit:
                    │
                    ▼
              FULL SESSION REPORT
                    │
                    ▼
              APPROVAL UI  (approve · reject · reason per item)
                    │
                    ▼
              APPLY TO REAL CODE
```

**Real-time learning:** the skill does not wait until the end to learn. Every new pattern
discovered in iteration N is immediately written into the scan prompt for iteration N+1.
Each pass is smarter than the last because the skill is continuously updating itself
as the loop runs.

---

## Operation Modes

| Mode | Requirements | Parallelism |
|------|-------------|-------------|
| **SOLO** | Any Claude Code instance | Sequential iterations |
| **SWARM** | Any `delegate_task` framework | Parallel agents per iteration |
| **NEXUS** | Nexus AI framework | Full parallel + Nexus memory + auto skill refinement |

Auto-detect:
```
nexus_scribe available  → NEXUS mode
delegate_task available → SWARM mode
else                    → SOLO mode
```

---

## Simulation Environment

Blue team works in an isolated sandbox. Real code is never modified during the loop.

**Git repos (preferred):**
```bash
git worktree add ~/.redblue/sim/{round_id} -b redblue-sim/{round_id}
```

**Non-git projects:**
```bash
cp -r {project_path} ~/.redblue/sim/{round_id}/
```

Blue team edits files inside the simulation. Red team reads from the same path.
On approval: changed files are copied/merged into the real project.

---

## Storage Layout

```
~/.redblue/
  rounds/{round_id}.json     ← full session state: iterations, findings, proposals
  sim/{round_id}/            ← sandboxed simulation environment
  live-patterns.json         ← patterns discovered THIS session (feeds next iteration)
  user-profile.json          ← your approval patterns (never published)
  learning-vault.json        ← patterns confirmed across multiple sessions
  skill-evolution.log        ← every self-update this skill has made
  sync-remotes.json          ← git remotes to push to after evolution
```

**`live-patterns.json`** is the real-time learning buffer. It is created at session start
and written to after every iteration. Patterns here feed into the next iteration's
scan prompt immediately. At session end, confirmed patterns graduate to `learning-vault.json`
and then to the skill's own `## EVOLVED PATTERNS` section.

---

## Scope Configuration

Replace this table with your own system paths. See `scope.example.yaml` for a template.

| System | Path | Has UI? |
|--------|------|---------|
| *(add your systems here)* | | |

---

## Phases

---

### Phase 0 — Initialise Session

1. Assign `round_id`: `redblue-YYYY-MM-DD-RN`.
2. Detect mode (NEXUS / SWARM / SOLO).
3. Load user profile (Phase 0b).
4. Load `## EVOLVED PATTERNS` from this file.
5. **Create `~/.redblue/live-patterns.json`** (empty buffer for this session's real-time learning).
6. Create simulation environment:
   ```
   git repo  → git worktree add ~/.redblue/sim/{round_id} -b redblue-sim/{round_id}
   non-git   → cp -r {project_path} ~/.redblue/sim/{round_id}/
   ```
7. Initialise `~/.redblue/rounds/{round_id}.json`.
8. Record `started_at`. Session runs until `started_at + time_limit` or convergence.

---

### Phase 0b — User Profile Adaptation

Load `~/.redblue/user-profile.json` (create if missing):
```json
{
  "rounds_completed": 0,
  "stack_signature": [],
  "domain_priorities": { "security": 1.0, "functional": 1.0, "ux": 1.0 },
  "approval_rates": { "critical": 1.0, "high": 1.0, "medium": 1.0, "low": 1.0 },
  "skipped_categories": [],
  "preferred_agents": null,
  "avg_rating": null
}
```

Apply:
- `domain_priorities` → weight how many agents cover each domain
- `approval_rates.medium < 0.3` → summarise medium findings, don't enumerate
- `skipped_categories` → scan agents flag these at info level only
- `stack_signature` → injected as hint into scan prompts

---

### Phase 1 — Red Team Scan

**Scan target:** `~/.redblue/sim/{round_id}/`
On iteration 1 this is a copy of the real project.
On iteration N it reflects all blue team changes from prior iterations.

**Load into every scan prompt:**
1. `## EVOLVED PATTERNS` from this file (permanent knowledge)
2. `~/.redblue/live-patterns.json` (patterns discovered in this session so far)

**NEXUS/SWARM:** three specialist agents run in parallel — one per domain.
**SOLO:** three sequential passes — security, functional, UX — on each subsystem.

---

#### Phase 1a — Security Scan

```
You are a red-team security analyst.
Scan: {sim_path}/{subsystem}
Stack: {stack_signature}
Iteration: {N}

Threat model: STRIDE + OWASP Top 10 + LLM-specific risks
(prompt injection, trust boundary bypass, memory poisoning, tool hijacking)

EVOLVED PATTERNS (permanent):
{## EVOLVED PATTERNS}

LIVE PATTERNS (discovered this session — check these especially):
{live-patterns.json}

Report every security finding as:
{
  "id": "{round_id}-I{N}-SEC-{NNN}",
  "domain": "security",
  "type": "vulnerability",
  "severity": "critical|high|medium|low|info",
  "confidence": "high|medium|low",
  "category": "STRIDE/OWASP ref",
  "title": "short name",
  "file": "path:line",
  "description": "technical detail",
  "reproduction_steps": ["step1", "step2"],
  "impact": "what an attacker gains",
  "suggestion": "one-sentence fix direction",
  "cvss_estimate": 0.0,
  "layman": "plain English — what does this mean for a non-technical person?"
}
Do NOT fix anything. Do NOT modify files.
```

---

#### Phase 1b — Functional QA Scan

```
You are a functional QA engineer.
Scan: {sim_path}/{subsystem}
Stack: {stack_signature}
Iteration: {N}

Review for:
- Logic errors: conditions, calculations, data transformations that produce wrong output
- Edge cases: empty inputs, nulls, boundary values, concurrent access, large datasets
- Error handling: unhandled exceptions, missing fallbacks, silent failures
- Integration correctness: API contracts, data schema mismatches, state inconsistencies
- Regression risk: changes that could break adjacent features

LIVE PATTERNS: {live-patterns.json}

Report every functional issue as:
{
  "id": "{round_id}-I{N}-FN-{NNN}",
  "domain": "functional",
  "type": "bug|regression_risk|missing_handling",
  "severity": "critical|high|medium|low|info",
  "confidence": "high|medium|low",
  "title": "short name",
  "file": "path:line",
  "description": "what is wrong and what should happen instead",
  "reproduction_steps": ["step1", "step2"],
  "impact": "what breaks or produces wrong output",
  "suggestion": "one-sentence fix direction",
  "layman": "plain English explanation"
}
Do NOT fix anything.
```

---

#### Phase 1c — UI / UX Scan

For subsystems with `Has UI? = Yes`.
**NEXUS/SWARM:** dedicated browser agent `["browser", "files"]`.
**SOLO:** browser pass.

```
You are a UX researcher and QA engineer.
Target: {FRONTEND_URL}
Iteration: {N}

Review for:
- User flow logic: are steps in a sensible order? Can users get stuck?
- Missing feedback: actions with no confirmation, loading states, error messages
- Confusing interactions: labels that don't explain what they do, ambiguous buttons
- Accessibility: keyboard navigation, contrast, screen reader landmarks
- Consistency: does the UI behave predictably across different sections?
- Dead ends: pages or states users can reach but cannot escape from
- Data visibility: is sensitive data exposed? Is the right data surfaced at the right time?

Also check for frontend security (XSS, auth bypass, exposed stack traces).

LIVE PATTERNS: {live-patterns.json}

For each issue:
{
  "id": "{round_id}-I{N}-UX-{NNN}",
  "domain": "ux",
  "type": "flow|feedback|consistency|accessibility|security",
  "severity": "critical|high|medium|low|info",
  "title": "short name",
  "ui_path": "steps to reach this state",
  "description": "what is wrong and why it matters to the user",
  "impact": "user confusion, lost actions, failed tasks",
  "suggestion": "one-sentence improvement direction",
  "layman": "plain English explanation"
}
Do NOT fix anything.
```

---

#### Phase 1d — Self-Scan Overseer Protocol

When scanning AI system core files: run independent second pass from fresh context.
Diff results. Pass 2 only → potential blind spot → escalate.
Record `overseer_signoff` in session state.

---

### ★ REAL-TIME LEARNING (between every iteration)

**This runs after Phase 1 and before Phase 2, every iteration.**

Do not wait until the end of the session to learn. Update immediately.

**Step 1 — Extract new patterns from this iteration's findings:**
For every finding with `confidence: high`:
- What class of issue is this? (e.g. "missing null check on user-supplied path")
- Is this class already in `## EVOLVED PATTERNS` or `live-patterns.json`?
- If not → add to `live-patterns.json`:
  ```json
  {
    "pattern": "short name",
    "domain": "security|functional|ux",
    "rule": "one-sentence prevention rule",
    "check_for": "what to look for in code or UI",
    "discovered_iteration": {N},
    "occurrences_this_session": 1
  }
  ```
- If already present → increment `occurrences_this_session`

**Step 2 — Inject live patterns into next iteration's scan prompt:**
The Phase 1 agent prompts include `{live-patterns.json}` directly.
This means iteration N+1 agents already know what N found and scan for it specifically.

**Step 3 — Qualify for graduation:**
After the session, any live pattern with `occurrences_this_session >= 2` graduates
to `learning-vault.json`. Patterns appearing across 3+ separate sessions graduate
to `## EVOLVED PATTERNS` in this skill file.

This is autonomous and continuous — no human action required.

---

### Phase 2 — Blue Team Propose (Simulation)

Blue team receives findings from Phase 1. They apply proposed changes **inside the
simulation environment only**. Real code is never touched.

**NEXUS/SWARM:** parallel agents per domain cluster (file-locked).
**SOLO:** sequential fix passes.

```
You are a blue-team engineer working INSIDE THE SIMULATION ONLY.
Location: {sim_path}
Fix these findings: {finding list by domain}

IMPORTANT:
- Edit files in {sim_path} — NEVER in {project_path}
- Fix root cause, not symptoms
- For UX findings: describe the change in clear UI terms
  (layout, copy, flow change) alongside any code change
- For functional findings: handle the edge case explicitly; do not paper over it
- For security findings: fix the root cause; do not just sanitise at the surface
- Also note any improvement opportunities you see while in the relevant code
- Run py_compile on every Python file you touch (inside sim only)

Output per change:
{
  "proposal_id": "{finding_id}-FIX",
  "finding_id": "{finding_id}",
  "domain": "security|functional|ux",
  "type": "fix|enhancement",
  "file": "path:line",
  "description": "what you changed and why",
  "expected_outcome": "what should be true after this change",
  "code_before": "snippet (or UI description for UX changes)",
  "code_after": "snippet (or UI description for UX changes)",
  "py_compile": "PASS|N/A|FAIL",
  "confidence": "high|medium|low"
}
```

---

### Phase 3 — Red Re-Scan + Delta

Red team rescans the simulation (now with blue team's changes).
All three domain scans repeat. Live patterns are already updated from Phase 1 learning.

**Compute iteration delta:**
```
resolved         = findings from I(N-1) no longer present in I(N)
remaining        = findings from I(N-1) still present
newly_introduced = findings in I(N) not in I(N-1)
```

**Convergence check:**
```
open_critical_high = [f for f in remaining + newly_introduced
                      if f.severity in ["critical", "high"]]

if len(open_critical_high) == 0  → CONVERGED → Phase 4
elif time_elapsed >= time_limit  → TIME LIMIT → Phase 4
else                             → loop back to Phase 1
```

**Status update after each iteration:**
```
Iteration {N} complete  [{elapsed} / {limit}]
  Security  → {X} resolved · {Y} remaining · {Z} new
  Functional → {X} resolved · {Y} remaining · {Z} new
  UX/UI     → {X} resolved · {Y} remaining · {Z} new
  Live patterns learned this session: {N}
  → {open_critical_high} critical/high still open
```

---

### Phase 4 — Full Session Report

Generated after convergence or time limit. Covers the entire session.

```markdown
# RED-BLUE LOOP SESSION REPORT
Session: {round_id} · Duration: {elapsed} · Iterations: {N}
Mode: {mode} · Outcome: CONVERGED / TIME LIMIT

---

## OVERVIEW

|  | Session start | End of simulation |
|--|--------------|-------------------|
| Critical | {N} | {N} |
| High | {N} | {N} |
| Medium | {N} | {N} |
| Low | {N} | {N} |

Breakdown by domain:
  Security:   {N} found · {N} resolved in sim · {N} remaining
  Functional: {N} found · {N} resolved in sim · {N} remaining
  UX/UI:      {N} found · {N} resolved in sim · {N} remaining

Patterns learned this session (live): {N}
Patterns qualifying for EVOLVED PATTERNS: {N}

---

## PROPOSED FIXES  ({N} total)

[One section per proposal, grouped by domain]

### {proposal_id} · {domain} · {severity}
Finding: {title} — {file}
What this means: {layman}
Root cause: {description}
Change: {code_before → code_after or UI description}
Why: {explanation}
Validation: py_compile {result} · Re-scan: {resolved / remaining}
Confidence: {high|medium|low}

---

## ENHANCEMENTS ({N})
[Improvements identified by blue team beyond the reported findings]

---

## REMAINING ISSUES ({N})
[Issues not resolved within the session]

---

## ISSUES INTRODUCED BY FIXES ({N})
[New issues caused by blue team changes]

---

## ITERATION HISTORY

| # | Sec resolved | Fn resolved | UX resolved | New issues | Patterns learned | Time |
|---|-------------|------------|-------------|------------|-----------------|------|
...

---

## WHAT THE SKILL LEARNED THIS SESSION
[New live patterns discovered — qualifying for EVOLVED PATTERNS]

---

⚠ NOTHING HAS BEEN APPLIED TO YOUR CODE.
Everything above is from the simulation.
Review each item below and submit your decisions.
```

---

### Phase 5 — Approval UI

**The only phase requiring user input.**

POST full report to `/api/security/rounds` for the Security Review UI.
Fallback: present as structured text, wait for input.

**Per-item decisions:**
- **Approve** → will be applied from simulation to real code
- **Reject** → discarded, reason recorded
- **Defer** → carried to next session

**Round-level:**
- `APPROVE ALL` / `APPROVE CRITICAL+HIGH` / `SKIP SESSION`

The agent explains every item in plain English before the user decides.
If the user asks "why does this matter?" — one sentence, no jargon.

---

### Phase 6 — Apply Approved Changes

**Only after user submits decisions.**

For each approved proposal:
1. Copy changed file from `{sim_path}/{file}` to `{project_path}/{file}`
2. `py_compile` all Python files copied
3. If any file fails: halt that file, flag to user
4. Run **final verification scan** on modified real files:
   - Confirm approved findings are resolved
   - Confirm no regressions introduced
   - Report APPLIED / MISSING / REGRESSED per proposal
5. Clean up: `git worktree remove {sim_path}` or `rm -rf {sim_path}`

---

### Phase 7 — Autonomous Post-Session Evolution

Runs automatically. No user action required.

**7a — Graduate live patterns to learning vault:**
Any `live-patterns.json` entry with `occurrences_this_session >= 2`:
```json
{
  "pattern": "{name}",
  "domain": "{domain}",
  "rule": "{prevention rule}",
  "check_for": "{grep/description}",
  "sessions_seen": 1,
  "first_seen": "{round_id}",
  "last_seen": "{round_id}"
}
```

**7b — Graduate to EVOLVED PATTERNS:**
Any learning vault entry with `sessions_seen >= 3`:
→ append to `## EVOLVED PATTERNS` in this skill file immediately

**7c — Mark stale / false-positive patterns:**
`sessions_seen` not incremented in 5+ sessions → `status: dormant`
Marked as false positive in 2+ sessions → `status: false-positive` with note

**7d — Fix the workflow itself:**
- Phase 1 scan consistently missed a class → add `also check:` hint to Phase 1
- Phase 2 fix consistently introduced new bugs → add WARNING to Phase 2
- UX findings consistently not approved → reduce UX scan depth next session
  (update `user-profile.json → domain_priorities.ux`)

**7e — Update user profile:**
- Approval rates per severity and per domain (running average)
- Skipped categories (rejected 3+ sessions in a row)
- Stack signature (from file paths of approved findings)
- Domain priorities (from approval rates per domain)

**7f — NEXUS mode:**
- Write updated skill via `nexus_scribe`
- Save session summary to Nexus long-term memory via `nexus_mind.save()`

**7g — Auto-sync to remotes:**
Push evolved skill to all remotes in `~/.redblue/sync-remotes.json`.

---

### Phase 8 — Start Next Session

Start Phase 0 immediately (continuous operation).
Carry forward:
- Unresolved findings from this session (pre-loaded into iteration 1)
- All patterns from EVOLVED PATTERNS (already in skill file)
- Updated user profile

Adjust agent count:
- Critical > 5 at end of session → +2 scan agents
- Zero Critical found at start → −1 (min 3/1)
- Convergence took > 8 iterations → +2 scan agents
- User rejected > 50% of proposals → review scope with user before restarting

---

## Invocation

```
/redblue                   full scope, loop until convergence or 1 hour
/redblue {subsystem}       single subsystem
/redblue 30m               custom time limit
/redblue security          security domain only
/redblue functional        functional QA only
/redblue ux                UI/UX evaluation only
/redblue report only       show last session report
/redblue apply approved    jump to Phase 6
/redblue solo              force SOLO mode
/redblue profile           show user-profile.json
/redblue evolve            run post-session evolution without a new scan
```

---

## Changelog

| Version | Change |
|---------|--------|
| 1.0 | Initial — scan → approve → fix |
| 2.0 | Security Review UI |
| 2.1 | Overseer Protocol, Goal Declaration |
| 3.0 | SOLO mode, end-of-session self-improvement |
| 4.0 | User profile, NEXUS mode, auto-sync |
| 5.0 | Simulation loop architecture — blue team works in sandbox |
| 6.0 | **Real-time in-loop learning** (live-patterns.json between every iteration); expanded scope beyond security to functional QA + UI/UX; three-domain red team; domain-aware user profile |

---

---

## EVOLVED PATTERNS

> Written by the self-improvement engine. Fed into every scan prompt.
> Real-time discoveries live in `~/.redblue/live-patterns.json` during a session
> and graduate here after appearing in 3+ separate sessions.

---

### PATTERN: Hardcoded Secret Fallback
**Domain:** security  **Sessions:** 6+  **Status:** active
**Rule:** Never fallback for secrets. Raise RuntimeError if env var missing.
**Check for:** `os.environ.get(` with non-None second arg containing secret/key/token/password

---

### PATTERN: Missing Auth Decorator on Route
**Domain:** security  **Sessions:** 8+  **Status:** active
**Rule:** Every route touching user data must have an auth guard.
**Check for:** `@router.get|@router.post|@app.route` not followed by `Depends(` or `@login_required`

---

### PATTERN: Path Traversal via User Input
**Domain:** security  **Sessions:** 4+  **Status:** active
**Rule:** `Path.resolve()` + verify result starts with expected base.
**Check for:** `os.path.join(` with user input and no containment check after

---

### PATTERN: Shell Injection via f-string
**Domain:** security  **Sessions:** 3+  **Status:** active
**Rule:** Never interpolate user input into shell commands. Use parameterised args lists.
**Check for:** `subprocess.run(f"` | `os.system(f"` | variable interpolation in shell strings

---

### PATTERN: CORS Substring Match
**Domain:** security  **Sessions:** 2+  **Status:** active
**Rule:** Exact allowlist set for CORS. `'domain.com' in origin` allows `evil-domain.com`.
**Check for:** `in origin` or `in request.origin` as CORS gate

---

### PATTERN: Internal Service Binding to 0.0.0.0
**Domain:** security  **Sessions:** 5+  **Status:** active
**Rule:** Internal services → `127.0.0.1`. Never `0.0.0.0`. Never `debug=True` in production.
**Check for:** `host="0.0.0.0"` in server startup

---

### PATTERN: Action With No User Feedback
**Domain:** ux  **Sessions:** 3+  **Status:** active
**Rule:** Every user action must produce visible confirmation, error, or loading state.
**Check for:** form submit handlers, API calls, and delete/save actions with no toast/alert/spinner

---

### PATTERN: Unhandled Empty State
**Domain:** functional  **Sessions:** 3+  **Status:** active
**Rule:** Every list or data-driven UI component must handle the empty/null/zero-items case.
**Check for:** `.map(` or list renders without a preceding null/empty check and fallback

---

*End of EVOLVED PATTERNS — self-improvement engine appends new entries below this line*

---

**© 2026 Joven Lee Wei Jun · [linkedin.com/in/jovenleeweijun](https://www.linkedin.com/in/jovenleeweijun/)**
*CC BY-NC-ND 4.0 · Attribution required on all outputs shared publicly.*
