# 📘 Nibbli — Project Briefer
### Your Complete Guide to Understanding the Project
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

Nibbli is a **real-time collaborative productivity web application** designed for small teams. Think of it like a lightweight combination of Trello (task boards), Discord (chat + rooms), and Notion (workspace organization) — but in a cozy pastel aesthetic.

In plain words: **multiple people can open Nibbli in their browsers at the same time, work on the same task board, chat with each other, and everything updates instantly for everyone — no page refresh needed.**

## What Problem Does It Solve?

When a small team (like Kia, Kaye, and AJ) works on a project together, they need to:
- See what tasks exist and who's doing what
- Move tasks as they progress (To Do → Doing → Done)
- Communicate in real time without switching apps
- Know who else is currently online and active

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
| **React** | Builds the user interface (what you see in the browser) |
| **Vite** | Development tool that runs the React app locally |
| **TailwindCSS** | Styles the UI with utility classes (colors, spacing, layout) |
| **Node.js** | Runs the backend server (JavaScript on the server) |
| **Express.js** | Handles the HTTP server setup |
| **Socket.IO** | Powers all real-time communication between clients and server |
| **In-Memory Storage** | Plain JavaScript objects store all data while the server runs |

## How Users Interact With It

1. Open `http://localhost:5173` in a browser
2. Enter your name on the join screen
3. Pick a workspace room (Thesis Team, Finals Project, Study Group)
4. The **Chat tab** opens — send messages to teammates instantly
5. Switch to the **Board tab** — create, move, and delete tasks on the Kanban board
6. The left sidebar shows who's online in your room
7. The right panel shows the live activity feed (who did what, when)
8. Everything updates in real time for everyone in the same room

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
2. The server creates your user profile (name + assigned color) and stores it in memory
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

### When you stop using the app (close the tab)

1. Socket.IO detects the disconnection automatically
2. The server removes you from the online users list
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
│   │   ├── socketHandlers.js   ← all real-time event logic
│   │   ├── store.js            ← in-memory database
│   │   └── uuid.js             ← generates unique IDs
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                    ← React entry point
│   │   ├── App.jsx                     ← root component
│   │   ├── index.css                   ← global styles + animations
│   │   ├── assets/
│   │   │   ├── Nibbli.png              ← app logo (join screen)
│   │   │   └── Seedling.png            ← sidebar logo
│   │   ├── context/
│   │   │   └── SocketContext.jsx       ← shared socket connection
│   │   ├── hooks/
│   │   │   └── useNibbli.js            ← all state + actions
│   │   └── components/
│   │       ├── JoinScreen.jsx          ← name entry screen
│   │       ├── Workspace.jsx           ← main layout
│   │       ├── Sidebar.jsx             ← rooms + online users
│   │       ├── ChatPanel.jsx           ← real-time chat
│   │       ├── KanbanBoard.jsx         ← drag-and-drop board
│   │       ├── KanbanColumn.jsx        ← single column (To Do / Doing / Done)
│   │       ├── TaskCard.jsx            ← individual task card
│   │       ├── ActivityFeed.jsx        ← right panel live log
│   │       ├── RoomEmptyState.jsx      ← shown before picking a room
│   │       └── ConnectionBadge.jsx     ← Live / Reconnecting pill
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
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

**Connects to:**
- `socketHandlers.js` — called every time a new user connects
- All frontend files — they all connect to this server

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
- Provides functions that the rest of the backend calls to read/write data
- `addUser` / `removeUser` — manage who's online
- `createTask` / `moveTask` / `deleteTask` — manage Kanban tasks
- `addMessage` / `getMessages` — manage chat history
- `startTyping` / `stopTyping` / `getTypingUsers` — manage typing indicators
- `addActivity` / `getActivities` — manage the activity feed log

**Connects to:**
- `socketHandlers.js` — imports and uses all store functions

**If this file is missing:** All data operations break. No tasks, no users, no messages.

**Important thing to understand:**
Because storage is in-memory, **all data is lost when the server restarts.** This is intentional for a simple academic project — no database setup required.

---

### `backend/src/socketHandlers.js`

**Purpose:** The brain of the real-time system. Every Socket.IO event — every action a user takes — is handled here.

**What it handles:**

| Event received | What it does |
|---|---|
| `user:join` | Creates the user in store, sends back rooms list |
| `room:join` | Moves user to a room, sends full room state |
| `task:create` | Creates task in store, broadcasts to room |
| `task:move` | Updates task status, broadcasts to room |
| `task:delete` | Removes task, broadcasts to room |
| `task:editing` | Marks a task as being edited, tells others |
| `task:editingStop` | Clears editing state |
| `chat:send` | Saves message, broadcasts to room |
| `chat:typing` | Starts typing indicator, tells others |
| `chat:stopTyping` | Stops typing indicator, tells others |
| `disconnect` | Removes user, updates everyone's online list |

**Connects to:**
- `store.js` — reads and writes all data
- Every frontend component indirectly — this is what the frontend's socket events talk to

**If this file is missing:** No real-time events work at all. The app would connect but nothing would happen.

**Key pattern to understand:**
```javascript
// Listen for an event from one client
socket.on('task:create', ({ roomId, title }) => {
  const task = store.createTask(roomId, title, user.name);
  // Broadcast to ALL clients in the room (including sender)
  io.to(roomId).emit('task:created', task);
});
```
`socket.on` = receive from one user. `io.to(roomId).emit` = send to everyone in the room.

