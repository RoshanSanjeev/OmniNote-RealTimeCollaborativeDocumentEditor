import React, { useState } from 'react';
import LandingPage from './LandingPage';
import EditorApp from './EditorApp';

function App() {
  const [entered, setEntered] = useState(false);
  const [username, setUsername] = useState('');

  const handleEnter = (name) => {
    setUsername(name);
    setEntered(true);
  };

  return entered
    ? <EditorApp username={username} />
    : <LandingPage onEnter={handleEnter} />;
}

export default App;
