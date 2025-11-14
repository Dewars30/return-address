# Claude Code Relaunch Plan - Ensure Session Hook Loads

**Goal:** Restart Claude Code session with Superpowers bootstrap properly loaded

**Time Required:** 5 minutes

**Last Updated:** 2025-11-13

---

## Quick Verification First

Before doing a full relaunch, let's verify current status:

### Check 1: Is Bootstrap Currently Loaded?

Look at the **very first system message** in this conversation. Search for:

```
<system-reminder>
SessionStart hook additional context: <EXTREMELY_IMPORTANT>
You have superpowers.
```

- **If you see this** → ✅ Bootstrap IS loaded (no relaunch needed)
- **If you DON'T see this** → ❌ Bootstrap NOT loaded (proceed with relaunch)

### Check 2: Current Plugin Status

```bash
# Check if superpowers is installed
cat ~/.claude/plugins/installed_plugins.json | grep -A 5 "superpowers@superpowers-marketplace"
```

Expected output:
```json
"superpowers@superpowers-marketplace": {
  "version": "3.4.1",
  "installedAt": "2025-11-14T07:21:36.615Z",
  ...
}
```

---

## Relaunch Plan (If Bootstrap Not Loaded)

### Option A: Simple Restart (Try This First)

**If superpowers is installed but bootstrap didn't load:**

1. **Save your current work**
   ```bash
   # If you have uncommitted changes
   git status
   git add .
   git commit -m "wip: before claude relaunch"
   ```

2. **Quit Claude Code completely**
   - macOS: `⌘Q` (Command-Q)
   - Ensure app fully quits (check Activity Monitor if unsure)

3. **Wait 5 seconds**
   - Let system fully close processes

4. **Relaunch Claude Code**
   - Open from Applications folder
   - Or `open -a "Claude Code"`

5. **Start NEW conversation**
   - Don't continue this conversation
   - Start fresh to get new session hook

6. **Verify bootstrap loaded**
   - First message should include superpowers context
   - Ask Claude: "Do you have superpowers loaded?"
   - Claude should respond: "Yes, I have superpowers loaded..."

---

### Option B: Clean Reinstall (If Option A Fails)

**If simple restart doesn't load bootstrap:**

#### Step 1: Uninstall Current Plugin

In Claude Code CLI:
```
/plugin uninstall superpowers@superpowers-marketplace
```

Wait for confirmation message.

#### Step 2: Remove Marketplace (Optional)

```
/plugin marketplace remove obra/superpowers-marketplace
```

This ensures clean slate.

#### Step 3: Verify Clean State

```bash
# Check plugins are removed
cat ~/.claude/plugins/installed_plugins.json | grep superpowers
```

Should return nothing (or show other superpowers-* plugins but not core superpowers).

#### Step 4: Re-add Marketplace

In Claude Code CLI:
```
/plugin marketplace add obra/superpowers-marketplace
```

Wait for success message.

#### Step 5: Reinstall Superpowers

```
/plugin install superpowers@superpowers-marketplace
```

Expected output:
```
✅ Successfully installed superpowers@superpowers-marketplace (v3.4.1)
📦 Please restart Claude Code to activate the plugin
```

#### Step 6: Quit and Restart

1. **Quit Claude Code**: `⌘Q`
2. **Wait 10 seconds**
3. **Relaunch Claude Code**
4. **Start NEW conversation**

#### Step 7: Verify Installation

**Check 1: Bootstrap Context**
```
Look for in first message:
<system-reminder>
SessionStart hook additional context: <EXTREMELY_IMPORTANT>
You have superpowers.
```

**Check 2: Skills Available**

Ask Claude:
```
"List all available superpowers skills"
```

Expected: Claude should list 21 skills including:
- brainstorming
- systematic-debugging
- test-driven-development
- etc.

**Check 3: Test Skill Loading**

Ask Claude:
```
"Use the brainstorming skill to help me plan a feature"
```