---

### `backend/src/uuid.js`

**Purpose:** A tiny helper that generates unique IDs for tasks, messages, and activity entries.

**What it does:**
- Exports a single `v4()` function that returns a random string like `"a3f2b1c4-..."`
- Every task, message, and activity entry gets one of these as its `id`
- This ensures no two items ever have the same ID, which prevents bugs

**Connects to:** `store.js` (imported and used there)

**If this file is missing:** store.js crashes on startup. Nothing gets a unique ID.

---

## Frontend Files

---

### `frontend/src/main.jsx`

**Purpose:** The absolute starting point of the React application. This is the first file that runs.

**What it does:**
- Imports the root `App` component
- Imports `index.css` (loads all Tailwind styles)
- Mounts the entire React app into the `<div id="root">` in `index.html`

**Connects to:** `App.jsx`, `index.css`, `index.html`

**If this file is missing:** The React app never starts — blank white screen.

---

### `frontend/src/App.jsx`

**Purpose:** The root of the entire React component tree. It wires together the socket connection, all shared state, and decides what screen to show.

**What it does:**
- Wraps the whole app in `<SocketProvider>` so every component can access the socket connection
- Uses the `useNibbli` hook to get all state (tasks, messages, users, etc.) and all actions
- Decides what to render: if you haven't joined yet → show `JoinScreen`; if you have → show `Workspace`
- Passes all the data and action functions down to `Workspace` as props

**Connects to:**
- `SocketContext.jsx` — provides the socket
- `useNibbli.js` — provides all state and actions
- `JoinScreen.jsx` — shown before joining
- `Workspace.jsx` — shown after joining

**If this file is missing:** The entire app breaks. It's the glue that holds everything together.

---

### `frontend/src/index.css`

**Purpose:** Global stylesheet for the entire app.

**What it does:**
- Loads Tailwind's base styles, component classes, and utility classes
- Sets body background color and font
- Defines the custom `scrollbar-thin` class used in chat and activity panels
- Defines the `typingBounce` keyframe animation used by the chat typing indicator dots

**Connects to:** Imported in `main.jsx`, affects every component

---

### `frontend/src/context/SocketContext.jsx`

**Purpose:** Creates ONE shared Socket.IO connection that the entire app uses. Think of it as the app's single phone line to the server.

**What it does:**
- Creates a React Context (a way to share data without passing it through every component)
- When the app loads, opens one Socket.IO connection to `http://localhost:3001`
- Tracks whether the connection is live (`connected: true/false`)
- Wraps the whole app so any component can call `useSocket()` to access the socket

**Why one connection?** If every component opened its own connection, you'd have 10+ connections per browser tab — chaos. One connection handles everything.

**Connects to:**
- `App.jsx` — wraps the app in `<SocketProvider>`
- `useNibbli.js` — calls `useSocket()` to get the socket
- `ConnectionBadge.jsx` — calls `useSocket()` to check if connected

**If this file is missing:** No socket connection exists. The entire real-time system breaks.

---

### `frontend/src/hooks/useNibbli.js`

**Purpose:** The brain of the frontend. All shared state and all actions live here, in one clean place.

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

**How it listens to the server:**
Inside a `useEffect`, it registers listeners for every server event (`task:created`, `chat:message`, `users:update`, etc.) and updates the relevant state when they arrive.

**Connects to:**
- `SocketContext.jsx` — gets the socket via `useSocket()`
- `App.jsx` — consumes all state and actions
- Every component indirectly — receives data through props from App

**If this file is missing:** No state, no actions, nothing works in the frontend.

---

### `frontend/src/components/JoinScreen.jsx`

**Purpose:** The welcome/entry screen. The first thing every user sees.

**What it does:**
- Shows the Nibbli logo image and a text input for your name
- When you submit, calls `onJoin(name)` which triggers `joinApp()` in `useNibbli.js`
- Kept intentionally simple — no passwords, no accounts

**Connects to:** `App.jsx` (receives `onJoin` prop), `assets/Nibbli.png`

---

### `frontend/src/components/Workspace.jsx`

**Purpose:** The main application layout after you've joined. Contains everything you see and interact with.

**What it does:**
- Renders the three-panel layout: Sidebar (left) | Center panel | ActivityFeed (right)
- Manages the `activeTab` state locally: `'chat'` or `'board'`
- The center panel conditionally renders either `ChatPanel` or `KanbanBoard` based on which tab is active
- Shows a header with the room name, online count, tab toggle buttons, and `ConnectionBadge`
- If no room is selected, shows `RoomEmptyState` instead

**Connects to:**
- `Sidebar.jsx`, `ChatPanel.jsx`, `KanbanBoard.jsx`, `ActivityFeed.jsx`, `RoomEmptyState.jsx`, `ConnectionBadge.jsx`
- `App.jsx` — receives all data and action props

---

### `frontend/src/components/Sidebar.jsx`

**Purpose:** The left panel. Shows the Nibbli logo, workspace rooms, online users, and your own user info.

**What it does:**
- Displays the Seedling logo image and app name
- Lists all available rooms as clickable buttons; highlights the active one
- Shows all online users in the current room with their colored avatars and a green dot
- Shows your own profile at the bottom with a "● You" label

