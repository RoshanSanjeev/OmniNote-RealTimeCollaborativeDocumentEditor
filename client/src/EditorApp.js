import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const socket = new WebSocket('ws://localhost:3001/ws');

function EditorApp({ username }) {
  const editorRef = useRef(null);
  const [content, setContent] = useState('');
  const [users, setUsers] = useState({});
  const [history, setHistory] = useState([]);
  const [userId, setUserId] = useState('');
  const [userColor, setUserColor] = useState('');
  const [notification, setNotification] = useState('');

  useEffect(() => {
    socket.onopen = () => {
      console.log('WebSocket connected');
      socket.send(JSON.stringify({ type: 'register_name', name: username }));
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === 'init') {
        setUserId(msg.userId);
        setUserColor(msg.userColor);
        setContent(msg.content);
        setUsers(msg.users);
        setHistory(msg.versionHistory);
        if (editorRef.current) editorRef.current.innerHTML = msg.content;
      }

      if (msg.type === 'content_update') {
        setContent(msg.content);
        if (editorRef.current && editorRef.current.innerHTML !== msg.content) {
          editorRef.current.innerHTML = msg.content;
        }
      }

      if (msg.type === 'user_joined') {
        setUsers(prev => ({ ...prev, [msg.userId]: { color: msg.color, name: msg.name || "Unnamed" } }));
        setNotification(`🟢 ${msg.name || 'User'} joined`);
        setTimeout(() => setNotification(''), 3000);
      }

      if (msg.type === 'user_left') {
        setUsers(prev => {
          const updated = { ...prev };
          delete updated[msg.userId];
          return updated;
        });
        setNotification(`🔴 User ${msg.userId.slice(0, 5)} left`);
        setTimeout(() => setNotification(''), 3000);
      }

      if (msg.type === 'cursor_update' && msg.userId !== userId) {
        console.log(`Cursor from ${msg.userId}: offset ${msg.cursor.offset}`);
      }
    };
  }, [username]);

  const handleInput = () => {
    const updatedContent = editorRef.current.innerHTML;
    socket.send(JSON.stringify({ type: 'content_change', content: updatedContent }));

    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const offset = range.startOffset;

    socket.send(JSON.stringify({
      type: 'cursor_update',
      cursor: {
        offset,
        color: userColor
      }
    }));
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const revertToVersion = (content) => {
    editorRef.current.innerHTML = content;
    socket.send(JSON.stringify({ type: 'content_change', content }));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📄 OmniNote</h1>
        <div className="status-bar">
          <span className="status-text">Connected Users: {Object.keys(users).length}</span>
        </div>
      </header>

      {notification && <div className="toast">{notification}</div>}

      <div className="toolbar">
        <button onClick={() => formatText('bold')}><b>B</b></button>
        <button onClick={() => formatText('italic')}><i>I</i></button>
        <button onClick={() => formatText('underline')}><u>U</u></button>
        <button onClick={() => formatText('formatBlock', 'h2')}>H2</button>
        <button onClick={() => formatText('insertUnorderedList')}>• List</button>
        <button onClick={() => formatText('insertOrderedList')}>1. List</button>
      </div>

      <main className="main-content">
        <section
          className="editor"
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          dangerouslySetInnerHTML={{ __html: content }}
        ></section>

        <aside className="sidebar">
          <div className="users-box">
            <h3>👥 Users</h3>
            <ul>
              {Object.entries(users).map(([uid, val]) => (
                <li key={uid} style={{ color: val.color }}>
                  {uid === userId ? `${username} (You)` : val.name || `User ${uid.substring(0, 5)}`}
                </li>
              ))}
            </ul>
          </div>

          <div className="history-box">
            <h3>📜 History</h3>
            <ul>
              {history.map((entry, idx) => (
                <li key={idx}>
                  {entry.timestamp?.slice(11, 16)} - {entry.userId?.substring(0, 5)} edited
                  <button onClick={() => revertToVersion(entry.content)}>⏪</button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default EditorApp;
