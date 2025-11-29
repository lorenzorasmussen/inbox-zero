---
description: "Advanced Git checkpoint with auto-detection, validation, categorization & rollback"
agent: "build"
subtask: false
model: null
---

# 🔄 Advanced Git Checkpoint System

Execute intelligent checkpointing with automatic change detection, validation, categorization, and rollback capabilities.

## Phase 1: Pre-Checkpoint Analysis

### Repository Status Detection

!`git status --porcelain`
!`git diff --stat`
!`git diff --check`

### Branch Information

Current branch: !`git branch --show-current`
Upstream tracking: !`git rev-parse --abbrev-ref @{upstream} 2>/dev/null || echo "No upstream configured"`

### Uncommitted Changes Count

Modified files: !`git status --porcelain | grep '^ M' | wc -l`
New files: !`git status --porcelain | grep '^??' | wc -l`
Deleted files: !`git status --porcelain | grep '^ D' | wc -l`

## Phase 2: Safety Validations

**Pre-flight checks:**

1. Verify no merge conflicts exist
2. Check for unstaged critical files (.env, secrets)
3. Ensure working directory is clean enough for checkpoint
4. Validate no detached HEAD state
5. Confirm branch protection rules (if applicable)

**Validation output:**
!`git diff --check 2>&1 || echo "No whitespace errors"`
!`git status | grep -E '\.env|secret|password|api[_-]?key' || echo "No sensitive files detected"`

## Phase 3: Intelligent File Categorization

Analyze and categorize changes into logical units:

### Categories

1. **Features** - New functionality, endpoints, components
2. **Fixes** - Bug corrections, error handling improvements
3. **Tests** - Test files, test utilities, fixtures
4. **Refactor** - Code restructuring without behavior change
5. **Docs** - README, comments, documentation
6. **Config** - Dependencies, build configs, environment setup
7. **Style** - Formatting, linting fixes, cosmetic changes

**Categorization rules:**

- Group related files (e.g., component + test + styles)
- Separate concerns (don't mix features with fixes)
- Keep atomic units (one logical change per commit)
- Prioritize by dependency (configs before features)

## Phase 4: Checkpoint Execution Strategy

For EACH identified category with changes:

### Stage Related Files

```
# Example for feature category
git add src/api/webhooks.py src/models/webhook.py
```

### Create Descriptive Commit

Format: `checkpoint: <category>: <imperative description>`

**Commit message standards:**

- Use imperative mood ("add" not "added", "fix" not "fixed")
- Keep subject line under 50 characters
- Add body for complex changes (after blank line)
- Reference issues/tickets if applicable

**Examples:**

```
git commit -m "checkpoint: feature: add webhook signature validation"
git commit -m "checkpoint: fix: resolve race condition in auth middleware"
git commit -m "checkpoint: test: add integration tests for payment flow"
git commit -m "checkpoint: refactor: extract validation logic to utils"
git commit -m "checkpoint: config: update dependencies to latest LTS"
```

### Post-Commit Verification

After each commit:
!`git log -1 --stat --color=always`
!`git show --name-status HEAD`

## Phase 5: Tagging & Milestones

**Create annotated tags for significant checkpoints:**

```
# For major milestones
git tag -a checkpoint-<milestone> -m "<description>"

# Examples:
git tag -a checkpoint-auth-complete -m "Authentication system fully implemented and tested"
git tag -a checkpoint-api-v1 -m "Public API v1 endpoints complete"
git tag -a checkpoint-pre-deploy -m "Pre-production deployment checkpoint"
```

**List existing checkpoint tags:**
!`git tag -l 'checkpoint-*' --sort=-creatordate | head -10`

## Phase 6: Rollback & Recovery Documentation

### Rollback Options

Present available rollback strategies:

1. **Soft Reset** (keep changes staged):

   ```
   git reset --soft HEAD~1
   ```

2. **Mixed Reset** (keep changes unstaged):

   ```
   git reset HEAD~1
   ```

3. **Hard Reset** (discard all changes):

   ```
   git reset --hard HEAD~1
   ```

4. **Revert** (create inverse commit):

   ```
   git revert HEAD
   ```

5. **Restore Specific File**:

   ```
   git checkout <commit-hash> -- <file-path>
   ```

6. **Interactive Rebase** (rewrite history):
   ```
   git rebase -i HEAD~<n>
   ```

### Recent Checkpoint History

!`git log --oneline --graph --decorate -20 | grep checkpoint || git log --oneline --graph --decorate -10`

## Phase 7: Argument Processing

### Command Arguments

User provided: $ARGUMENTS

**Argument Options:**

- `$1` - Category override (feature|fix|test|refactor|docs|config|style)
- `$2` - Specific file paths (comma-separated)
- `$3` - Custom commit message
- `$4` - Tag name for milestone

**Processing logic:**

- If `$1` provided: Use specified category only
- If `$2` provided: Checkpoint only listed files
- If `$3` provided: Use custom message instead of auto-generated
- If `$4` provided: Create annotated tag with this name

### Examples

```
/checkpoint                              # Auto-detect and checkpoint all changes
/checkpoint feature                      # Only checkpoint feature-related changes
/checkpoint feature src/api.py          # Checkpoint specific file as feature
/checkpoint fix "resolve auth bug"      # Custom message
/checkpoint feature "" "" auth-v1       # Auto-checkpoint features and tag as auth-v1
```

## Phase 8: Execution Summary

Generate checkpoint report:

### Changes Committed

- Total commits created: [COUNT]
- Files changed: [FILES]
- Lines added: [+LINES]
- Lines removed: [-LINES]

### Commit References

!`git log --oneline -5 --graph --decorate`

### Next Steps

1. Review commits: `git log --stat`
2. Push to remote: `git push origin $(git branch --show-current)`
3. Create PR if needed
4. Rollback if needed: See Phase 6 options

### Branch Status

!`git status --short --branch`

## Execution Protocol

**NOW execute the following sequence:**

1. Run all pre-checkpoint validations
2. Categorize all modified files into logical groups
3. For each category with changes:
   - Stage related files atomically
   - Generate descriptive commit message
   - Create commit with proper formatting
   - Verify commit was created successfully
4. If $4 provided or milestone detected: Create annotated tag
5. Generate comprehensive summary report
6. Present rollback options for user reference

**Commit Requirements:**

- Every commit MUST be atomic (single logical unit)
- Every commit MUST have descriptive message following standards
- Every commit MUST be verifiable via git log
- Every file change MUST be committed (no unstaged changes remain)

**Error Handling:**

- If validation fails: STOP and report issue
- If commit fails: STOP and show error
- If files contain conflicts: STOP and request resolution
- If sensitive files detected: WARN and request confirmation

Execute complete checkpoint protocol now.