**Connects to:**
- `Workspace.jsx` — receives `rooms`, `onlineUsers`, `user`, `onRoomSelect`
- `assets/Seedling.png`

---

### `frontend/src/components/ChatPanel.jsx`

**Purpose:** The real-time chat interface. The center panel when the Chat tab is active.

**What it does:**
- Displays all chat messages as colored pastel bubbles
- Your own messages appear on the **right** in purple; others appear on the **left** in their avatar color
- Each bubble shows initials avatar, sender name, message text, and timestamp
- Shows the typing indicator ("Kaye is typing…") with animated bouncing dots
- Auto-scrolls to the latest message whenever messages or typing state changes
- The input area: text field + send button; pressing Enter sends the message
- Calls `onTyping()` on every keystroke, which triggers the typing indicator for others

**Connects to:**
- `Workspace.jsx` — receives `messages`, `typingUsers`, `user`, `onSend`, `onTyping`
- `index.css` — uses `typingBounce` animation

---

### `frontend/src/components/KanbanBoard.jsx`

**Purpose:** The drag-and-drop task board. The center panel when the Board tab is active.

**What it does:**
- Wraps everything in `DndContext` from `@dnd-kit/core` to enable drag-and-drop
- Renders three `KanbanColumn` components side by side (To Do, Doing, Done)
- Listens for drag end events: determines which column the task was dropped into
- If the column changed, calls `onMove(taskId, newStatus)` which emits to the server
- Shows a `DragOverlay` — the floating ghost card that follows your cursor while dragging

**Connects to:**
- `KanbanColumn.jsx`, `TaskCard.jsx`
- `Workspace.jsx` — receives `tasks`, `editingMap`, `onMove`, `onDelete`, `onCreate`

---

### `frontend/src/components/KanbanColumn.jsx`

**Purpose:** A single column on the Kanban board (To Do, Doing, or Done).

**What it does:**
- Acts as a **droppable zone** — tasks can be dragged and dropped onto it
- Highlights with a soft color when a dragged card hovers over it
- Contains a `SortableContext` for the tasks inside it
- Renders each task as a `TaskCard`
- Shows "Drop here" text when empty and a card is being dragged over it
- Has an "Add task" button that expands into a small form for creating new tasks

**Connects to:**
- `TaskCard.jsx`
- `KanbanBoard.jsx` — receives `tasks`, `onDelete`, `onCreateTask`

---

### `frontend/src/components/TaskCard.jsx`

**Purpose:** A single draggable task card.

**What it does:**
- Uses `useSortable` from `@dnd-kit/sortable` to become draggable
- Shows the task title, creator name, and how long ago it was created
- Shows an editing indicator ("AJ is editing…") if another user is editing it
- Has a delete button (✕) that appears on hover — uses `onPointerDown: stopPropagation` so clicking it doesn't accidentally start a drag
- While being dragged: becomes semi-transparent, gets a purple ring outline

**Connects to:**
- `KanbanColumn.jsx` — rendered inside columns
- `KanbanBoard.jsx` — also rendered inside the `DragOverlay`

---

### `frontend/src/components/ActivityFeed.jsx`

**Purpose:** The right panel showing a live log of everything that has happened in the room.

**What it does:**
- Displays each activity entry with a colored dot, message text, and "X minutes ago" timestamp
- Dot colors are meaningful: purple = created, yellow = moved, red = deleted, green = joined, grey = left
- Entries appear at the top (newest first) with a subtle fade-in animation
- Keeps the last 50 entries maximum

**Connects to:** `Workspace.jsx` — receives `activities` array

---

### `frontend/src/components/ConnectionBadge.jsx`

**Purpose:** A tiny pill in the top-right corner of the header showing if you're connected to the server.

**What it shows:**
- 🟢 **"Live"** with a pulsing green dot when the Socket.IO connection is active
- 🔴 **"Reconnecting…"** with a red dot when the connection drops

**Connects to:**
- `SocketContext.jsx` — reads the `connected` boolean
- `Workspace.jsx` — rendered in the header

---

### `frontend/src/components/RoomEmptyState.jsx`

**Purpose:** The placeholder shown in the center panel when you've joined the app but haven't selected a room yet.

**What it does:**
- Shows a friendly message and lists all available rooms as clickable cards
- Clicking a room calls `onRoomSelect` which triggers `joinRoom()`

**Connects to:** `Workspace.jsx`

---

### Configuration Files

#### `frontend/vite.config.js`
Tells Vite to use the React plugin and run the dev server on port 5173. Nothing complex here.

#### `frontend/tailwind.config.js`
Defines Nibbli's custom color palette (`nibbli-purple`, `nibbli-pink`, etc.), custom shadows (`shadow-card`, `shadow-panel`), and custom border radii (`rounded-xl2`, `rounded-xl3`). Every pastel color you see in the UI comes from here.

#### `frontend/postcss.config.js`
Required for Tailwind to work. Just enables the Tailwind and Autoprefixer plugins. You don't need to touch this.

#### `backend/package.json` & `frontend/package.json`
List all the dependencies each side needs. Running `npm install` reads these and downloads everything.

---

# 4. Frontend Explanation

## How React Works in Nibbli

