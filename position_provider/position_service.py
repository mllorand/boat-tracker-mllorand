import eventlet
import pandas
import itertools
import socketio
print('hello')

sio = socketio.Server(cors_allowed_origins="*", async_mode='eventlet')
app = socketio.WSGIApp(sio)


@sio.event
def connect(sid, environ):
    print(sid, 'connected')


@sio.event
def disconnect(sid):
    print(sid, 'disconnected')


if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 8000)), app)
