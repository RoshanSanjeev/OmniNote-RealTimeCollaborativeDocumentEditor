# RealTimeCollaborativeDocumentEditor
# ✨ OmniNote: Real-Time Collaborative Document Editor

Built by **Roshan Sanjeev**  
This is a real-time collaborative document editor built from scratch using **React**, **Flask**, and **native WebSockets**. It allows multiple users to edit a shared document simultaneously with live syncing, rich text formatting, user tracking, and version history — all without any external rich text or socket libraries.

---

## 🧠 Features

- **Real-time Document Editing** with native WebSocket sync (no Socket.io)
- **Rich Text Formatting** (bold, italic, underline, headers, lists)
- **Live User Presence** with names and unique colors
- **Join/Leave Notifications** with toast alerts
- **Version History** with named rollback buttons
- **In-Memory Data** (document + history resets on server restart)

---

# 📝 Real-Time Collaborative Document Editor

A Flask + React-based real-time collaborative editor that supports multiple users editing and viewing changes live. Powered by `WebSockets`, `flask-sock`, and a sleek React frontend.

---

## 🛠️ Setup Instructions

Follow these steps to run the full stack locally on your machine.

---
git clone https://github.com/your-username/RealTimeCollaborativeDocumentEditor.git
cd RealTimeCollaborativeDocumentEditor
🐍 2. Backend Setup (Flask + WebSocket)
✅ Create & activate a Python virtual environment
bash
Copy
Edit
python3 -m venv venv
source venv/bin/activate

✅ Install Python dependencies
bash
Copy
Edit
pip install --upgrade pip
pip install flask flask-sock flask-cors hypercorn
⚛️ 3. Frontend Setup (React)
bash
Copy
Edit
cd client
npm install
This installs react-scripts and other frontend dependencies

🚀 4. Run the App
🧠 Start the Flask WebSocket backend
Go to the root project folder (where app.py is located):

bash
Copy
Edit
hypercorn app:app
Replace app.py with the actual name of your server file if different

💻 Start the React frontend
In a new terminal tab:

bash
Copy
Edit
cd RealTimeCollaborativeDocumentEditor/client
npm start
💡 Notes
The WebSocket server runs on ws://localhost:3001/ws

The React frontend runs on http://localhost:3000

Multiple users can connect simultaneously in separate tabs or devices and see edits live

Socket logic is in app.py and React WebSocket client code is in EditorApp.jsx

🧪 To Test
Open the site in two browser tabs or two different machines

Enter names when prompted

Type in the editor — both users will see real-time content and cursor updates

🤝 Credits
Built with 💻 Flask, ⚛️ React, and 🔌 WebSockets



