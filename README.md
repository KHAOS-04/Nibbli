# ✨ Nibbli
### A Cozy Real-Time Collaborative Task Board

> Final project for **Parallel and Distributed Computing**  
> Built with React · Vite · TailwindCSS · Node.js · Express · Socket.IO

---

## 📖 Project Overview

Nibbli is a real-time collaborative productivity web app for small teams. Team members can join workspace rooms, manage a shared Kanban board, and see each other's actions instantly — all without any accounts, databases, or cloud services.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 Workspace Rooms | Three rooms: Thesis Team, Finals Project, Study Group |
| 📋 Kanban Board | Shared To Do / Doing / Done columns |
| ⚡ Real-Time Sync | All board changes broadcast instantly to every connected user |
| 👥 Online Users | See who's in the room with live green indicator |
| 📢 Activity Feed | Live log of every action ("Kia created task…") |
| ✏️ Editing Indicator | Shows when a teammate is about to update a task |
| 🎨 Cozy Pastel UI | Soft purples, pinks, yellows, blues — calming and modern |

---

## 🏗️ Distributed Architecture Concepts

This project demonstrates four core distributed systems concepts:

### 1. Client-Server Architecture
Multiple browser clients connect to a single Node.js server. The server is the authoritative source of truth for all board state. Clients request changes; the server validates and persists them.

### 2. Event-Driven Communication
All real-time updates use Socket.IO events rather than polling. When Alice moves a task, the server emits a `task:moved` event to every client in the room — no one needs to ask "has anything changed?"

### 3. Real-Time Synchronization
When a user joins a room they receive a full `room:state` snapshot. From that point every event (`task:created`, `task:moved`, `task:deleted`, `activity:new`) keeps all clients in sync without full page reloads.

### 4. Concurrent Multi-User Interaction
Multiple users can create, move, and delete tasks simultaneously. The server processes events sequentially (Node.js event loop), so concurrent operations are naturally serialized — no race conditions in the in-memory store.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | Node.js, Express |
| Real-Time | Socket.IO (WebSocket) |
| Storage | In-Memory (plain JS objects) |
| Styling | TailwindCSS with custom pastel palette |

---

## 📁 Project Structure

```
nibbli/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express + Socket.IO entry point
│   │   ├── store.js           # In-memory data store (our "database")
│   │   ├── socketHandlers.js  # All Socket.IO event handlers
│   │   └── uuid.js            # Simple UUID generator (no extra dep)
│   ├── package.json
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx           # React entry point
│   │   ├── App.jsx            # Root component
│   │   ├── index.css          # Tailwind + global styles
│   │   ├── context/
│   │   │   └── SocketContext.jsx   # Single shared socket connection
│   │   ├── hooks/
│   │   │   └── useNibbli.js        # All board state + actions
│   │   └── components/
│   │       ├── JoinScreen.jsx       # Name entry screen
│   │       ├── Workspace.jsx        # Main layout
│   │       ├── Sidebar.jsx          # Rooms + online users
│   │       ├── KanbanBoard.jsx      # Three-column board
│   │       ├── KanbanColumn.jsx     # Single column + add-task
│   │       ├── TaskCard.jsx         # Individual task card
│   │       ├── ActivityFeed.jsx     # Right panel live feed
│   │       ├── RoomEmptyState.jsx   # Shown before room is selected
│   │       └── ConnectionBadge.jsx  # Live/offline indicator
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## 💻 VS Code Local Setup Guide

### Prerequisites

Make sure you have these installed:

- **Node.js** v18 or higher → https://nodejs.org  
  Check: `node -v` in terminal
- **npm** (comes with Node.js)  
  Check: `npm -v`
- **VS Code** → https://code.visualstudio.com

### Step 1 — Open project in VS Code

```bash
# After cloning or unzipping:
code nibbli
```

Or: File → Open Folder → select the `nibbli` folder.

---

## 📦 Installation

You need **two terminals** open in VS Code (use the `+` button in the terminal panel).

### Terminal 1 — Backend

```bash
cd backend
npm install
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
```

---

## ▶️ How to Run

### Terminal 1 — Start the Backend

```bash
cd backend
npm run dev
```

You should see:
```
✨ Nibbli backend running → http://localhost:3001
```

> **Note:** `npm run dev` uses nodemon which auto-restarts on file changes.  
> If you don't have nodemon, use `npm start` instead.

### Terminal 2 — Start the Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Open the App

Open your browser and go to: **http://localhost:5173**

---

## 👥 How to Test Multi-User Functionality

To simulate multiple team members working together:

1. Open **3 different browser windows** (or use different browsers)
2. Go to `http://localhost:5173` in each
3. Enter different names: **Kia**, **Kaye**, **AJ**
4. All three join the same workspace room (e.g., "Finals Project")