React builds the UI using **components** — reusable pieces of the interface, each in its own file. Think of components like LEGO bricks: `Sidebar`, `ChatPanel`, `KanbanBoard` are all separate bricks that `Workspace` assembles together.

**The component tree in Nibbli looks like this:**

```
App
├── JoinScreen          (shown before joining)
└── Workspace           (shown after joining)
    ├── Sidebar
    ├── ChatPanel        (shown on Chat tab)
    │   └── MessageBubble (one per message)
    ├── KanbanBoard      (shown on Board tab)
    │   └── KanbanColumn (×3: To Do, Doing, Done)
    │       └── TaskCard (one per task)
    └── ActivityFeed
```

## How State Updates Happen

React state is like a component's memory. When state changes, React automatically re-renders the component to reflect the new data.

In Nibbli, all the important state lives in `useNibbli.js`. When the server sends a new message, this happens:

```
Server emits 'chat:message'
  → useNibbli.js listener fires
  → setMessages(prev => [...prev, msg])  ← state updates
  → React re-renders ChatPanel           ← new bubble appears
  → useEffect in ChatPanel fires         ← auto-scrolls to bottom
```

This entire chain happens in milliseconds. That's why the UI feels instant.

## How the Tab Toggle Works

`Workspace.jsx` has a local state variable `activeTab` (either `'chat'` or `'board'`). The two buttons in the header just call `setActiveTab('chat')` or `setActiveTab('board')`. React then conditionally renders either `<ChatPanel>` or `<KanbanBoard>` in the center panel. Simple as that.

## How Drag and Drop Works

`@dnd-kit` is a library that adds drag-and-drop to React. Here's how it connects:

1. `KanbanBoard` wraps everything in `DndContext`
2. Each `KanbanColumn` is a `useDroppable` zone — it can receive dropped items
3. Each `TaskCard` is `useSortable` — it can be picked up and dragged
4. When you drop a card, `KanbanBoard` receives a `onDragEnd` event with the task ID and the column it landed on
5. If the column changed, it calls `onMove(taskId, newStatus)` → emits to server → server broadcasts → everyone's board updates

---

# 5. Backend Explanation

## How Express.js Works Here

Express is used minimally in Nibbli — just to create the HTTP server that Socket.IO runs on top of.

The only real HTTP endpoint is:
```
GET http://localhost:3001/health
→ Returns { "status": "ok", "app": "Nibbli" }
```

This is just for debugging — to confirm the server is running.

**Everything else happens over WebSocket (Socket.IO), not HTTP.**

## How the Server Starts

```javascript
const app = express();             // create express app
const server = http.createServer(app); // wrap it in an HTTP server
const io = new Server(server);    // attach Socket.IO to the server
server.listen(3001);              // start listening on port 3001
```

When a browser opens Nibbli, it first makes an HTTP request to port 3001, then upgrades that connection to a WebSocket. After that, all communication is real-time and two-way.

## How Data is Stored

Nibbli uses **in-memory storage** — no database, no files. All data is stored in plain JavaScript objects inside `store.js` while the server is running.

```javascript
// This is the entire "database"
const rooms = {
  'room-thesis':  { tasks: [], activities: [], messages: [] },
  'room-finals':  { tasks: [], activities: [], messages: [] },
  'room-study':   { tasks: [], activities: [], messages: [] },
};
const onlineUsers = {};  // who's connected
```

**Pros:** Simple, no setup, extremely fast.
**Cons:** All data is lost when the server restarts. For this academic project, that's acceptable.

## How Events Flow Through the Backend

Every time something happens, the flow is:
1. `server.js` receives a new WebSocket connection, calls `registerHandlers(io, socket)`
2. `socketHandlers.js` sets up listeners for that specific user's socket
3. When an event arrives, the handler calls `store.js` functions to read/write data
4. The handler then emits events back to one user (`socket.emit`) or the whole room (`io.to(roomId).emit`)

---

# 6. Socket.IO & Real-Time System

## What is Socket.IO?

Normal websites use HTTP: you ask, the server answers, connection closes. Like sending a letter and waiting for a reply.

Socket.IO uses **WebSockets**: the connection stays open permanently. Either side can send a message at any time. Like a phone call that never hangs up.

Socket.IO adds extra features on top of WebSockets:
- **Automatic reconnection** if the connection drops
- **Rooms** — groups of sockets that can be messaged together
- **Event names** — instead of raw data, you send named events like `task:create`

## How Emit and Listen Work

**Sending (emitting) an event:**
```javascript
socket.emit('task:create', { roomId: 'room-thesis', title: 'Write README' });
// "Send the 'task:create' event with this data to the server"
```

**Receiving (listening for) an event:**
```javascript
socket.on('task:created', (task) => {
  setTasks(prev => [...prev, task]);
  // "When the server sends 'task:created', add the task to state"
});
```

The event name is just a string you agree on between frontend and backend. `task:create` is what the client sends; `task:created` is what the server broadcasts back.

## How Rooms Work

Socket.IO has a built-in concept of **rooms** — groups of connected sockets. In Nibbli, each workspace room (Thesis Team, Finals Project, Study Group) is a Socket.IO room.

```javascript
socket.join('room-thesis');                      // add this user to the group
io.to('room-thesis').emit('task:created', task); // send to everyone in the group
```

