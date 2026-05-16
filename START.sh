#!/bin/bash
# CollabCode - Start Everything

echo "🚀 Starting CollabCode..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Kill any existing processes on ports
echo "Cleaning up ports..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo ""
echo -e "${BLUE}📋 Terminal 1: Starting Backend${NC}"
echo "  Run: cd backend && npm run dev"
echo ""
echo -e "${BLUE}📋 Terminal 2: Starting Frontend${NC}"
echo "  Run: cd frontend && npm run dev"
echo ""
echo -e "${GREEN}✅ Then open: http://localhost:3000${NC}"
echo ""
echo "Press Enter to start backend in background..."
read

cd backend && npm run dev &
BACKEND_PID=$!

sleep 3

echo ""
echo "Backend running (PID: $BACKEND_PID)"
echo ""
echo "Press Enter to start frontend..."
read

cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✅ Both servers started!${NC}"
echo "  Backend:  http://localhost:3001"
echo "  Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all"

wait
