# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

## Project Architecture Notes

### Static Assets and Public Directory

**IMPORTANT: Static assets (JS, CSS, images) MUST be placed under `resources/public/`, NOT `public/`**

- ✅ **Correct**: `resources/public/js/race-visualizations.js`
- ✅ **Correct**: `resources/public/css/visualizations.css`
- ❌ **Incorrect**: `public/js/race-visualizations.js`
- ❌ **Incorrect**: `public/css/visualizations.css`

**Reason**: Powerpack expects static files to be served from `resources/public/` directory structure. Files placed at root `public/` will not be accessible.

**Reference**: See `deps.edn` `:paths` includes both `"src"` and `"resources"` - all static assets must be within `resources/` to be correctly resolved.