This means when Kia creates a task in Thesis Team, only Kaye and AJ (who are also in that room) get the update. Someone in Finals Project sees nothing. **Room isolation is automatic.**

## How Real-Time Sync Works Step by Step

Here's what happens when Kaye moves a task:

```
1. Kaye drags a card to "Doing" column in her browser
2. KanbanBoard.jsx calls onMove('task-abc', 'doing')
3. useNibbli.js emits: socket.emit('task:move', { roomId, taskId, newStatus: 'doing' })
4. Server receives 'task:move' in socketHandlers.js
5. store.moveTask() updates the task's status in memory
6. Server emits to the WHOLE ROOM: io.to(roomId).emit('task:moved', { taskId, newStatus })
7. Every browser in the room receives 'task:moved'
8. useNibbli.js listener fires on each browser: setTasks(prev => prev.map(...))
9. React re-renders KanbanBoard on every browser
10. Kia and AJ see the task move to "Doing" — instantly
```

Total time: typically under 50 milliseconds.

## How Typing Indicators Work

This is one of the more elegant features. Here's the flow:

```
Kaye types a character in the chat input
  → ChatPanel calls onTyping()
  → useNibbli.js emits 'chat:typing' to server
  → Server calls store.startTyping('room-thesis', 'Kaye')
  → Server emits 'chat:typing' with ['Kaye'] to everyone EXCEPT Kaye
  → Kia and AJ see "Kaye is typing..." appear

Kaye stops typing for 2.5 seconds
  → A timer in useNibbli.js fires automatically
  → Emits 'chat:stopTyping' to server
  → Server removes Kaye from typingUsers
  → Broadcasts updated list (now empty)
  → "Kaye is typing..." disappears for Kia and AJ
```

The 2.5-second auto-stop means the indicator always disappears eventually — even if Kaye closes her browser.

## How Online Presence Works

```
AJ opens Nibbli and enters his name
  → server creates AJ's user profile
  → AJ joins "Finals Project" room
  → server adds AJ to room's user list
  → server broadcasts 'users:update' to everyone in the room
  → Kia and Kaye's sidebars update: AJ's avatar appears with a green dot

AJ closes his browser tab
  → Socket.IO fires 'disconnect' automatically
  → server removes AJ from onlineUsers
  → server broadcasts 'users:update' with updated list
  → Kia and Kaye's sidebars update: AJ's avatar disappears
```

No heartbeat or polling needed — Socket.IO detects disconnection automatically.

---

# 7. Distributed Architecture Concepts

## Client-Server Architecture

**Definition:** Multiple clients connect to and depend on a central server. The server is the authority.

**In Nibbli:**
- **Clients:** Kia's browser, Kaye's browser, AJ's browser — each running the React app
- **Server:** The Node.js/Express backend at `localhost:3001`
- **The server is the single source of truth.** If Kia's browser crashes and she refreshes, she reconnects and gets all the current tasks, messages, and users from the server. Nothing is stored only in her browser.

**Where in code:** `server.js`, `SocketContext.jsx` (connection), `socketHandlers.js` (all server-side authority)

## Event-Driven Architecture

**Definition:** Instead of components constantly asking "has anything changed?", the system reacts to events as they happen.

**In Nibbli:**
- Nothing polls the server. Nothing asks "give me the latest tasks" every second.
- Instead, the server **pushes** events when something changes
- `task:created` → every browser reacts immediately
- `users:update` → every sidebar reacts immediately
- `chat:message` → every chat panel reacts immediately

**This is fundamentally different from normal HTTP.** A normal website would need you to refresh to see Kaye's new task. Nibbli pushes it to you the moment it's created.

**Where in code:** Every `socket.on()` in `socketHandlers.js` and `useNibbli.js`

## Real-Time Synchronization

**Definition:** All connected clients maintain the same view of shared data at the same time.

**In Nibbli:**
- All users in a room see the **exact same task board** at all times
- When any change happens, the server immediately broadcasts it to all clients
- The broadcast is the synchronization mechanism — it's what keeps everyone in sync

**The room:state event is especially important:**
When you join a room, the server doesn't just say "welcome." It sends you the **complete current state** — all tasks, all messages, all activity entries, all online users — in one snapshot. After that, incremental events keep you updated.

**Where in code:** `room:state` in `socketHandlers.js`, `room:state` listener in `useNibbli.js`

## Concurrency

**Definition:** Multiple users performing actions at the same time.

**In Nibbli:**
- Kia can create a task at the same moment Kaye moves a task and AJ sends a message
- Node.js processes events one at a time using its **event loop** — they queue up and are handled sequentially
- This prevents data corruption without needing complex locking mechanisms
- The in-memory store is always updated before the broadcast goes out, so everyone gets consistent data

**In practice:** Try it — have all three users do something simultaneously. They all work. That's concurrency in action.

**Where in code:** Node.js event loop (built in), `store.js` (sequential mutations), `socketHandlers.js` (one handler at a time)

## Shared Distributed State

**Definition:** Data that exists in a central location and is shared across all nodes (clients) in the system.

**In Nibbli:**
- The task list, message history, activity log, and online user list all live on the server in `store.js`
- Every client sees a **synchronized copy** of this shared state
- When state changes, the server propagates the change to all clients
- No client holds the authoritative state — the server always does

