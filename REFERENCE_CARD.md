# 🎯 CollabCode - Interview Reference Card

## Pre-Demo Checklist (5 min before demo)

```bash
# Terminal 1 - Start Backend
cd CollabEditor/backend
npm run dev
# Verify: http://localhost:3001/health returns {"status":"ok"}

# Terminal 2 - Start Frontend  
cd CollabEditor/frontend
npm run dev
# Verify: http://localhost:3000 loads successfully
```

**System ready when:**
- ✅ Backend: "🚀 Server running on http://localhost:3001"
- ✅ Frontend: "ready - started server on 0.0.0.0:3000"
- ✅ Browser shows CollabCode home page

---

## Demo Script (10 minutes)

### **Min 0-1: Show Home Page**
- "This is CollabCode, a real-time collaborative code editor"
- Highlight: Features, Tech stack badges
- Click "Start Coding Now" button

### **Min 1-3: Execute Code**
- In the editor, paste:
```python
# Fibonacci Sequence
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        print(a, end=' ')
        a, b = b, a+b

fib(10)
```
- Click "Run Code"
- Show output on right panel
- **Explain**: "Code runs on backend via Node.js child_process, not JavaScript eval"

### **Min 3-5: Multi-Language Support**
- Change language dropdown to "JavaScript"
- Paste:
```javascript
const nums = [1,2,3,4,5];
console.log("Sum:", nums.reduce((a,b) => a+b));
```
- Click Run → Show output
- Change to "C++" → paste simple program → Run

### **Min 5-7: Real-Time Collaboration**
- **Open room URL in second tab**
- In Tab 1: Type or paste code
- In Tab 2: **Watch it appear instantly**
- In Tab 2: Modify the code (add a line)
- In Tab 1: **See changes sync immediately**
- **Explain**: "Uses Yjs CRDT for zero-conflict merging"

### **Min 7-9: Architecture Explanation**
- Draw or explain:
```
Frontend (Next.js) ←WebSocket→ Backend (Express)
     ↓                              ↓
  Monaco Editor         Python/Node.js/g++
     ↓                              ↓
  Tailwind UI           SQLite Database
```

### **Min 9-10: Closing**
- Show Dashboard tab (mentions room history)
- Summarize: "Real-time collab + Code execution + Modern UI = interview-ready project"

---

## Code Snippets Ready to Paste

**Python - Simple**
```python
print("Hello from CollabCode!")
for i in range(1, 6):
    print(f"{i} squared = {i**2}")
```

**Python - Interesting**
```python
# Factorial
def factorial(n):
    return 1 if n <= 1 else n * factorial(n-1)

print(f"5! = {factorial(5)}")
print(f"10! = {factorial(10)}")
```

**JavaScript - Simple**
```javascript
const text = "CollabCode";
console.log(text.split('').reverse().join(''));
```

**JavaScript - Interesting**
```javascript
// Prime numbers up to 20
for(let i=2; i<=20; i++){
  let isPrime = true;
  for(let j=2; j<i; j++) if(i%j===0) isPrime=false;
  if(isPrime) console.log(i);
}
```

**C++ - Simple**
```cpp
#include <iostream>
using namespace std;

int main() {
    for(int i=1; i<=5; i++)
        cout << i << " ";
    cout << endl;
    return 0;
}
```

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Run Code | Button click (or Ctrl+Shift+Enter) |
| Format Code | Ctrl+Shift+P → "Format Document" |
| Maximize Editor | Double-click on editor area |
| Reload Page | F5 or Ctrl+R |
| Developer Console | F12 |

---

## Answering Common Questions

**Q: "Is the code actually running?"**
A: "Yes, 100% real execution. Each code snippet spawns a separate process on the backend. We capture stdout/stderr and send it back in real-time."

**Q: "What's the 5-second timeout?"**
A: "Safety measure. Infinite loops would hang the server otherwise. Perfect for live demos."

**Q: "Can multiple people edit the same code?"**
A: "Yes, that's the whole point! Open 2 browser windows with the same URL and edit simultaneously. Yjs merges edits automatically."

**Q: "Why not eval() in the browser?"**
A: "Security + Capability. We support C++/Python which need server-side execution. Also, browser eval can't access system resources safely."

**Q: "How do you handle 100 concurrent users?"**
A: "Socket.IO broadcasts to all connected clients. Each user's edits get sent to server, merged by Yjs, broadcasted to others. Stateless backend scales horizontally."

---

## Troubleshooting During Demo

| Issue | Quick Fix | Why |
|-------|----------|-----|
| Button doesn't respond | Refresh page (F5) | Frontend may have WebSocket disconnect |
| Code output empty | Check code syntax | Invalid Python/JS/C++ won't produce output |
| 2nd tab doesn't sync | Open dev console (F12) | Check WebSocket connection in Network tab |
| UI looks broken | Ctrl+Shift+R (hard refresh) | CSS cache issue |
| Backend not responding | Check Terminal 1 running | Process may have crashed |

---

## Performance During Demo

- Sync latency: <100ms (aim to show between tabs)
- Code execution: <2 seconds (for simple programs)
- Page load: <3 seconds
- If code takes >5s: "Server killed it (timeout protection)"

---

## Things NOT to Demo (Avoid These)

❌ Don't try to run infinite loops
❌ Don't try massive file uploads
❌ Don't try heavy AI features (API keys not configured)
❌ Don't try login/register (auth fully wired but not critical for demo)
❌ Don't try to execute system commands

---

## Things TO Emphasize

✅ "Real-time sync" — show 2 tabs
✅ "Actual code execution" — run multiple languages
✅ "Zero conflicts" — explain Yjs briefly
✅ "Production ready" — show clean architecture
✅ "Scalable" — explain horizontal scaling potential

---

## Post-Demo (If Interviewer Asks)

**"Can you walk me through the code?"**
- Open `frontend/app/room/[slug]/page.tsx` (main editor)
- Scroll to see useSocket hook usage
- Explain WebSocket event listeners
- Show backend `src/routes/run.ts` (code execution)

**"What would you improve?"**
- Add AI code review (Anthropic API ready)
- Implement code sandboxing (containerization)
- Add user permissions (partially done)
- Persist undo/redo history

**"How did you handle X?"**
- Use git blame: `git blame -L <line> <file>`
- Shows commit message for context

---

## Exit Strategy (If Demo Breaks)

If something fails badly:
1. Say: "Backend may have cached old process, let me restart it"
2. Kill backend: Ctrl+C in Terminal 1
3. Restart: `npm run dev`
4. Give 30 seconds to boot
5. Continue with another feature

---

**Remember: You built this! You know it better than anyone. Confidence is key! 🚀**
