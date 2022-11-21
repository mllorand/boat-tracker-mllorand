import eventlet
import pandas
import itertools
import socketio
print('hello')

sio = socketio.Server(cors_allowed_origins="*", async_mode='eventlet')
app = socketio.WSGIApp(sio)


def iter_from_data_frame(line_data):
    return ({
        'lat': line_data['lat'][i],
        'lon': line_data['lon'][i],
        'heading': line_data['heading'][i]
    } for i in range(len(line_data))
    )


@sio.event
def connect(sid, environ):
    print(sid, 'connected')


@sio.event
def disconnect(sid):
    print(sid, 'disconnected')


if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 8000)), app)