**This is what makes Nibbli a distributed system and not just a regular app.** Multiple separate machines share and react to the same data in real time.

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
| 6 | `store.js` | Creates task object with unique ID, adds to room's task array, logs activity |
| 7 | `socketHandlers.js` | `io.to(roomId).emit('task:created', task)` |
| 8 | `socketHandlers.js` | `io.to(roomId).emit('activity:new', latestActivity)` |
| 9 | `useNibbli.js` (all browsers) | `task:created` listener fires → `setTasks(prev => [...prev, task])` |
| 10 | React (all browsers) | Re-renders KanbanBoard → new card appears for everyone |

## Moving a Task (Drag and Drop)

| Step | Where | What happens |
|---|---|---|
| 1 | `TaskCard.jsx` | User grabs and drags the card |
| 2 | `KanbanBoard.jsx` | `DragOverlay` shows a floating copy of the card |
| 3 | `KanbanColumn.jsx` | Target column highlights as card hovers over it |
| 4 | `KanbanBoard.jsx` | `onDragEnd` fires; detects source and target columns |
| 5 | `useNibbli.js` | `socket.emit('task:move', { roomId, taskId, newStatus })` |
| 6 | `socketHandlers.js` | Updates task status in store, logs activity |
| 7 | All browsers | `task:moved` received → `setTasks` updates → card moves columns for everyone |

## Joining a Room

| Step | Where | What happens |
|---|---|---|
| 1 | `Sidebar.jsx` | User clicks a room button |
| 2 | `Workspace.jsx` | Calls `onRoomSelect(roomId)` |
| 3 | `useNibbli.js` | Clears all stale state immediately (snappy UX) |
| 4 | `useNibbli.js` | `socket.emit('room:join', { roomId })` |
| 5 | `socketHandlers.js` | Removes user from old room, adds to new room |
| 6 | `socketHandlers.js` | `socket.emit('room:state', { tasks, activities, users, messages })` to THIS user |
| 7 | `socketHandlers.js` | `io.to(roomId).emit('users:update', ...)` to EVERYONE in the new room |
| 8 | `useNibbli.js` | `room:state` listener fires → sets all state for the new room |
| 9 | React | Board, chat, activity, and sidebar all populate with the room's data |

## Sending a Chat Message

| Step | Where | What happens |
|---|---|---|
| 1 | `ChatPanel.jsx` | User types and presses Enter |
| 2 | `ChatPanel.jsx` | `handleSend()` calls `onSend(text)` |
| 3 | `useNibbli.js` | Clears typing timer, emits `chat:stopTyping` |
| 4 | `useNibbli.js` | `socket.emit('chat:send', { roomId, text })` |
| 5 | `socketHandlers.js` | Calls `store.addMessage()`, creates message object with user color |
| 6 | `socketHandlers.js` | `io.to(roomId).emit('chat:message', msg)` to everyone |
| 7 | `useNibbli.js` (all browsers) | `chat:message` listener fires → `setMessages(prev => [...prev, msg])` |
| 8 | `ChatPanel.jsx` (all browsers) | Re-renders with new bubble; `useEffect` auto-scrolls to bottom |

## Typing Indicator Flow

| Step | Where | What happens |
|---|---|---|
| 1 | `ChatPanel.jsx` | User types a character |
| 2 | `ChatPanel.jsx` | `handleInputChange` calls `onTyping()` |
| 3 | `useNibbli.js` | Emits `chat:typing`, resets 2.5s debounce timer |
| 4 | `socketHandlers.js` | `store.startTyping(roomId, userName)` |
| 5 | `socketHandlers.js` | `socket.to(roomId).emit('chat:typing', typingNames)` (excludes sender) |
| 6 | Other browsers | `chat:typing` fires → `setTypingUsers(['Kaye'])` |
| 7 | `ChatPanel.jsx` (others) | `TypingIndicator` renders "Kaye is typing…" with bouncing dots |
| 8 | 2.5s of no typing | Timer fires in `useNibbli.js` → emits `chat:stopTyping` |
| 9 | `socketHandlers.js` | `store.stopTyping()`, broadcasts empty typing list |
| 10 | Other browsers | `setTypingUsers([])` → indicator disappears |

---

# 9. Common Professor Questions & Answers

---

**Q: Why is Nibbli considered a distributed system?**

A: Because multiple separate client devices (browsers) communicate through a centralized server over a network to share data and coordinate their behavior. Each browser is an independent node in the system. They don't communicate with each other directly — they all go through the server. The server holds the shared state and synchronizes it across all clients in real time. This is the definition of a client-server distributed system.

---

**Q: What type of distributed architecture does Nibbli use?**

A: Nibbli uses **Client-Server architecture** as its primary pattern, combined with **Event-Driven architecture** for real-time communication. Multiple browser clients connect to one central Node.js server. All actions are expressed as named events (like `task:create`, `chat:send`) rather than polling or traditional HTTP requests.

---

**Q: How does real-time synchronization work in Nibbli?**

A: Through Socket.IO's WebSocket connection. When any client performs an action, it emits an event to the server. The server processes the action, updates the shared in-memory state, then broadcasts the result to all other connected clients in the same room. Each client's state update triggers React to re-render the UI. This entire cycle typically completes in under 50 milliseconds.

---

**Q: What is the difference between HTTP and WebSocket communication?**

