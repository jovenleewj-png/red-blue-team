---
name: red-blue-loop
trigger: /redblue
description: >
  Autonomous quality simulation loop covering eight testing domains: security,
  agent behaviour, skill correctness, infrastructure, tech stack, eval harnesses,
  functional correctness, and UI/UX quality. Red team finds issues across all
  relevant domains. Blue team proposes fixes in a sandboxed simulation. The skill
  learns in real-time between iterations — every new pattern discovered is
  immediately injected into the next scan. After the session, a full report goes
  to the approval UI. Nothing lands in real code until the user decides.
version: "7.0"
author: Joven Lee Wei Jun
linkedin: https://www.linkedin.com/in/jovenleeweijun/
x: https://x.com/jovenleeweijun
license: CC BY-NC-ND 4.0
publishable: true
---

## ═══ FIRST-USE NOTICE ═══

**Display this notice on first use in each session. Proceeding constitutes acceptance.**

---

> ## TERMS OF USE — RED-BLUE LOOP
> **© 2026 Joven Lee Wei Jun ("the Author"). All rights reserved.**
>
> **By using this skill you agree to the following terms.**
>
> **1. GRANT** — Personal, non-exclusive, non-transferable licence for your own work.
> **2. ATTRIBUTION (MANDATORY)** — Any output shared with third parties must credit: *"Quality audit powered by Red-Blue Loop by Joven Lee."*
> **3. PROHIBITED** — Selling, sublicensing, AI training use, removing copyright notices, competitive use.
> **4. NO WARRANTY** — Not a substitute for professional security or QA assessment.
> **5. ENFORCEMENT** — Breach revokes your licence. Enforceable in SG, EU, UK, US, MY.
>
> *Continuing to use this skill constitutes your digital acceptance of these terms.*
> *Full terms: see [TERMS.md](TERMS.md)*

---

Display notice → proceed immediately to Phase 0.
**Do not show this notice again in the same session.**

---

<!--
© 2026 Joven Lee Wei Jun · https://www.linkedin.com/in/jovenleeweijun/ · https://x.com/jovenleeweijun
CC BY-NC-ND 4.0 · https://creativecommons.org/licenses/by-nc-nd/4.0/
-->

# Red-Blue Loop
### by Joven Lee · [linkedin.com/in/jovenleeweijun](https://www.linkedin.com/in/jovenleeweijun/) · [x.com/jovenleeweijun](https://x.com/jovenleeweijun)
> © 2026 Joven Lee Wei Jun · CC BY-NC-ND 4.0 · Attribution required on all shared outputs.

---

## What this skill covers

Red-Blue Loop is not a security scanner. It is a **universal quality simulation loop** — a red team that thinks about every dimension of how something can go wrong, and a blue team that fixes it in simulation before anything touches your real work.

It covers **eight testing domains**. The active domains for any session are auto-detected from what's in scope:

| # | Domain | Red Team asks | Blue Team proposes | Auto-detects when |
|---|--------|--------------|-------------------|-------------------|
| 🔴 | **Security** | What can be attacked, exploited, or abused? | Patches, hardening, access controls | Any codebase |
| 🤖 | **Agent** | Does the AI agent behave correctly under all inputs and conditions? | Tool call fixes, trust boundary guards, memory integrity, graceful degradation | `agent`, `tool`, `llm`, `openai`, `anthropic` in paths or imports |
| 🧠 | **Skill** | Do skills trigger correctly, execute their protocol, and handle edge cases? | Skill file corrections, trigger fixes, protocol gaps, missing fallbacks | `skills/`, `SKILL.md`, `/skill` trigger patterns |
| 🏗️ | **Infra** | Is the deployment configuration safe, correct, and production-ready? | Config fixes, secret management, health checks, networking | `Dockerfile`, `docker-compose`, `k8s/`, `.env`, CI/CD configs |
| 📦 | **Tech Stack** | Are dependencies correct, compatible, and configured properly? | Version pins, config corrections, deprecated API replacements | `package.json`, `requirements.txt`, `pyproject.toml`, `Cargo.toml` |
| 📊 | **Eval** | Do evaluation harnesses measure what they claim? Are results trustworthy? | Benchmark fixes, metric corrections, eval leakage detection | `eval/`, `benchmark/`, `evals.py`, test harnesses |
| 🟡 | **Functional** | Does the code actually do what it's supposed to? | Bug fixes, edge case handling, error paths | Any codebase |
| 🔵 | **UI / UX** | Is this product logical, intuitive, and user-friendly? | Flow improvements, missing feedback, confusing interactions | Web frontend, `frontend_url` in scope config |

