// EditorApp.js
import React, { useEffect, useRef, useState } from 'react';
import './App.css';

function EditorApp({ username }) {
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const [content, setContent] = useState('');
  const [users, setUsers] = useState({});
  const [userId, setUserId] = useState('');
  const [userColor, setUserColor] = useState('');
  const [cursorMap, setCursorMap] = useState({});
  const [history, setHistory] = useState([]);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001/ws');
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'register_name', name: username }));
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log('[RECEIVED]', msg);

      switch (msg.type) {
        case 'init':
          setUserId(msg.userId);
          setUserColor(msg.userColor);
          setContent(msg.content);
          setUsers(msg.users);
          setHistory(msg.versionHistory);
          if (editorRef.current) editorRef.current.innerHTML = msg.content;
          break;

        case 'user_joined':
          setUsers(prev => ({ ...prev, [msg.userId]: { name: msg.name, color: msg.color } }));
          setNotification(`${msg.name} joined`);
          break;

        case 'user_left':
          setUsers(prev => {
            const updated = { ...prev };
            delete updated[msg.userId];
            return updated;
          });
          setNotification(`A user left`);
          break;

        case 'content_update':
          setContent(msg.content);
          if (editorRef.current) editorRef.current.innerHTML = msg.content;
          break;

        case 'history_update':
          setHistory(msg.versionHistory);
          break;

        case 'cursor_update':
          setCursorMap(prev => ({
            ...prev,
            [msg.userId]: {
              offset: msg.cursor.offset,
              color: msg.cursor.color,
              name: msg.cursor.name
            }
          }));
          break;

        default:
          console.warn('Unknown message type:', msg);
      }
    };

    return () => socket.close();
  }, [username]);

  const handleInput = () => {
    const newContent = editorRef.current.innerHTML;
    setContent(newContent);
    socketRef.current?.send(JSON.stringify({ type: 'content_change', content: newContent }));

    sendCursorUpdate();
  };

  const sendCursorUpdate = () => {
    const selection = window.getSelection();
    const offset = selection?.anchorOffset || 0;
    socketRef.current?.send(JSON.stringify({
      type: 'cursor_update',
      cursor: {
        offset,
        color: userColor,
        name: username
      }
    }));
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    sendCursorUpdate();
  };

  const revertToVersion = (html) => {
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
      socketRef.current?.send(JSON.stringify({ type: 'content_change', content: html }));
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📄 OmniNote</h1>
        <div className="status-bar">Connected Users: {Object.keys(users).length}</div>
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
          ref={editorRef}
          className="editor"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        <aside className="sidebar">
          <div className="users-box">
            <h3>👥 Users</h3>
            <ul>
              {Object.entries(users).map(([id, val]) => (
                <li key={id} style={{ color: val.color }}>
                  {id === userId ? `${val.name} (You)` : val.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="history-box">
            <h3>📜 History</h3>
            <ul>
              {history.map((h, i) => (
                <li key={i}>
                  {h.timestamp?.slice(11, 16)} - {h.userId?.slice(0, 5)} edited
                  <button onClick={() => revertToVersion(h.content)}>⏪</button>
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
