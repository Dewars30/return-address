# Superpowers Plugin - Complete Setup & Usage Guide

**Last Updated:** 2025-11-13
**Plugin Version:** 3.4.1
**Installation Status:** ✅ Installed

---

## Current Installation Status

### Installed Plugins

```json
✅ superpowers@superpowers-marketplace (v3.4.1)
✅ episodic-memory@superpowers-marketplace (v1.0.9)
✅ superpowers-developing-for-claude-code@superpowers-marketplace (v0.2.0)
✅ superpowers-chrome@superpowers-marketplace (v1.5.0)
✅ superpowers-lab@superpowers-marketplace (v0.1.0)
```

### Installation Location

```
/Users/td/.claude/plugins/cache/superpowers/
```

---

## Available Skills (21 Total)

### Core Workflow Skills
1. **brainstorming** - Refine rough ideas into designs before coding
2. **writing-plans** - Create detailed implementation plans
3. **executing-plans** - Execute plans in batches with review checkpoints
4. **subagent-driven-development** - Dispatch subagents for independent tasks

### Development Quality Skills
5. **test-driven-development** - TDD workflow (write test first, watch fail, implement)
6. **systematic-debugging** - Four-phase debugging framework
7. **verification-before-completion** - Verify work before claiming complete
8. **requesting-code-review** - Request code review before merging
9. **receiving-code-review** - Handle code review feedback rigorously

### Git & Collaboration Skills
10. **using-git-worktrees** - Create isolated git worktrees for feature work
11. **finishing-a-development-branch** - Complete dev work (merge, PR, cleanup)
12. **sharing-skills** - Contribute skills upstream via PR

### Testing & Quality Skills
13. **testing-anti-patterns** - Prevent common testing mistakes
14. **testing-skills-with-subagents** - Test skills before deployment
15. **condition-based-waiting** - Replace timeouts with condition polling
16. **defense-in-depth** - Validate data at every system layer

### Advanced Debugging Skills
17. **root-cause-tracing** - Trace errors back to original source
18. **dispatching-parallel-agents** - Investigate 3+ independent failures concurrently

### Meta Skills
19. **using-superpowers** - Master skill for learning the system (auto-loaded)
20. **writing-skills** - Create new skills with TDD approach
21. **commands** - Slash commands support

---

## How Session Start Hook Works

### Bootstrap Process

1. **On Claude Code Restart:**
   - Superpowers plugin auto-loads
   - Bootstrap file injects into session context
   - File: `~/.claude/plugins/cache/superpowers/.codex/superpowers-bootstrap.md`

2. **Bootstrap Teaches Claude:**
   - Skills exist as markdown files with instructions
   - Skills are mandatory when they match the task
   - Use `Skill` tool to load and execute skills
   - Never rationalize away skill usage

3. **Critical Rules Loaded:**
   ```
   - Before ANY task, check if a skill applies
   - If skill exists for task, you MUST use it
   - Announce skill usage before executing
   - Follow skills exactly (they encode proven techniques)
   ```

### Verifying Hook Loaded

Check for this in session start:
```
<system-reminder>
SessionStart hook additional context: <EXTREMELY_IMPORTANT>
You have superpowers...
</system-reminder>
```

If you DON'T see this, the hook didn't load properly.

---

## Usage Patterns (From Blog Post)

### The Mandatory Workflow

**From**: https://blog.fsck.com/2025/10/09/superpowers/

1. **Brainstorm → Plan → Implement** cycle
2. **Automatic git worktree creation** for parallel work
3. **Two implementation approaches:**
   - Traditional: Multi-session management
   - Modern: Subagent dispatch with code reviews
4. **RED/GREEN TDD** throughout
5. **GitHub PR or local merge** at completion

### Skills as Superpowers

**Key Insight:** Skills are markdown files that teach Claude new capabilities.

**How They Work:**
- Skills extracted from technical literature
- Claude can self-improve by writing skill documentation
- Skills tested against simulated subagents under pressure
- Psychological principles (authority, commitment, social proof) embedded

### Common Rationalizations to Avoid

From `using-superpowers` skill, these thoughts mean you're about to fail:

❌ "This is just a simple question" → WRONG. Questions are tasks.
❌ "I can check git/files quickly" → WRONG. Skills tell you HOW.
❌ "Let me gather information first" → WRONG. Check for skills first.
❌ "This doesn't need a formal skill" → WRONG. If skill exists, use it.
❌ "I remember this skill" → WRONG. Skills evolve. Run current version.
❌ "This doesn't count as a task" → WRONG. If taking action, it's a task.
❌ "The skill is overkill for this" → WRONG. Skills exist to prevent errors.
❌ "I'll just do this one thing first" → WRONG. Check skills BEFORE doing anything.

---

## Return Address Project-Specific Skills

### Missing Skills We Need (Not in Core Superpowers)

Based on your bug patterns, you need:

1. **return-address-bug-documentation** (Custom)
   - Document bugs in your YYYY-MM-DD-{issue}-{type}.md format
   - Include: Problem, Root Cause, Solution, Verification
   - Update claude.md known issues
   - Commit to git

