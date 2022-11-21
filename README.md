# boat-tracker-mllorand
This is a homework assignment from Norbit Hungary for applicants of a Web Developer role.

The task description as sent by Marton Koczor:

The scope of this task is to expose you to similar challenges as the ones you'll face in our environment.

Create a simple mock application which streams boat position data to connected clients over WebSocket protocol in JSON format. Position data sample records are given by Norbit in csv format (latitude, longitude, heading). The program may terminate at the end of the record. Data shall be streamed at 1 Hz rate. Feel free to use any programming language.

Set up a PostgreSQL database to store boat position and any other necessary data. Create stored procedures to be able to save data and views to retrieve data.

Implement an express.js server application which connects to the mock application and listens to boat position data. The server is the only application which can interact with the database. The server shall support handling any number of clients and update their states over socket.io in real time.

Create a client application based on OpenLayers to display real time position of the boat on a map view. Use any simple symbol to visualize the boat e.g., an acute isosceles triangle. Also reflect the heading direction when displaying the symbol. Offer the possibility of recording a track by a start/stop button. During ongoing recording, display the track in red color by simply connecting the position samples with straight lines. Synchronize the state of start/stop button and the display of the currently recorded track between clients. Consider newly connected clients during a recording. Start/stop actions can be initiated from any of the clients. Implement a list of all previously recorded tracks ordered and named by start time. The user can select any single track from the list and activate visualization on the map in black color. Feel free to utilize any component-based font-end framework. It is a plus if Vue.js is selected.


My solution:

Position provider:
A simple position service streaming the next position for each line every second
Written in python3, using a socket server mounting on a http server

dependencies: 
Pandas for reading csv,
Eventlet for async framework (works with coroutines)
Socketio for socket server

Server:
A simple express server to distribute the data streamed by position provider to all connected clients
via socket.io and handle the database

Db:
PostgresSQL database schema with stored procedure, function and view for persisting
recordings