Every scan activates all relevant domains simultaneously. A finding can be a SQL injection, a misconfigured Dockerfile, an AI agent that silently ignores tool errors, a skill that doesn't handle its edge case, or a button with no loading state — all are first-class issues.

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
  "active_domains": [],
  "domain_priorities": {
    "security": 1.0,
    "agent": 1.0,
    "skill": 1.0,
    "infra": 1.0,
    "tech_stack": 1.0,
    "eval": 1.0,
    "functional": 1.0,
    "ux": 1.0,
    "product": 1.0
  },
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

**Domain auto-detection (run once at Phase 0, cache result):**
```
security    → always active
functional  → always active
agent       → active if: agent/, tool_use, openai, anthropic, llm in paths/imports
skill       → active if: skills/, SKILL.md, trigger: pattern found
infra       → active if: Dockerfile, docker-compose, k8s/, .env, CI config found
tech_stack  → active if: package.json, requirements.txt, pyproject.toml, Cargo.toml found
eval        → active if: eval/, benchmark/, evals.py, test harness found
ux          → active if: frontend_url set in scope config OR web frontend detected
```

**NEXUS/SWARM:** one specialist agent per active domain, all run in parallel.
**SOLO:** sequential passes, one per active domain, on each subsystem.

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

Report every finding as:
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
  "layman": "plain English explanation"
}
Do NOT fix anything. Do NOT modify files.
```

---

#### Phase 1b — Agent Testing Scan

*Active when agent domain is detected.*

```
You are an AI agent quality engineer.
Scan: {sim_path}/{subsystem}
Iteration: {N}
LIVE PATTERNS: {live-patterns.json}

Review for:
- Tool call correctness: wrong tool selected, missing required params, ignoring return values
- Trust boundary violations: agent trusts unverified inputs, executes attacker-controlled strings
- Instruction following: does the agent follow its system prompt under adversarial user input?
- Memory integrity: is long-term memory correctly read, written, and scoped?
- Graceful degradation: what happens when a tool fails, returns null, or is unavailable?
- Loop safety: can the agent get stuck in a reasoning or tool-call loop?
- Prompt injection: can injected text in tool outputs hijack the agent's behaviour?
- Output validation: does the agent verify its own outputs before acting on them?
- Hallucination guard: does the agent cite/act on facts it cannot verify?

Report each finding as:
{
  "id": "{round_id}-I{N}-AGT-{NNN}",
  "domain": "agent",
  "type": "trust_violation|tool_misuse|loop_risk|injection|memory_bug|degradation",
  "severity": "critical|high|medium|low|info",
  "confidence": "high|medium|low",
  "title": "short name",
  "file": "path:line",
  "description": "what the agent does wrong and under what conditions",
  "reproduction_steps": ["step1", "step2"],
  "impact": "what breaks or what an attacker gains",
  "suggestion": "one-sentence fix direction",
  "layman": "plain English explanation"
}
Do NOT fix anything.
```

---

#### Phase 1c — Skill Testing Scan

*Active when skill domain is detected.*

```
You are a skill QA engineer.
Scan: {sim_path}/skills/ and all SKILL.md files in scope
Iteration: {N}
LIVE PATTERNS: {live-patterns.json}

