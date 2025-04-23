import React, { useState } from 'react';
import './LandingPage.css';

function LandingPage({ onEnter }) {
  const [name, setName] = useState('');

  return (
    <div className="landing-container">
      <h1>Welcome to OmniNote</h1>
      <input
        type="text"
        placeholder="Enter your name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={() => onEnter(name)}>Join</button>
    </div>
  );
}

export default LandingPage;
