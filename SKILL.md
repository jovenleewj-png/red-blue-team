---
name: red-blue-loop
trigger: /redblue
description: >
  Autonomous red-team (find) + blue-team (fix) security loop. Self-contained —
  works with any Claude agent, with or without Nexus. SOLO mode for single-agent
  use, SWARM mode when multi-agent delegation is available. Includes a
  self-improvement engine that evolves its own scan patterns from usage,
  a user profile that adapts to your approval behaviour, and an auto-sync
  protocol that pushes every skill update to all configured remotes.
version: "4.0"
author: nexus-scribe
tags: [security, red-team, blue-team, orchestration, qa, self-improving]
publishable: true
---

# /redblue — Red-Blue Security Loop

> You are **COMMANDER** — orchestrating a continuous red-team / blue-team
> security loop. Scan → report → wait for approval → fix → evolve.
>
> **Self-contained.** Works standalone (SOLO) or with a multi-agent system
> like Nexus (SWARM). No external dependencies required.
> **Self-improving.** After every round the skill updates its own patterns,
> adapts to the user's approval habits, and syncs to all configured remotes.

---

## OPERATION MODES

| Mode | When | Agent work |
|------|------|------------|
| **SOLO** | Single Claude Code instance, no delegation framework | Sequential scans and fixes |
| **NEXUS** | Running on a machine with Nexus (`delegate_task` available) | Full parallel swarm + Nexus memory + nexus_scribe refinement |
| **SWARM** | Any multi-agent system with `delegate_task` | Parallel swarm, no Nexus extras |

Auto-detect on startup:
```
if nexus_scribe tool available  → NEXUS mode
elif delegate_task available    → SWARM mode
else                            → SOLO mode
```

**NEXUS mode is always preferred on Joven's machine.** Nexus acts as the
persistent backbone: round summaries go into Nexus long-term memory, skill
updates are written back through `nexus_scribe`, and all agent dispatch uses
`delegate_task`. This creates a closed loop where every session makes Nexus
smarter about security patterns in the specific codebase it watches.

---

## STORAGE LAYOUT

```
~/.redblue/
  rounds/
    {round_id}.json        ← findings, decisions, status per round
  user-profile.json        ← adapts to YOUR approval patterns (never published)
  learning-vault.json      ← recurring patterns confirmed across rounds
  skill-evolution.log      ← every self-update this skill has ever made
  sync-remotes.json        ← git remotes to push to after self-improvement
```

Create on first run: `mkdir -p ~/.redblue/rounds`

**`sync-remotes.json` default (configure per machine):**
```json
{
  "remotes": [
    {
      "label": "nexus",
      "type": "git",
      "repo_path": "~/Desktop/Nexus",
      "skill_src": "~/Desktop/Nexus/skills/red-blue-loop.md",
      "branch": "main",
      "commit_msg": "redblue: self-improvement after {round_id}"
    },
    {
      "label": "red-blue-team",
      "type": "git",
      "repo_path": "~/Desktop/red-blue-team",
      "skill_src": "~/Desktop/red-blue-team/SKILL.md",
      "branch": "main",
      "commit_msg": "skill: evolved patterns after {round_id} (+{n_new} patterns)"
    }
  ]
}
```

---

## SCOPE CONFIGURATION

Replace with your own system paths. `scope.example.yaml` is a clean template.

**Joven's stack (default — remove before publishing):**