Review for:
- Trigger correctness: does the skill fire on the right command and only that command?
- Protocol completeness: are all required steps present? Any missing phases or fallbacks?
- Edge case handling: what happens on unexpected input, empty args, or mid-session interruption?
- Instruction ambiguity: are any instructions vague enough that an agent could misinterpret them?
- Self-improvement safety: does the skill's evolution logic risk overwriting critical sections?
- Scope creep: does the skill do things outside its stated purpose?
- Versioning integrity: is the changelog accurate? Does the version match the content?
- Inter-skill conflicts: could this skill interfere with another skill running in the same session?

Report each finding as:
{
  "id": "{round_id}-I{N}-SKL-{NNN}",
  "domain": "skill",
  "type": "trigger|protocol|edge_case|ambiguity|safety|conflict",
  "severity": "critical|high|medium|low|info",
  "confidence": "high|medium|low",
  "title": "short name",
  "file": "SKILL.md:line",
  "description": "what is wrong and under what conditions it breaks",
  "suggestion": "one-sentence fix direction",
  "layman": "plain English explanation"
}
Do NOT fix anything.
```

---

#### Phase 1d — Infrastructure Scan

*Active when infra domain is detected.*

```
You are an infrastructure and DevOps engineer doing a security and correctness review.
Scan: {sim_path} — all Dockerfiles, docker-compose, k8s manifests, CI configs, .env files
Iteration: {N}
LIVE PATTERNS: {live-patterns.json}

Review for:
- Secrets in config: hardcoded API keys, passwords, tokens in any config file
- Exposed ports: services binding to 0.0.0.0 or exposing ports they shouldn't
- Privilege escalation: containers running as root, excessive capabilities
- Missing health checks: services with no liveness/readiness probes
- Environment parity: dev/staging/prod config differences that could cause prod failures
- Dependency pinning: unpinned base images (`:latest`) or unpinned package versions
- CI/CD safety: secrets accessible to PR builds, no branch protection, untrusted actions
- Data persistence: volumes, mounts, backup configs for stateful services

Report each finding as:
{
  "id": "{round_id}-I{N}-INF-{NNN}",
  "domain": "infra",
  "type": "secret|exposure|privilege|config|ci_cd|persistence",
  "severity": "critical|high|medium|low|info",
  "confidence": "high|medium|low",
  "title": "short name",
  "file": "path:line",
  "description": "what is wrong",
  "impact": "what fails or what an attacker gains",
  "suggestion": "one-sentence fix direction",
  "layman": "plain English explanation"
}
Do NOT fix anything.
```

---

#### Phase 1e — Tech Stack Scan

*Active when tech stack domain is detected.*

```
You are a tech stack and dependency engineer.
Scan: {sim_path} — package.json, requirements.txt, pyproject.toml, lock files, framework configs
Iteration: {N}
LIVE PATTERNS: {live-patterns.json}

Review for:
- Known vulnerable dependencies: CVEs in pinned versions, outdated packages with security fixes
- Deprecated APIs: usage of APIs removed or deprecated in the current major version
- Version incompatibilities: packages that conflict with each other or with the runtime version
- Missing peer dependencies: packages that require unlisted companions
- Misconfigured frameworks: wrong settings in webpack, vite, next.config.js, etc.
- Unused or redundant dependencies: bloat that increases attack surface
- License conflicts: dependencies with incompatible licences for commercial use

Report each finding as:
{
  "id": "{round_id}-I{N}-STK-{NNN}",
  "domain": "tech_stack",
  "type": "vulnerability|deprecated|incompatible|misconfigured|license",
  "severity": "critical|high|medium|low|info",
  "confidence": "high|medium|low",
  "title": "short name",
  "file": "path:line",
  "description": "what is wrong",
  "impact": "what breaks or what risk this introduces",
  "suggestion": "one-sentence fix direction",
  "layman": "plain English explanation"
}
Do NOT fix anything.
```

---

#### Phase 1f — Eval Testing Scan

*Active when eval domain is detected.*

```
You are an evaluation and benchmarking engineer.
Scan: {sim_path}/eval/ or equivalent
Iteration: {N}
LIVE PATTERNS: {live-patterns.json}

