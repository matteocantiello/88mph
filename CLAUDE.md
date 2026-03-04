# CLAUDE.md — Paradigm Project Instructions

## ⚠️ MANDATORY: Project History Logging

**Every time the human gives you a prompt or instruction, you MUST append it to `HISTORY.md` before doing anything else.** This is non-negotiable.

Record:
- The date (if a new day)
- The prompt number (sequential)
- A brief title describing the request
- The full prompt text (quoted with `>`)
- Key decisions made (if any)
- Artifacts produced or modified (if any)

This creates a complete, reproducible trail of how the project was built. If you forget to log a prompt, add it retroactively as soon as you notice.

---

## ⚠️ MANDATORY: Chart Data Source Tracking

**Every time new chart data is ingested or existing chart data is revised, you MUST update `88mph/SOURCES.md`.** This includes:
- Adding new countries or years
- Updating existing chart data with corrected information
- Adding new data sources or verifying against official sources

Update the relevant tables (Official Chart Organizations, Coverage by Country, etc.) and the total chart count. If a new source is used, add it to the appropriate section.

---

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles
- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

