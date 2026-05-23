// App.jsx — root component, wires all pieces together
import React from 'react';
import { SocketProvider } from './context/SocketContext';
import { useNibbli }      from './hooks/useNibbli';
import JoinScreen          from './components/JoinScreen';
import Workspace           from './components/Workspace';

function NibbliApp() {
  const {
    user, rooms, currentRoom, tasks,
    activities, onlineUsers, editingMap, joined,
    messages, typingUsers,
    joinApp, joinRoom, createTask, moveTask, deleteTask,
    sendMessage, notifyTyping,
  } = useNibbli();

  if (!joined) {
    return <JoinScreen onJoin={joinApp} />;
  }

  return (
    <Workspace
      user={user}
      rooms={rooms}
      currentRoom={currentRoom}
      tasks={tasks}
      activities={activities}
      onlineUsers={onlineUsers}
      editingMap={editingMap}
      messages={messages}
      typingUsers={typingUsers}
      onRoomSelect={joinRoom}
      onCreateTask={createTask}
      onMoveTask={moveTask}
      onDeleteTask={deleteTask}
      onSendMessage={sendMessage}
      onTyping={notifyTyping}
    />
  );
}

export default function App() {
  return (
    <SocketProvider>
      <NibbliApp />
    </SocketProvider>
  );
}