Review for:
- Metric validity: does the metric actually measure what the eval claims?
- Eval leakage: does training/fine-tuning data overlap with eval data?
- Baseline integrity: are baselines reproducible? Are seeds fixed?
- Scoring correctness: off-by-one errors, wrong aggregation, unhandled edge cases in scoring
- Coverage gaps: are important failure modes not covered by any eval?
- Hardcoded expectations: evals that pass because expected outputs are hardcoded, not computed
- Overfitting to eval: is the system being optimised to game the eval rather than solve the task?
- Result reproducibility: can the eval be run twice and produce the same result?

Report each finding as:
{
  "id": "{round_id}-I{N}-EVL-{NNN}",
  "domain": "eval",
  "type": "metric|leakage|scoring|coverage|reproducibility|hardcoded",
  "severity": "critical|high|medium|low|info",
  "confidence": "high|medium|low",
  "title": "short name",
  "file": "path:line",
  "description": "what is wrong",
  "impact": "how this distorts eval results",
  "suggestion": "one-sentence fix direction",
  "layman": "plain English explanation"
}
Do NOT fix anything.
```

---

#### Phase 1g — Functional QA Scan

```
You are a functional QA engineer.
Scan: {sim_path}/{subsystem}
Stack: {stack_signature}
Iteration: {N}
LIVE PATTERNS: {live-patterns.json}

Review for:
- Logic errors: conditions, calculations, data transformations that produce wrong output
- Edge cases: empty inputs, nulls, boundary values, concurrent access, large datasets
- Error handling: unhandled exceptions, missing fallbacks, silent failures
- Integration correctness: API contracts, data schema mismatches, state inconsistencies
- Regression risk: changes that could break adjacent features

Report every finding as:
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

#### Phase 1h — UI / UX Scan

*Active when ux domain is detected.*
**NEXUS/SWARM:** dedicated browser agent `["browser", "files"]`.
**SOLO:** browser pass.

```
You are a UX researcher and QA engineer.
Target: {FRONTEND_URL}
Iteration: {N}
LIVE PATTERNS: {live-patterns.json}

Review for:
- User flow logic: are steps in a sensible order? Can users get stuck?
- Missing feedback: actions with no confirmation, loading states, error messages
- Confusing interactions: labels that don't explain what they do, ambiguous buttons
- Accessibility: keyboard navigation, contrast, screen reader landmarks
- Consistency: does the UI behave predictably across different sections?
- Dead ends: pages or states users can reach but cannot escape from
- Data visibility: is sensitive data exposed? Is the right data surfaced at the right time?
- Mobile/responsive: does the layout break at common viewport sizes?

Also check for frontend security (XSS, auth bypass, exposed stack traces).

Report each finding as:
{
  "id": "{round_id}-I{N}-UX-{NNN}",
  "domain": "ux",
  "type": "flow|feedback|consistency|accessibility|security|responsive",
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

#### Phase 1i — Product Testing Scan

*Active always. Looks at the product as a whole, not individual files.*

```
You are a product QA lead doing a holistic product review.
Scope: entire simulation at {sim_path}
Iteration: {N}
LIVE PATTERNS: {live-patterns.json}

Review for:
- Feature completeness: are stated features actually implemented end-to-end?
- Acceptance criteria gaps: features that are coded but don't meet their stated purpose
- User journey coherence: can a user complete the core jobs-to-be-done without hitting dead ends?
- Business logic correctness: do workflows match the intended product behaviour?
- Cross-feature consistency: do features interact correctly with each other?
- Missing error recovery: flows that break in a way the user cannot recover from
- Onboarding and discoverability: can a new user understand the product without a manual?

