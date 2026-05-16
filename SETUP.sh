#!/bin/bash

# CollabCode - Complete Setup Script
# Usage: bash SETUP.sh

set -e

echo "🚀 CollabCode Setup Starting..."
echo ""

# Check system requirements
echo "📋 Checking system requirements..."
echo -n "  Node.js: "
node --version || (echo "❌ Node.js not installed" && exit 1)
echo -n "  Python3: "
python3 --version || (echo "⚠️  Python3 not installed (optional)" && true)
echo -n "  g++ (C++): "
g++ --version | head -1 || (echo "⚠️  g++ not installed (optional)" && true)
echo ""

# Backend Setup
echo "🔧 Setting up Backend..."
cd backend
echo "  Installing dependencies..."
npm install --legacy-peer-deps >/dev/null 2>&1
echo "  Building TypeScript..."
npm run build >/dev/null 2>&1
echo "  ✅ Backend ready"
cd ..
echo ""

# Frontend Setup
echo "🎨 Setting up Frontend..."
cd frontend
echo "  Installing dependencies..."
npm install --legacy-peer-deps >/dev/null 2>&1
echo "  Building Next.js..."
npm run build >/dev/null 2>&1
echo "  ✅ Frontend ready"
cd ..
echo ""

echo "✨ Setup Complete!"
echo ""
echo "📝 Quick Start:"
echo "  Terminal 1 (Backend):   cd backend && npm run dev"
echo "  Terminal 2 (Frontend):  cd frontend && npm run dev"
echo "  Browser:                http://localhost:3000"
echo ""
echo "🧪 Test code execution:"
echo "  Create room → Write Python code → Click 'Run Code'"
echo ""
