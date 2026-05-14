# Red-Blue Loop — OpenAI Codex CLI Instructions

**© 2026 Joven Lee Wei Jun · CC BY-NC-ND 4.0**
[linkedin.com/in/jovenleeweijun](https://www.linkedin.com/in/jovenleeweijun/) · [x.com/jovenleeweijun](https://x.com/jovenleeweijun)

---

## What this is

Red-Blue Loop is an autonomous quality simulation loop. When invoked, it runs
a red team (finds issues) and blue team (proposes fixes in a sandboxed copy)
across nine quality domains, iterating until convergence or the time limit.
Nothing is applied to real code until the user approves it.

Full protocol: see `SKILL.md` in this repository.

---

## Trigger

When the user types `/redblue` (with any arguments), execute the Red-Blue Loop
protocol defined in `SKILL.md`. Follow every phase in order.

---

## Codex / OpenAI platform notes

The skill is written for Claude Code but all core phases run identically on Codex.
Use these mappings where Claude-specific tools are referenced:

| SKILL.md reference | Codex equivalent |
|--------------------|-----------------|
| `nexus_scribe` | Write to file directly |
| `nexus_mind.save()` | Append a summary to `~/.redblue/session-notes.md` |
| `delegate_task` available | Use parallel tool calls → SWARM mode |
| `delegate_task` not available | Sequential passes → SOLO mode |
| `Skill` tool | Read `SKILL.md` directly |

**Operation mode detection for Codex:**
```
parallel tool calls available → SWARM mode
otherwise                     → SOLO mode
NEXUS mode is not applicable on Codex
```

**Everything else is identical:** git worktree, py_compile, file writes to
`~/.redblue/`, phase structure, convergence logic, approval gate, self-improvement.

---

## Storage

Same as any platform:
```
~/.redblue/rounds/{round_id}.json    session state
~/.redblue/sim/{round_id}/           simulation environment
~/.redblue/live-patterns.json        real-time learning buffer
~/.redblue/user-profile.json         approval history
~/.redblue/learning-vault.json       graduated patterns
```

---

## Terms

By using this skill you accept the terms in `TERMS.md`.
Attribution required on any output shared publicly:
*"Quality audit powered by Red-Blue Loop by Joven Lee."*
