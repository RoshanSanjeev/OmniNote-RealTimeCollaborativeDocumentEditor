import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const socket = new WebSocket('ws://localhost:3001/ws');

function App() {
  const editorRef = useRef(null);
  const [content, setContent] = useState('');
  const [users, setUsers] = useState({});
  const [history, setHistory] = useState([]);
  const [userId, setUserId] = useState('');
  const [userColor, setUserColor] = useState('');

  useEffect(() => {
    socket.onopen = () => console.log('WebSocket connected');

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === 'init') {
        setUserId(msg.userId);
        setUserColor(msg.userColor);
        setContent(msg.content);
        setUsers(msg.users);
        setHistory(msg.versionHistory);
      }

      if (msg.type === 'content_update') {
        setContent(msg.content);
        if (editorRef.current) {
          editorRef.current.innerHTML = msg.content;
        }
      }

      if (msg.type === 'user_joined') {
        setUsers(prev => ({ ...prev, [msg.userId]: { color: msg.color } }));
      }

      if (msg.type === 'user_left') {
        setUsers(prev => {
          const updated = { ...prev };
          delete updated[msg.userId];
          return updated;
        });
      }
    };
  }, []);

  const handleInput = () => {
    const updatedContent = editorRef.current.innerHTML;
    socket.send(JSON.stringify({ type: 'content_change', content: updatedContent }));
  };

  const formatText = (command) => {
    document.execCommand(command, false, null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📄 OmniNote</h1>
        <div className="status-bar">
          <span className="status-text">Connected Users: {Object.keys(users).length}</span>
        </div>
      </header>

      <div className="toolbar">
        <button onClick={() => formatText('bold')}><b>B</b></button>
        <button onClick={() => formatText('italic')}><i>I</i></button>
        <button onClick={() => formatText('underline')}><u>U</u></button>
      </div>

      <main className="main-content">
        <section className="editor" ref={editorRef} contentEditable suppressContentEditableWarning onInput={handleInput} dangerouslySetInnerHTML={{ __html: content }}></section>

        <aside className="sidebar">
          <div className="users-box">
            <h3>👥 Users</h3>
            <ul>
              {Object.entries(users).map(([uid, val]) => (
                <li key={uid} style={{ color: val.color }}>
                  {uid === userId ? 'You' : `User ${uid.substring(0, 5)}`}
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
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
