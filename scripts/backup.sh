#!/bin/bash

# Backup Script
# Automated backup system for inbox-zero-google-migration project

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="backup-$TIMESTAMP"
MAX_BACKUPS=10

# Logging function
log() {
    local message="$1"
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    echo -e "${BLUE}[$timestamp]${NC} $message"
}

success() {
    local message="$1"
    echo -e "${GREEN}[✓]${NC} $message"
}

warning() {
    local message="$1"
    echo -e "${YELLOW}[⚠]${NC} $message"
}

error() {
    local message="$1"
    echo -e "${RED}[✗]${NC} $message"
}

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -t, --type TYPE     Backup type: full, code, data, config"
    echo "  -d, --dest DIR      Custom backup destination directory"
    echo "  -c, --compress      Compress backup (default: true)"
    echo "  -k, --keep COUNT    Number of backups to keep (default: 10)"
    echo "  --dry-run           Preview backup without executing"
    echo "  -v, --verbose       Verbose output"
    echo "  -h, --help          Show this help message"
    exit 1
}

# Parse arguments
BACKUP_TYPE="full"
CUSTOM_DEST=""
COMPRESS=true
KEEP_COUNT=$MAX_BACKUPS
DRY_RUN=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--type)
            BACKUP_TYPE="$2"
            shift 2
            ;;
        -d|--dest)
            CUSTOM_DEST="$2"
            shift 2
            ;;
        -c|--compress)
            COMPRESS=true
            shift
            ;;
        -k|--keep)
            KEEP_COUNT="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            error "Unknown option: $1"
            usage
            ;;
    esac
done

# Validate backup type
VALID_TYPES=("full" "code" "data" "config")
if [[ ! " ${VALID_TYPES[@]} " =~ " ${BACKUP_TYPE} " ]]; then
    error "Invalid backup type: $BACKUP_TYPE"
    echo "Valid types: ${VALID_TYPES[*]}"
    exit 1
fi

# Set backup destination
if [[ -n "$CUSTOM_DEST" ]]; then
    BACKUP_DIR="$CUSTOM_DEST"
fi

# Create backup directory
CURRENT_BACKUP_DIR="$BACKUP_DIR/$BACKUP_NAME"

# Execute command or show what would be executed
execute() {
    local cmd="$1"
    if [[ "$DRY_RUN" == true ]]; then
        warning "DRY RUN: $cmd"
    else
        if [[ "$VERBOSE" == true ]]; then
            log "Executing: $cmd"
        fi
        eval "$cmd"
    fi
}

# Create backup directory
create_backup_dir() {
    if [[ "$DRY_RUN" == false ]]; then
        mkdir -p "$CURRENT_BACKUP_DIR"
        log "Created backup directory: $CURRENT_BACKUP_DIR"
    else
        log "Would create backup directory: $CURRENT_BACKUP_DIR"
    fi
}

# Backup source code
backup_code() {
    log "Backing up source code..."
    
    local code_items=(
        "apps/"
        "packages/"
        "scripts/"
        "docs/"
        "*.json"
        "*.md"
        "*.yml"
        "*.yaml"
        ".env.example"
        ".gitignore"
        ".nvmrc"
        "tsconfig.json"
        "turbo.json"
    )
    
    for item in "${code_items[@]}"; do
        if [[ -e "$PROJECT_ROOT/$item" ]]; then
            execute "cp -r '$PROJECT_ROOT/$item' '$CURRENT_BACKUP_DIR/'"
        fi
    done
    
    success "Source code backup completed"
}

# Backup data
backup_data() {
    log "Backing up data..."
    
    # Backup database if DATABASE_URL is available
    if [[ -n "${DATABASE_URL:-}" ]] && command -v pg_dump >/dev/null 2>&1; then
        log "Backing up database..."
        execute "pg_dump '$DATABASE_URL' > '$CURRENT_BACKUP_DIR/database.sql'"
        success "Database backup completed"
    else
        warning "DATABASE_URL not set or pg_dump not available, skipping database backup"
    fi
    
    # Backup any data directories
    local data_dirs=(
        "data/"
        "uploads/"
        "logs/"
        "storage/"
    )
    
    for dir in "${data_dirs[@]}"; do
        if [[ -d "$PROJECT_ROOT/$dir" ]]; then
            execute "cp -r '$PROJECT_ROOT/$dir' '$CURRENT_BACKUP_DIR/'"
        fi
    done
    
    success "Data backup completed"
}

# Backup configuration
backup_config() {
    log "Backing up configuration..."
    
    local config_items=(
        ".env*"
        "config/"
        "docker-compose*.yml"
        "Dockerfile*"
        ".vscode/"
        ".cursor/"
        "biome.json"
        ".gitignore"
        ".npmrc"
        "vercel.json"
    )
    
    for item in "${config_items[@]}"; do
        # Handle glob patterns
        for file in $PROJECT_ROOT/$item; do
            if [[ -e "$file" ]]; then
                execute "cp -r '$file' '$CURRENT_BACKUP_DIR/'"
            fi
        done
    done
    
    success "Configuration backup completed"
}