| System | Path | Has UI? |
|--------|------|---------|
| Nexus Core | `~/Desktop/Nexus/` | No |
| Nexus Server | `~/Desktop/Nexus/server/` | Yes — `localhost:7070` |
| Nexus Messaging | `~/Desktop/Nexus/nexus_messaging/` | No |
| Nexus Tools | `~/Desktop/Nexus/nexus_tools/` | No |
| Nexus CRM | `~/Desktop/Nexus/crm/` | No |
| GTM Agent | `~/Desktop/Calude Code Agent/GTM Agent/` | Yes |
| Cookiy AI GTM | `~/Desktop/Calude Code Agent/Cookiy AI - GTM Agent/` | Yes |
| Marketing Agent | `~/Desktop/Calude Code Agent/Marketing Agent/` | Yes |
| Qualitative Research Agent | `~/Desktop/Calude Code Agent/Qualitative Research Agent/` | No |
| Agent Studio | `~/Desktop/Calude Code Agent/agent-studio/` | Yes |
| Cybersecurity Agent | `~/Desktop/Calude Code Agent/Cybersecurity Agent/` | Yes |
| Headhunting Agent | `~/Desktop/Calude Code Agent/Headhunting Agent/` | No |
| Legal Review Agent | `~/Desktop/Calude Code Agent/Legal Review Agent/` | No |
| Builder Swarm | `~/Desktop/Calude Code Agent/Builder Swarm/` | No |
| CookiyCRM | `~/Desktop/cookiycrm-internal-mac/` | Yes |
| All SKILL.md files | `~/.nexus/skills/`, `~/Desktop/Nexus/skills/` | No |

---

## PHASES

---

### PHASE 0 — INITIALISE ROUND

1. Assign `round_id`: `redblue-YYYY-MM-DD-RN` (increment N each day).
2. Detect operation mode (NEXUS / SWARM / SOLO).
3. Load `~/.redblue/user-profile.json` — apply to scan priorities (see Phase 0b).
4. Load `## EVOLVED PATTERNS` from this file — feed into scan prompt.
5. Calculate agent count from scope size:

   | Subsystems | NEXUS/SWARM agents | SOLO passes |
   |-----------|-------------------|-------------|
   | 1–3 | 3 | 1 |
   | 4–8 | 6 | 2 |
   | 9+ | 12 (max) | 3 |

   Adjust up/down based on `user-profile.json → preferred_agents`.

6. Create `~/.redblue/rounds/{round_id}.json`:
   ```json
   {
     "round_id": "...",
     "date": "...",
     "mode": "NEXUS|SWARM|SOLO",
     "phase": "red",
     "findings": [],
     "files_locked": [],
     "overseer_signoff": null,
     "status": "scanning",
     "rating": null
   }
   ```

---

### PHASE 0b — USER PROFILE ADAPTATION

Read `~/.redblue/user-profile.json`. If it doesn't exist, create it:
```json
{
  "rounds_completed": 0,
  "stack_signature": [],
  "approval_rates": {
    "critical": 1.0, "high": 1.0, "medium": 1.0, "low": 1.0, "info": 0.0
  },
  "skipped_categories": [],
  "preferred_agents": null,
  "avg_rating": null,
  "last_updated": null
}
```

Apply profile to scan behaviour:
- `approval_rates.medium < 0.3` → downweight medium findings in report (still
  scan, but note user rarely acts on them)
- `approval_rates.low < 0.1` → collapse low/info into a single summary line
  in the report, don't enumerate individually
- `skipped_categories` → scan agents are told to flag these at info level only,
  not high/medium, since user consistently deprioritises them
- `preferred_agents` → override default N_SCAN_AGENTS if set
- `stack_signature` → scan agents receive a hint: "This codebase uses
  {stack_signature}. Pay extra attention to patterns common in this stack."

---

### PHASE 1 — RED TEAM (SCAN)

**NEXUS/SWARM:** dispatch N parallel scan agents via `delegate_task`.
**SOLO:** scan each subsystem in sequence.

Toolset: `["files"]` only — no browser, no execution.

