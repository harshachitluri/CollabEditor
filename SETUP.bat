@echo off
REM CollabCode - Complete Setup Script for Windows
REM Usage: SETUP.bat

echo.
echo 🚀 CollabCode Setup Starting...
echo.

REM Check system requirements
echo 📋 Checking system requirements...
echo   Node.js:
node --version || (echo ❌ Node.js not installed && exit /b 1)
echo.
echo   Python3:
python --version 2>nul || (echo ⚠️  Python3 not installed - code execution may not work)
echo.
echo   g++ (C++):
g++ --version 2>nul | findstr /R ".*" >nul && (echo ✓ Found) || (echo ⚠️  g++ not installed - C++ execution may not work)
echo.

REM Backend Setup
echo 🔧 Setting up Backend...
cd backend
echo   Installing dependencies...
call npm install --legacy-peer-deps >nul 2>&1
echo   Building TypeScript...
call npm run build >nul 2>&1
echo   ✅ Backend ready
cd ..
echo.

REM Frontend Setup
echo 🎨 Setting up Frontend...
cd frontend
echo   Installing dependencies...
call npm install --legacy-peer-deps >nul 2>&1
echo   Building Next.js...
call npm run build >nul 2>&1
echo   ✅ Frontend ready
cd ..
echo.

echo ✨ Setup Complete!
echo.
echo 📝 Quick Start:
echo   Terminal 1 (Backend):   cd backend ^&^& npm run dev
echo   Terminal 2 (Frontend):  cd frontend ^&^& npm run dev
echo   Browser:                http://localhost:3000
echo.
echo 🧪 Test code execution:
echo   Create room - Write Python code - Click 'Run Code'
echo.
pause
