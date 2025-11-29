---
description: "Advanced Git checkpoint with auto-detection, validation, categorization & rollback"
agent: build
subtask: true
---

# 🔄 Advanced Git Checkpoint System

Execute intelligent checkpointing with automatic change detection, validation, categorization, and rollback capabilities.

## Phase 0: Git Repository Initialization & Health Check

### Git Repository Validation

**Check if Git is initialized:**
!`git rev-parse --git-dir 2>/dev/null && echo "Git repository exists" || echo "No Git repository found"`

**Auto-initialize Git if needed:**

```bash
# If no Git repository, initialize it
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "🚀 Initializing Git repository..."
  git init
  git config user.name "OpenCode Checkpoint"
  git config user.email "checkpoint@opencode.ai"

  # Create initial commit
  echo "# Project initialized by OpenCode Checkpoint" > README.md
  git add README.md
  git commit -m "init: initial project setup by OpenCode Checkpoint"

  echo "✅ Git repository initialized successfully"
fi
```

### Git Configuration Check

**Verify Git user configuration:**
!`git config --global user.name || echo "No global user name configured"`
!`git config --global user.email || echo "No global user email configured"`

**Set default configuration if missing:**

```bash
if ! git config user.name >/dev/null 2>&1; then
  git config user.name "OpenCode Checkpoint"
fi

if ! git config user.email >/dev/null 2>&1; then
  git config user.email "checkpoint@opencode.ai"
fi
```

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
/checkpoint auto                         # Automatic checkpoint with minimal prompts
/checkpoint feature                      # Only checkpoint feature-related changes
/checkpoint feature src/api.py          # Checkpoint specific file as feature
/checkpoint fix "resolve auth bug"      # Custom message
/checkpoint feature "" "" auth-v1       # Auto-checkpoint features and tag as auth-v1
/checkpoint init                        # Initialize Git repository if needed
/checkpoint schedule                    # Setup periodic auto-checkpointing
/checkpoint status                      # Show checkpoint and auto-checkpoint status
```

/checkpoint # Auto-detect and checkpoint all changes
/checkpoint feature # Only checkpoint feature-related changes
/checkpoint feature src/api.py # Checkpoint specific file as feature
/checkpoint fix "resolve auth bug" # Custom message
/checkpoint feature "" "" auth-v1 # Auto-checkpoint features and tag as auth-v1

````

## Phase 8: Periodic Auto-Checkpoint Configuration

### Automatic Checkpoint Setup

**Configure periodic checkpointing:**

```bash
# Setup auto-checkpoint cron job (every 30 minutes)
echo "*/30 * * * * cd $(pwd) && /checkpoint auto" | crontab -

# Or use systemd timer for more reliability
sudo systemctl create opencode-checkpoint.timer
````

**Auto-checkpoint triggers:**

- Time-based: Every 30 minutes during work hours
- Change-based: When >10 files modified
- Event-based: Before major operations (builds, deploys)
- Session-based: When IDE session ends

### Auto-Checkpoint Logic

```bash
# Auto-checkpoint function
auto_checkpoint() {
  local changes=$(git status --porcelain | wc -l)

  if [ $changes -gt 0 ]; then
    echo "🔄 Auto-checkpoint: $changes files detected"

    # Categorize and commit automatically
    /checkpoint auto

    # Create auto-checkpoint tag
    local timestamp=$(date +%Y%m%d-%H%M%S)
    git tag -a "auto-checkpoint-$timestamp" -m "Automatic checkpoint at $timestamp"

    echo "✅ Auto-checkpoint completed: auto-checkpoint-$timestamp"
  fi
}
```

### Background Monitoring

**File system watcher for real-time checkpointing:**

```bash
# Install fswatch if not available
command -v fswatch >/dev/null 2>&1 || {
  echo "Installing fswatch for file monitoring..."
  # Installation commands based on OS
}

# Start background file watcher
fswatch -o . --exclude=.git --exclude=node_modules | while read event; do
  sleep 5  # Debounce
  auto_checkpoint
done &
```

### Integration with IDE/Editor

**VS Code integration:**

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Auto Checkpoint",
      "type": "shell",
      "command": "/checkpoint",
      "args": ["auto"],
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      },
      "runOptions": {
        "runOn": "folderOpen"
      }
    }
  ]
}
```

**Vim/Neovim integration:**

```vim
" Auto-save and checkpoint on buffer write
autocmd BufWritePost * :silent !/checkpoint auto
```

## Phase 9: Execution Summary

Generate checkpoint report:

### Changes Committed

- Total commits created: [COUNT]
- Files changed: [FILES]
- Lines added: [+LINES]
- Lines removed: [-LINES]

### Auto-Checkpoint Status

- Auto-checkpoint enabled: [STATUS]
- Last auto-checkpoint: [TIMESTAMP]
- Total auto-checkpoints: [COUNT]
- Next scheduled checkpoint: [TIME]

### Commit References

!`git log --oneline -5 --graph --decorate`

### Auto-Checkpoint History

!`git tag -l 'auto-checkpoint-*' --sort=-creatordate | head -5`

### Next Steps

1. Review commits: `git log --stat`
2. Push to remote: `git push origin $(git branch --show-current)`
3. Create PR if needed
4. Rollback if needed: See Phase 6 options
5. Configure auto-checkpoint: See Phase 8 options

### Branch Status

!`git status --short --branch`

## Execution Protocol

**NOW execute the following sequence:**

1. **Git Repository Setup**:
   - Check if Git repository exists, initialize if needed
   - Configure default user settings if missing
   - Verify repository health and accessibility

2. **Pre-Checkpoint Validations**:
   - Run all safety checks and validations
   - Detect merge conflicts and sensitive files
   - Ensure working directory is ready for checkpointing

3. **Auto-Checkpoint Detection**:
   - Check if $1 equals "auto" for automatic mode
   - If auto mode: Skip prompts, use intelligent categorization
   - If schedule mode: Setup periodic checkpointing
   - If init mode: Initialize Git repository

4. **Change Analysis & Categorization**:
   - Categorize all modified files into logical groups
   - Apply intelligent grouping based on file relationships
   - Prioritize changes by dependency and importance

5. **Checkpoint Execution**:
   - For each category with changes:
     - Stage related files atomically
     - Generate descriptive commit message
     - Create commit with proper formatting
     - Verify commit was created successfully
   - Handle auto-checkpoint special cases
   - Create milestone tags if requested

6. **Auto-Checkpoint Setup** (if applicable):
   - Configure periodic checkpointing
   - Setup file system monitoring
   - Integrate with IDE/editor if possible

7. **Reporting & Documentation**:
   - Generate comprehensive summary report
   - Document auto-checkpoint status and history
   - Present rollback options for user reference
   - Provide next steps and recommendations

**Special Mode Handling:**

- **Auto Mode**: Minimal prompts, maximum automation
- **Init Mode**: Repository initialization focus
- **Schedule Mode**: Periodic checkpointing setup
- **Status Mode**: Display current checkpoint status

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
