const express = require('express');
const cors = require('cors');
const http = require('http'); // Added
const { Server } = require('socket.io'); // Added
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;

// Setup HTTP server and WebSockets
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' } // Allow frontend to connect
});

app.use(cors());
app.use(express.json());

app.post('/api/logs/ingest', (req, res) => {
    const logData = req.body;
    let responseSent = false; // Prevent sending multiple responses
    
    const pythonProcess = spawn('/app/venv/bin/python3', ['ai_engine.py', JSON.stringify(logData)]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const aiResult = JSON.parse(data.toString());
            io.emit('threat_alert', aiResult); 
            if (!responseSent) {
                res.status(200).json({ message: 'Analysis complete' });
                responseSent = true;
            }
        } catch (err) {
            console.error('Error parsing AI:', err);
        }
    });

    // Handle Errors (CRITICAL FIX)
    pythonProcess.stderr.on('data', (data) => {
        console.error(`AI Engine Error: ${data.toString()}`);
    });

    // Handle Process Exit
    pythonProcess.on('close', (code) => {
        if (code !== 0 && !responseSent) {
            res.status(500).json({ error: 'AI Engine crashed during analysis' });
            responseSent = true;
        }
    });
});

// Start the server using 'server.listen' instead of 'app.listen'
server.listen(PORT, '0.0.0.0', () => {
    console.log(`SIEM Backend & WebSocket running on port ${PORT}`);
});