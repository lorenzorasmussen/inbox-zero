#!/bin/bash

# Health Check Script
# Comprehensive health monitoring for inbox-zero-google-migration project

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HEALTH_CHECK_URL="http://localhost:3000/api/health"
LOG_FILE="$PROJECT_ROOT/logs/health-check.log"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=85
ALERT_THRESHOLD_DISK=85

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

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -u, --url URL       Health check URL (default: $HEALTH_CHECK_URL)"
    echo "  -q, --quiet         Quiet mode (only output errors)"
    echo "  -j, --json          Output in JSON format"
    echo "  -w, --webhook URL   Send alerts to webhook URL"
    echo "  -h, --help          Show this help message"
    exit 1
}

# Parse arguments
QUIET=false
JSON_OUTPUT=false
WEBHOOK_URL=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--url)
            HEALTH_CHECK_URL="$2"
            shift 2
            ;;
        -q|--quiet)
            QUIET=true
            shift
            ;;
        -j|--json)
            JSON_OUTPUT=true
            shift
            ;;
        -w|--webhook)
            WEBHOOK_URL="$2"
            shift 2
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

# Global health status
OVERALL_HEALTH=true
HEALTH_DETAILS=()

# Add health detail
add_health_detail() {
    local component="$1"
    local status="$2"
    local message="$3"
    
    HEALTH_DETAILS+=("$component:$status:$message")
    
    if [[ "$status" == "ERROR" ]]; then
        OVERALL_HEALTH=false
    fi
}

# Check system requirements
check_system_requirements() {
    if [[ "$QUIET" != true ]]; then
        log "Checking system requirements..."
    fi
    
    # Check Node.js
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version)
        local major_version=$(echo "$node_version" | sed 's/v//' | cut -d. -f1)
        
        if [[ "$major_version" -ge 22 ]]; then
            add_health_detail "nodejs" "OK" "Version $node_version"
            success "Node.js: $node_version ✓"
        else
            add_health_detail "nodejs" "WARNING" "Version $node_version (recommended v22+)"
            warning "Node.js: $node_version (recommended v22+)"
        fi
    else
        add_health_detail "nodejs" "ERROR" "Node.js not installed"
        error "Node.js not installed"
    fi
    
    # Check pnpm
    if command -v pnpm >/dev/null 2>&1; then
        local pnpm_version=$(pnpm --version)
        add_health_detail "pnpm" "OK" "Version $pnpm_version"
        success "pnpm: $pnpm_version ✓"
    else
        add_health_detail "pnpm" "ERROR" "pnpm not installed"
        error "pnpm not installed"
    fi
    
    # Check Git
    if command -v git >/dev/null 2>&1; then
        local git_version=$(git --version | cut -d' ' -f3)
        add_health_detail "git" "OK" "Version $git_version"
        success "Git: $git_version ✓"
    else
        add_health_detail "git" "ERROR" "Git not installed"
        error "Git not installed"
    fi
}

