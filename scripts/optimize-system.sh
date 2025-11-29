#!/bin/bash

# System Resource Optimization Script for MacBook Pro
# Identifies and fixes resource-hungry processes

echo "🔍 System Resource Optimization"
echo "================================="
echo "Hardware: MacBook Pro (8GB RAM, 2 CPU cores)"
echo ""

# Function to show memory usage
show_memory_usage() {
    if command -v vm_stat >/dev/null 2>&1; then
        PAGE_SIZE=$(vm_stat | head -1 | sed "s/.*page size of \([0-9]*\).*$/\1/")
        FREE_PAGES=$(vm_stat | awk '/free/ {gsub(/\./, "", $3); print $3}')
        INACTIVE_PAGES=$(vm_stat | awk '/inactive/ {gsub(/\./, "", $3); print $3}')
        AVAILABLE_MEMORY=$((($FREE_PAGES + $INACTIVE_PAGES) * $PAGE_SIZE / 1024 / 1024))
        TOTAL_MEMORY=$(sysctl -n hw.memsize | awk '{print $1/1024/1024}')
        USED_MEMORY=$((TOTAL_MEMORY - AVAILABLE_MEMORY))
        
        echo "💾 Memory Status:"
        echo "   Used: ${USED_MEMORY}MB / ${TOTAL_MEMORY}MB ($(echo "scale=1; $USED_MEMORY * 100 / $TOTAL_MEMORY" | bc 2>/dev/null || echo "N/A")%)"
        echo "   Free: ${AVAILABLE_MEMORY}MB"
    fi
}

