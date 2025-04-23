import React, { useState } from 'react';
import './LandingPage.css';

function LandingPage({ onEnter }) {
  const [name, setName] = useState('');

  const handleEnter = () => {
    if (name.trim() === '') return alert('Please enter your name!');
    onEnter(name);
  };

  return (
    <div className="landing-container">
      <div className="landing-card">
        <h1>📄 OmniNote</h1>
        <p>Collaborate in real-time with your team.</p>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleEnter}>Enter Editor</button>
      </div>
    </div>
  );
}

export default LandingPage;
