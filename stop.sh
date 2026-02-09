#!/bin/bash

# Java-Next Boilerplate Development Stop Script
# Stops both frontend and backend services

echo "🛑 Stopping Java-Next Boilerplate development environment..."
echo ""

# Kill processes by PID file if it exists
if [ -f .dev.pids ]; then
    while read pid; do
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid 2>/dev/null && echo "✓ Stopped process $pid"
        fi
    done < .dev.pids
    rm .dev.pids
fi

# Fallback: kill by port
echo "🧹 Cleaning up any remaining processes on ports 3000 and 8080..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

echo ""
echo "✅ All services stopped"