# Check project structure
check_project_structure() {
    if [[ "$QUIET" != true ]]; then
        log "Checking project structure..."
    fi
    
    local required_files=(
        "package.json"
        "pnpm-lock.yaml"
        "tsconfig.json"
        "turbo.json"
    )
    
    local required_dirs=(
        "apps"
        "packages"
        "scripts"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$PROJECT_ROOT/$file" ]]; then
            add_health_detail "structure" "OK" "Required file exists: $file"
        else
            add_health_detail "structure" "ERROR" "Missing required file: $file"
            error "Missing required file: $file"
        fi
    done
    
    for dir in "${required_dirs[@]}"; do
        if [[ -d "$PROJECT_ROOT/$dir" ]]; then
            add_health_detail "structure" "OK" "Required directory exists: $dir"
        else
            add_health_detail "structure" "WARNING" "Missing directory: $dir"
            warning "Missing directory: $dir"
        fi
    done
}

# Check dependencies
check_dependencies() {
    if [[ "$QUIET" != true ]]; then
        log "Checking dependencies..."
    fi
    
    cd "$PROJECT_ROOT"
    
    # Check if node_modules exists
    if [[ -d "node_modules" ]]; then
        add_health_detail "dependencies" "OK" "node_modules directory exists"
        success "Dependencies installed ✓"
        
        # Check for security vulnerabilities
        if pnpm audit --audit-level moderate >/dev/null 2>&1; then
            add_health_detail "security" "OK" "No security vulnerabilities found"
            success "Security: No vulnerabilities ✓"
        else
            add_health_detail "security" "WARNING" "Security vulnerabilities found"
            warning "Security: Vulnerabilities found"
        fi
        
        # Check for outdated packages
        local outdated_count=$(pnpm outdated | grep -c "├\|└" || true)
        if [[ "$outdated_count" -eq 0 ]]; then
            add_health_detail "updates" "OK" "All packages up to date"
            success "Updates: All packages current ✓"
        else
            add_health_detail "updates" "INFO" "$outdated_count outdated packages"
            if [[ "$QUIET" != true ]]; then
                log "Updates: $outdated_count outdated packages"
            fi
        fi
    else
        add_health_detail "dependencies" "ERROR" "Dependencies not installed"
        error "Dependencies not installed - run 'pnpm install'"
    fi
}

# Check system resources
check_system_resources() {
    if [[ "$QUIET" != true ]]; then
        log "Checking system resources..."
    fi
    
    # Check disk space
    local disk_usage=$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ "$disk_usage" -le $ALERT_THRESHOLD_DISK ]]; then
        add_health_detail "disk" "OK" "Disk usage: ${disk_usage}%"
        success "Disk: ${disk_usage}% ✓"
    else
        add_health_detail "disk" "WARNING" "Disk usage high: ${disk_usage}%"
        warning "Disk: ${disk_usage}% (threshold: ${ALERT_THRESHOLD_DISK}%)"
    fi
    
    # Check memory usage (Linux/macOS)
    if command -v free >/dev/null 2>&1; then
        # Linux
        local memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
        if [[ "$memory_usage" -le $ALERT_THRESHOLD_MEMORY ]]; then
            add_health_detail "memory" "OK" "Memory usage: ${memory_usage}%"
            success "Memory: ${memory_usage}% ✓"
        else
            add_health_detail "memory" "WARNING" "Memory usage high: ${memory_usage}%"
            warning "Memory: ${memory_usage}% (threshold: ${ALERT_THRESHOLD_MEMORY}%)"
        fi
    elif command -v vm_stat >/dev/null 2>&1; then
        # macOS
        local memory_pressure=$(memory_pressure | grep "System-wide memory free percentage" | awk '{print $5}' | sed 's/%//')
        if [[ -n "$memory_pressure" ]]; then
            local memory_usage=$((100 - memory_pressure))
            if [[ "$memory_usage" -le $ALERT_THRESHOLD_MEMORY ]]; then
                add_health_detail "memory" "OK" "Memory usage: ${memory_usage}%"
                success "Memory: ${memory_usage}% ✓"
            else
                add_health_detail "memory" "WARNING" "Memory usage high: ${memory_usage}%"
                warning "Memory: ${memory_usage}% (threshold: ${ALERT_THRESHOLD_MEMORY}%)"
            fi
        fi
    fi
    
    # Check CPU usage (simplified)
    if command -v top >/dev/null 2>&1; then
        local cpu_usage=$(top -l 1 -n 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//' || echo "0")
        if [[ "$cpu_usage" -le $ALERT_THRESHOLD_CPU ]]; then
            add_health_detail "cpu" "OK" "CPU usage: ${cpu_usage}%"
            success "CPU: ${cpu_usage}% ✓"
        else
            add_health_detail "cpu" "WARNING" "CPU usage high: ${cpu_usage}%"
            warning "CPU: ${cpu_usage}% (threshold: ${ALERT_THRESHOLD_CPU}%)"
        fi
    fi
}

