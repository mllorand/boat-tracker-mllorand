require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors')
const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const querystring = require('querystring');
const PORT = process.env.SERVER_PORT || 4000;

const io = require("socket.io");
const clientIo = require("socket.io-client");

const distributorSocket = io(http, {
    cors: {
        origins: ['http://localhost:8080']
    }
});

const providerSocket = clientIo('http://localhost:8000');

app.use(
    bodyParser.urlencoded()
)
app.use(cors());



const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DB,
    password: process.env.DB_PW,
    port: process.env.DB_PORT,
})





let currentRecordingId = null;
let currentLine = null;
let currentReplay = null;

app.post('/start', (req, res) => {
    const { line } = req.body;
    pool.query("SELECT start_recording($1)", [line], (err, results) => {
        if (err) {
            throw err
        }
        currentRecordingId = results.rows[0].start_recording
        currentLine = line
        distributorSocket.emit('start', currentLine)
        res.status(200).send('ok')
    })
});

app.get('/stop', (req, res) => {
    currentRecordingId = null
    distributorSocket.emit('stop')
    res.status(200).send('ok')
});

app.get('/recordings', (req, res) => {
    pool.query("SELECT * from recording_list", [], (err, results) => {
        if (err) {
            throw err
        }
        res.status(200).send(JSON.stringify(results.rows))
    })
})
app.get('/saved', (req, res) => {
    pool.query("SELECT lon, lat, heading FROM point WHERE recording_id = ($1) ORDER BY insert_time DESC", [req.query.recordingId], (err, results) => {
        if (err) {
            throw err
        }
        currentReplay = JSON.parse(JSON.stringify(results.rows))
        distributorSocket.emit('replay')
        res.status(200).send('ok')
    })
})



providerSocket.on('positions', positions => {
    if (currentRecordingId) {
        let record = positions[currentLine]
        pool.query("CALL insert_point($1, $2, $3, $4)", [currentRecordingId, record.lat, record.lon, record.heading], err => {
            if (err) {
                throw err
            }
        })
    }
    if (currentReplay) {
        let replay = currentReplay.pop()
        if(replay) {
            positions["replay"] = replay
        } else {
            currentReplay = null
            distributorSocket.emit('stopreplay')
        }
    }
    distributorSocket.emit('positions', JSON.stringify(positions));
})

distributorSocket.on('connection', socket => {

    socket.on('stopreplay', () => {
        currentReplay = null
        distributorSocket.emit('stopreplay')
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});


http.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