**Scan agent prompt:**
```
You are a red-team security analyst scanning: {SUBSYSTEM_PATH}

Stack hint: {stack_signature from user profile, or "unknown"}
User focus: {list any high-approval-rate categories from user profile}

Threat model: STRIDE + OWASP Top 10 + LLM-specific risks
(prompt injection, trust boundary bypass, memory poisoning, tool hijacking)

EVOLVED PATTERNS — check every one of these first, they are confirmed
recurring issues in this codebase:
{contents of ## EVOLVED PATTERNS section}

For every finding, output:
{
  "id": "{round_id}-{SUBSYSTEM}-{NNN}",
  "severity": "critical|high|medium|low|info",
  "confidence": "high|medium|low",
  "category": "STRIDE + OWASP ref",
  "title": "short name",
  "file": "path:line",
  "description": "what it is",
  "reproduction_steps": ["step1", "step2"],
  "impact": "what an attacker gains",
  "remediation_hint": "one-sentence fix",
  "cvss_estimate": 0.0,
  "layman": "plain English — what does this mean for a non-technical person?"
}

Report ALL findings Critical to Info. Do NOT fix.
```

---

### PHASE 1b — UI / BROWSER QA SCAN

For any subsystem with `Has UI? = Yes`, add a browser scan.
**NEXUS/SWARM:** dedicated UI-QA agent with `["browser", "files"]`.
**SOLO:** after code scan, switch to browser mode.

```
You are a UI security and QA agent for: {FRONTEND_URL}

1. Navigate to login page. Attempt protected pages WITHOUT login (auth bypass).
2. Log in. Walk all linked pages. Map every form.
3. Submit forms with: <script>alert(1)</script> and "><img src=x onerror=alert(1)>
4. Check network: missing CSRF tokens, wide CORS headers, unencrypted POST bodies.
5. Flag: missing errors, raw stack traces, sensitive data exposed without interaction.
6. Output in the same JSON format. Add: "ui_path": "steps to reach this finding"
```

---

### PHASE 1c — SELF-SCAN OVERSEER PROTOCOL

**Applies when scanning AI system core files** — any code that controls the
AI's own behaviour, memory, tool dispatch, or decision-making.

A conflict of interest exists: an AI reviewing its own behavioural code may
underweight findings that would restrict its own capabilities.

**Mitigation:**
1. Run the normal scan on core files.
2. Run a **second independent pass** on the same files from a fresh context.
3. Diff the two finding sets:
   - In pass 2, not pass 1 → potential blind spot → escalate to referee.
   - In pass 1, not pass 2 → verify legitimacy.
4. Record in round manifest: `{ "overseer_signoff": true, "blind_spots": [...] }`
5. Round report is not final until this field is set.

**NEXUS mode extra:** Nexus must not be the sole reviewer of its own core.
Claude Code runs the second independent pass, not a Nexus-delegated agent.

---

### PHASE 2 — AGGREGATION

1. Collect all finding JSON blocks.
2. Deduplicate by `(file, title)` — keep highest severity.
3. Score: `priority = cvss × confidence_weight` (high=1.0 / med=0.7 / low=0.4)
4. Sort by priority DESC.
5. Referee / flag conflicts on the same file.
6. Lock files for Critical/High findings.
7. Write to `~/.redblue/rounds/{round_id}.json`.

---

### PHASE 3 — ROUND REPORT + APPROVAL GATE

Generate the report, present it, then **stop**. Nothing happens until approved.

```markdown
# RED-BLUE SECURITY ROUND REPORT
**Round:** {round_id}  **Mode:** {mode}  **Date:** {date}
**Coverage:** {N subsystems, N files}  **Agents:** {N}

---
## CRITICAL ({N})  |  HIGH ({N})  |  MEDIUM ({N})  |  LOW ({N})

| ID | File | Title | CVSS | What this means |
|----|------|-------|------|-----------------|
...

## TOP 5 PRIORITY FIXES
1. {id}: {title} — {remediation_hint}
...

## METRICS
- New this round: {N}
- Repeat (not yet fixed): {N}
- Closed since last round: {N}
- Risk trend: ↑ / → / ↓

## OVERSEER NOTES
{blind spots / self-scan conflicts resolved}

---
⚠ NO FIXES APPLIED. Awaiting approval.

Reply:  APPROVE | APPROVE CRITICAL | SKIP [id,...] | SKIP ALL
        + optional rating 1–5
```