# Function to show CPU usage
show_cpu_usage() {
    echo "🖥️  CPU Status:"
    if command -v top >/dev/null 2>&1; then
        CPU_USAGE=$(top -l 1 -n 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')
        echo "   Current: ${CPU_USAGE}%"
    fi
    
    echo "   Load Average: $(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')"
}

# Function to identify resource hogs
identify_resource_hogs() {
    echo ""
    echo "🎯 Resource Hogs Analysis:"
    echo "-------------------------"
    
    # Check for high memory processes (>500MB)
    echo "📊 High Memory Processes (>500MB):"
    ps aux | awk 'BEGIN{OFS=""} $6 > 512000 {printf "   %-20s %dMB (%.1f%%)\n", $11, int($6/1024), $6*100/8192}' | sort -rk2 | head -5
    
    # Check for high CPU processes (>20% CPU)
    echo ""
    echo "🔥 High CPU Processes (>20%):"
    ps aux | awk 'BEGIN{OFS=""} $3 > 20.0 {printf "   %-20s %d%% CPU\n", $11, int($3)}' | sort -rk3 | head -5
    
    # Check for problematic daemons
    echo ""
    echo "👾 System Daemons Status:"
    ps aux | grep -E "(fileproviderd|mds|mdworker|spotlight|hidd)" | grep -v grep | while read line; do
        name=$(echo "$line" | awk '{print $11}')
        cpu=$(echo "$line" | awk '{print int($3)}')
        mem=$(echo "$line" | awk '{print int($6/1024)}')
        if [[ $cpu -gt 10 ]] || [[ $mem -gt 100 ]]; then
            echo "   ⚠️  $name: ${cpu}% CPU, ${mem}MB RAM"
        fi
    done
}

# Function to fix common issues
fix_resource_issues() {
    echo ""
    echo "🔧 Applying Fixes:"
    echo "-------------------"
    
    # Fix 1: Kill OpenCode if using excessive memory
    OPENCODE_MEM=$(ps aux | grep opencode | awk '{sum += $6} END {print int(sum/1024)}' 2>/dev/null || echo 0)
    if [[ $OPENCODE_MEM -gt 1000 ]]; then
        echo "   🛑 Stopping OpenCode (using ${OPENCODE_MEM}MB RAM)..."
        pkill -f "opencode" 2>/dev/null || true
        echo "   ✅ OpenCode terminated"
    fi
    
    # Fix 2: Limit Chrome processes
    CHROME_COUNT=$(ps aux | grep "Google Chrome" | grep -v grep | wc -l)
    if [[ $CHROME_COUNT -gt 10 ]]; then
        echo "   🌐 Reducing Chrome processes (${CHROME_COUNT} running)..."
        pkill -f "Google Chrome Helper" 2>/dev/null || true
        echo "   ✅ Chrome helper processes terminated"
    fi
    
    # Fix 3: Restart fileprovider if misbehaving
    FILEPROVIDER_CPU=$(ps aux | grep fileproviderd | grep -v grep | awk '{sum += $3} END {print int(sum)}' 2>/dev/null || echo 0)
    if [[ $FILEPROVIDER_CPU -gt 50 ]]; then
        echo "   📁 Restarting fileprovider daemon (high CPU usage)..."
        pkill -f fileproviderd 2>/dev/null || true
        sleep 2
        echo "   ✅ FileProvider daemon restarted"
    fi
    
    # Fix 4: Clear system caches
    echo "   🧹 Clearing system caches..."
    sudo rm -rf /Library/Caches/* 2>/dev/null || true
    rm -rf ~/Library/Caches/* 2>/dev/null || true
    echo "   ✅ System caches cleared"
    
    # Fix 5: Optimize memory pressure
    echo "   💾 Optimizing memory pressure..."
    purge 2>/dev/null || true
    echo "   ✅ Memory optimized"
}

# Function to provide recommendations
provide_recommendations() {
    echo ""
    echo "💡 Optimization Recommendations:"
    echo "----------------------------"
    
    # Get current memory usage
    if command -v vm_stat >/dev/null 2>&1; then
        PAGE_SIZE=$(vm_stat | head -1 | sed "s/.*page size of \([0-9]*\).*$/\1/")
        FREE_PAGES=$(vm_stat | awk '/free/ {gsub(/\./, "", $3); print $3}')
        INACTIVE_PAGES=$(vm_stat | awk '/inactive/ {gsub(/\./, "", $3); print $3}')
        AVAILABLE_MEMORY=$((($FREE_PAGES + $INACTIVE_PAGES) * $PAGE_SIZE / 1024 / 1024))
        
        if [[ $AVAILABLE_MEMORY -lt 2048 ]]; then
            echo "   🚨 CRITICAL: Only ${AVAILABLE_MEMORY}MB RAM available!"
            echo "   💡 Immediate actions:"
            echo "      - Close browser tabs and applications"
            echo "      - Restart resource-heavy applications"
            echo "      - Use this script: sudo $0 --force"
        elif [[ $AVAILABLE_MEMORY -lt 4096 ]]; then
            echo "   ⚠️  WARNING: Only ${AVAILABLE_MEMORY}MB RAM available"
            echo "   💡 Recommendations:"
            echo "      - Monitor memory usage closely"
            echo "      - Consider closing unused applications"
            echo "      - Use Activity Monitor for details"
        else
            echo "   ✅ GOOD: ${AVAILABLE_MEMORY}MB RAM available"
            echo "   💡 Maintenance tips:"
            echo "      - Run this script weekly"
            echo "      - Monitor Docker resource usage"
            echo "      - Keep browser tabs reasonable"
        fi
    fi
    
    echo ""
    echo "🛠️  Quick Commands:"
    echo "   Force cleanup:     sudo $0 --force"
    echo "   Monitor Docker:     ./docker/scripts/monitor.sh"
    echo "   Activity Monitor:    open /Applications/Utilities/Activity\\ Monitor.app"
    echo "   System Info:       system_profiler SPHardwareDataType"
}

# Force cleanup mode
if [[ "$1" == "--force" ]]; then
    echo "🔥 FORCE CLEANUP MODE"
    echo "===================="
    
    echo "🛑 Terminating all user processes..."
    pkill -u $USER -9 2>/dev/null || true
    
    echo "🧹 Clearing all caches..."
    sudo rm -rf /Library/Caches/* 2>/dev/null || true
    rm -rf ~/Library/Caches/* 2>/dev/null || true
    
    echo "🔄 Restarting Finder..."
    killall Finder 2>/dev/null || true
    open /System/Library/CoreServices/Finder.app 2>/dev/null || true
    
    echo "✅ Force cleanup complete!"
    exit 0
fi

# Main execution
show_memory_usage
show_cpu_usage
identify_resource_hogs

if [[ "$1" != "--dry-run" ]]; then
    fix_resource_issues
fi

provide_recommendations

echo ""
echo "🎉 System optimization complete!"
echo "📊 Run 'top' or 'Activity Monitor' for real-time monitoring"
echo "🔄 Run this script weekly for best results"