### What to try:
- **Kia** creates a task → Kaye and AJ see it appear instantly
- **Kaye** moves the task to "Doing" → all three boards update
- **AJ** deletes a task → it disappears for everyone
- Watch the **Activity Feed** on the right update in real time
- Watch **Online Users** in the sidebar — shows who's active
- Close a browser tab → user disappears from the online list

---

## 🔌 Socket.IO Event Reference

| Direction | Event | Payload | Description |
|---|---|---|---|
| Client → Server | `user:join` | `{ name }` | User sets their name |
| Client → Server | `room:join` | `{ roomId }` | User enters a workspace room |
| Client → Server | `task:create` | `{ roomId, title }` | Create new task |
| Client → Server | `task:move` | `{ roomId, taskId, newStatus }` | Move task between columns |
| Client → Server | `task:delete` | `{ roomId, taskId }` | Delete a task |
| Client → Server | `task:editing` | `{ roomId, taskId }` | Signal editing started |
| Client → Server | `task:editingStop` | `{ roomId, taskId }` | Signal editing stopped |
| Server → Client | `user:joined` | `{ user, rooms }` | Confirms join + sends room list |
| Server → Client | `room:state` | `{ tasks, activities, users }` | Full room snapshot |
| Server → Client | `users:update` | `[users]` | Updated online user list |
| Server → Client | `task:created` | task object | New task to add |
| Server → Client | `task:moved` | `{ taskId, newStatus }` | Task column change |
| Server → Client | `task:deleted` | `{ taskId }` | Task to remove |
| Server → Client | `activity:new` | activity entry | New feed item |
| Server → Client | `task:editingUpdate` | `{ taskId, userName }` | Who's editing what |

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Make sure the backend is running in Terminal 1
- Check you see `✨ Nibbli backend running → http://localhost:3001`
- Check nothing else is using port 3001: `netstat -ano | findstr :3001` (Windows)

### "Port already in use"
```bash
# Windows: find and kill the process
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3001 | xargs kill
```

### "npm: command not found"
- Install Node.js from https://nodejs.org (LTS version)
- Restart VS Code after installing

### Tasks not updating in real time
- Make sure all browser windows are on `http://localhost:5173`
- Open browser DevTools → Console — look for connection errors
- Confirm backend terminal shows `[+] Kia connected`

### "Module not found" errors
```bash
# Delete node_modules and reinstall
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

---

## 🐙 GitHub Setup Guide

### 1. Create a new repository on GitHub

- Go to https://github.com → New repository
- Name it `nibbli`
- Leave it empty (no README)

### 2. Push your code

```bash
cd nibbli
git init
git add .
git commit -m "✨ Initial commit — Nibbli distributed task board"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nibbli.git
git push -u origin main
```

### 3. Verify

Open your GitHub repo — you should see all files uploaded cleanly.  
The `node_modules/` folders are excluded by `.gitignore`.

---

## 🌐 Free Hosting Guide

> You can deploy Nibbli for free so teammates can access it from anywhere.

### Backend → Render.com (free tier)

1. Go to https://render.com and sign up
2. New → Web Service → Connect your GitHub repo
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
4. Add Environment Variable:
   - `PORT` = `3001`
5. Deploy — Render gives you a URL like `https://nibbli-backend.onrender.com`

> ⚠️ Free Render services sleep after 15 min of inactivity. First request may take ~30s to wake up.

### Frontend → Vercel.com (free tier)

1. Go to https://vercel.com and sign up
2. Import your GitHub repo
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Vite
4. Add Environment Variable:
   - `VITE_BACKEND_URL` = your Render backend URL (e.g., `https://nibbli-backend.onrender.com`)
5. Deploy — Vercel gives you a URL like `https://nibbli.vercel.app`

### Socket.IO Deployment Notes

Socket.IO works fine on both Render and Vercel when:
- `VITE_BACKEND_URL` points to your Render URL
- Your server's CORS `origin` includes your Vercel frontend URL

Update `server.js` CORS before deploying:
```js
origin: [
  'http://localhost:5173',
  'https://your-nibbli.vercel.app'  // add this
],
```

---

## 👩‍💻 Team

Built with 💜 for Parallel and Distributed Computing  
Kia · Kaye · AJ

---

## 📄 License

MIT — free to use for academic purposes.
