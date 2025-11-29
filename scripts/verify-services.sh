#!/bin/bash

# Service Connectivity Verification Script
# Tests all Inbox Zero services and endpoints

set -e

echo "🔍 Inbox Zero Service Connectivity Check"
echo "===================================="
echo ""

# Function to check if service is responding
check_service() {
    local service_name="$1"
    local url="$2"
    local timeout="${3:-5}"
    
    echo -n "🔎 Checking $service_name... "
    
    if curl -s --max-time "$timeout" "$url" >/dev/null 2>&1; then
        echo "✅ OK"
        return 0
    else
        echo "❌ FAILED"
        return 1
    fi
}

# Function to check port availability
check_port() {
    local port="$1"
    local service_name="$2"
    
    echo -n "🔌 Port $port ($service_name)... "
    
    if nc -z localhost "$port" 2>/dev/null; then
        echo "✅ OPEN"
        return 0
    else
        echo "❌ CLOSED"
        return 1
    fi
}

# Function to check Docker containers
check_docker_containers() {
    echo "🐳 Docker Container Status:"
    echo "=========================="
    
    if ! docker info >/dev/null 2>&1; then
        echo "❌ Docker is not running"
        return 1
    fi
    
    echo ""
    echo "📦 Active Containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(inbox-zero|redis|postgres)" || echo "   No relevant containers running"
    
    echo ""
    echo "📊 Container Resource Usage:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" | grep -E "(inbox-zero|redis|postgres)" || echo "   No relevant containers found"
}

# Function to check database connectivity
check_database() {
    local port="$1"
    local db_name="$2"
    
    echo -n "🗄️ Testing $db_name connection... "
    
    # Try to connect using psql if available
    if command -v psql >/dev/null 2>&1; then
        if PGPASSWORD=password timeout 3 psql -h localhost -p "$port" -U postgres -d inboxzero -c "SELECT 1;" >/dev/null 2>&1; then
            echo "✅ CONNECTED"
            return 0
        else
            echo "❌ FAILED"
            return 1
        fi
    else
        # Fallback to port check
        if nc -z localhost "$port" 2>/dev/null; then
            echo "✅ PORT OPEN (connection test skipped)"
            return 0
        else
            echo "❌ PORT CLOSED"
            return 1
        fi
    fi
}

# Function to check Redis connectivity
check_redis() {
    local port="$1"
    local redis_type="$2"
    
    echo -n "🔴 Testing $redis_type connection... "
    
    if command -v redis-cli >/dev/null 2>&1; then
        if redis-cli -p "$port" ping >/dev/null 2>&1; then
            echo "✅ CONNECTED"
            return 0
        else
            echo "❌ FAILED"
            return 1
        fi
    else
        # Fallback to port check
        if nc -z localhost "$port" 2>/dev/null; then
            echo "✅ PORT OPEN (connection test skipped)"
            return 0
        else
            echo "❌ PORT CLOSED"
            return 1
        fi
    fi
}

# Function to check web application
check_web_app() {
    local port="$1"
    local app_type="$2"
    
    echo -n "🌐 Testing $app_type web app... "
    
    # Check if port is open first
    if ! nc -z localhost "$port" 2>/dev/null; then
        echo "❌ PORT CLOSED"
        return 1
    fi
    
    # Try to access health endpoint
    if curl -s --max-time 5 "http://localhost:$port/api/health" >/dev/null 2>&1; then
        echo "✅ HEALTHY"
        return 0
    else
        # Try basic HTTP connection
        if curl -s --max-time 5 "http://localhost:$port" >/dev/null 2>&1; then
            echo "✅ RUNNING (no health endpoint)"
            return 0
        else
            echo "❌ FAILED"
            return 1
        fi
    fi
}

# Main execution
echo "🖥️ System Information:"
echo "===================="
echo "Hardware: MacBook Pro (8GB RAM, 2 CPU cores)"
echo "Date: $(date)"
echo ""

# Check Docker containers
check_docker_containers