# Check application health
check_application_health() {
    if [[ "$QUIET" != true ]]; then
        log "Checking application health..."
    fi
    
    # Check if application is running
    if command -v curl >/dev/null 2>&1; then
        local http_status=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK_URL" 2>/dev/null || echo "000")
        
        case "$http_status" in
            200)
                add_health_detail "application" "OK" "Application responding (HTTP $http_status)"
                success "Application: Healthy ✓"
                ;;
            000)
                add_health_detail "application" "WARNING" "Application not responding"
                warning "Application: Not responding"
                ;;
            *)
                add_health_detail "application" "WARNING" "Application returning HTTP $http_status"
                warning "Application: HTTP $http_status"
                ;;
        esac
    else
        add_health_detail "application" "INFO" "curl not available, skipping health check"
        if [[ "$QUIET" != true ]]; then
            log "curl not available, skipping application health check"
        fi
    fi
}

# Check Git repository status
check_git_status() {
    if [[ "$QUIET" != true ]]; then
        log "Checking Git repository..."
    fi
    
    cd "$PROJECT_ROOT"
    
    if [[ -d ".git" ]]; then
        # Check if we have uncommitted changes
        local git_status=$(git status --porcelain 2>/dev/null || echo "")
        if [[ -z "$git_status" ]]; then
            add_health_detail "git" "OK" "Working directory clean"
            success "Git: Working directory clean ✓"
        else
            local changed_files=$(echo "$git_status" | wc -l)
            add_health_detail "git" "INFO" "$changed_files uncommitted changes"
            if [[ "$QUIET" != true ]]; then
                log "Git: $changed_files uncommitted changes"
            fi
        fi
        
        # Check if we're on a branch
        local current_branch=$(git branch --show-current 2>/dev/null || echo "DETACHED")
        if [[ "$current_branch" != "DETACHED" ]]; then
            add_health_detail "git" "OK" "On branch: $current_branch"
        else
            add_health_detail "git" "WARNING" "DETACHED HEAD state"
            warning "Git: DETACHED HEAD state"
        fi
    else
        add_health_detail "git" "WARNING" "Not a Git repository"
        warning "Git: Not a Git repository"
    fi
}

# Send alert to webhook
send_alert() {
    local status="$1"
    local message="$2"
    
    if [[ -n "$WEBHOOK_URL" ]] && command -v curl >/dev/null 2>&1; then
        local payload=$(cat << EOF
{
  "timestamp": "$(date -Iseconds)",
  "project": "inbox-zero-google-migration",
  "status": "$status",
  "message": "$message",
  "details": $(printf '%s\n' "${HEALTH_DETAILS[@]}" | jq -R . | jq -s .)
}
EOF
)
        
        curl -s -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "$payload" >/dev/null 2>&1 || true
    fi
}

# Generate JSON output
generate_json_output() {
    local status="healthy"
    if [[ "$OVERALL_HEALTH" != true ]]; then
        status="unhealthy"
    fi
    
    local details_json=$(printf '%s\n' "${HEALTH_DETAILS[@]}" | jq -R 'split(":") | {component: .[0], status: .[1], message: .[2]}' | jq -s .)
    
    cat << EOF
{
  "timestamp": "$(date -Iseconds)",
  "project": "inbox-zero-google-migration",
  "status": "$status",
  "details": $details_json
}
EOF
}

# Main execution
main() {
    if [[ "$QUIET" != true ]]; then
        log "Starting health check..."
    fi
    
    # Run all health checks
    check_system_requirements
    check_project_structure
    check_dependencies
    check_system_resources
    check_application_health
    check_git_status
    
    # Generate output
    if [[ "$JSON_OUTPUT" == true ]]; then
        generate_json_output
    else
        if [[ "$OVERALL_HEALTH" == true ]]; then
            success "Overall health: ✓ HEALTHY"
        else
            error "Overall health: ✗ UNHEALTHY"
        fi
    fi
    
    # Send alert if unhealthy and webhook configured
    if [[ "$OVERALL_HEALTH" != true ]] && [[ -n "$WEBHOOK_URL" ]]; then
        send_alert "unhealthy" "Health check failed for inbox-zero-google-migration"
    fi
    
    # Exit with appropriate code
    if [[ "$OVERALL_HEALTH" == true ]]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main "$@"