# Backup Git repository
backup_git() {
    log "Backing up Git repository..."
    
    if [[ -d "$PROJECT_ROOT/.git" ]]; then
        execute "cp -r '$PROJECT_ROOT/.git' '$CURRENT_BACKUP_DIR/'"
        
        # Create git bundle for efficient storage
        execute "cd '$PROJECT_ROOT' && git bundle create '$CURRENT_BACKUP_DIR/git.bundle' --all"
        success "Git repository backup completed"
    else
        warning "Git repository not found, skipping Git backup"
    fi
}

# Create backup metadata
create_metadata() {
    log "Creating backup metadata..."
    
    local metadata_file="$CURRENT_BACKUP_DIR/backup-info.json"
    
    cat > "$metadata_file" << EOF
{
  "backup_name": "$BACKUP_NAME",
  "timestamp": "$(date -Iseconds)",
  "backup_type": "$BACKUP_TYPE",
  "project": "inbox-zero-google-migration",
  "project_root": "$PROJECT_ROOT",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'N/A')",
  "git_branch": "$(git branch --show-current 2>/dev/null || echo 'N/A')",
  "node_version": "$(node --version 2>/dev/null || echo 'N/A')",
  "pnpm_version": "$(pnpm --version 2>/dev/null || echo 'N/A')",
  "backup_size": "N/A (calculated after compression)",
  "compressed": $COMPRESS
}
EOF
    
    success "Backup metadata created"
}

# Compress backup
compress_backup() {
    if [[ "$COMPRESS" == true ]]; then
        log "Compressing backup..."
        
        local archive_name="$BACKUP_DIR/$BACKUP_NAME.tar.gz"
        
        execute "cd '$BACKUP_DIR' && tar -czf '$BACKUP_NAME.tar.gz' '$BACKUP_NAME'"
        execute "rm -rf '$CURRENT_BACKUP_DIR'"
        
        # Get compressed size
        if [[ "$DRY_RUN" == false ]]; then
            local compressed_size=$(du -sh "$archive_name" | cut -f1)
            log "Compressed backup size: $compressed_size"
            
            # Update metadata with size
            local metadata_file="$BACKUP_DIR/$BACKUP_NAME/backup-info.json"
            if [[ -f "$metadata_file" ]]; then
                sed -i.bak "s/\"backup_size\": \"N/A (calculated after compression)\"/\"backup_size\": \"$compressed_size\"/" "$metadata_file"
                rm "$metadata_file.bak"
            fi
        fi
        
        success "Backup compressed successfully"
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups (keeping last $KEEP_COUNT)..."
    
    if [[ "$DRY_RUN" == false ]]; then
        # List backups by date, remove old ones
        local backup_count=$(ls -1 "$BACKUP_DIR"/backup-* 2>/dev/null | wc -l)
        
        if [[ "$backup_count" -gt "$KEEP_COUNT" ]]; then
            local remove_count=$((backup_count - KEEP_COUNT))
            ls -1t "$BACKUP_DIR"/backup-* | tail -n "$remove_count" | while read -r backup; do
                log "Removing old backup: $(basename "$backup")"
                rm -rf "$backup"
            done
            success "Removed $remove_count old backups"
        else
            log "No old backups to remove (current: $backup_count, keeping: $KEEP_COUNT)"
        fi
    else
        log "Would clean up old backups, keeping last $KEEP_COUNT"
    fi
}

# Verify backup
verify_backup() {
    log "Verifying backup..."
    
    local backup_path="$BACKUP_DIR/$BACKUP_NAME"
    if [[ "$COMPRESS" == true ]]; then
        backup_path="$BACKUP_DIR/$BACKUP_NAME.tar.gz"
    fi
    
    if [[ "$DRY_RUN" == false ]]; then
        if [[ -f "$backup_path" ]] || [[ -d "$backup_path" ]]; then
            success "Backup verification successful"
            
            # Show backup size
            local backup_size=$(du -sh "$backup_path" | cut -f1)
            log "Backup size: $backup_size"
        else
            error "Backup verification failed - backup not found"
            exit 1
        fi
    else
        log "Would verify backup at: $backup_path"
    fi
}

# Main execution
main() {
    log "Starting backup: $BACKUP_TYPE"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    create_backup_dir
    
    # Perform backup based on type
    case "$BACKUP_TYPE" in
        full)
            backup_code
            backup_data
            backup_config
            backup_git
            ;;
        code)
            backup_code
            backup_git
            ;;
        data)
            backup_data
            ;;
        config)
            backup_config
            ;;
    esac
    
    # Create metadata and finalize
    create_metadata
    compress_backup
    cleanup_old_backups
    verify_backup
    
    success "Backup completed successfully!"
    
    if [[ "$DRY_RUN" == true ]]; then
        warning "This was a dry run. No actual backup was created."
    fi
}

# Run main function
main "$@"