**With Nexus Security Review UI:** POST round to `/api/security/rounds` and
wait for UI submission instead of text reply.

---

### PHASE 4 — GOAL DECLARATION (before any fix)

Before the first file change in any fix, state:

```
GOAL DECLARATION — {finding_id}
────────────────────────────────
Task:           {one sentence}
Root cause:     {from finding description}
Files in scope: {explicit list — nothing outside this}

Expected outcomes:
  1. {concrete, testable}
  2. {another if needed}

Out of scope: {what you are NOT touching}

Done when:
  - [ ] Outcomes verified
  - [ ] py_compile passes on all Python files touched
  - [ ] Original finding no longer reproducible
```

Included in fix report. Retest agent verifies outcomes against it.

---

### PHASE 5 — BLUE TEAM (FIX)

**Only after APPROVE.**

1. N_FIX_AGENTS: 1–5 → 2 agents / 6–15 → 5 / 16+ → 10 (max)
2. File-lock: no two agents touch the same file. Batch shared-file findings.
3. Each agent:
   ```
   Fix ONLY these findings: {list}
   1. State GOAL DECLARATION first.
   2. Fix root cause, not symptoms.
   3. py_compile every Python file touched.
   4. Do not refactor beyond the fix.
   5. Do not touch files outside your list.
   6. Report: files, line numbers, compile status, goal + outcome verification.
   ```
4. Retest: verify each fix — PASS/FAIL per finding against declared outcomes.

---

### PHASE 6 — FIX REPORT + SELF-IMPROVEMENT ENGINE

#### 6a — Fix Report
What was fixed, what failed, what was deferred. Goal declaration + outcome
verification included for each finding.

#### 6b — Learning Vault
For every Critical/High fix, append to `~/.redblue/learning-vault.json`:
```json
{
  "id": "{finding_id}",
  "round": "{round_id}",
  "violation": "root cause in one sentence",
  "what_should_have_happened": "prevention rule",
  "fixed": true,
  "retest_pass": true,
  "occurrence_count": 1,
  "verified_applied": false,
  "verification_due": "{today + 7 days ISO}"
}
```

#### 6c — UPDATE USER PROFILE

After the user's approval/rejection decisions, update `~/.redblue/user-profile.json`:

1. **Approval rates:** for each severity level, recompute running average:
   `new_rate = (old_rate × (rounds-1) + this_round_rate) / rounds`
2. **Skipped categories:** if user rejected or deferred a category 3+ rounds
   in a row → add to `skipped_categories`
3. **Stack signature:** scan the approved findings' `file` paths and extract
   tech indicators (`.py` + FastAPI → python/fastapi, `.tsx` → react, etc.)
   Accumulate into `stack_signature` array.
4. **Preferred agents:** update running average of how many agents were used
   in rounds the user rated ≥ 4.
5. **Last updated:** ISO timestamp.

#### 6d — SELF-IMPROVEMENT ENGINE

This is how the skill gets better with every round — not just for you, but for
every user who runs it.

**Step 1 — Pattern detection**
Read `~/.redblue/learning-vault.json`. Group entries by `violation` text similarity.
If any violation pattern appears 3+ times → it is a **recurring confirmed pattern**.

**Step 2 — Check existing EVOLVED PATTERNS**
Look at the `## EVOLVED PATTERNS` section at the bottom of this file.
If the pattern is not already there → it must be added.

**Step 3 — Write the update**
```
### PATTERN: {short name}
**Detected:** {round_id}  **Occurrences:** {N}  **Status:** active
**Rule:** {one-sentence prevention rule}
**Check for:** {regex or grep string to detect in code}
**Auto-flag:** yes — scan agents must flag any instance in future rounds
```

**Step 4 — Fix stale or wrong patterns**
If a pattern was added but:
- Has not appeared in the last 5 rounds → mark `status: dormant`
- Was found to be a false positive in 2+ rounds → mark `status: false-positive`,
  add note explaining why, so future agents don't waste time on it

