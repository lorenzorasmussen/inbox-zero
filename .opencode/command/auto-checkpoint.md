---
description: "Auto-checkpoint scheduler and monitoring service"
agent: "build"
subtask: true
---

# 🤖 Auto-Checkpoint Scheduler

Configure and manage periodic automatic checkpointing with intelligent change detection.

## Phase 1: Environment Setup

### Checkpoint Configuration

**Current working directory:** !`pwd`
**Git repository status:** !`git rev-parse --git-dir 2>/dev/null && echo "Valid" || echo "Not initialized"`

### System Capabilities

**Available monitoring tools:**
!`command -v fswatch >/dev/null 2>&1 && echo "✅ fswatch available" || echo "❌ fswatch not found"`
!`command -v inotifywait >/dev/null 2>&1 && echo "✅ inotifywait available" || echo "❌ inotifywait not found"`
!`command -v entr >/dev/null 2>&1 && echo "✅ entr available" || echo "❌ entr not found"`

**Cron/systemd availability:**
!`command -v crontab >/dev/null 2>&1 && echo "✅ crontab available" || echo "❌ crontab not found"`
!`command -v systemctl >/dev/null 2>&1 && echo "✅ systemd available" || echo "❌ systemd not found"`

## Phase 2: Auto-Checkpoint Configuration

### Configuration File Creation

**Create checkpoint configuration:**

```bash
# Create .checkpoint-config file
cat > .checkpoint-config << 'EOF'
# Auto-Checkpoint Configuration
CHECKPOINT_INTERVAL=30  # minutes
MIN_CHANGES=5          # minimum files to trigger auto-checkpoint
WORK_HOURS="09:00-18:00" # only auto-checkpoint during work hours
EXCLUDE_PATTERNS=".git,node_modules,*.log,*.tmp"
AUTO_PUSH=false         # auto-push to remote after checkpoint
CREATE_TAGS=true       # create auto-checkpoint tags
MAX_AUTO_CHECKPOINTS=50 # cleanup old auto-checkpoints
EOF

echo "✅ Checkpoint configuration created"
```

### Intelligent Change Detection

**Setup file monitoring:**

```bash
# Install monitoring tool if needed
setup_monitoring_tool() {
  if command -v fswatch >/dev/null 2>&1; then
    echo "Using fswatch for file monitoring"
    MONITOR_CMD="fswatch -o . --exclude=.git --exclude=node_modules"
  elif command -v inotifywait >/dev/null 2>&1; then
    echo "Using inotifywait for file monitoring"
    MONITOR_CMD="inotifywait -r -e modify,create,delete --exclude='(\.git|node_modules)' ."
  elif command -v entr >/dev/null 2>&1; then
    echo "Using entr for file monitoring"
    MONITOR_CMD="find . -not -path './.git/*' -not -path './node_modules/*' | entr -d"
  else
    echo "⚠️  No file monitoring tool found, using polling"
    MONITOR_CMD="while true; do sleep 60; done"
  fi
}

setup_monitoring_tool
```

## Phase 3: Periodic Scheduling

### Cron Job Setup

**Create cron job for periodic checkpointing:**

```bash
# Add to crontab
(crontab -l 2>/dev/null; echo "*/30 9-18 * * 1-5 cd $(pwd) && /checkpoint auto >> .checkpoint.log 2>&1") | crontab -

echo "✅ Cron job configured: Every 30 minutes during work hours (Mon-Fri, 9AM-6PM)"
```

### Systemd Timer Setup (Alternative)

**Create systemd service and timer:**

```bash
# Create service file
sudo tee /etc/systemd/system/opencode-checkpoint.service > /dev/null << EOF
[Unit]
Description=OpenCode Auto-Checkpoint Service
After=network.target

[Service]
Type=oneshot
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/checkpoint auto
StandardOutput=append:.checkpoint.log
StandardError=append:.checkpoint.log

[Install]
WantedBy=multi-user.target
EOF

# Create timer file
sudo tee /etc/systemd/system/opencode-checkpoint.timer > /dev/null << EOF
[Unit]
Description=Run OpenCode Auto-Checkpoint every 30 minutes
Requires=opencode-checkpoint.service

[Timer]
OnCalendar=*:0/30
OnBootSec=5min
Persistent=true

[Install]
WantedBy=timers.target
EOF

# Enable and start timer
sudo systemctl daemon-reload
sudo systemctl enable opencode-checkpoint.timer
sudo systemctl start opencode-checkpoint.timer

echo "✅ Systemd timer configured and started"
```

## Phase 4: Real-time Monitoring

### File System Watcher

**Start background file monitoring:**

```bash
# Start monitoring in background
start_file_monitor() {
  echo "🔍 Starting file system monitoring..."

  $MONITOR_CMD | while read event; do
    # Debounce rapid changes
    sleep 5

    # Check if significant changes exist
    local changes=$(git status --porcelain | wc -l)

    if [ $changes -ge $MIN_CHANGES ]; then
      echo "🔄 Auto-checkpoint triggered: $changes files changed"

      # Execute auto-checkpoint
      /checkpoint auto

      # Log the event
      echo "$(date): Auto-checkpoint executed ($changes files)" >> .checkpoint.log
    fi
  done &

  MONITOR_PID=$!
  echo "✅ File monitoring started (PID: $MONITOR_PID)"
}

start_file_monitor
```

### IDE Integration Scripts

**VS Code integration:**

