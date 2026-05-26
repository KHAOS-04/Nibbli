# 📘 Nibbli — Project Briefer
### Your Complete Guide to Understanding, Explaining, and Defending the Project
---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [How the Entire System Works](#2-how-the-entire-system-works)
3. [Complete File & Folder Breakdown](#3-complete-file--folder-breakdown)
4. [Frontend Explanation](#4-frontend-explanation)
5. [Backend Explanation](#5-backend-explanation)
6. [Socket.IO & Real-Time System](#6-socketio--real-time-system)
7. [Distributed Architecture Concepts](#7-distributed-architecture-concepts)
8. [User Flow Walkthroughs](#8-user-flow-walkthroughs)
9. [Common Professor Questions & Answers](#9-common-professor-questions--answers)
10. [Common Beginner Confusions](#10-common-beginner-confusions)
11. [How Everything Connects Together](#11-how-everything-connects-together)

---

# 1. Project Overview

## What is Nibbli?

Nibbli is a **real-time collaborative productivity web application** designed for small teams. Think of it like a lightweight combination of Trello (task boards), Discord (chat + rooms), and Notion (workspace organization) — but in a cozy pastel aesthetic built by us.

In plain words: **multiple people can open Nibbli in their browsers at the same time, work on the same task board, chat with each other, and everything updates instantly for everyone — no page refresh needed.**

## What Problem Does It Solve?

When a small team (like Kia, Kaye, and AJ) works on a project together, they need to:
- See what tasks exist and who's doing what
- Move tasks as they progress (To Do → Doing → Done)
- Communicate in real time without switching apps
- Know who else is currently online and active
- Feel a sense of shared presence — like being in the same room

Nibbli solves all of this in one place, locally, with no accounts or paid services.

## Why Does Nibbli Qualify as a Distributed System?

A **distributed system** is one where multiple separate computers (or browser tabs) communicate and coordinate with each other through a network to achieve a shared goal.

Nibbli qualifies because:

- **Multiple clients** (browsers) connect to a **single server** over a network
- **All clients share the same state** — the same tasks, messages, and user list
- **Changes made by one client are instantly propagated to all others** — no one is working in isolation
- **The server coordinates everything** — it is the single source of truth
- **Clients can join and leave at any time** without breaking the system for others

This is textbook Client-Server distributed architecture, enhanced with Event-Driven communication.

## Technologies Used

| Technology | Role |
|---|---|
| **React 18** | Builds the user interface (what you see in the browser) |
| **Vite 5** | Development tool that runs the React app locally |
| **TailwindCSS 3** | Styles the UI with utility classes (colors, spacing, layout) |
| **@dnd-kit** | Powers drag-and-drop on the Kanban board |
| **Node.js** | Runs the backend server (JavaScript on the server) |
| **Express.js** | Handles the HTTP server setup |
| **Socket.IO 4** | Powers all real-time communication between clients and server |
| **In-Memory Storage** | Plain JavaScript objects store all data while the server runs |

## How Users Interact With It

1. Open `http://localhost:5173` in a browser
2. Enter your name on the join screen
3. Pick a workspace room (Thesis Team, Finals Project, Study Group)
4. The **Chat tab** opens — send messages to teammates instantly
5. Switch to the **Board tab** — create, move, and delete tasks on the Kanban board
6. Move your cursor around the board — teammates see it live in real time
7. The left sidebar shows who's online in your room
8. The right panel shows the live activity feed (who did what, when)
9. Everything updates in real time for everyone in the same room

---

# 2. How the Entire System Works

## The Big Picture

Think of Nibbli like a **group chat in a coffee shop**. The server is the coffee shop itself — it holds the space. Each browser tab is a person sitting at a table. When one person says something, the coffee shop broadcasts it to everyone at the same table.

```
Browser (Kia)  ──┐
Browser (Kaye) ──┼──► Node.js Server ──► broadcasts back to all browsers
Browser (AJ)   ──┘
```

## Step-by-Step: What Happens When You Use Nibbli

### When the app first loads

1. React renders the **JoinScreen** — a simple name entry form
2. Nothing connects to the server yet — the socket exists but is waiting

### When you enter your name

1. The frontend sends a `user:join` event to the server with your name
2. The server creates your user profile (name + assigned pastel color) and stores it in memory
3. The server sends back `user:joined` with your profile and the list of rooms
4. The frontend stores this and shows the main Workspace screen

### When you join a room

1. The frontend sends a `room:join` event with the room ID
2. The server adds you to that room's Socket.IO "group"
3. The server sends back the full room state: all tasks, all messages, all activity entries, all online users
4. The frontend displays everything immediately
5. Everyone already in the room gets a `users:update` event so they see you appear in the online list

### When you create a task

1. You type a title and press Add
2. The frontend emits `task:create` to the server
3. The server creates the task object, saves it in memory, logs it to the activity feed
4. The server broadcasts `task:created` to **everyone in the room** (including you)
5. Every browser adds the new task card to their board at the same moment

### When you send a chat message

1. You type and press Enter (or click Send)
2. The frontend emits `chat:send` with the message text
3. The server saves the message and broadcasts `chat:message` to everyone in the room
4. Every browser adds the new bubble to their chat panel

### When you move your cursor on the board

1. Your cursor position is captured and emitted as `cursor:move` every ~40ms
2. The server relays this to everyone else in the room
3. Other users see your cursor — rendered as a custom SVG with your name and color — glide smoothly across their screens
4. When you drag a card, your cursor switches to `Grabbing.svg` for everyone
5. When you leave the board, your cursor disappears from others' screens

### When you stop using the app (close the tab)

1. Socket.IO detects the disconnection automatically
2. The server removes you from the online users list and removes your cursor from the board
3. Everyone in your room gets a `users:update` event — your avatar disappears from their sidebar
4. An activity entry is logged: "Kia left the room"

---

# 3. Complete File & Folder Breakdown

## Project Structure at a Glance

```
nibbli/
├── backend/
│   ├── src/
│   │   ├── server.js           ← starts the server
│   │   ├── socketHandlers.js   ← all real-time event logic (including cursors)
│   │   ├── store.js            ← in-memory database
│   │   └── uuid.js             ← generates unique IDs
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── cursors/            ← SVG cursor assets (served as static files)
│   │   │   ├── Hand.svg        ← default cursor
│   │   │   ├── Click.svg       ← left-click + hover state
│   │   │   ├── Grabbing.svg    ← active drag state
│   │   │   └── Hehe.svg        ← right-click easter egg
│   │   └── sounds/
│   │       └── faaah.mp3       ← easter egg sound effect
│   │
│   └── src/
│       ├── main.jsx                    ← React entry point
│       ├── App.jsx                     ← root component
│       ├── index.css                   ← global styles + animations
│       ├── assets/
│       │   ├── Nibbli.png              ← app logo (join screen)
│       │   └── Seedling.png            ← sidebar logo
│       ├── context/
│       │   └── SocketContext.jsx       ← shared socket connection
│       ├── hooks/
│       │   ├── useNibbli.js            ← all board + chat state + actions
│       │   └── useCursor.js            ← live cursor presence system
│       └── components/
│           ├── JoinScreen.jsx          ← name entry screen
│           ├── Workspace.jsx           ← main layout
│           ├── Sidebar.jsx             ← rooms + online users
│           ├── ChatPanel.jsx           ← real-time chat
│           ├── KanbanBoard.jsx         ← drag-and-drop board + cursor overlay host
│           ├── KanbanColumn.jsx        ← single column (To Do / Doing / Done)
│           ├── TaskCard.jsx            ← individual task card
│           ├── ActivityFeed.jsx        ← right panel live log
│           ├── CursorOverlay.jsx       ← renders all remote user cursors
│           ├── LocalCursor.jsx         ← renders YOUR OWN cursor overlay
│           ├── RemoteCursor.jsx        ← single remote user's cursor with lerp
│           ├── RoomEmptyState.jsx      ← shown before picking a room
│           └── ConnectionBadge.jsx     ← Live / Reconnecting pill
│
├── README.md
└── BRIEFER.md  ← you are here
```

---

## Backend Files

---

### `backend/src/server.js`

**Purpose:** The entry point of the entire backend. It starts the server and makes everything else run.

**What it does:**
- Creates an Express application (the HTTP server)
- Attaches Socket.IO to that HTTP server so real-time connections work
- Configures CORS so the frontend at `localhost:5173` is allowed to connect
- Adds one simple HTTP route (`GET /health`) to confirm the server is running
- Listens on port `3001` for all incoming connections
- When a new browser connects via Socket.IO, it calls `registerHandlers` to set up that user's event listeners

**Connects to:** `socketHandlers.js` — called every time a new user connects

**If this file is missing:** Nothing works. The backend doesn't exist without it.

**Key line to understand:**
```javascript
io.on('connection', (socket) => {
  registerHandlers(io, socket);
});
```
This means: "Every time a browser connects, set up all the event listeners for that browser."

---

### `backend/src/store.js`

**Purpose:** The in-memory "database." All of Nibbli's data lives here as plain JavaScript objects.

**What it stores:**
- `rooms` — an object containing tasks, activities, and messages for each workspace room
- `onlineUsers` — an object mapping each socket ID to a user's name, color, and current room
- `editingUsers` — tracks which user is currently editing which task
- `typingUsers` — tracks who is currently typing in each room's chat

**What it does:**
- `addUser` / `removeUser` — manage who's online
- `createTask` / `moveTask` / `deleteTask` — manage Kanban tasks
- `addMessage` / `getMessages` — manage chat history
- `startTyping` / `stopTyping` / `getTypingUsers` — manage typing indicators
- `addActivity` / `getActivities` — manage the activity feed log

**Important:** Cursor positions are NOT stored here. The server is a pure relay for cursor events — it receives a position and immediately forwards it without saving. Cursor state is ephemeral and doesn't need to persist.

**If this file is missing:** All data operations break. No tasks, no users, no messages.

Because storage is in-memory, **all data is lost when the server restarts.** This is intentional for a simple academic project.

---

### `backend/src/socketHandlers.js`

**Purpose:** The brain of the real-time system. Every Socket.IO event — every action a user takes — is handled here. This now includes all cursor presence events.

**What it handles:**

| Event received | What it does |
|---|---|
| `user:join` | Creates the user in store, sends back rooms list |
| `room:join` | Moves user to a room, sends full room state, removes old cursor from previous room |
| `task:create` | Creates task in store, broadcasts to room |
| `task:move` | Updates task status, broadcasts to room |
| `task:delete` | Removes task, broadcasts to room |
| `task:editing` | Marks a task as being edited, tells others |
| `task:editingStop` | Clears editing state |
| `chat:send` | Saves message, broadcasts to room |
| `chat:typing` | Starts typing indicator, tells others |
| `chat:stopTyping` | Stops typing indicator, tells others |
| `cursor:move` | Relays cursor position + state to everyone else in the room |
| `cursor:state` | Relays a state-only change (no movement) to everyone else |
| `cursor:leave` | Tells the room to remove this user's cursor |
| `disconnect` | Removes user, removes cursor, updates everyone's online list |

**Key cursor relay pattern:**
```javascript
socket.on('cursor:move', ({ roomId, x, y, state }) => {
  const user = store.getUser(socket.id);
  // socket.to = everyone in room EXCEPT the sender
  socket.to(roomId).emit('cursor:move', {
    userId: socket.id, x, y, state,
    userName: user.name, color: user.color,
  });
});
```
The sender is excluded because they render their own cursor locally — no need to receive their own position back.

**If this file is missing:** No real-time events work at all.

---

### `backend/src/uuid.js`

**Purpose:** A tiny helper that generates unique IDs for tasks, messages, and activity entries.

**What it does:** Exports a single `v4()` function that returns a random string like `"a3f2b1c4-..."`. Every task, message, and activity entry gets one of these as its `id` to prevent duplicates.

**Connects to:** `store.js`

**If this file is missing:** store.js crashes on startup. Nothing gets a unique ID.

---

## Frontend Files

---

### `frontend/src/main.jsx`

**Purpose:** The absolute starting point of the React application.

**What it does:** Imports `App`, imports `index.css`, and mounts the entire React app into `<div id="root">` in `index.html`.

**If this file is missing:** Blank white screen.

---

### `frontend/src/App.jsx`

**Purpose:** The root of the entire React component tree.

**What it does:**
- Wraps the whole app in `<SocketProvider>` so every component can access the socket
- Uses `useNibbli` hook to get all state and actions
- Shows `JoinScreen` before joining, `Workspace` after joining
- Passes all data and action functions down to `Workspace` as props

**If this file is missing:** The entire app breaks.

---

### `frontend/src/index.css`

**Purpose:** Global stylesheet for the entire app.

**What it does:**
- Loads Tailwind's base styles, components, and utilities
- Defines `scrollbar-thin` for chat and activity panels
- Defines `typingBounce` — animation for chat typing indicator dots
- Defines `cursorHeheBounce` — bounce animation for the Hehe cursor state (new)

**Connects to:** Imported in `main.jsx`, affects every component

---

### `frontend/src/context/SocketContext.jsx`

**Purpose:** Creates ONE shared Socket.IO connection that the entire app uses.

**What it does:**
- Opens one Socket.IO connection to `http://localhost:3001` when the app loads
- Tracks `connected: true/false`
- Wraps the whole app so any hook can call `useSocket()` to access the same connection

**Why one connection?** If each component opened its own, you'd have 10+ connections per tab. One connection handles everything — board events, chat events, and cursor events all share it.

**Connects to:** `App.jsx`, `useNibbli.js`, `useCursor.js`, `ConnectionBadge.jsx`

**If this file is missing:** No real-time system works at all.

---

### `frontend/src/hooks/useNibbli.js`

**Purpose:** The brain of the frontend for board and chat. All shared state and actions for tasks and chat live here.

**What state it manages:**

| State variable | What it holds |
|---|---|
| `user` | Your own name, color, and socket ID |
| `rooms` | List of available workspace rooms |
| `currentRoom` | Which room you're currently in |
| `tasks` | All tasks in the current room |
| `activities` | Activity feed entries for the current room |
| `onlineUsers` | List of users currently online in the room |
| `editingMap` | Which tasks are being edited and by who |
| `messages` | All chat messages in the current room |
| `typingUsers` | Names of people currently typing in chat |
| `joined` | Whether you've entered your name yet |

**What actions it provides:**

| Action | What it does |
|---|---|
| `joinApp(name)` | Emits `user:join` to the server |
| `joinRoom(roomId)` | Emits `room:join`, clears stale state |
| `createTask(title)` | Emits `task:create` |
| `moveTask(taskId, status)` | Emits `task:move` |
| `deleteTask(taskId)` | Emits `task:delete` |
| `sendMessage(text)` | Emits `chat:send` |
| `notifyTyping()` | Emits `chat:typing` with 2.5s auto-stop |

**If this file is missing:** No board or chat state, nothing works.

---

### `frontend/src/hooks/useCursor.js`

**Purpose:** The single authoritative hook for the entire live cursor presence system. Deliberately separate from `useNibbli.js` because cursor logic is complex and deserves its own file.

**What it manages:**

| Concern | How it's handled |
|---|---|
| Local cursor state | Tracks four states: `normal`, `click`, `grabbing`, `hehe` |
| State priority | `grabbing > hehe > click/hover > normal` via one `resolveState()` function |
| Throttled emitting | Emits `cursor:move` at most every 40ms (~25fps) |
| Position tracking | Uses `window pointermove` (not board `mousemove`) so drag never freezes it |
| Remote receiving | Listens for `cursor:move` and `cursor:state` from server |
| Smooth interpolation | `requestAnimationFrame` loop lerps remote positions (factor 0.16) |
| Inactivity | Fades and removes cursors after 4+ seconds of no movement |
| Right-click hold | Tracks `mousedown button=2` / `mouseup button=2` — Hehe state persists while held |
| Hover detection | Walks DOM tree checking `getComputedStyle(el).cursor === 'pointer'` for auto-click state |
| Audio | Loads `faaah.mp3`, plays once on initial right-click press |
| Cleanup | Emits `cursor:leave` on unmount (tab switch or room leave) |

**Why `window pointermove`?** When `@dnd-kit` activates a drag, it calls `setPointerCapture`, causing regular `mousemove` events on DOM elements to stop firing. `window pointermove` always fires even during pointer capture, keeping cursor sync alive throughout the entire drag.

**Returns:**
```javascript
{
  localState,       // 'normal' | 'click' | 'grabbing' | 'hehe'
  remoteCursors,    // { [userId]: { x, y, state, userName, color, lastSeen } }
  setDraggingState, // called by KanbanBoard on drag start/end
  INACTIVITY_MS,
}
```

**Connects to:** `SocketContext.jsx` (shared socket), `KanbanBoard.jsx` (consumed here)

---

### `frontend/src/components/JoinScreen.jsx`

**Purpose:** The welcome/entry screen. The first thing every user sees.

**What it does:** Shows the Nibbli logo and a name input. On submit, calls `onJoin(name)` which triggers `joinApp()` in `useNibbli.js`. No passwords, no accounts.

**Connects to:** `App.jsx`, `assets/Nibbli.png`

---

### `frontend/src/components/Workspace.jsx`

**Purpose:** The main application layout after joining.

**What it does:**
- Renders the three-panel layout: Sidebar (left) | Center panel | ActivityFeed (right)
- Manages `activeTab` state: `'chat'` or `'board'`
- Shows `ChatPanel` or `KanbanBoard` based on active tab
- Passes `user` and `currentRoom` down to `KanbanBoard` — required for the cursor system

**Important:** Switching tabs unmounts either `ChatPanel` or `KanbanBoard`. When `KanbanBoard` unmounts, `useCursor` unmounts too and emits `cursor:leave` — your cursor disappears from teammates' boards immediately.

---

### `frontend/src/components/Sidebar.jsx`

**Purpose:** Left panel showing the logo, workspace rooms, online users, and your own profile.

**What it does:**
- Lists all rooms as clickable buttons with active highlight
- Shows all online users in the current room with their colored avatars and a green dot
- Shows your own profile at the bottom with a "● You" label

---

### `frontend/src/components/ChatPanel.jsx`

**Purpose:** The real-time chat interface. Center panel when Chat tab is active.

**What it does:**
- Shows messages as colored pastel bubbles (yours on right in purple, others on left in their color)
- Shows typing indicator with animated bouncing dots
- Auto-scrolls to the latest message
- Input: text field + send button; Enter sends the message

---

### `frontend/src/components/KanbanBoard.jsx`

**Purpose:** The drag-and-drop task board AND the host of the entire cursor presence system.

**What it does:**
- Wraps everything in `DndContext` from `@dnd-kit`
- Creates `boardRef` — a ref on the board `div` used for coordinate normalisation
- Calls `useCursor(currentRoom, user, boardRef)` — activates the cursor system only while this tab is visible
- Renders three `KanbanColumn` components
- Renders `CursorOverlay` — all remote cursors
- Renders `LocalCursor` — your own cursor overlay
- Sets `cursor: 'none'` on the board `div` — hides the native browser cursor entirely inside the board
- `handleDragStart` → calls `setDraggingState(true)` → switches your cursor to `Grabbing.svg` for everyone
- `handleDragEnd` / `handleDragCancel` → calls `setDraggingState(false)` → reverts to normal

**Why `cursor: none`?** Because the native cursor and the SVG overlay would visually overlap. We hide the native one so only the custom SVG cursor is visible. The cursor restores automatically when you leave the board area.

---

### `frontend/src/components/KanbanColumn.jsx`

**Purpose:** A single column on the Kanban board (To Do, Doing, or Done).

**What it does:**
- Acts as a `useDroppable` zone — tasks can be dragged and dropped onto it
- Highlights with a soft color when a dragged card hovers over it
- Renders each task as a `TaskCard`
- Shows "Drop here" text when empty during drag
- Has an "Add task" button that expands into a form

---

### `frontend/src/components/TaskCard.jsx`

**Purpose:** A single draggable task card.

**What it does:**
- Uses `useSortable` from `@dnd-kit` to become draggable
- Shows task title, creator name, and how long ago it was created
- Shows editing indicator if another user is currently editing it
- Has a delete button (✕) on hover — uses `onPointerDown: stopPropagation` to prevent accidental drag starts
- While dragging: semi-transparent with a purple ring outline

---

### `frontend/src/components/CursorOverlay.jsx`

**Purpose:** An absolute-positioned overlay inside the board that renders every remote user's cursor. This is what makes Nibbli feel like a multiplayer workspace.

**What it does:**
- Sits inside the board's `position: relative` wrapper, filling it with `inset: 0`
- Iterates `remoteCursors` and renders one `RemoteCursor` per user
- Passes `boardWidth` and `boardHeight` (from `boardRef`) to `RemoteCursor` for de-normalisation
- `pointer-events: none` — never blocks any board interaction

---

### `frontend/src/components/LocalCursor.jsx`

**Purpose:** Renders YOUR OWN cursor as a custom SVG overlay. Replaces the native browser cursor entirely while you're on the board.

**What it does:**
- Listens to `window pointermove` to track real mouse position relative to the board
- Shows only when the pointer is inside board bounds
- Renders the correct SVG based on `state` prop (`Hand`, `Click`, `Grabbing`, `Hehe`)
- Shows your username pill below the cursor
- Uses `key={state}` on the `<img>` — forces React to remount on every state change for instant swap
- `pointer-events: none`

**Why `window pointermove` here too?** During `@dnd-kit` drag, board `mousemove` stops firing. `window pointermove` keeps the overlay position in sync even while dragging.

---

### `frontend/src/components/RemoteCursor.jsx`

**Purpose:** Renders ONE remote user's cursor with smooth lerp-interpolated movement.

**What it does:**
- De-normalises 0–1 position back to pixel coordinates using `boardWidth` and `boardHeight`
- Uses `key={userId-state}` on `<img>` — forces remount on state change for instant visual swap
- Scales the cursor on state transitions: `click` = 1.18x, `grabbing` = 1.08x, `hehe` = 1.28x
- Fades opacity based on `lastSeen` timestamp for inactive cursors
- `pointer-events: none`

**Why is movement smooth?** `useCursor.js` runs a `requestAnimationFrame` loop that lerps `currentPos` toward `targetPos`. The `x`/`y` values passed to `RemoteCursor` are already the smoothed interpolated values — not raw received positions.

---

### `frontend/src/components/ActivityFeed.jsx`

**Purpose:** Right panel showing a live log of everything that happened in the room.

**What it does:**
- Shows each activity entry with colored dot, text, and "X minutes ago" timestamp
- Dot colors: purple = created, yellow = moved, red = deleted, green = joined, grey = left
- Newest entries at the top; keeps last 50

---

### `frontend/src/components/ConnectionBadge.jsx`

**Purpose:** Tiny pill showing if you're connected to the server.

**What it shows:** 🟢 "Live" with pulsing dot when connected · 🔴 "Reconnecting…" when dropped.

---

### `frontend/src/components/RoomEmptyState.jsx`

**Purpose:** Placeholder when no room is selected yet. Shows a friendly prompt and lists all rooms as clickable cards.

---

### Configuration Files

**`frontend/vite.config.js`** — Vite plugin + port 5173. Nothing complex.

**`frontend/tailwind.config.js`** — Defines the full `nibbli-*` color palette, custom shadows, and border radii. Every pastel color in the UI comes from here.

**`frontend/postcss.config.js`** — Required for Tailwind. Just enables the plugins. Don't touch it.

**`backend/package.json` & `frontend/package.json`** — Dependency lists. `npm install` reads these.

---

# 4. Frontend Explanation

## How React Works in Nibbli

React builds the UI using **components** — reusable pieces of the interface, each in its own file. Think of components like LEGO bricks assembled by `Workspace`.

**The component tree in Nibbli:**

```
App
├── JoinScreen              (shown before joining)
└── Workspace               (shown after joining)
    ├── Sidebar
    ├── ChatPanel            (shown on Chat tab)
    │   └── MessageBubble    (one per message)
    ├── KanbanBoard          (shown on Board tab)
    │   ├── KanbanColumn (×3: To Do, Doing, Done)
    │   │   └── TaskCard (one per task)
    │   ├── CursorOverlay
    │   │   └── RemoteCursor (one per remote user)
    │   └── LocalCursor      (your own cursor)
    └── ActivityFeed
```

## How State Updates Happen

When the server sends a new message:
```
Server emits 'chat:message'
  → useNibbli.js listener fires
  → setMessages(prev => [...prev, msg])  ← state updates
  → React re-renders ChatPanel           ← new bubble appears
  → useEffect auto-scrolls to bottom
```

When a remote cursor moves:
```
Server emits 'cursor:move' (relayed from another user)
  → useCursor.js listener fires
  → targetPos.current[userId] = { x, y }  ← ref updated (no re-render)
  → rAF loop lerps currentPos toward targetPos
  → setRemoteCursors updates with smoothed x/y
  → RemoteCursor re-renders at new position — glides smoothly
```

## How the Tab Toggle Works

`Workspace.jsx` has local `activeTab` state. Switching tabs conditionally renders `<ChatPanel>` or `<KanbanBoard>`. When `KanbanBoard` unmounts, `useCursor` unmounts with it and emits `cursor:leave` — your cursor disappears from teammates' boards immediately.

## How Drag and Drop Works

1. `KanbanBoard` wraps everything in `DndContext`
2. Each `KanbanColumn` is a `useDroppable` zone
3. Each `TaskCard` is `useSortable`
4. `onDragEnd` fires with task ID and destination column
5. If column changed → `onMove(taskId, newStatus)` → emits to server → everyone's board updates
6. Simultaneously → `setDraggingState(false)` → cursor reverts from Grabbing

## How the Cursor System Works (Three Layers)

**Layer 1 — `useCursor.js` (logic):** Tracks state, emits to server, receives from server, lerps remote positions.

**Layer 2 — `LocalCursor.jsx` (what you see for yourself):** Reads `localState`, renders your cursor SVG, follows `window pointermove`. The board has `cursor: none` so only the SVG is visible.

**Layer 3 — `CursorOverlay.jsx` + `RemoteCursor.jsx` (what you see for others):** Reads `remoteCursors`, renders one `RemoteCursor` per teammate with lerped position and current state.

---

# 5. Backend Explanation

## How Express.js Works Here

Express is used minimally — just to create the HTTP server that Socket.IO runs on top of.

The only HTTP endpoint:
```
GET http://localhost:3001/health  →  { "status": "ok", "app": "Nibbli" }
```

**Everything else happens over WebSocket (Socket.IO), not HTTP.**

## How the Server Starts

```javascript
const app    = express();
const server = http.createServer(app);  // HTTP server
const io     = new Server(server);      // Socket.IO attached
server.listen(3001);
```

The browser first makes an HTTP request to port 3001, then upgrades to a WebSocket. After that, all communication is real-time and two-way.

## How Data is Stored

```javascript
const rooms = {
  'room-thesis':  { tasks: [], activities: [], messages: [] },
  'room-finals':  { tasks: [], activities: [], messages: [] },
  'room-study':   { tasks: [], activities: [], messages: [] },
};
const onlineUsers = {};  // who's connected
```

**Cursor data is never stored.** The server relays `cursor:move` events immediately without saving anything. Cursor state is ephemeral.

**Pros:** Simple, no setup, extremely fast.
**Cons:** All data lost on server restart. Acceptable for this academic project.

## How Events Flow Through the Backend

1. `server.js` receives connection → calls `registerHandlers(io, socket)`
2. `socketHandlers.js` sets up listeners for that socket
3. Event arrives → handler reads/writes `store.js` (except cursor events — relayed directly)
4. Handler emits back: `socket.emit` (one user), `io.to(roomId).emit` (whole room), `socket.to(roomId).emit` (room except sender)

---

# 6. Socket.IO & Real-Time System

## What is Socket.IO?

Normal HTTP: you ask, server answers, connection closes. Like sending a letter.

Socket.IO WebSocket: connection stays open permanently. Either side sends at any time. Like a phone call that never hangs up.

**Socket.IO adds:** automatic reconnection, named events, built-in rooms.

## Complete Socket.IO Event Reference

| Direction | Event | Payload | Description |
|---|---|---|---|
| Client → Server | `user:join` | `{ name }` | Register name, receive rooms |
| Client → Server | `room:join` | `{ roomId }` | Join a workspace room |
| Client → Server | `task:create` | `{ roomId, title }` | Create a task |
| Client → Server | `task:move` | `{ roomId, taskId, newStatus }` | Move task to column |
| Client → Server | `task:delete` | `{ roomId, taskId }` | Delete a task |
| Client → Server | `task:editing` | `{ roomId, taskId }` | Signal editing started |
| Client → Server | `task:editingStop` | `{ roomId, taskId }` | Signal editing stopped |
| Client → Server | `chat:send` | `{ roomId, text }` | Send a message |
| Client → Server | `chat:typing` | `{ roomId }` | Typing started |
| Client → Server | `chat:stopTyping` | `{ roomId }` | Typing stopped |
| Client → Server | `cursor:move` | `{ roomId, x, y, state }` | Cursor position + state |
| Client → Server | `cursor:state` | `{ roomId, state }` | State-only change (no move) |
| Client → Server | `cursor:leave` | `{ roomId }` | Left board area |
| Server → Client | `user:joined` | `{ user, rooms }` | Confirms join |
| Server → Client | `room:state` | `{ tasks, activities, users, messages }` | Full room snapshot |
| Server → Client | `users:update` | `[users]` | Updated online list |
| Server → Client | `task:created` | task object | New task |
| Server → Client | `task:moved` | `{ taskId, newStatus }` | Task column change |
| Server → Client | `task:deleted` | `{ taskId }` | Task removed |
| Server → Client | `activity:new` | activity entry | New feed entry |
| Server → Client | `chat:message` | message object | New chat message |
| Server → Client | `chat:typing` | `[names]` | Who's typing |
| Server → Client | `cursor:move` | `{ userId, x, y, state, userName, color }` | Remote cursor update |
| Server → Client | `cursor:state` | `{ userId, state }` | Remote state change |
| Server → Client | `cursor:userLeft` | `{ userId }` | Remove remote cursor |

## How Real-Time Sync Works: Task Move

```
1. Kaye drags a card to "Doing"
2. KanbanBoard.jsx calls onMove('task-abc', 'doing')
3. useNibbli.js emits: socket.emit('task:move', { roomId, taskId, newStatus })
4. Server receives 'task:move'
5. store.moveTask() updates status in memory
6. io.to(roomId).emit('task:moved', { taskId, newStatus })
7. Every browser receives 'task:moved'
8. setTasks(prev => prev.map(...)) on each browser
9. React re-renders KanbanBoard everywhere
10. Kia and AJ see the task move — instantly
```

## How the Live Cursor Works End-to-End

```
1. Kia moves her mouse on the board
2. window pointermove fires in useCursor.js
3. Position normalised to 0–1 (relative to board dimensions)
4. Throttle check: if 40ms has passed → emit
5. socket.emit('cursor:move', { roomId, x, y, state })
6. Server reads Kia's name + color from store
7. socket.to(roomId).emit('cursor:move', { userId, x, y, state, userName, color })
   (everyone EXCEPT Kia)
8. Kaye and AJ's useCursor.js receive 'cursor:move'
9. targetPos.current[kiaId] = { x, y } updated (ref — no re-render)
10. rAF loop lerps currentPos toward targetPos
11. setRemoteCursors with smoothed x/y
12. RemoteCursor re-renders — Kia's cursor glides to new position
```

## How Typing Indicators Work

```
Kaye types a character
  → useNibbli.js emits 'chat:typing'
  → Server: store.startTyping() → socket.to(room).emit('chat:typing', ['Kaye'])
  → Kia and AJ see "Kaye is typing..."

2.5 seconds of no keystrokes
  → Timer fires → 'chat:stopTyping' emitted
  → Server: store.stopTyping() → broadcasts empty list
  → Indicator disappears
```

## How Online Presence Works

```
AJ joins room
  → server adds to onlineUsers → broadcasts users:update
  → Kia and Kaye's sidebars: AJ appears with green dot

AJ closes browser
  → Socket.IO fires 'disconnect' automatically
  → server removes AJ → broadcasts users:update + cursor:userLeft
  → AJ's avatar and cursor disappear for Kia and Kaye
```

---

# 7. Distributed Architecture Concepts

## Client-Server Architecture

**Definition:** Multiple clients connect to and depend on a central server. The server is the authority.

**In Nibbli:** Kia's, Kaye's, and AJ's browsers are independent clients. The Node.js server at `localhost:3001` is the single source of truth. If Kia's browser crashes and refreshes, she reconnects and gets all current state from the server.

**Where in code:** `server.js`, `SocketContext.jsx`, `socketHandlers.js`

## Event-Driven Architecture

**Definition:** The system reacts to events as they happen — nothing polls.

**In Nibbli:** Nothing asks "did anything change?" The server pushes:
- `task:created` → every board reacts
- `chat:message` → every chat reacts
- `cursor:move` → every RemoteCursor reacts

**Where in code:** Every `socket.on()` in `socketHandlers.js`, `useNibbli.js`, and `useCursor.js`

## Real-Time Synchronization

**Definition:** All connected clients maintain the same view of shared data at the same time.

**In Nibbli:** When you join a room, you get a complete `room:state` snapshot. After that, every incremental event keeps you in sync. The `last-write-wins` strategy means all state mutations happen server-side and broadcast immediately — every client converges to the same state.

**Where in code:** `room:state` in `socketHandlers.js`, `room:state` listener in `useNibbli.js`

## Concurrency

**Definition:** Multiple users performing actions at the same time.

**In Nibbli:** Kia can create a task while Kaye moves one and AJ sends a message — all simultaneously. Node.js's single-threaded event loop queues and processes events sequentially, preventing race conditions without locking mechanisms.

**Where in code:** Node.js event loop (built in), `store.js` (sequential mutations), `socketHandlers.js`

## Shared Distributed State

**Definition:** Data that exists centrally and is shared across all nodes.

**In Nibbli:** Task list, message history, activity log, and online users all live in `store.js`. Every client has a synchronized copy. When state changes, the server propagates it to all clients. No client holds the authoritative state.

**This is what makes Nibbli a distributed system** — multiple separate machines sharing and reacting to the same data in real time.

---

# 8. User Flow Walkthroughs

## Creating a Task

| Step | Where | What happens |
|---|---|---|
| 1 | `KanbanColumn.jsx` | User types title, presses Add |
| 2 | `KanbanColumn.jsx` | Calls `onCreateTask(title)` prop |
| 3 | `Workspace.jsx` → `App.jsx` | Prop chain passes to `createTask()` |
| 4 | `useNibbli.js` | `socket.emit('task:create', { roomId, title })` |
| 5 | `socketHandlers.js` | Receives `task:create`, calls `store.createTask()` |
| 6 | `store.js` | Creates task object with UUID, adds to room array, logs activity |
| 7 | `socketHandlers.js` | `io.to(roomId).emit('task:created', task)` |
| 8 | `socketHandlers.js` | `io.to(roomId).emit('activity:new', latestActivity)` |
| 9 | `useNibbli.js` (all browsers) | `task:created` listener → `setTasks(prev => [...prev, task])` |
| 10 | React (all browsers) | Re-renders KanbanBoard → new card appears for everyone |

## Moving a Task (Drag and Drop)

| Step | Where | What happens |
|---|---|---|
| 1 | `TaskCard.jsx` | User grabs and drags the card |
| 2 | `KanbanBoard.jsx` | `handleDragStart` fires → `setDraggingState(true)` |
| 3 | `useCursor.js` | `isDraggingRef = true` → resolves to `'grabbing'` → emits `cursor:state` |
| 4 | All other browsers | `RemoteCursor` switches to `Grabbing.svg` |
| 5 | `KanbanBoard.jsx` | `DragOverlay` shows ghost card |
| 6 | `KanbanColumn.jsx` | Target column highlights on hover |
| 7 | `KanbanBoard.jsx` | `onDragEnd` fires → `setDraggingState(false)` → cursor back to normal |
| 8 | `useNibbli.js` | `socket.emit('task:move', { roomId, taskId, newStatus })` |
| 9 | All browsers | `task:moved` received → `setTasks` updates → card moves for everyone |

## Joining a Room

| Step | Where | What happens |
|---|---|---|
| 1 | `Sidebar.jsx` | User clicks a room button |
| 2 | `Workspace.jsx` | Calls `onRoomSelect(roomId)` |
| 3 | `useNibbli.js` | Clears all stale state immediately |
| 4 | `useNibbli.js` | `socket.emit('room:join', { roomId })` |
| 5 | `socketHandlers.js` | Removes from old room, emits `cursor:userLeft` to old room |
| 6 | `socketHandlers.js` | Sends full `room:state` snapshot to THIS user |
| 7 | `socketHandlers.js` | `io.to(newRoom).emit('users:update', ...)` |
| 8 | `useNibbli.js` | `room:state` fires → sets all state for new room |
| 9 | React | Board, chat, activity, sidebar all populate |

## Sending a Chat Message

| Step | Where | What happens |
|---|---|---|
| 1 | `ChatPanel.jsx` | User presses Enter |
| 2 | `useNibbli.js` | Clears typing timer, emits `chat:stopTyping` |
| 3 | `useNibbli.js` | `socket.emit('chat:send', { roomId, text })` |
| 4 | `socketHandlers.js` | `store.addMessage()` creates message with user color |
| 5 | `socketHandlers.js` | `io.to(roomId).emit('chat:message', msg)` |
| 6 | `useNibbli.js` (all browsers) | `setMessages(prev => [...prev, msg])` |
| 7 | `ChatPanel.jsx` (all browsers) | New bubble renders, auto-scrolls |

## Live Cursor Flow

| Step | Where | What happens |
|---|---|---|
| 1 | User moves mouse | `window pointermove` fires in `useCursor.js` |
| 2 | `useCursor.js` | Normalise to 0–1, check 40ms throttle |
| 3 | `useCursor.js` | `socket.emit('cursor:move', { roomId, x, y, state })` |
| 4 | `socketHandlers.js` | Reads name + color, `socket.to(room).emit('cursor:move', ...)` |
| 5 | `useCursor.js` (others) | `targetPos.current[userId]` updated |
| 6 | rAF loop | Lerps `currentPos` toward `targetPos` |
| 7 | `setRemoteCursors` | Smoothed x/y passed to `RemoteCursor` |
| 8 | `RemoteCursor.jsx` | Re-renders at interpolated position — cursor glides |

## Typing Indicator Flow

| Step | Where | What happens |
|---|---|---|
| 1 | `ChatPanel.jsx` | User types → calls `onTyping()` |
| 2 | `useNibbli.js` | Emits `chat:typing`, resets 2.5s debounce |
| 3 | `socketHandlers.js` | `store.startTyping()` → `socket.to(room).emit('chat:typing', names)` |
| 4 | Other browsers | `setTypingUsers(['Kaye'])` |
| 5 | `ChatPanel.jsx` (others) | "Kaye is typing…" appears with bouncing dots |
| 6 | 2.5s no typing | Timer fires → `chat:stopTyping` → indicator disappears |

---

# 9. Common Professor Questions & Answers

---

**Q: Why is Nibbli considered a distributed system?**

A: Because multiple separate client devices (browsers) communicate through a centralized server over a network to share data and coordinate behavior. Each browser is an independent node. They don't communicate directly — everything goes through the server. The server holds shared state and synchronizes it to all clients in real time. This is the definition of a client-server distributed system.

---

**Q: What type of distributed architecture does Nibbli use?**

A: Client-Server architecture as the primary pattern, combined with Event-Driven architecture for real-time communication. All actions are expressed as named socket events (`task:create`, `chat:send`, `cursor:move`) rather than polling or HTTP requests.

---

**Q: How does real-time synchronization work in Nibbli?**

A: Through Socket.IO's WebSocket connection. When any client acts, it emits an event to the server. The server updates shared state and broadcasts the result to all clients in the room. Each client's listener updates React state, which re-renders the UI. This cycle typically completes in under 50 milliseconds.

---

**Q: What is the difference between HTTP and WebSocket?**

A: HTTP is request-response: client asks, server answers, connection closes. WebSocket keeps the connection open permanently — either side can send at any time. Nibbli uses WebSocket so the server can push updates the moment they happen, without clients asking.

---

**Q: How does Nibbli handle concurrency?**

A: Node.js's event loop processes socket events one at a time sequentially. Concurrent events queue up and are handled in order. This prevents data corruption without database transactions or locks. Both tasks are created correctly even if emitted simultaneously.

---

**Q: Where is data stored?**

A: Tasks, messages, activity logs, and online user info are stored in-memory as plain JavaScript objects in `store.js`. Cursor positions are never stored — the server is a pure relay. No database. Data is lost on server restart, which is acceptable for a local academic project.

---

**Q: What is Socket.IO and why use it over plain WebSockets?**

A: Socket.IO adds automatic reconnection, named events, and the room concept on top of WebSockets. Plain WebSockets require building all of this manually. Socket.IO is the practical choice for a real-time collaborative app.

---

**Q: How does the live cursor system work technically?**

A: Cursor position is captured from `window pointermove` and emitted as `cursor:move` every 40ms (throttled). The server relays the position plus the user's name and color to everyone else in the room via `socket.to(roomId)` (excludes sender). Remote cursors use a `requestAnimationFrame` loop with linear interpolation to glide smoothly to new positions. We use `window pointermove` specifically because `@dnd-kit` calls `setPointerCapture` during drag, which stops regular DOM `mousemove` events — `window pointermove` continues firing throughout.

---

**Q: What are the four cursor states and how do they work?**

A: The four states are `normal` (Hand), `click` (Click — on left-click or hovering any interactive element), `grabbing` (Grabbing — while dragging), and `hehe` (Hehe — while holding right-click, plays a sound). A single `resolveState()` function picks the winner: `grabbing > hehe > click > normal`. All state changes broadcast to other users via `cursor:state` events so everyone sees the same visuals.

---

**Q: How does Nibbli know when a user disconnects?**

A: Socket.IO fires a built-in `disconnect` event on the server automatically when a tab closes or connection drops. The handler removes the user from the store, broadcasts updated user list, and broadcasts `cursor:userLeft` to remove their cursor from all boards.

---

**Q: What happens when two users move the same task simultaneously?**

A: Node.js processes events sequentially. One arrives first, gets applied. The second arrives, gets applied. The last one "wins" — its resulting state broadcasts to everyone. This is last-write-wins conflict resolution, acceptable for this use case.

---

**Q: How does drag-and-drop connect to real-time synchronization?**

A: `@dnd-kit` handles the visual drag locally. When the card is dropped, `onDragEnd` fires with the destination column. If the column changed, `task:move` emits to the server, which updates state and broadcasts `task:moved` to everyone. Simultaneously, `setDraggingState(false)` reverts the cursor from Grabbing. The drag UI is local; the sync is Socket.IO.

---

**Q: Why did you choose in-memory storage?**

A: Simplicity (no database setup), speed (in-memory is orders of magnitude faster), and beginner-friendliness (the entire data layer is readable plain JS objects). Data lost on restart is acceptable for a local academic project.

---

**Q: Explain the full data flow from a user action to all browsers.**

A: Five stages: (1) User interacts with a React component. (2) Component calls an action from `useNibbli.js` or `useCursor.js`, which emits a socket event. (3) `socketHandlers.js` receives it and calls `store.js` to update state. (4) Handler broadcasts a result event to the room. (5) Every browser's listener updates React state, React re-renders, user sees the change. Total time: under 100ms.

---

# 10. Common Beginner Confusions

---

**"I don't understand how frontend and backend talk."**

Think of them as walkie-talkies. They agree on channel names (event names like `task:create`). Frontend broadcasts on that channel. Backend listens and responds on another channel (`task:created`). Both sides hear immediately.

---

**"Why do we need a backend? Can't browsers talk directly?"**

Browsers can't connect to each other for security reasons. Even if they could, there'd be no single authority. The server is the referee and shared memory. Without it, there's no synchronization.

---

**"What's the difference between React state and server data?"**

Server data in `store.js` is the **truth**. React state in `useNibbli.js` is your browser's **current copy**. The server is always authoritative. If you crash and reconnect, you get a fresh copy.

---

**"Why does the frontend emit `task:create` but listen for `task:created`?"**

`task:create` = command ("please create"). `task:created` = notification ("it was created"). The server only broadcasts after successfully saving — so the broadcast confirms success. You also hear about other users' creations through the same event.

---

**"Why does `useCursor.js` exist separately from `useNibbli.js`?"**

Cursor logic is complex: its own rAF loop, throttling, audio, inactivity cleanup, state priority resolver, right-click hold tracking. Putting all that in `useNibbli.js` would make it massive and hard to follow. Both hooks share the same socket from `SocketContext.jsx`.

---

**"Why `window pointermove` instead of `board mousemove`?"**

When `@dnd-kit` starts a drag, it calls `setPointerCapture`, routing all pointer events to the dragging element. Regular `mousemove` on the board stops firing. `window pointermove` is unaffected by pointer capture — cursor sync continues uninterrupted during drag.

---

**"Why is `key={state}` on the cursor image so important?"**

Without it, React reuses the existing `<img>` element and just updates `src`. The browser may serve a cached version without visually updating. With `key={state}`, React unmounts the old element and mounts a new one on every state change — guaranteed instant image swap, no flicker.

---

**"What is `useEffect` and why is it in `useNibbli.js`?"**

`useEffect` runs code after rendering and can set up/tear down side effects like event listeners. In `useNibbli.js` it registers all `socket.on()` listeners when the component mounts, and the cleanup removes them when it unmounts. Without cleanup, you'd add duplicate listeners causing bugs like messages appearing twice.

---

**"What's the difference between `io.to()`, `socket.emit()`, and `socket.to()`?"**

`socket.emit()` = send to **this socket only** (one user).
`io.to(roomId).emit()` = send to **everyone in the room** (including sender).
`socket.to(roomId).emit()` = send to **everyone in the room EXCEPT the sender**.

Nibbli uses all three: `room:state` goes only to the joining user, task updates go to everyone, typing and cursor events go to everyone except the person who triggered them.

---

**"Why does joining a room clear all state?"**

The tasks and messages you were seeing belong to the old room. Clearing them immediately prevents briefly seeing the wrong room's data while the server sends the new room's state. Show nothing briefly — not the wrong thing briefly.

---

**"What is CORS?"**

A browser security feature. Browsers block requests from one origin (`localhost:5173`) to another (`localhost:3001`) unless the server explicitly allows it. The `cors` config in `server.js` enables this. Without it, the Socket.IO connection would be blocked.

---

# 11. How Everything Connects Together

## The System in One Paragraph

When you run Nibbli, two servers start: the frontend (Vite at port 5173) and the backend (Node.js at port 3001). Opening a browser renders the app and `SocketContext.jsx` opens a persistent WebSocket to port 3001. Entering your name emits `user:join`. Picking a room emits `room:join`, subscribing to that room's broadcast group, and the server responds with a full state snapshot. From then on, every board/chat action emits an event → server processes → broadcasts to everyone → React re-renders. If on the Board tab, cursor positions emit every 40ms → server relays to teammates → their `RemoteCursor` components interpolate smoothly. Everything — tasks, chat, presence, cursors — follows the same push-based event-driven pattern.

## File Communication Map

```
index.html
  └── main.jsx
        └── App.jsx
              ├── SocketContext.jsx ──────────────────► localhost:3001 (server.js)
              ├── useNibbli.js                              │
              │     ├── listens: task:created               │
              │     ├── listens: chat:message          socketHandlers.js
              │     ├── listens: users:update               │
              │     ├── emits: task:create            ◄─────┤
              │     ├── emits: chat:send                    │
              │     └── emits: room:join               store.js (tasks/messages/users)
              │                                             │
              ├── JoinScreen.jsx                       uuid.js
              └── Workspace.jsx
                    ├── Sidebar.jsx        ← reads: rooms, onlineUsers
                    ├── ChatPanel.jsx      ← reads: messages, typingUsers
                    ├── KanbanBoard.jsx    ← reads: tasks, editingMap
                    │     ├── useCursor.js
                    │     │     ├── emits: cursor:move ──► server (relayed to others)
                    │     │     ├── listens: cursor:move ◄─ server (from others)
                    │     │     └── rAF lerp loop → smooth remote positions
                    │     ├── KanbanColumn.jsx
                    │     ├── TaskCard.jsx
                    │     ├── CursorOverlay.jsx
                    │     │     └── RemoteCursor.jsx (one per remote user)
                    │     └── LocalCursor.jsx (your own cursor)
                    ├── ActivityFeed.jsx   ← reads: activities
                    └── ConnectionBadge.jsx ← reads: connected (from SocketContext)
```

## The Four Loops That Make Nibbli Work

**Loop 1 — Action Loop (you do something):**
Interaction → React component → `useNibbli` action → `socket.emit` → server → store update → server broadcast → `useNibbli` listener → React state update → UI re-render

**Loop 2 — Presence Loop (someone joins/leaves):**
Browser connects/disconnects → server detects → updates `onlineUsers` → broadcasts `users:update` + `cursor:userLeft` → all browsers update sidebar and remove cursor

**Loop 3 — Sync Loop (you join a room):**
`room:join` emitted → server sends full `room:state` snapshot → `useNibbli` sets all state → React renders entire board, chat, and activity feed

**Loop 4 — Cursor Loop (you move your mouse on the board):**
`window pointermove` → throttle check → `cursor:move` emitted → server relays to room → remote `useCursor` updates target position → rAF lerp → `RemoteCursor` re-renders smoothly

**Everything Nibbli does is one of these four loops.**

---

## Final Summary: Why This Project Matters

Nibbli demonstrates that distributed systems don't have to be complex. With just:
- One Node.js server
- A simple in-memory store
- Socket.IO events
- A React frontend

...you have a system where multiple independent clients share state, react to each other's actions in real time, handle concurrent operations, and — with the live cursor system — literally *see* each other's presence as it happens.

That's distributed computing — and Nibbli does it cleanly, simply, and expressively.

---

*BRIEFER.md — Nibbli Project · Parallel and Distributed Computing · v2.0*
*Updated to include: live cursor presence system, useCursor.js, LocalCursor.jsx, CursorOverlay.jsx, RemoteCursor.jsx, cursor socket events, hover detection, right-click hold, drag sync fix, and the fourth loop.*
