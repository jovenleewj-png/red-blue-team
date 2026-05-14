# red-blue-loop

A self-improving, autonomous red-team / blue-team security loop for any codebase.

## What it does

- **Red team**: spawns parallel scan agents that audit your code against STRIDE, OWASP Top 10, and LLM-specific threat models
- **UI/QA**: browser agents walk your web frontends looking for XSS, auth bypass, and visual regressions
- **Approval gate**: presents a scored round report and waits for your decision before touching anything
- **Blue team**: dispatches fix agents only after you approve, with file-lock coordination to prevent conflicts
- **Self-improvement**: after every round, detects recurring patterns and rewrites its own scan rules — the skill gets better the more you use it
- **User adaptation**: learns your approval habits and adjusts report priorities to match what you actually care about

## Works with

| Environment | Mode | What you get |
|-------------|------|-------------|
| Claude Code (standalone) | SOLO | Sequential scans + fixes, full self-improvement |
| Any multi-agent system with `delegate_task` | SWARM | Parallel agents |
| Nexus | NEXUS | Parallel agents + Nexus long-term memory + auto nexus_scribe refinement |

## Install

```bash
git clone git@github.com:jovenleewj-png/red-blue-team.git
mkdir -p ~/.redblue/rounds
cp scope.example.yaml scope.yaml
# Edit scope.yaml with your system paths
```

Copy `SKILL.md` into your agent's skills directory and invoke with `/redblue`.

## Usage

```
/redblue                  full scan, all phases
/redblue nexus-core       scope to one subsystem
/redblue crm ui           CRM with browser QA
/redblue solo             force single-agent mode
/redblue profile          show what the skill has learned about your usage
/redblue evolve           run self-improvement pass without a new scan
```

## Storage

```
~/.redblue/
  rounds/{round_id}.json   — findings and decisions per round
  learning-vault.json      — confirmed recurring patterns
  user-profile.json        — your approval patterns (local only, never pushed)
  skill-evolution.log      — every change the skill has made to itself
  sync-remotes.json        — git remotes to push skill updates to
```

## Self-improvement

The `EVOLVED PATTERNS` section at the bottom of `SKILL.md` grows automatically.
Every round, the skill:
1. Detects violations that appear 3+ times in the learning vault
2. Adds them as auto-flagged patterns for future scans
3. Fixes scan instructions that led to missed findings
4. Marks stale patterns as dormant, marks repeated false positives
5. Pushes the updated skill to all configured git remotes

Patterns that prove universal should be PR'd back here so everyone benefits.

## Optional: Security Review UI

A FastAPI router and React component for the approval gate are in `server/`.
Drop them into any FastAPI + React stack. The text-based approval in Phase 3
works fine without them.

## License

MIT
