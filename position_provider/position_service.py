import eventlet
import pandas
import itertools
import socketio
print('hello')

sio = socketio.Server(cors_allowed_origins="*", async_mode='eventlet')
app = socketio.WSGIApp(sio)


