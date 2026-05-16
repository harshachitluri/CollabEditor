# 🎬 CollabCode - Interview Demo Guide

## Pre-Demo Checklist (Do This First!)
- [ ] Run `SETUP.bat` or `SETUP.sh` to ensure everything is built
- [ ] Start Backend: `cd backend && npm run dev`
- [ ] Start Frontend: `cd frontend && npm run dev` (in another terminal)
- [ ] Verify both running: Backend on `http://localhost:3001/health` → `{status: "ok"}`
- [ ] Open `http://localhost:3000` in browser

---

## 🎯 Demo Scenarios

### **Scenario 1: Single User - Real-Time Code Execution** (2 min)
1. Click "Start Coding Now"
2. Write Python code:
   ```python
   import time
   print("Hello from CollabCode!")
   for i in range(3):
       print(f"Count: {i+1}")
       time.sleep(0.5)
   ```
3. Click "Run Code" button
4. Show output in real-time on the right panel
5. **Explain**: Code runs on backend via Node.js child_process, not in browser

### **Scenario 2: Real-Time Collaboration** (2 min)
1. Open room URL in a new tab (same URL in two browser windows)
2. **Tab 1**: Type some code
3. **Tab 2**: Watch it appear instantly (real-time sync)
4. **Tab 2**: Modify the code
5. **Tab 1**: See changes immediately
6. **Explain**: Uses Yjs CRDT for conflict-free editing + WebSocket sync via Socket.IO

### **Scenario 3: Multi-Language Support** (2 min)
1. Switch language dropdown to "Python" → run code
2. Switch to "JavaScript":
   ```javascript
   console.log("Running JavaScript!");
   const arr = [1, 2, 3, 4, 5];
   console.log("Sum:", arr.reduce((a, b) => a + b, 0));
   ```
   Click Run
3. Switch to "C++":
   ```cpp
   #include <iostream>
   using namespace std;
   
   int main() {
       cout << "Hello from C++!" << endl;
       for(int i = 1; i <= 5; i++) {
           cout << i << " ";
       }
       cout << endl;
       return 0;
   }
   ```
   Click Run
4. **Explain**: Backend detects language, spawns appropriate runtime (python3, node, g++)

### **Scenario 4: Dashboard & Room Management** (1 min)
1. Go to Dashboard link
2. Show "Create Room" feature - generates unique room IDs
3. Show "Recent Rooms" - stored in SQLite via Prisma
4. Click to join an existing room

---

## 🏗️ Architecture to Explain

**When asked "How does this work?"**

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Next.js + React + Monaco Editor)                 │
│ - Real-time UI updates via Socket.IO events               │
│ - Code editor with syntax highlighting                    │
└────────────────────────┬────────────────────────────────────┘
                         │ WebSocket (Socket.IO)
                         │ HTTP (for code execution)
┌────────────────────────▼────────────────────────────────────┐
│ BACKEND (Express + Node.js)                                │
├─────────────────────────────────────────────────────────────┤
│ • /api/run → Executes code (spawn child_process)          │
│ • /api/auth → JWT authentication                          │
│ • /api/rooms → Room CRUD operations (Prisma + SQLite)     │
│ • Socket.IO events → Broadcast code changes (Yjs)         │
│ • Yjs WebSocket → Conflict-free document sync             │
└────────────────────────────────────────────────────────────┘
       │
       └─→ SQLite Database (dev.db)
       └─→ System Executors (python3, node, g++)
```

---

## 💡 Key Talking Points

1. **Real-Time Sync (Yjs)**
   - CRDT (Conflict-free Replicated Data Type) algorithm
   - No merge conflicts even with concurrent edits
   - Offline-first support

2. **Code Execution**
   - Actual code runs on server (not eval/sandboxed)
   - Supports Python, JavaScript, C++
   - Real terminal output captured

3. **Authentication**
   - JWT tokens for session management
   - bcryptjs for password hashing
   - Role-based access control ready

4. **Scalability**
   - Socket.IO allows horizontal scaling
   - Prisma for easy database migrations
   - Modular architecture (separate routes)

---

## 🐛 Troubleshooting During Demo

| Issue | Solution |
|-------|----------|
| Code doesn't run | Check Python3/Node.js/g++ installed: `python3 --version` |
| WebSocket connection fails | Check backend running: `curl http://localhost:3001/health` |
| Sync doesn't work between tabs | Verify Socket.IO connection in browser console |
| UI looks broken | Try hard refresh: `Ctrl+Shift+R` |
| Database error | Delete `backend/prisma/dev.db` and re-run `npx prisma migrate dev` |

---

## ⏱️ Demo Timeline

- **Setup**: 5 min (just run SETUP.bat + start both servers)
- **Demo**: 10 min (all 4 scenarios above)
- **Q&A**: 5 min (tech questions)

**Total: 20 minutes** - Perfect for interview slot!

---

## 📊 Metrics to Mention

- **Real-time latency**: <100ms sync (WebSocket)
- **Code execution**: <5 second timeout (security)
- **Concurrent users**: Unlimited (stateless backend)
- **Database**: SQLite locally, can scale to PostgreSQL
- **Lines of code**: ~2000 (compact, clean)

---

## 🎓 Interview Questions You Might Get

### "Why Yjs for collaboration?"
> Yjs provides CRDTs that handle concurrent edits without conflicts. Unlike OT (Operational Transformation), it's simpler to implement and works offline-first.

### "How do you handle code execution securely?"
> We spawn child processes with 5-second timeout and file cleanup. For production, we'd add sandboxing (containers/VMs), but for now it's demonstration-grade.

### "What if two users edit the same line?"
> Yjs merges edits automatically. If user A adds text and user B deletes text on same line, Yjs resolves it deterministically based on unique client IDs.

### "Why Socket.IO over raw WebSockets?"
> Socket.IO handles reconnection, fallbacks (polling if WebSocket fails), and broadcasting to multiple clients easily. Great for this use case.

### "How would you deploy this?"
> Frontend on Vercel/Netlify, Backend on Heroku/Railway/AWS, Database on PostgreSQL/Render. Use GitHub Actions for CI/CD.

---

## ✅ Success Criteria

By end of demo, you should have shown:
- ✅ Real-time collaborative editing working
- ✅ Code execution producing real output
- ✅ Multiple users syncing (open 2 tabs)
- ✅ UI is polished and responsive
- ✅ Database storing rooms persistently

Good luck with your interviews! 🚀
