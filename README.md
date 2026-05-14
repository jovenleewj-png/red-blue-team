# Red-Blue Loop

**A continuous simulation loop that finds issues, proposes fixes, and re-validates — across security, agents, skills, infrastructure, tech stack, evals, functionality, UI/UX, and product quality — before anything touches your real code.**

> **by Joven Lee** · [linkedin.com/in/jovenleeweijun](https://www.linkedin.com/in/jovenleeweijun/) · [x.com/jovenleeweijun](https://x.com/jovenleeweijun)
> © 2026 Joven Lee Wei Jun · Licensed CC BY-NC-ND 4.0

---

## For Everyone: What is this?

Imagine hiring a quality team that works in a parallel universe — a perfect copy of your codebase where they can try fixes, break things, rebuild them, and check if their fixes introduced new problems. Only after they've converged on a complete solution do they present it to you for a final sign-off. Your real code is never touched until you say so.

That's what Red-Blue Loop does — across **eight quality domains**, auto-detected from your project:

| Domain | What it checks |
|--------|---------------|
| 🔴 **Security** | Vulnerabilities, auth issues, injection risks, exposed secrets |
| 🤖 **Agent** | AI agent behaviour — tool calls, trust boundaries, prompt injection, memory integrity |
| 🧠 **Skill** | Skill file correctness — triggers, protocol completeness, edge cases, inter-skill conflicts |
| 🏗️ **Infra** | Deployment configs, secrets in config, exposed ports, CI/CD safety, health checks |
| 📦 **Tech Stack** | Vulnerable dependencies, deprecated APIs, version incompatibilities, framework misconfig |
| 📊 **Eval** | Evaluation harness validity, metric correctness, eval leakage, result reproducibility |
| 🟡 **Functional** | Logic errors, edge cases, error handling, integration correctness |
| 🔵 **UI / UX** | User flows, missing feedback states, accessibility, consistency |
| 🛒 **Product** | Feature completeness, acceptance criteria gaps, user journey coherence |

**In plain English, here's how a session works:**

1. 🔴 **Red team scans** your code across all three domains
2. 🔵 **Blue team proposes fixes** in a sandboxed copy of your code — never your real files
3. 🧠 **The skill learns in real-time** — patterns found in this iteration are immediately injected into the next scan
4. 🔴 **Red team scans again** on the updated sandbox — did the fixes work? did they introduce new problems?
5. 🔄 **Loop repeats** — until everything is resolved, or the time limit is up (default: 1 hour). When the hour runs out, the current iteration always finishes in full before stopping — no loose ends left mid-round
6. 📋 **Full report** — complete picture: what was found, what was fixed in simulation, what still needs work
7. ✅ **You decide** — review every item with a plain-English explanation, approve or reject each one
8. 🚀 **Applied** — only approved changes land in your real code

**The key difference from other tools:**
Most tools find problems and stop there. Red-Blue Loop runs a full simulation to figure out the best fix and validates that the fix actually works — across all three quality domains — before asking you to approve anything.

---

## For Technical Users

### The simulation loop

```mermaid
flowchart TD
    A([/redblue]) --> B[Phase 0\nInitialise simulation\ngit worktree or temp copy]
    B --> RED

    subgraph LOOP [" ── Simulation Loop — up to 1 hour ──"]
        direction TB
        RED["🔴 Phase 1 — Red Team Scan  (active domains only)\n1a · Security · STRIDE + OWASP + LLM risks\n1b · Agent · tool calls + trust + injection + loops\n1c · Skill · triggers + protocol + edge cases\n1d · Infra · configs + secrets + ports + CI/CD\n1e · Tech Stack · CVEs + deprecated APIs + misconfig\n1f · Eval · metric validity + leakage + reproducibility\n1g · Functional · logic + edge cases + error handling\n1h · UI/UX · flow + feedback + accessibility\n1i · Product · completeness + journeys + acceptance"]
        LEARN["🧠 Real-Time Learning\nNew patterns from this iteration\nwritten to live-patterns.json\nInjected into NEXT scan prompt"]
        BLUE["🔵 Phase 2 — Blue Team Fix\nWrite changes to simulation ONLY\nFile-lock · py_compile · code diff"]
        DELTA["📊 Phase 3 — Iteration Delta\nResolved · Remaining · Newly introduced"]
        CHECK{Convergence?}

        RED --> LEARN
        LEARN --> BLUE
        BLUE --> DELTA
        DELTA --> CHECK
        CHECK -->|"Critical/High remain\nor newly introduced"| RED
    end

    CHECK -->|"All resolved\nor time limit"| RPT

    RPT[Phase 4 — Full Session Report\nAll findings · All proposals · Remaining · Introduced]
    RPT --> UI[Security Review UI\nApprove · Reject · Reason · per item]
    UI --> APL[Apply approved changes\nto real codebase]
    APL --> VFY[Final verification scan\nconfirm applied correctly]
    VFY --> EVO[Self-Improvement\nGraduate patterns · Sync remotes]
    EVO --> A
```

### Eight quality domains

Every scan activates all domains relevant to your project (auto-detected from project structure):

| Domain | Auto-detects when | What red team looks for |
|--------|-------------------|------------------------|
| 🔴 **Security** | Always | STRIDE, OWASP Top 10, LLM-specific risks, secrets, auth gaps |
| 🤖 **Agent** | `agent/`, `openai`, `anthropic` imports | Tool misuse, trust violations, prompt injection, loop safety, graceful degradation |
| 🧠 **Skill** | `skills/`, `SKILL.md` | Trigger correctness, protocol completeness, edge cases, versioning |
| 🏗️ **Infra** | Dockerfile, docker-compose, k8s, `.env` | Secrets in config, exposed ports, privilege escalation, CI/CD safety |
| 📦 **Tech Stack** | `package.json`, `requirements.txt` | CVEs, deprecated APIs, version incompatibilities, misconfigs |
| 📊 **Eval** | `eval/`, `benchmark/`, test harnesses | Metric validity, eval leakage, scoring bugs, reproducibility |
| 🟡 **Functional** | Always | Logic errors, edge cases, error handling, integration correctness |
| 🔵 **UI / UX** | `frontend_url` in scope config | Flow logic, missing feedback, accessibility, consistency |
| 🛒 **Product** | Always | Feature completeness, acceptance gaps, user journey coherence |

### Real-time learning

The skill doesn't just get smarter after sessions — it gets smarter **between iterations within the same session**:

```mermaid
flowchart LR
    I1["Iteration N\nFindings"] -->|"new pattern\ndetected"| LP["live-patterns.json\n~/.redblue/live-patterns.json"]
    LP -->|"injected into\nnext scan prompt"| I2["Iteration N+1\nScans with\nnew pattern"]
    LP -->|"3+ sessions"| LV["learning-vault.json"]
    LV -->|"graduated\npattern"| EP["EVOLVED PATTERNS\nin SKILL.md"]
    EP -->|"all future\nsessions"| I2
```

Each iteration builds on what the previous one discovered. By iteration 3, the red team is scanning with everything it learned in iterations 1 and 2.

### Operation modes

| Mode | Requirements | Parallelism |
|------|-------------|-------------|
| **SOLO** | Any Claude Code instance | Sequential iterations |
| **SWARM** | Any `delegate_task` framework | Parallel scan + fix agents per iteration |
| **NEXUS** | Nexus AI framework | Full parallel + Nexus memory + auto skill refinement |

### Agent architecture

```mermaid
flowchart LR
    subgraph COMMANDER ["COMMANDER"]
        C["redblue — Session orchestrator"]
    end

    subgraph SIM ["Simulation · sim/round_id/"]
        SF["Sandboxed copy of codebase"]
    end

    subgraph RED ["Red Team — reads sim, never writes"]
        R1["Security Agent"]
        R2["Agent Testing Agent"]
        R3["Skill Testing Agent"]
        R4["Infra Agent"]
        R5["Tech Stack Agent"]
        R6["Eval Agent"]
        R7["Functional QA Agent"]
        R8["UI/UX Agent"]
        R9["Product Agent"]
        ROV["Overseer — independent re-scan"]
    end

    subgraph LEARN ["Real-Time Learning"]
        LP["live-patterns.json"]
    end

    subgraph BLUE ["Blue Team — writes to sim only"]
        B1["Fix Agent 1 — File cluster A"]
        B2["Fix Agent 2 — File cluster B"]
        BN["Fix Agent N — File cluster ..."]
    end

    C -->|"scan sim"| R1
    C -->|"scan sim"| R2
    C -->|"scan sim"| R3
    C -->|"scan sim"| R4
    C -->|"scan sim"| R5
    C -->|"scan sim"| R6
    C -->|"scan sim"| R7
    C -->|"scan sim"| R8
    C -->|"scan sim"| R9
    C -->|"scan sim"| ROV

    R1 -->|"findings"| C
    R2 -->|"findings"| C
    R3 -->|"findings"| C
    R4 -->|"findings"| C
    R5 -->|"findings"| C
    R6 -->|"findings"| C
    R7 -->|"findings"| C
    R8 -->|"findings"| C
    R9 -->|"findings"| C
    ROV -->|"findings"| C

    C -->|"new patterns"| LP
    LP -->|"injected into next scan"| C

    C -->|"propose fixes"| B1
    C -->|"propose fixes"| B2
    C -->|"propose fixes"| BN

    B1 -->|"changes"| SF
    B2 -->|"changes"| SF
    BN -->|"changes"| SF

    SF -->|"next iteration"| C
```

### What "simulation" means technically

The simulation is a git worktree (or a directory copy for non-git projects):
- `git worktree add ~/.redblue/sim/{round_id}` creates an isolated branch
- Blue team agents edit real files inside that worktree
- `py_compile` runs against those files so syntax is validated
- Red team scans the same path the next iteration
- At approval time, changed files are copied/merged into the main project

Blue team proposals are actual code, not pseudocode — they get validated by the same scan logic that found the problems.

### Convergence

The loop exits when:
- No Critical or High severity findings remain in simulation **AND** no Critical/High newly introduced, **OR**
- The session time limit is reached (default 60 minutes, configurable)

### Iteration delta tracking

Each re-scan computes:
- **Resolved** — issues from iteration N-1 that no longer appear
- **Remaining** — issues from N-1 that still appear (fix didn't work)
- **Newly introduced** — issues in iteration N not present before (blue team's fix caused a new problem)

This three-way delta is the core feedback loop — it tells blue team exactly what their fix broke.

---

## Workflow: full session view

```mermaid
sequenceDiagram
    participant U as User
    participant C as Commander
    participant R as Red Team
    participant L as Learning Engine
    participant B as Blue Team
    participant S as Simulation
    participant UI as Approval UI

    U->>C: /redblue
    C->>S: Create simulation environment

    loop Until convergence or time limit
        C->>R: Scan simulation (Security + Functional + UX)
        R-->>C: Findings across all domains
        C->>L: Extract new patterns from findings
        L-->>C: live-patterns.json updated
        note over L: Patterns immediately available\nfor next iteration scan
        C->>B: Propose fixes for all findings
        B->>S: Apply changes to simulation files
        B-->>C: Proposals (code_before/after, domain, confidence)
        C->>R: Re-scan with updated live-patterns
        R-->>C: Delta (resolved / remaining / introduced)
        C-->>U: Iteration status update
    end

    C->>UI: POST full session report (all domains)
    UI-->>U: Review each item (plain-English explanation + domain)
    U->>UI: Approve / Reject / Reason per item
    UI->>C: Decisions
    C->>S: Copy approved files to real codebase
    C->>R: Final verification scan
    R-->>C: APPLIED / MISSING / REGRESSED per item
    C-->>U: Session complete
    C->>C: Graduate patterns → Self-improvement → Sync remotes
```

---

## Self-Improvement Loop

```mermaid
flowchart TD
    subgraph INSESSION ["In-Session (every iteration)"]
        direction LR
        F[New findings] -->|"new pattern?"| LP[live-patterns.json]
        LP -->|"injected"| NS[Next scan prompt]
    end

    subgraph POSTSESSION ["Post-Session (after apply)"]
        direction LR
        LP2[live-patterns.json] -->|"3+ sessions"| LV[learning-vault.json]
        LV -->|"graduated"| EP[EVOLVED PATTERNS\nin SKILL.md]
        EP -->|"auto-push"| GR[git remotes]
    end

    subgraph ADAPT ["User Adaptation (per session)"]
        UP[user-profile.json] -->|"approval rates\nper domain"| RW[Reweight findings\nnext session]
        IT[Iteration count] -->|"> 8 iterations"| SD[Increase scan depth]
        FP[False positive rate] -->|"> 2 FPs"| DM[Mark pattern dormant]
    end

    INSESSION --> POSTSESSION
    POSTSESSION --> ADAPT
```

---

## Security Review UI (optional)

A FastAPI router and React component for the approval interface.
Each item shows: domain badge, severity badge, CVSS score, plain-English explanation, code diff, approve/reject/defer buttons with reason input.

```
server/security.py         ← FastAPI: /api/security/rounds
client/SecurityReview.tsx  ← React approval UI
```

Phase 5 text approval works without these if you prefer.

---

## Platform Compatibility

Red-Blue Loop runs on any AI coding assistant. The core phases, prompts, and simulation logic are identical everywhere — only the tool names differ.

| Platform | How to install | Operation mode |
|----------|---------------|---------------|
| **Claude Code** | Copy `SKILL.md` to `~/.nexus/skills/red-blue-loop/SKILL.md` | SOLO / SWARM / NEXUS |
| **OpenAI Codex CLI** | Copy `AGENTS.md` to your project root or `~/.codex/AGENTS.md` | SOLO / SWARM |
| **ChatGPT Custom GPT** | Paste `GPT-SYSTEM-PROMPT.md` into Custom GPT instructions | Conversation mode |
| **Any LLM terminal agent** | Reference `SKILL.md` in your system prompt or agent instructions | SOLO |

### Using with OpenAI Codex CLI

```bash
cp red-blue-team/AGENTS.md ~/.codex/AGENTS.md
# or copy to your project root so it loads per-project
cp red-blue-team/AGENTS.md ./AGENTS.md
```

Codex CLI reads `AGENTS.md` at session start. Once installed, `/redblue` triggers the full loop. All phases run identically — `git worktree`, `py_compile`, `~/.redblue/` storage, nine-domain scanning, approval gate. The only difference: Nexus-specific tools (`nexus_scribe`, `nexus_mind`) are replaced by direct file writes.

### Using with ChatGPT / Custom GPT

1. Open [GPT-SYSTEM-PROMPT.md](GPT-SYSTEM-PROMPT.md)
2. Copy everything between `=== SYSTEM PROMPT START ===` and `=== SYSTEM PROMPT END ===`
3. Paste into your Custom GPT's **Instructions** field
4. Optionally upload `SKILL.md` as a Knowledge file for full protocol detail

In conversation mode the GPT cannot write files — it shows you exactly what to change and you apply it. All nine domains, the full report format, and the per-item approval gate are all fully functional in conversation.

---

## Install

```bash
git clone git@github.com:jovenleewj-png/red-blue-team.git
mkdir -p ~/.redblue/rounds
mkdir -p ~/.nexus/skills/red-blue-loop
cp red-blue-team/SKILL.md ~/.nexus/skills/red-blue-loop/SKILL.md
cp red-blue-team/scope.example.yaml ~/.redblue/scope.yaml
# Edit scope.yaml with your system paths
```

---

## Usage

```
/redblue                  full scope, loop until convergence or 1 hour
/redblue {subsystem}      single subsystem
/redblue 30m              custom time limit
/redblue ui               include browser QA
/redblue report only      show last session report
/redblue apply approved   apply pre-decided proposals
/redblue solo             force SOLO mode
/redblue profile          show what the skill learned about your usage
/redblue evolve           self-improvement pass only
```

---

## Contributing

If the simulation loop surfaces a pattern in your codebase that proves universal,
contribute it back to EVOLVED PATTERNS via PR:

1. Fork this repo
2. Add your pattern to `## EVOLVED PATTERNS` following the existing format
3. Include: detected version, domain (security/functional/ux), occurrence count, check string, auto-flag status
4. Submit PR — reviewed by Joven Lee before merging

---

## License and Attribution

**CC BY-NC-ND 4.0** — See [TERMS.md](TERMS.md) for full terms.

Any output shared publicly must credit: *"Quality audit powered by Red-Blue Loop by Joven Lee Wei Jun."*

**© 2026 Joven Lee Wei Jun · [linkedin.com/in/jovenleeweijun](https://www.linkedin.com/in/jovenleeweijun/) · [x.com/jovenleeweijun](https://x.com/jovenleeweijun)**
