#!/bin/bash
# Real-time Docker Resource Monitor

set -e

echo "🐳 Docker Resource Monitor - $(date)"
echo "=========================================="
echo "Press Ctrl+C to stop monitoring"
echo ""

while true; do
    clear
    echo "🐳 Docker Resource Monitor - $(date)"
    echo "=========================================="
    
    # System resources
    echo "💻 System Resources:"
    if command -v top >/dev/null 2>&1; then
        echo "CPU Usage: $(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//' 2>/dev/null || echo "N/A")%"
    fi
    echo "Memory Usage: $(vm_stat | perl -ne '/page size of (\d+)/ and $ps=$1; /Pages\s+([^ ]+)\s+free/ and printf "%.2f%%\n", ((1 - $2/($1+$2))*100))' 2>/dev/null || echo "N/A")"
    echo ""
    
    # Docker container resources
    echo "📦 Container Resources:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" 2>/dev/null || echo "No containers running"
    
    # Docker system info
    echo ""
    echo "🔧 Docker System Info:"
    docker system df 2>/dev/null || echo "Docker system info unavailable"
    
    echo ""
    echo "⏱️  Next update in 5 seconds..."
    sleep 5
done