**Step 5 — Fix the workflow itself**
If any of the following happened this round, update the relevant Phase section:
- A scan agent consistently missed a class of finding → add a "also check:"
  hint to Phase 1's prompt
- A blue-team fix consistently failed retest → add a WARNING note in Phase 5
- A goal declaration outcome was wrong/unmeasurable → refine Phase 4 template
- User rated round < 3 and wrote a reason → address the reason in the phase it relates to

The skill rewrites its own Phase sections and EVOLVED PATTERNS.
**Only these two areas are writable by self-improvement:**
the `## EVOLVED PATTERNS` section, and targeted `also check:` / WARNING
additions inside the existing Phase prose. The structure and headers above
this section are stable.

**Step 6 — NEXUS MODE EXTRA**
When running in NEXUS mode, after Steps 1–5:

6a. Use `nexus_scribe` to write the updated skill back to `~/.nexus/skills/red-blue-loop/SKILL.md`.
6b. Use `nexus_mind.save()` to store the round summary in Nexus long-term memory:
   ```
   key: "redblue-{round_id}-summary"
   value: {finding counts, top patterns found, user profile delta, patterns added}
   ```
   This means Nexus retains institutional knowledge of every security round
   across all sessions, even after this conversation ends.

---

### PHASE 6e — AUTO-SYNC TO REMOTES

After every self-improvement update, sync the skill to all configured remotes.

Read `~/.redblue/sync-remotes.json`. For each remote:

```bash
# For each remote entry:
cp {skill_source} {repo_path}/SKILL.md  # or destination path in remote config
cd {repo_path}
git add -A
git commit -m "{commit_msg with round_id and n_new substituted}"
git push origin {branch}
```

**Default remotes for Joven's machine:**
1. `~/Desktop/Nexus` → `git@github.com:jovenleewj-png/Nexus.git` (main branch)
   - Source: `~/Desktop/Nexus/skills/red-blue-loop.md`
2. `~/Desktop/red-blue-team` → `git@github.com:jovenleewj-png/red-blue-team.git` (main branch)
   - Source: `~/Desktop/red-blue-team/SKILL.md`
   - **Strip before pushing:** remove the Joven-specific SCOPE CONFIGURATION
     table entries and replace with the generic placeholder. Keep EVOLVED PATTERNS
     (they are universal insights). Strip `user-profile.json` reference.

If a push fails: log the failure to `skill-evolution.log` with the error,
retry once after 30 seconds, then surface the failure to the user without
blocking the round from completing.

---

### PHASE 7 — NEXT ROUND

- Start Phase 0 again immediately (continuous loop).
- Adjust N_SCAN_AGENTS from profile + backlog:
  - Critical > 5 this round → +2 agents
  - Zero new Critical → −1 (min 3/1)
  - Backlog > 20 unfixed → +3 fix agents
  - User rated < 3 → +1 scan + flag for human review

---

## INVOCATION

```
/redblue                       — full scope, all phases
/redblue nexus-core            — single subsystem
/redblue crm ui                — scope to CRM with UI-QA priority
/redblue report only           — regenerate last report, no new scan
/redblue fix approved          — skip to Phase 5
/redblue solo                  — force SOLO mode
/redblue profile               — show current user-profile.json
/redblue evolve                — run only Phase 6d (self-improvement pass without a new scan)
```

---

## PUBLISHING THIS SKILL

1. Clone `git@github.com:jovenleewj-png/red-blue-team.git`
2. Replace SCOPE CONFIGURATION with your own system paths
3. Set up `~/.redblue/sync-remotes.json` for your own remotes
4. The Security Review UI (`server/routers/security.py` + `SecurityReview.tsx`)
   is optional — Phase 3 text approval works standalone
5. `user-profile.json` is machine-local and never committed
6. The EVOLVED PATTERNS section is the community-shareable insight layer —
   patterns that prove universal should be PR'd back to the main repo

---

## CHANGELOG

