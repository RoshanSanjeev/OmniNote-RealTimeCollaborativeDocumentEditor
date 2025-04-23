from flask import Flask, request
from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler
from ws_handler import handle_websocket

app = Flask(__name__)

@app.route('/')
def index():
    return "WebSocket Server is running."

@app.route('/ws')
def websocket_handler():
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        handle_websocket(ws)
    return ''

if __name__ == '__main__':
    print("✅ Flask WebSocket server running on ws://localhost:3001/ws")
    server = pywsgi.WSGIServer(('', 3001), app, handler_class=WebSocketHandler)
    server.serve_forever()