A: HTTP is request-response: the client asks, the server answers, and the connection closes. The client has to ask again to get new data. WebSocket keeps the connection open permanently, and either side can send data at any time. Nibbli uses WebSocket (via Socket.IO) so the server can push updates to clients the moment something changes — without clients having to ask.

---

**Q: How does Nibbli handle concurrency — multiple users acting at the same time?**

A: Node.js uses an event loop that processes one operation at a time, so concurrent socket events are queued and handled sequentially. This prevents data corruption without requiring database transactions or locks. The in-memory store is always updated before the broadcast goes out, ensuring all clients receive consistent data. In practice, if Kia and Kaye create tasks simultaneously, both tasks are created correctly and broadcast to everyone.

---

**Q: Where is the data stored in Nibbli?**

A: All data is stored in-memory on the server, as plain JavaScript objects in `store.js`. This includes tasks, chat messages, activity logs, and online user information. There is no database. This is intentional for simplicity — the project is designed to run locally for a small team. The trade-off is that data is lost when the server restarts.

---

**Q: What is Socket.IO and why did you use it instead of plain WebSockets?**

A: Socket.IO is a library built on top of WebSockets that adds extra features: automatic reconnection when connection drops, named events (like `task:create`) instead of raw data, and the room concept for grouping connected users. Plain WebSockets work but require you to build all of these features manually. Socket.IO is the practical choice for a real-time collaborative app because it handles edge cases like dropped connections automatically.

---

**Q: What is a Socket.IO "room" and how does Nibbli use it?**

A: A Socket.IO room is a named group of socket connections. When you broadcast to a room, only users in that room receive the message. In Nibbli, each workspace (Thesis Team, Finals Project, Study Group) is a Socket.IO room. When Kia creates a task in Thesis Team, only users in that room get the `task:created` event. Users in Finals Project see nothing. This provides workspace isolation without any complex filtering logic.

---

**Q: How does Nibbli know when a user goes offline?**

A: Socket.IO fires a built-in `disconnect` event on the server when a browser tab closes or the connection drops. The `socketHandlers.js` listens for this event, removes the user from the in-memory store, and broadcasts an updated user list to everyone in their room. This happens automatically — no heartbeat or ping mechanism needed.

---

**Q: What happens if two users try to move the same task at the exact same time?**

A: Node.js processes events sequentially through its event loop, so even if both events arrive nearly simultaneously, one is processed first and one is processed second. The last one to be processed "wins" — its resulting state is what gets broadcast to everyone. This is called "last-write-wins" conflict resolution. It's the simplest approach and is acceptable for this use case.

---

**Q: How does the typing indicator work technically?**

A: When a user types in the chat input, the frontend emits `chat:typing` to the server on every keystroke (along with starting a 2.5-second debounce timer). The server adds that user's name to a Set of typing users for the room and broadcasts the updated list to everyone else. When the debounce timer fires (2.5 seconds of no typing), the frontend emits `chat:stopTyping`, and the server removes the user from the typing set and broadcasts again. This ensures the indicator always disappears, even if a user closes their browser mid-typing.

---

**Q: Why did you choose in-memory storage instead of a database?**

A: For three reasons: simplicity (no database setup or configuration required), speed (in-memory reads/writes are orders of magnitude faster than database queries), and beginner-friendliness (the entire data layer is readable plain JavaScript objects). The trade-off — losing data on server restart — is acceptable for a locally-run academic project designed for a small team.

---

**Q: How does the drag-and-drop connect to real-time synchronization?**

A: The drag-and-drop uses the `@dnd-kit` library purely for the UI interaction (the visual dragging, the hover highlighting, the floating overlay). When you drop a card on a new column, `@dnd-kit` fires an `onDragEnd` callback with the task ID and destination. Nibbli then emits a `task:move` event to the server via Socket.IO. The server updates the task's status and broadcasts `task:moved` to everyone in the room. The drag-and-drop is local UI; the synchronization is Socket.IO.

---

**Q: Can Nibbli scale to more users?**

A: In its current form, Nibbli is designed for small teams (3-4 users). The in-memory storage and single-server architecture are limiting factors. To scale, you could: add a database (PostgreSQL) for persistence, use Redis for shared in-memory state across multiple server instances, and load-balance connections. However, for the scope of this project — a local academic demonstration — the current architecture is appropriate, functional, and clearly demonstrates distributed systems concepts.

---

**Q: Explain the flow of data from a user action to all connected browsers.**

A: The flow has five stages. First, the user interacts with a React component (e.g., clicks "Add task"). Second, the component calls an action from `useNibbli.js`, which emits a Socket.IO event to the server (e.g., `task:create`). Third, `socketHandlers.js` on the server receives the event, calls `store.js` functions to update the shared state. Fourth, the handler broadcasts a result event to all clients in the room (e.g., `task:created`). Fifth, every browser's `useNibbli.js` receives the event, calls a React state setter, React re-renders the relevant component, and the user sees the change. Total time: typically under 100 milliseconds.

---

# 10. Common Beginner Confusions

---

**"I don't understand how the frontend and backend talk to each other."**

Think of it like two people using walkie-talkies. The frontend (your browser) and the backend (the server) both have a Socket.IO "radio." They agree on channel names (event names like `task:create`). When the frontend wants to tell the backend something, it broadcasts on that channel. The backend is always listening and responds by broadcasting on another channel (like `task:created`). Both sides hear immediately.