echo ""
echo "🔌 Port Status Check:"
echo "===================="
check_port "3000" "Next.js Dev Server"
check_port "3001" "Production Proxy"
check_port "5432" "PostgreSQL (Prod)"
check_port "5433" "PostgreSQL (Dev)"
check_port "6379" "Redis (Internal)"
check_port "6380" "Redis (External)"
check_port "8079" "Redis HTTP API"

echo ""
echo "🗄️ Database Connectivity:"
echo "========================"
check_database "5432" "PostgreSQL Production"
check_database "5433" "PostgreSQL Development"

echo ""
echo "🔴 Redis Connectivity:"
echo "===================="
check_redis "6379" "Redis Direct"
check_redis "8079" "Redis HTTP API"

echo ""
echo "🌐 Web Application Status:"
echo "========================"
check_web_app "3000" "Development Server"
check_web_app "3001" "Production Proxy"

echo ""
echo "📊 Service Health Summary:"
echo "========================"

# Count successful services
SERVICES_OK=0
TOTAL_SERVICES=0

# Check web app on port 3000
if nc -z localhost 3000 2>/dev/null; then
    ((TOTAL_SERVICES++))
    if curl -s --max-time 3 "http://localhost:3000/api/health" >/dev/null 2>&1; then
        ((SERVICES_OK++))
    fi
fi

# Check web app on port 3001
if nc -z localhost 3001 2>/dev/null; then
    ((TOTAL_SERVICES++))
    if curl -s --max-time 3 "http://localhost:3001/api/health" >/dev/null 2>&1; then
        ((SERVICES_OK++))
    fi
fi

# Check PostgreSQL
if nc -z localhost 5433 2>/dev/null; then
    ((TOTAL_SERVICES++))
    if PGPASSWORD=password timeout 3 psql -h localhost -p 5433 -U postgres -d inboxzero -c "SELECT 1;" >/dev/null 2>&1; then
        ((SERVICES_OK++))
    fi
fi

# Check Redis
if nc -z localhost 6379 2>/dev/null; then
    ((TOTAL_SERVICES++))
    if redis-cli -p 6379 ping >/dev/null 2>&1; then
        ((SERVICES_OK++))
    fi
fi

if [[ $TOTAL_SERVICES -eq 0 ]]; then
    echo "❌ No services are running"
elif [[ $SERVICES_OK -eq $TOTAL_SERVICES ]]; then
    echo "✅ All running services are healthy"
else
    echo "⚠️  $SERVICES_OK/$TOTAL_SERVICES services are healthy"
fi

echo ""
echo "🛠️ Troubleshooting Commands:"
echo "=========================="
echo "🔧 Start services:"
echo "   ./docker/scripts/start-optimized.sh"
echo "   docker-compose -f docker-compose.dev-optimized.yml up -d"
echo ""
echo "🔧 Check logs:"
echo "   docker-compose logs"
echo "   docker-compose logs -f [service-name]"
echo ""
echo "🔧 Restart services:"
echo "   docker-compose restart [service-name]"
echo "   docker-compose down && docker-compose up -d"
echo ""
echo "🔧 Port conflicts:"
echo "   lsof -i :[port]"
echo "   kill -9 \$(lsof -t -i :[port] | awk 'NR!=1 {print $2}')"
echo ""
echo "🔧 Environment check:"
echo "   ./scripts/setup-environment.sh"
echo "   cat apps/web/.env | grep -v '^#'"
echo ""
echo "📊 Real-time monitoring:"
echo "   ./docker/scripts/monitor.sh"
echo "   top -o cpu -O mem"
echo "   Activity Monitor"

echo ""
echo "🎯 Quick Access URLs:"
echo "=================="
if nc -z localhost 3000 2>/dev/null; then
    echo "🌐 Development: http://localhost:3000"
fi
if nc -z localhost 3001 2>/dev/null; then
    echo "🏭 Production: http://localhost:3001"
fi
if nc -z localhost 8079 2>/dev/null; then
    echo "🔴 Redis HTTP: http://localhost:8079"
fi

echo ""
echo "✅ Connectivity check complete!"