Claude should respond:
```
"I'm using the brainstorming skill to refine your idea into a design."
```

---

## Post-Relaunch Verification Checklist

Run through this checklist in your NEW session:

```markdown
- [ ] Session start shows superpowers bootstrap context
- [ ] Claude responds "Yes" to "Do you have superpowers loaded?"
- [ ] Claude can list all 21 skills
- [ ] Claude successfully loads brainstorming skill when asked
- [ ] Claude follows mandatory workflow (checks for skills before tasks)
- [ ] TodoWrite works for checklist items
```

---

## Troubleshooting Failed Relaunch

### Issue: Bootstrap Still Not Loading After Reinstall

**Possible Causes:**
1. Claude Code version too old (need 2.0.13+)
2. Corrupted plugin cache
3. Permissions issue on ~/.claude/plugins/

**Solutions:**

**A. Check Claude Code Version**
```
# In Claude Code, run:
/help

# Look for version number
# Must be 2.0.13 or higher
```

**B. Clear Plugin Cache**
```bash
# Backup first
cp -r ~/.claude/plugins ~/.claude/plugins.backup

# Clear cache
rm -rf ~/.claude/plugins/cache/superpowers

# Reinstall
# In Claude Code:
/plugin install superpowers@superpowers-marketplace
```

**C. Check Permissions**
```bash
# Ensure you own the plugins directory
ls -la ~/.claude/plugins/

# Should show your username, not root

# Fix if needed:
sudo chown -R $(whoami) ~/.claude/plugins/
```

### Issue: Skills Load But Don't Execute

**Symptoms:**
- Claude acknowledges skill
- Doesn't follow skill instructions
- Rationalizes away skill usage

**This is NOT a technical issue** - it's a prompt adherence issue.

**Solution:**
1. Start new conversation
2. First message: "Before we start, confirm you will follow all superpowers skills exactly as written, without rationalization."
3. Claude should commit to following skills
4. If Claude still doesn't follow, the skill itself may need stronger language

---

## After Successful Relaunch

### 1. Update claude.md

Add to the Superpowers section:
```markdown
## Session Hook Verification

✅ **Last Verified:** 2025-11-13
✅ **Bootstrap Loading:** Confirmed in session start
✅ **All 21 Skills Available**

If bootstrap not loading:
1. See CLAUDE_RELAUNCH_PLAN.md
2. Try simple restart first
3. Clean reinstall if needed
```

### 2. Test Return Address Workflows

Run a test bug fix using skills:

1. **Pick a small bug** from your backlog
2. **Use systematic-debugging skill** to investigate
3. **Use brainstorming skill** if solution unclear
4. **Use test-driven-development skill** to implement fix
5. **Use verification-before-completion skill** before claiming done

This validates skills work end-to-end.

### 3. Create Custom Skills

Once core skills verified:
1. Create `return-address-bug-documentation` skill
2. Create `return-address-deployment-checklist` skill
3. Test both skills with real scenarios

---

## Success Criteria

You'll know relaunch was successful when:

✅ Every new Claude session shows superpowers bootstrap
✅ Claude proactively suggests relevant skills
✅ Claude follows skill workflows without rationalization
✅ TodoWrite creates tasks for skill checklists
✅ Claude announces skill usage before executing

---

## Quick Reference Commands

```bash
# Check installation
cat ~/.claude/plugins/installed_plugins.json | grep superpowers

# List skills
ls ~/.claude/plugins/cache/superpowers/skills/

# Verify bootstrap file
cat ~/.claude/plugins/cache/superpowers/.codex/superpowers-bootstrap.md

# Uninstall
/plugin uninstall superpowers@superpowers-marketplace

# Reinstall
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace

# Then: Quit (⌘Q), wait, relaunch, start new conversation
```

---

**Status:** Ready for execution
**Estimated Time:** 5 minutes (simple restart) or 10 minutes (clean reinstall)
**Next Action:** Choose Option A (simple restart) or Option B (clean reinstall)