---

**"Why do we need a backend at all? Can't the browsers just talk to each other?"**

Browsers can't connect to each other directly for security reasons (firewalls, no open ports). Even if they could, there'd be no single authority — if Kia and Kaye both update a task simultaneously, whose version wins? The server acts as the referee and the shared memory. It receives all changes, applies them, and tells everyone the result. Without a server, there's no synchronization.

---

**"What's the difference between React state and the server's data?"**

The server's data (in `store.js`) is the **truth**. React state (in `useNibbli.js`) is your browser's **current copy** of that truth. When you join a room, the server sends you a full copy. From then on, events keep your copy updated. If your browser crashes and you reconnect, you get a fresh copy from the server. The server is always authoritative.

---

**"Why does the frontend emit `task:create` but listen for `task:created`?"**

Convention and clarity. `task:create` is a **command** — "please create this task." `task:created` is a **notification** — "a task has been created." The server only broadcasts `task:created` after it has successfully saved the task. This means the broadcast is confirmation that the action succeeded. It also means you hear about task creations from other users through the same event — no special handling needed.

---

**"What is `useEffect` and why is it used in `useNibbli.js`?"**

`useEffect` runs code after React renders a component, and can also set up and clean up side effects like event listeners. In `useNibbli.js`, `useEffect` registers all the `socket.on()` listeners when the component first mounts, and the cleanup function removes them when it unmounts. Without cleanup, you'd add duplicate listeners every time the component re-rendered, which would cause bugs like messages appearing multiple times.

---

**"What does `io.to(roomId).emit()` vs `socket.emit()` mean?"**

`socket.emit()` = send to **one specific user** (the one whose socket this is).
`io.to(roomId).emit()` = send to **everyone in a room** (all users who have joined that room).
`socket.to(roomId).emit()` = send to **everyone in the room EXCEPT the sender**.

Nibbli uses all three: the room state snapshot goes only to the joining user (`socket.emit`), task updates go to everyone (`io.to`), and typing indicators go to everyone except the typist (`socket.to`).

---

**"Why does joining a room clear all the state?"**

When you switch rooms, the tasks, messages, and users you were seeing belong to the old room. They're no longer relevant. Clearing them immediately (`setTasks([])`, `setMessages([])`, etc.) prevents you from briefly seeing the wrong room's data while the server is sending the new room's state. It's a UX choice: show nothing briefly rather than show wrong data briefly.

---

**"What is CORS and why is it configured?"**

CORS (Cross-Origin Resource Sharing) is a browser security feature. By default, browsers block requests from one origin (like `localhost:5173`) to a different origin (like `localhost:3001`) unless the server explicitly allows it. The `cors` configuration in `server.js` tells the browser: "yes, requests from `localhost:5173` are allowed." Without this, the Socket.IO connection would be blocked by the browser and nothing would work.

---

# 11. How Everything Connects Together

Here is the complete mental model of Nibbli, from top to bottom.

## The System in One Paragraph

When you run Nibbli, two servers start: the **frontend** (Vite at port 5173, serving the React app) and the **backend** (Node.js at port 3001, running Socket.IO). When you open a browser, React renders the app and `SocketContext.jsx` opens a persistent WebSocket connection to port 3001. After you enter your name, a `user:join` event registers you with the server. When you pick a room, a `room:join` event subscribes your socket to that room's broadcast group, and the server responds with a full snapshot of the room's current state. From that point on, every action you take emits an event to the server, the server processes it, updates its in-memory state, and broadcasts the result to everyone in your room — instantly. React receives those broadcasts, updates state, and re-renders the relevant components. The UI always reflects what's on the server, and what's on the server reflects what everyone is doing.

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
              │     └── emits: room:join               store.js
              │                                             │
              ├── JoinScreen.jsx                       uuid.js
              └── Workspace.jsx
                    ├── Sidebar.jsx        ← reads: rooms, onlineUsers
                    ├── ChatPanel.jsx      ← reads: messages, typingUsers
                    ├── KanbanBoard.jsx    ← reads: tasks, editingMap
                    │     ├── KanbanColumn.jsx
                    │     └── TaskCard.jsx
                    ├── ActivityFeed.jsx   ← reads: activities
                    └── ConnectionBadge.jsx ← reads: connected (from SocketContext)
```

## The Three Loops That Make Nibbli Work

**Loop 1 — Action Loop (you do something):**
Your interaction → React component → useNibbli action → `socket.emit` → server → store update → server broadcast → your `useNibbli` listener → React state update → UI re-render

**Loop 2 — Presence Loop (someone joins/leaves):**
Browser connects/disconnects → server detects → updates onlineUsers in store → broadcasts `users:update` → all browsers' `useNibbli` updates onlineUsers state → Sidebar re-renders with new list

**Loop 3 — Sync Loop (you join a room):**
`room:join` emitted → server sends full `room:state` snapshot → `useNibbli` sets all state at once → React renders entire board, chat, and activity feed populated with current data

These three loops cover every interaction in the app. **Everything Nibbli does is one of these three loops.**

---

## Final Summary: Why This Project Matters

Nibbli is a practical demonstration that distributed systems don't have to be complex. With just:
- One Node.js server
- A simple in-memory store
- Socket.IO events
- A React frontend
