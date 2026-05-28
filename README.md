# CollabCode - Real-time Collaborative Code Editor

A high-performance, professional-grade collaborative code editor built with Next.js, Yjs, and Socket.IO. Features real-time multi-user editing, AI assistance, and an integrated code execution engine.

![CollabCode Hero](https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2000)

## 🚀 Key Features

- **Real-time Collaboration**: Multi-user editing with zero conflicts powered by Yjs CRDTs.
- **AI Pair Programmer**: Context-aware AI assistant that can explain, refactor, and review code.
- **Integrated Execution**: Run Python, JavaScript, and more directly in the browser with real terminal output.
- **Premium UI**: Modern "Apple-grade" aesthetic with glassmorphism, dark mode, and smooth animations.
- **Presence Tracking**: Live cursor decorations and user awareness.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Monaco Editor, Lucide Icons.
- **Backend**: Node.js (Express), Socket.IO, Yjs.
- **Execution**: Local runtime bridge (Python/Node.js).
- **Database**: Prisma with SQLite (Room management).

## 🏁 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/CollabEditor.git
cd CollabEditor
```

### 2. Setup Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```
*Backend will run on `http://localhost:3001`*

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend will run on `http://localhost:3000`*

## 💡 Usage

1. Open `http://localhost:3000` in your browser.
2. Click **"Start Coding Now"** to create a random room or use the **Dashboard** to join a specific one.
3. Share the URL with a friend to test the real-time sync.
4. Write some Python code like `print("Hello World")` and hit the **"Run Code"** button.

## 📝 Configuration

Create a `.env` file in the `backend` directory:
```env
PORT=3001
CLIENT_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
# ANTHROPIC_API_KEY=your_key_here
```

## 🚀 Production Start

Build both apps, then start them with the production scripts:

```bash
npm --prefix backend run build
npm --prefix frontend run build
npm --prefix backend run start:prod
npm --prefix frontend run start:prod
```

For PM2/systemd, see `deploy/pm2/ecosystem.config.cjs` and `deploy/systemd/`.

## 📄 License

MIT