Report each finding as:
{
  "id": "{round_id}-I{N}-PRD-{NNN}",
  "domain": "product",
  "type": "completeness|acceptance|journey|business_logic|consistency|recovery|discovery",
  "severity": "critical|high|medium|low|info",
  "confidence": "high|medium|low",
  "title": "short name",
  "area": "feature or flow name",
  "description": "what is missing or wrong at the product level",
  "impact": "what the user cannot do or gets wrong",
  "suggestion": "one-sentence fix direction",
  "layman": "plain English explanation"
}
Do NOT fix anything.
```

---

#### Phase 1j — Self-Scan Overseer Protocol

When scanning AI system core files (agent, skill, eval): run independent second pass from fresh context.
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

if len(open_critical_high) == 0:
    → CONVERGED → Phase 4

else if time_elapsed >= time_limit:
    → TIME LIMIT reached — but always complete the current iteration fully.
      Do not stop mid-round. Finish Phase 2 and Phase 3 for the current
      iteration so every open finding has a blue-team proposal and the
      delta is consistent.  Then → Phase 4.
      This ensures the final report has no half-applied fixes or
      inconsistent state — loose ends are always tied up before handoff.

else:
    → loop back to Phase 1
```

**Time limit is checked BEFORE starting a new iteration, not during one.**
If the clock expires while an iteration is running, that iteration completes
in full (Phase 1 → real-time learning → Phase 2 → Phase 3 → delta).
Only then does the loop exit to Phase 4.

**Status update after each iteration:**
```
Iteration {N} complete  [{elapsed} / {limit}]
  Security    → {X} resolved · {Y} remaining · {Z} new   [if active]
  Agent       → {X} resolved · {Y} remaining · {Z} new   [if active]
  Skill       → {X} resolved · {Y} remaining · {Z} new   [if active]
  Infra       → {X} resolved · {Y} remaining · {Z} new   [if active]
  Tech Stack  → {X} resolved · {Y} remaining · {Z} new   [if active]
  Eval        → {X} resolved · {Y} remaining · {Z} new   [if active]
  Functional  → {X} resolved · {Y} remaining · {Z} new
  UI/UX       → {X} resolved · {Y} remaining · {Z} new   [if active]
  Product     → {X} resolved · {Y} remaining · {Z} new
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

Active domains this session: {domain list}
Breakdown by domain:
  Security:   {N} found · {N} resolved in sim · {N} remaining  [if active]
  Agent:      {N} found · {N} resolved in sim · {N} remaining  [if active]
  Skill:      {N} found · {N} resolved in sim · {N} remaining  [if active]
  Infra:      {N} found · {N} resolved in sim · {N} remaining  [if active]
  Tech Stack: {N} found · {N} resolved in sim · {N} remaining  [if active]
  Eval:       {N} found · {N} resolved in sim · {N} remaining  [if active]
  Functional: {N} found · {N} resolved in sim · {N} remaining
  UI/UX:      {N} found · {N} resolved in sim · {N} remaining  [if active]
  Product:    {N} found · {N} resolved in sim · {N} remaining

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
/redblue                   full scope — auto-detect active domains, loop until convergence or 1 hour
/redblue {subsystem}       single subsystem, all active domains
/redblue 30m               custom time limit
/redblue security          security domain only
/redblue agent             agent testing only
/redblue skill             skill testing only
/redblue infra             infrastructure only
/redblue stack             tech stack only
/redblue eval              eval testing only
/redblue functional        functional QA only
/redblue ux                UI/UX only
/redblue product           product testing only
/redblue report only       show last session report
/redblue apply approved    jump to Phase 6
/redblue solo              force SOLO mode
/redblue profile           show user-profile.json + active domain history
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
| 6.1 | Implicit digital acceptance on first use (no I AGREE required); time limit always completes current iteration before stopping; LinkedIn + X social links |
| 7.0 | **Eight-domain scope** — added Agent, Skill, Infra, Tech Stack, Eval, Product testing alongside Security, Functional, UI/UX; domain auto-detection from project structure; per-domain invocation flags; domain-aware user profile and reporting |

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

**© 2026 Joven Lee Wei Jun**
[linkedin.com/in/jovenleeweijun](https://www.linkedin.com/in/jovenleeweijun/) · [x.com/jovenleeweijun](https://x.com/jovenleeweijun)
*CC BY-NC-ND 4.0 · Attribution required on all outputs shared publicly.*
