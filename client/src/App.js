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
    <div className="container">
      <header>
        <h2>Document: Meeting Notes</h2>
        <span>Connected Users ({Object.keys(users).length})</span>
      </header>

      <div className="toolbar">
        <button onClick={() => formatText('bold')}>Bold</button>
        <button onClick={() => formatText('italic')}>Italic</button>
        <button onClick={() => formatText('underline')}>Underline</button>
      </div>

      <div className="editor-area">
        <div
          className="editor"
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          dangerouslySetInnerHTML={{ __html: content }}
        ></div>

        <div className="sidebar">
          <h4>Connected Users</h4>
          <ul>
            {Object.entries(users).map(([uid, val]) => (
              <li key={uid} style={{ color: val.color }}>
                {uid === userId ? 'You' : `User: ${uid.substring(0, 5)}`}
              </li>
            ))}
          </ul>

          <h4>Document History</h4>
          <ul>
            {history.map((entry, idx) => (
              <li key={idx}>
                {entry.timestamp?.slice(11, 16)} - {entry.userId?.substring(0, 5)} edited
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
