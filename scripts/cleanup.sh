#!/bin/bash

# Project Cleanup Script
# Comprehensive cleanup and maintenance for inbox-zero-google-migration project

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -t, --type TYPE     Cleanup type: dependencies, cache, git, code, logs, docker, full"
    echo "  -d, --dry-run       Preview changes without executing"
    echo "  -b, --backup        Create backup before cleanup"
    echo "  -v, --verbose       Verbose output"
    echo "  -h, --help          Show this help message"
    exit 1
}

# Parse arguments
CLEANUP_TYPE=""
DRY_RUN=false
BACKUP=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--type)
            CLEANUP_TYPE="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -b|--backup)
            BACKUP=true
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

# Validate cleanup type
if [[ -z "$CLEANUP_TYPE" ]]; then
    error "Cleanup type is required"
    usage
fi

VALID_TYPES=("dependencies" "cache" "git" "code" "logs" "docker" "full")
if [[ ! " ${VALID_TYPES[@]} " =~ " ${CLEANUP_TYPE} " ]]; then
    error "Invalid cleanup type: $CLEANUP_TYPE"
    echo "Valid types: ${VALID_TYPES[*]}"
    exit 1
fi

# Create backup if requested
create_backup() {
    if [[ "$BACKUP" == true ]]; then
        log "Creating backup..."
        BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        # Backup important files
        cp package.json "$BACKUP_DIR/" 2>/dev/null || true
        cp pnpm-lock.yaml "$BACKUP_DIR/" 2>/dev/null || true
        cp -r .git "$BACKUP_DIR/" 2>/dev/null || true
        
        success "Backup created: $BACKUP_DIR"
    fi
}

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

# Dependency cleanup
cleanup_dependencies() {
    log "Cleaning up dependencies..."
    
    execute "pnpm outdated"
    execute "pnpm audit --audit-level moderate"
    execute "pnpm audit fix"
    execute "pnpm update --latest"
    
    success "Dependency cleanup completed"
}

# Cache cleanup
cleanup_cache() {
    log "Cleaning up caches..."
    
    execute "rm -rf .next"
    execute "rm -rf apps/web/.next"
    execute "rm -rf .turbo"
    execute "rm -rf node_modules/.cache"
    execute "find . -name '*.tsbuildinfo' -delete"
    execute "find . -name '.eslintcache' -type d -exec rm -rf {} + 2>/dev/null || true"
    execute "pnpm store prune"
    execute "rm -rf apps/web/cache apps/web/tmp .cache"
    
    success "Cache cleanup completed"
}

# Git cleanup
cleanup_git() {
    log "Optimizing Git repository..."
    
    execute "git clean -fd"
    execute "git branch --merged | grep -v '\*' | xargs git branch -d 2>/dev/null || true"
    execute "git remote prune origin"
    execute "git gc --aggressive --prune=now"
    execute "git reflog expire --expire=now --all"
    
    success "Git repository optimized"
}

# Code cleanup
cleanup_code() {
    log "Cleaning up code quality..."
    
    execute "npx @biomejs/biome check . --write 2>/dev/null || echo 'Biome not available'"
    execute "npx tsc --noEmit 2>/dev/null || echo 'TypeScript check timed out'"
    
    # Find and report console statements
    local console_files=$(find . -name '*.ts' -o -name '*.tsx' | grep -v node_modules | xargs grep -l 'console\.' 2>/dev/null || true)
    if [[ -n "$console_files" ]]; then
        warning "Files with console statements found:"
        echo "$console_files"
    fi
    
    success "Code cleanup completed"
}

# Log cleanup
cleanup_logs() {
    log "Managing logs..."
    
    execute "find . -name '*.log' -type f -mtime +7d -exec gzip {} \; 2>/dev/null || true"
    execute "find . -name '*.log' -type f -mtime +30d -delete 2>/dev/null || true"
    execute "mkdir -p logs/archive"
    execute "find . -name '*.log.gz' -mtime +90d -exec mv {} logs/archive/ \; 2>/dev/null || true"
    
    success "Log management completed"
}

# Docker cleanup
cleanup_docker() {
    log "Cleaning up Docker..."
    
    if command -v docker >/dev/null 2>&1; then
        execute "docker image prune -f"
        execute "docker container prune -f"
        execute "docker volume prune -f"
        execute "docker network prune -f"
        execute "docker builder prune -f"
        success "Docker cleanup completed"
    else
        warning "Docker is not available or not running"
    fi
}

# Full cleanup
cleanup_full() {
    log "Performing full cleanup..."
    
    cleanup_dependencies
    cleanup_cache
    cleanup_git
    cleanup_code
    cleanup_logs
    cleanup_docker
    
    success "Full cleanup completed"
}

# Main execution
main() {
    log "Starting cleanup: $CLEANUP_TYPE"
    
    create_backup
    
    case "$CLEANUP_TYPE" in
        dependencies)
            cleanup_dependencies
            ;;
        cache)
            cleanup_cache
            ;;
        git)
            cleanup_git
            ;;
        code)
            cleanup_code
            ;;
        logs)
            cleanup_logs
            ;;
        docker)
            cleanup_docker
            ;;
        full)
            cleanup_full
            ;;
    esac
    
    success "Cleanup completed successfully!"
    
    if [[ "$DRY_RUN" == true ]]; then
        warning "This was a dry run. No actual changes were made."
    fi
}

# Run main function
main "$@"