// useNibbli.js — all real-time board + chat state in one hook
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

export function useNibbli() {
  const { socket } = useSocket();

  const [user,         setUser]         = useState(null);
  const [rooms,        setRooms]        = useState([]);
  const [currentRoom,  setCurrentRoom]  = useState(null);
  const [tasks,        setTasks]        = useState([]);
  const [activities,   setActivities]   = useState([]);
  const [onlineUsers,  setOnlineUsers]  = useState([]);
  const [editingMap,   setEditingMap]   = useState({});
  const [joined,       setJoined]       = useState(false);
  // ── Chat state ─────────────────────────────────────────────────────────────
  const [messages,     setMessages]     = useState([]);   // chat messages for current room
  const [typingUsers,  setTypingUsers]  = useState([]);   // names of people typing

  // Typing debounce timer ref — cleared on every keystroke, fires stopTyping after 2s idle
  const typingTimerRef = useRef(null);

  // ── Listen for server events ──────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.on('user:joined', ({ user: u, rooms: r }) => {
      setUser(u);
      setRooms(r);
      setJoined(true);
    });

    socket.on('room:state', ({ tasks: t, activities: a, users: u, messages: m }) => {
      setTasks(t);
      setActivities(a);
      setOnlineUsers(u);
      setMessages(m || []);
      setTypingUsers([]);
    });

    socket.on('users:update',   (users) => setOnlineUsers(users));

    socket.on('task:created',   (task) => {
      setTasks(prev => [...prev, task]);
    });
    socket.on('task:moved',     ({ taskId, newStatus }) => {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    });
    socket.on('task:deleted',   ({ taskId }) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    });
    socket.on('activity:new',   (entry) => {
      setActivities(prev => [entry, ...prev].slice(0, 50));
    });
    socket.on('task:editingUpdate', ({ taskId, userName }) => {
      setEditingMap(prev => {
        const next = { ...prev };
        if (userName) next[taskId] = userName;
        else          delete next[taskId];
        return next;
      });
    });

    // ── Chat events ────────────────────────────────────────────────────────
    socket.on('chat:message', (msg) => {
      setMessages(prev => [...prev, msg].slice(-200));
    });

    socket.on('chat:typing', (names) => {
      setTypingUsers(names);
    });

    return () => {
      socket.off('user:joined');
      socket.off('room:state');
      socket.off('users:update');
      socket.off('task:created');
      socket.off('task:moved');
      socket.off('task:deleted');
      socket.off('activity:new');
      socket.off('task:editingUpdate');
      socket.off('chat:message');
      socket.off('chat:typing');
    };
  }, [socket]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const joinApp = useCallback((name) => {
    if (!socket || !name.trim()) return;
    socket.emit('user:join', { name: name.trim() });
  }, [socket]);

  const joinRoom = useCallback((roomId) => {
    if (!socket) return;
    socket.emit('room:join', { roomId });
    setCurrentRoom(roomId);
    setTasks([]);
    setActivities([]);
    setOnlineUsers([]);
    setEditingMap({});
    setMessages([]);
    setTypingUsers([]);
  }, [socket]);

  const createTask = useCallback((title) => {
    if (!socket || !currentRoom || !title.trim()) return;
    socket.emit('task:create', { roomId: currentRoom, title });
  }, [socket, currentRoom]);

  const moveTask = useCallback((taskId, newStatus) => {
    if (!socket || !currentRoom) return;
    socket.emit('task:move', { roomId: currentRoom, taskId, newStatus });
  }, [socket, currentRoom]);

  const deleteTask = useCallback((taskId) => {
    if (!socket || !currentRoom) return;
    socket.emit('task:delete', { roomId: currentRoom, taskId });
  }, [socket, currentRoom]);

  const startEditing = useCallback((taskId) => {
    if (!socket || !currentRoom) return;
    socket.emit('task:editing', { roomId: currentRoom, taskId });
  }, [socket, currentRoom]);

  const stopEditing = useCallback((taskId) => {
    if (!socket || !currentRoom) return;
    socket.emit('task:editingStop', { roomId: currentRoom, taskId });
  }, [socket, currentRoom]);

  // ── Chat actions ───────────────────────────────────────────────────────────
  const sendMessage = useCallback((text) => {
    if (!socket || !currentRoom || !text.trim()) return;
    // Clear any pending typing timer and stop the indicator
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    socket.emit('chat:stopTyping', { roomId: currentRoom });
    socket.emit('chat:send', { roomId: currentRoom, text });
  }, [socket, currentRoom]);

  const notifyTyping = useCallback(() => {
    if (!socket || !currentRoom) return;
    socket.emit('chat:typing', { roomId: currentRoom });
    // Auto-stop after 2.5s of no keystrokes
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('chat:stopTyping', { roomId: currentRoom });
    }, 2500);
  }, [socket, currentRoom]);

  return {
    user, rooms, currentRoom, tasks,
    activities, onlineUsers, editingMap, joined,
    messages, typingUsers,
    joinApp, joinRoom, createTask, moveTask, deleteTask,
    startEditing, stopEditing,
    sendMessage, notifyTyping,
  };
}
