// LandingPage.js
import React, { useState } from 'react';
import './LandingPage.css';

function LandingPage({ onEnter }) {
  const [name, setName] = useState('');

  return (
    <div className="landing-container">
      <div className="landing-card">
        <h1>Welcome to OmniNote</h1>
        <p>Start collaborating in real time. Enter your name to begin:</p>
        <input
          type="text"
          placeholder="Enter your name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={() => onEnter(name)}>Join</button>
      </div>
    </div>
  );
}

export default LandingPage;
