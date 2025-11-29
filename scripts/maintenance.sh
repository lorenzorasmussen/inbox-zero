#!/bin/bash

# Maintenance Script
# Regular maintenance tasks for the inbox-zero-google-migration project

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/logs/maintenance.log"
HEALTH_CHECK_URL="http://localhost:3000/api/health"

# Logging function
log() {
    local message="$1"
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    echo -e "${BLUE}[$timestamp]${NC} $message"
    echo "[$timestamp] $message" >> "$LOG_FILE"
}

success() {
    local message="$1"
    echo -e "${GREEN}[✓]${NC} $message"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [SUCCESS] $message" >> "$LOG_FILE"
}

warning() {
    local message="$1"
    echo -e "${YELLOW}[⚠]${NC} $message"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [WARNING] $message" >> "$LOG_FILE"
}

error() {
    local message="$1"
    echo -e "${RED}[✗]${NC} $message"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [ERROR] $message" >> "$LOG_FILE"
}

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

# Health check function
health_check() {
    log "Performing health checks..."
    
    # Check if required services are running
    local services_ok=true
    
    # Check Node.js version
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version)
        log "Node.js version: $node_version"
        
        # Check if version meets requirements
        if [[ "$node_version" < "v22.0.0" ]]; then
            warning "Node.js version is below recommended v22.0.0"
            services_ok=false
        fi
    else
        error "Node.js is not installed"
        services_ok=false
    fi
    
    # Check pnpm
    if command -v pnpm >/dev/null 2>&1; then
        local pnpm_version=$(pnpm --version)
        log "pnpm version: $pnpm_version"
    else
        error "pnpm is not installed"
        services_ok=false
    fi
    
    # Check disk space
    local disk_usage=$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ "$disk_usage" -gt 85 ]]; then
        warning "Disk usage is high: ${disk_usage}%"
        services_ok=false
    else
        log "Disk usage: ${disk_usage}%"
    fi
    
    # Check memory usage
    if command -v free >/dev/null 2>&1; then
        local memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
        if [[ "$memory_usage" -gt 85 ]]; then
            warning "Memory usage is high: ${memory_usage}%"
            services_ok=false
        else
            log "Memory usage: ${memory_usage}%"
        fi
    fi
    
    # Check application health if running
    if command -v curl >/dev/null 2>&1; then
        if curl -s "$HEALTH_CHECK_URL" >/dev/null 2>&1; then
            success "Application health check passed"
        else
            warning "Application health check failed or not running"
        fi
    fi
    
    if [[ "$services_ok" == true ]]; then
        success "All health checks passed"
        return 0
    else
        warning "Some health checks failed"
        return 1
    fi
}

# Dependency maintenance
dependency_maintenance() {
    log "Performing dependency maintenance..."
    
    cd "$PROJECT_ROOT"
    
    # Check for security updates
    log "Checking for security vulnerabilities..."
    if pnpm audit --audit-level moderate; then
        success "No security vulnerabilities found"
    else
        warning "Security vulnerabilities found, consider running pnpm audit fix"
    fi
    
    # Check for outdated packages
    log "Checking for outdated packages..."
    local outdated_count=$(pnpm outdated | grep -c "├\|└" || true)
    if [[ "$outdated_count" -gt 0 ]]; then
        warning "$outdated_count outdated packages found"
        log "Consider running 'pnpm update --latest' to update packages"
    else
        success "All packages are up to date"
    fi
    
    # Clean up unused dependencies
    log "Checking for unused dependencies..."
    if command -v npx >/dev/null 2>&1; then
        if npx depcheck --quiet 2>/dev/null; then
            success "No unused dependencies found"
        else
            warning "Unused dependencies found, review depcheck output"
        fi
    fi
}

# Database maintenance
database_maintenance() {
    log "Performing database maintenance..."
    
    # Check if DATABASE_URL is set
    if [[ -z "${DATABASE_URL:-}" ]]; then
        warning "DATABASE_URL not set, skipping database maintenance"
        return 0
    fi
    
    # Check database connection
    if command -v psql >/dev/null 2>&1; then
        if psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
            success "Database connection successful"
            
            # Update table statistics
            log "Updating database statistics..."
            if psql "$DATABASE_URL" -c "ANALYZE;" >/dev/null 2>&1; then
                success "Database statistics updated"
            else
                warning "Failed to update database statistics"
            fi
        else
            error "Database connection failed"
        fi
    else
        warning "psql not available, skipping database checks"
    fi
}