| Version | Change |
|---------|--------|
| 1.0 | Initial — phases 0-7, dynamic scaling, Builder Swarm, UI/QA |
| 2.0 | Security Review UI (Phase 3 API, Phase 4 UI gate) |
| 2.1 | Overseer Protocol (1c), /goal merged (Phase 4), publishability split |
| 3.0 | /goal inlined, SOLO mode, self-improvement engine (6d), EVOLVED PATTERNS, standalone storage |
| 4.0 | User profile adaptation (0b, 6c), NEXUS mode always-on for local use, auto-sync to remotes (6e), self-fixing workflow (6d Step 5), Nexus memory integration (6d Step 6) |

---

---

## EVOLVED PATTERNS

> Maintained by the self-improvement engine. Scan agents check every pattern
> below before looking for anything else. Only this section and targeted
> Phase hints are written by self-improvement — the rest is stable.
> Last engine run: pre-4.0 seed

---

### PATTERN: Hardcoded Secret Fallback
**Detected:** pre-4.0  **Occurrences:** 6  **Status:** active
**Rule:** Never provide a fallback value for secrets. `os.environ.get("KEY", "value")` is always wrong. Raise if missing.
**Check for:** `os.environ.get(` with a non-None second argument containing "secret", "key", "token", "password"
**Auto-flag:** yes

---

### PATTERN: Missing Auth Decorator on Route
**Detected:** pre-4.0  **Occurrences:** 8  **Status:** active
**Rule:** Every route that accesses user data or performs actions must have an auth guard.
**Check for:** `@router.get|@router.post|@app.route` NOT immediately followed by a `Depends(` or `@login_required`
**Auto-flag:** yes

---

### PATTERN: Path Traversal via User Input
**Detected:** pre-4.0  **Occurrences:** 4  **Status:** active
**Rule:** Resolve paths and verify the result starts with the expected base. Use `Path.resolve()` and `str(resolved).startswith(str(base))`.
**Check for:** `os.path.join(` or `Path(base) /` with user-controlled input not followed by a containment check
**Auto-flag:** yes

---

### PATTERN: SSH StrictHostKeyChecking Disabled
**Detected:** pre-4.0  **Occurrences:** 2  **Status:** active
**Rule:** Never `StrictHostKeyChecking=no` in production. Use `yes` + explicit `UserKnownHostsFile`.
**Check for:** `StrictHostKeyChecking=no` in any subprocess or shell call
**Auto-flag:** yes

---

### PATTERN: Subprocess / Shell Injection via f-string
**Detected:** pre-4.0  **Occurrences:** 3  **Status:** active
**Rule:** Never interpolate user-controlled input into shell commands. Use parameterised args lists.
**Check for:** `subprocess.run(f"` | `os.system(f"` | `python3 -c` with variable interpolation
**Auto-flag:** yes

---

### PATTERN: CORS Substring Match
**Detected:** pre-4.0  **Occurrences:** 2  **Status:** active
**Rule:** CORS origin check must use an exact allowlist set. `'domain.com' in origin` allows `evil-domain.com`.
**Check for:** `in origin` or `in request.origin` used as a CORS gate
**Auto-flag:** yes

---

### PATTERN: WebSocket Auth After Accept
**Detected:** pre-4.0  **Occurrences:** 1  **Status:** active
**Rule:** Authenticate BEFORE `await ws.accept()`. Close with code 1008 if auth fails.
**Check for:** `await.*accept()` appearing before any token/auth check in WebSocket connect handlers
**Auto-flag:** yes

---

### PATTERN: Server Binding 0.0.0.0 on Internal Service
**Detected:** pre-4.0  **Occurrences:** 5  **Status:** active
**Rule:** Internal services bind to `127.0.0.1`. Never `0.0.0.0`. Never `debug=True` in production.
**Check for:** `host="0.0.0.0"` | `host='0.0.0.0'` in uvicorn/Flask startup
**Auto-flag:** yes

---

*End of EVOLVED PATTERNS — self-improvement engine appends new entries below this line*
