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
    
    // Pass data to Python AI Engine
// Change this line
const pythonProcess = spawn('python3', ['ai_engine.py', JSON.stringify(logData)]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const aiResult = JSON.parse(data.toString());
            
            // PUSH the result instantly to the React Dashboard
            io.emit('threat_alert', aiResult); 

            res.status(200).json({ message: 'Analysis complete' });
        } catch (err) {
            console.error('Error parsing AI response:', err);
        }
    });
});

// Start the server using 'server.listen' instead of 'app.listen'
server.listen(PORT, '0.0.0.0', () => {
    console.log(`SIEM Backend & WebSocket running on port ${PORT}`);
});