# Performance monitoring
performance_monitoring() {
    log "Performing performance monitoring..."
    
    # Check project size
    local project_size=$(du -sh "$PROJECT_ROOT" | cut -f1)
    log "Project size: $project_size"
    
    # Check node_modules size
    if [[ -d "$PROJECT_ROOT/node_modules" ]]; then
        local node_modules_size=$(du -sh "$PROJECT_ROOT/node_modules" | cut -f1)
        log "node_modules size: $node_modules_size"
        
        # Alert if node_modules is too large
        local size_mb=$(du -sm "$PROJECT_ROOT/node_modules" | cut -f1)
        if [[ "$size_mb" -gt 2000 ]]; then
            warning "node_modules is large (${node_modules_size}), consider cleanup"
        fi
    fi
    
    # Check git repository size
    if [[ -d "$PROJECT_ROOT/.git" ]]; then
        local git_size=$(du -sh "$PROJECT_ROOT/.git" | cut -f1)
        log "Git repository size: $git_size"
    fi
    
    # Check for large files
    local large_files=$(find "$PROJECT_ROOT" -type f -size +100M -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l)
    if [[ "$large_files" -gt 0 ]]; then
        warning "$large_files large files (>100MB) found in project"
    fi
}

# Security checks
security_checks() {
    log "Performing security checks..."
    
    # Check for exposed secrets
    log "Checking for potentially exposed secrets..."
    local secret_patterns=(
        "password.*="
        "api_key.*="
        "secret.*="
        "token.*="
        "private_key.*="
    )
    
    local secrets_found=false
    for pattern in "${secret_patterns[@]}"; do
        if grep -r -i "$pattern" "$PROJECT_ROOT" --include="*.env*" --include="*.config.*" --include="*.json" --include="*.js" --include="*.ts" 2>/dev/null | grep -v node_modules | head -5; then
            secrets_found=true
            break
        fi
    done
    
    if [[ "$secrets_found" == true ]]; then
        warning "Potential secrets found in codebase, review and secure"
    else
        success "No obvious secrets found in codebase"
    fi
    
    # Check file permissions
    log "Checking file permissions..."
    local world_writable=$(find "$PROJECT_ROOT" -type f -perm -002 -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l)
    if [[ "$world_writable" -gt 0 ]]; then
        warning "$world_writable world-writable files found"
    fi
}

# Cleanup tasks
cleanup_tasks() {
    log "Performing cleanup tasks..."
    
    # Clean old log files
    find "$PROJECT_ROOT" -name "*.log" -type f -mtime +30d -delete 2>/dev/null || true
    log "Cleaned up old log files"
    
    # Clean temporary files
    find "$PROJECT_ROOT" -name "*.tmp" -type f -mtime +7d -delete 2>/dev/null || true
    find "$PROJECT_ROOT" -name ".DS_Store" -delete 2>/dev/null || true
    log "Cleaned up temporary files"
    
    # Clean build artifacts if old
    find "$PROJECT_ROOT" -name ".next" -type d -mtime +7d -exec rm -rf {} + 2>/dev/null || true
    find "$PROJECT_ROOT" -name "dist" -type d -mtime +7d -exec rm -rf {} + 2>/dev/null || true
    log "Cleaned up old build artifacts"
}

# Generate maintenance report
generate_report() {
    log "Generating maintenance report..."
    
    local report_file="$PROJECT_ROOT/logs/maintenance-report-$(date +%Y%m%d).json"
    mkdir -p "$(dirname "$report_file")"
    
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "project": "inbox-zero-google-migration",
  "node_version": "$(node --version 2>/dev/null || echo 'N/A')",
  "pnpm_version": "$(pnpm --version 2>/dev/null || echo 'N/A')",
  "project_size": "$(du -sh "$PROJECT_ROOT" | cut -f1)",
  "node_modules_size": "$(du -sh "$PROJECT_ROOT/node_modules" 2>/dev/null | cut -f1 || echo 'N/A')",
  "disk_usage": "$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $5}')",
  "last_maintenance": "$(date -Iseconds)"
}
EOF
    
    success "Maintenance report generated: $report_file"
}

# Main execution
main() {
    log "Starting maintenance tasks..."
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Run maintenance tasks
    health_check
    dependency_maintenance
    database_maintenance
    performance_monitoring
    security_checks
    cleanup_tasks
    generate_report
    
    success "Maintenance completed successfully!"
    log "Maintenance log saved to: $LOG_FILE"
}

# Handle script arguments
case "${1:-}" in
    --health-only)
        health_check
        ;;
    --deps-only)
        dependency_maintenance
        ;;
    --security-only)
        security_checks
        ;;
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo "Options:"
        echo "  --health-only     Run only health checks"
        echo "  --deps-only       Run only dependency maintenance"
        echo "  --security-only   Run only security checks"
        echo "  --help, -h        Show this help message"
        echo ""
        echo "Default: Run all maintenance tasks"
        exit 0
        ;;
    *)
        main
        ;;
esac