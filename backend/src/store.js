// store.js — In-memory data store (our "database")
// Simple plain objects and arrays. No external DB needed.

const { v4: uuidv4 } = require('./uuid');

// ─── Initial workspace seeds ───────────────────────────────────────────────
const INITIAL_ROOMS = [
  { id: 'room-thesis',  name: 'Thesis Team',    emoji: '📚' },
  { id: 'room-finals',  name: 'Finals Project', emoji: '🎓' },
  { id: 'room-study',   name: 'Study Group',    emoji: '✏️'  },
];

// rooms[roomId] = { tasks: [], activities: [], messages: [] }
const rooms = {};

INITIAL_ROOMS.forEach(r => {
  rooms[r.id] = { tasks: [], activities: [], messages: [] };
});

// onlineUsers[socketId] = { id, name, roomId, color }
const onlineUsers = {};

// editingUsers[taskId] = { userId, userName }
const editingUsers = {};

// typingUsers[roomId] = Set of userNames currently typing
const typingUsers = {};

// ─── User colors (assigned round-robin) ────────────────────────────────────
const USER_COLORS = [
  '#C4B5FD', // pastel purple
  '#FBCFE8', // pastel pink
  '#FDE68A', // pastel yellow
  '#BAE6FD', // pastel blue
  '#A7F3D0', // pastel green
  '#FED7AA', // pastel orange
];
let colorIndex = 0;

function nextColor() {
  const c = USER_COLORS[colorIndex % USER_COLORS.length];
  colorIndex++;
  return c;
}

// ─── Store API ──────────────────────────────────────────────────────────────

function addUser(socketId, name) {
  onlineUsers[socketId] = {
    id: socketId,
    name,
    roomId: null,
    color: nextColor(),
  };
  return onlineUsers[socketId];
}

function removeUser(socketId) {
  const user = onlineUsers[socketId];
  delete onlineUsers[socketId];
  // clean up any editing state
  for (const taskId in editingUsers) {
    if (editingUsers[taskId] && editingUsers[taskId].userId === socketId) {
      delete editingUsers[taskId];
    }
  }
  // clean up typing state
  if (user && user.roomId) {
    stopTyping(user.roomId, user.name);
  }
  return user;
}

function getUser(socketId) {
  return onlineUsers[socketId] || null;
}

function setUserRoom(socketId, roomId) {
  if (onlineUsers[socketId]) {
    onlineUsers[socketId].roomId = roomId;
  }
}

function getUsersInRoom(roomId) {
  return Object.values(onlineUsers).filter(u => u.roomId === roomId);
}

function getAllRooms() {
  return INITIAL_ROOMS;
}

function getRoom(roomId) {
  return rooms[roomId] || null;
}

function getTasks(roomId) {
  return rooms[roomId] ? rooms[roomId].tasks : [];
}

function createTask(roomId, title, userName) {
  const task = {
    id: uuidv4(),
    title,
    status: 'todo',   // 'todo' | 'doing' | 'done'
    createdBy: userName,
    createdAt: Date.now(),
  };
  rooms[roomId].tasks.push(task);
  addActivity(roomId, `${userName} created "${title}"`);
  return task;
}

function moveTask(roomId, taskId, newStatus, userName) {
  const room = rooms[roomId];
  if (!room) return null;
  const task = room.tasks.find(t => t.id === taskId);
  if (!task) return null;
  task.status = newStatus;
  const label = { todo: 'To Do', doing: 'Doing', done: 'Done' };
  addActivity(roomId, `${userName} moved "${task.title}" to ${label[newStatus] || newStatus}`);
  return task;
}

function deleteTask(roomId, taskId, userName) {
  const room = rooms[roomId];
  if (!room) return null;
  const idx = room.tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return null;
  const [task] = room.tasks.splice(idx, 1);
  addActivity(roomId, `${userName} deleted "${task.title}"`);
  return task;
}

function addActivity(roomId, message) {
  if (!rooms[roomId]) return;
  const entry = { id: uuidv4(), message, timestamp: Date.now() };
  rooms[roomId].activities.unshift(entry);
  if (rooms[roomId].activities.length > 50) {
    rooms[roomId].activities.length = 50;
  }
  return entry;
}

function getActivities(roomId) {
  return rooms[roomId] ? rooms[roomId].activities : [];
}

// ─── Chat ──────────────────────────────────────────────────────────────────

function addMessage(roomId, user, text) {
  if (!rooms[roomId]) return null;
  const msg = {
    id:        uuidv4(),
    userId:    user.id,
    userName:  user.name,
    userColor: user.color,
    text:      text.trim(),
    timestamp: Date.now(),
  };
  rooms[roomId].messages.push(msg);
  // keep last 200 messages
  if (rooms[roomId].messages.length > 200) {
    rooms[roomId].messages.shift();
  }
  return msg;
}

function getMessages(roomId) {
  return rooms[roomId] ? rooms[roomId].messages : [];
}

// ─── Typing indicators ─────────────────────────────────────────────────────

function startTyping(roomId, userName) {
  if (!typingUsers[roomId]) typingUsers[roomId] = new Set();
  typingUsers[roomId].add(userName);
}

function stopTyping(roomId, userName) {
  if (typingUsers[roomId]) {
    typingUsers[roomId].delete(userName);
  }
}

function getTypingUsers(roomId) {
  return typingUsers[roomId] ? [...typingUsers[roomId]] : [];
}

// ─── Task editing ──────────────────────────────────────────────────────────

function setEditing(taskId, socketId, userName) {
  editingUsers[taskId] = { userId: socketId, userName };
}

function clearEditing(socketId) {
  for (const taskId in editingUsers) {
    if (editingUsers[taskId] && editingUsers[taskId].userId === socketId) {
      const taskId2 = taskId;
      delete editingUsers[taskId];
      return taskId2;
    }
  }
  return null;
}

function getEditing(taskId) {
  return editingUsers[taskId] || null;
}

module.exports = {
  addUser, removeUser, getUser, setUserRoom,
  getUsersInRoom, getAllRooms, getRoom,
  getTasks, createTask, moveTask, deleteTask,
  addActivity, getActivities,
  addMessage, getMessages,
  startTyping, stopTyping, getTypingUsers,
  setEditing, clearEditing, getEditing,
};