```bash
# Create VS Code extension directory
mkdir -p .vscode/extensions

# Create auto-checkpoint extension
cat > .vscode/extensions/auto-checkpoint.js << 'EOF'
const vscode = require('vscode');
const { execSync } = require('child_process');

function activate(context) {
  let disposable = vscode.commands.registerCommand('extension.autoCheckpoint', () => {
    try {
      execSync('/checkpoint auto', { stdio: 'inherit' });
      vscode.window.showInformationMessage('Auto-checkpoint completed!');
    } catch (error) {
      vscode.window.showErrorMessage(`Checkpoint failed: ${error.message}`);
    }
  });

  // Auto-checkpoint on file save
  let lastCheckpoint = Date.now();
  vscode.workspace.onDidSaveTextDocument(() => {
    const now = Date.now();
    if (now - lastCheckpoint > 5 * 60 * 1000) { // 5 minutes
      execSync('/checkpoint auto', { stdio: 'ignore' });
      lastCheckpoint = now;
    }
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };
EOF

echo "✅ VS Code integration created"
```

**Vim/Neovim integration:**

```bash
# Create Vim plugin
cat > .vim/plugin/auto-checkpoint.vim << 'EOF'
" Auto-checkpoint plugin for Vim/Neovim
if exists('g:loaded_auto_checkpoint') | finish | endif
let g:loaded_auto_checkpoint = 1

let s:last_checkpoint = localtime()

function! s:auto_checkpoint()
  if localtime() - s:last_checkpoint > 300 " 5 minutes
    silent !/checkpoint auto
    let s:last_checkpoint = localtime()
  endif
endfunction

" Auto-checkpoint on buffer write
autocmd BufWritePost * call s:auto_checkpoint()

" Manual checkpoint command
command! AutoCheckpoint execute '/checkpoint auto'
EOF

echo "✅ Vim/Neovim integration created"
```

## Phase 5: Monitoring & Logging

### Checkpoint Status Dashboard

**Create status monitoring:**

```bash
# Status function
checkpoint_status() {
  echo "📊 Auto-Checkpoint Status"
  echo "========================"

  # Git status
  echo "📁 Repository Status:"
  git status --porcelain | wc -l | xargs echo "  Changed files:"

  # Recent auto-checkpoints
  echo ""
  echo "🏷️  Recent Auto-Checkpoints:"
  git tag -l 'auto-checkpoint-*' --sort=-creatordate | head -5 | while read tag; do
    echo "  $tag"
  done

  # Monitoring status
  echo ""
  echo "🔍 Monitoring Status:"
  if ps -p $MONITOR_PID > /dev/null 2>&1; then
    echo "  ✅ File monitoring active (PID: $MONITOR_PID)"
  else
    echo "  ❌ File monitoring not running"
  fi

  # Configuration
  echo ""
  echo "⚙️  Configuration:"
  if [ -f .checkpoint-config ]; then
    source .checkpoint-config
    echo "  Interval: $CHECKPOINT_INTERVAL minutes"
    echo "  Min changes: $MIN_CHANGES"
    echo "  Work hours: $WORK_HOURS"
  else
    echo "  ❌ Configuration file not found"
  fi
}

# Export status function
export -f checkpoint_status
```

### Log Management

**Setup log rotation:**

```bash
# Create log rotation script
cat > .checkpoint-logrotate << 'EOF'
.checkpoint.log {
  daily
  rotate 7
  compress
  missingok
  notifempty
  copytruncate
}
EOF

# Setup logrotate
if command -v logrotate >/dev/null 2>&1; then
  logrotate .checkpoint-logrotate
  echo "✅ Log rotation configured"
fi
```

## Phase 6: Cleanup & Maintenance

### Auto-Cleanup Old Checkpoints

**Cleanup script:**

```bash
# Cleanup old auto-checkpoints
cleanup_old_checkpoints() {
  local max_checkpoints=${MAX_AUTO_CHECKPOINTS:-50}

  echo "🧹 Cleaning up old auto-checkpoints (keeping latest $max_checkpoints)..."

  # Get old auto-checkpoint tags
  local old_tags=$(git tag -l 'auto-checkpoint-*' --sort=-creatordate | tail -n +$((max_checkpoints + 1)))

  if [ -n "$old_tags" ]; then
    echo "$old_tags" | xargs -I {} git tag -d {}
    echo "✅ Cleaned up $(echo "$old_tags" | wc -l) old checkpoints"
  else
    echo "✅ No old checkpoints to clean up"
  fi
}

# Schedule cleanup weekly
echo "0 2 * * 0 cd $(pwd) && cleanup_old_checkpoints" | crontab -
```

## Phase 7: Execution Protocol

**NOW execute the following sequence:**

1. **Environment Validation**:
   - Check Git repository status
   - Verify monitoring tools availability
   - Validate system capabilities

2. **Configuration Setup**:
   - Create .checkpoint-config file
   - Setup monitoring tool selection
   - Configure auto-checkpoint parameters

3. **Scheduling Setup**:
   - Install cron job or systemd timer
   - Configure work hours and intervals
   - Setup periodic execution

4. **Real-time Monitoring**:
   - Start file system watcher
   - Configure IDE integrations
   - Setup change detection logic

5. **Monitoring & Logging**:
   - Create status dashboard
   - Setup log rotation
   - Configure cleanup procedures

6. **Validation & Testing**:
   - Test auto-checkpoint functionality
   - Verify monitoring is working
   - Validate configuration

**Auto-Checkpoint Features Enabled:**

- ✅ Time-based periodic checkpointing
- ✅ Change-based intelligent triggering
- ✅ File system real-time monitoring
- ✅ IDE/editor integration
- ✅ Comprehensive logging and status
- ✅ Automatic cleanup and maintenance
- ✅ Configurable work hours and intervals
- ✅ Multiple scheduling options (cron/systemd)

Execute auto-checkpoint setup now.