2. **return-address-deployment-checklist** (Custom)
   - Pre-deployment health checks
   - Verify critical env vars (PRISMA_CLIENT_DISABLE_PREPARED_STATEMENTS, etc.)
   - Test auth flows (creator, non-creator, unauthenticated)
   - Test Stripe webhooks
   - Verify CSP policies

3. **next.js-app-router-debugging** (Community - Need to Find)
   - Next.js 14+ specific debugging
   - NEXT_REDIRECT error handling
   - Middleware debugging
   - Server Component vs Client Component issues

4. **prisma-pooling-debugging** (Community - Need to Find)
   - Prisma + PgBouncer/Supavisor issues
   - Connection pooling errors
   - Prepared statement conflicts
   - Transaction pooling mode debugging

5. **stripe-connect-testing** (Custom or Community)
   - Test creator onboarding → Connect account creation
   - Test subscription creation → webhook handling
   - Test payout flows
   - Verify webhook signatures

---

## Relaunch Plan: Ensuring Session Start Hook Loads

### Current Problem

Session start hook may not be loading consistently, missing the bootstrap context.

### Solution: Clean Reinstall

#### Step 1: Verify Current Installation
```bash
# Check installed plugins
cat ~/.claude/plugins/installed_plugins.json | grep superpowers

# Check skills directory
ls ~/.claude/plugins/cache/superpowers/skills/
```

#### Step 2: Optional - Clean Reinstall (If Hook Not Loading)
```bash
# In Claude Code CLI:
/plugin uninstall superpowers@superpowers-marketplace
/plugin marketplace remove obra/superpowers-marketplace

# Wait 5 seconds

/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

#### Step 3: Quit and Restart Claude Code
```
⌘Q to quit (macOS)
Relaunch Claude Code
```

#### Step 4: Verify Bootstrap Loaded

**In first message of new session, check for:**
```
<system-reminder>
SessionStart hook additional context: <EXTREMELY_IMPORTANT>
You have superpowers.
```

**If you see this** → ✅ Hook loaded successfully
**If you DON'T see this** → ❌ Hook failed to load

#### Step 5: Test Skill Loading

```
# Try loading a skill manually
User: "Use the brainstorming skill to help me plan a feature"

# Claude should respond with:
"I'm using the brainstorming skill to refine your idea into a design."
```

---

## Creating Custom Skills for Return Address

### Skill File Structure

```markdown
---
name: skill-name
description: Brief description that triggers when relevant
---

# Skill Title

## When to Use
- Specific trigger conditions
- Context where this skill applies

## Process
1. Step-by-step instructions
2. What Claude should do
3. How to verify completion

## Checklist (if applicable)
- [ ] Item 1
- [ ] Item 2
```

### Location for Custom Skills

**Project-specific skills:**
```
~/.claude/skills/return-address/
```

**Naming convention:**
```
return-address-{feature}.md
```

Example:
```
~/.claude/skills/return-address/bug-documentation.md
~/.claude/skills/return-address/deployment-checklist.md
```

---

## Troubleshooting

### Hook Not Loading

**Symptoms:**
- No `<system-reminder>` with superpowers context
- Skills don't auto-trigger
- Claude doesn't follow skill workflows

**Fix:**
1. Quit Claude Code completely
2. Check `~/.claude/plugins/installed_plugins.json` shows superpowers
3. Verify `~/.claude/plugins/cache/superpowers/.codex/superpowers-bootstrap.md` exists
4. Restart Claude Code
5. Start new conversation
6. Check for bootstrap context in first exchange

### Skill Not Found

**Symptoms:**
- "Skill not found" error
- Skill doesn't load

**Fix:**
```bash
# List available skills
ls ~/.claude/plugins/cache/superpowers/skills/

# Verify skill exists
cat ~/.claude/plugins/cache/superpowers/skills/{skill-name}/SKILL.md
```

### Skill Loaded But Not Followed

**Symptoms:**
- Claude acknowledges skill
- Claude doesn't follow skill instructions

**Fix:**
- Check skill has `<EXTREMELY_IMPORTANT>` tags
- Verify skill instructions are clear and unambiguous
- Add psychological triggers (authority, commitment, social proof)
- Test skill with pressure scenarios

---

## Next Steps for Return Address

### Immediate (This Session)
1. ✅ Verify superpowers installation
2. ✅ Document current setup (this file)
3. ⏳ Create `return-address-bug-documentation` skill
4. ⏳ Create `return-address-deployment-checklist` skill
5. ⏳ Update claude.md with skill references

### Short-term (This Week)
1. Search superpowers-marketplace for Next.js skills
2. Search superpowers-marketplace for Prisma skills
3. Create `stripe-connect-testing` skill if not found
4. Test all skills with real bugs from backlog

### Long-term (For V2)
1. Create skills for new V2 features
2. Share useful skills back to marketplace
3. Build library of Return Address-specific skills
4. Document skill creation process

---

## Reference Links

- **Blog Post:** https://blog.fsck.com/2025/10/09/superpowers/
- **Superpowers Repo:** https://github.com/obra/superpowers
- **Marketplace:** https://github.com/obra/superpowers-marketplace
- **Skills Repo:** https://github.com/obra/superpowers-skills
- **Claude Code Docs:** https://docs.claude.com/claude-code

---

**Status:** ✅ Plugin Installed, Bootstrap Loaded
**Next Action:** Create custom Return Address skills
