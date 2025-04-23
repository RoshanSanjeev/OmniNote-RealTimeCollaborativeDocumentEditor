import json
import uuid

# In-memory storage
document_content = ""
version_history = []
clients = {}          # user_id: websocket
user_names = {}       # user_id: username
user_colors = {}      # user_id: color

def handle_websocket(ws):
    global document_content  # ✅ Declare ONCE, at the top

    user_id = str(uuid.uuid4())
    user_color = "#%06x" % (int(user_id[:6], 16) % 0xFFFFFF)

    clients[user_id] = ws
    user_colors[user_id] = user_color

    print(f"🟢 New WebSocket connected: {user_id}")

    try:
        while True:
            message = ws.receive()
            if message is None:
                break

            data = json.loads(message)
            print(f"📩 Received from {user_id}: {data}")

            # Handle name registration
            if data["type"] == "register_name":
                username = data.get("name", "Anonymous")
                user_names[user_id] = username

                # Send init message to this client
                ws.send(json.dumps({
                    "type": "init",
                    "userId": user_id,
                    "userColor": user_color,
                    "content": document_content,
                    "users": {
                        uid: {
                            "color": user_colors[uid],
                            "name": user_names.get(uid, "Anonymous")
                        } for uid in clients
                    },
                    "versionHistory": version_history
                }))

                # Notify others about new user
                broadcast({
                    "type": "user_joined",
                    "userId": user_id,
                    "color": user_color,
                    "name": username
                }, exclude=ws)
                continue

            # Handle content change
            if data["type"] == "content_change":
                document_content = data["content"]

                version_history.append({
                    "timestamp": data.get("timestamp"),
                    "userId": user_id,
                    "content": document_content
                })

                broadcast({
                    "type": "content_update",
                    "content": document_content,
                    "userId": user_id
                })

            # Handle cursor update
            elif data["type"] == "cursor_update":
                broadcast({
                    "type": "cursor_update",
                    "userId": user_id,
                    "cursor": data["cursor"]
                }, exclude=ws)

    except Exception as e:
        print("❌ WebSocket error:", e)

    finally:
        print(f"🔴 User disconnected: {user_id}")
        clients.pop(user_id, None)
        user_names.pop(user_id, None)
        user_colors.pop(user_id, None)

        broadcast({
            "type": "user_left",
            "userId": user_id
        })

def broadcast(message, exclude=None):
    disconnected = []
    for uid, ws in clients.items():
        if ws == exclude:
            continue
        try:
            ws.send(json.dumps(message))
        except Exception:
            disconnected.append(uid)

    for uid in disconnected:
        clients.pop(uid, None)
        user_names.pop(uid, None)
        user_colors.pop(uid, None)
