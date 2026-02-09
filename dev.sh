#!/bin/bash

# Java-Next Boilerplate Development Startup Script
# Starts both frontend and backend services

set -e

echo "🚀 Starting Java-Next Boilerplate development environment..."
echo ""

# Kill any existing processes on ports 3000 and 8080
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
echo "✓ Ports cleared"
echo ""

# Start backend in background
echo "🔧 Starting Spring Boot backend (port 8080)..."
cd backend
mvn spring-boot:run > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "✓ Backend started (PID: $BACKEND_PID)"
echo ""

# Wait a moment for backend to initialize
sleep 2

# Start frontend in background
echo "🎨 Starting Next.js frontend (port 3000)..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "✓ Frontend started (PID: $FRONTEND_PID)"
echo ""

# Save PIDs to file for easy cleanup
echo "$BACKEND_PID" > .dev.pids
echo "$FRONTEND_PID" >> .dev.pids

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Development environment is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend:  http://localhost:8080"
echo ""
echo "📋 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop: ./stop.sh or kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Keep script running and tail logs
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

echo "📖 Showing combined logs (Ctrl+C to stop)..."
echo ""
tail -f backend.log frontend.log
