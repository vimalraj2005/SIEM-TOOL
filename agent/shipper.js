const { exec } = require('child_process');

// Replace with your private cloud server's IP/Domain
const SERVER_URL = 'https://api.vimalrajs.in/api/logs/ingest'; 

function fetchAndSendLogs() {
    // Fetches the latest 5 failed login attempts (Event ID 4625)
    const psCommand = `powershell -Command "Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 5 -ErrorAction SilentlyContinue | Select-Object TimeCreated, Id, Message | ConvertTo-Json"`;

    exec(psCommand, async (error, stdout, stderr) => {
        if (error || !stdout) {
            console.log('No new failed logins detected or error occurred.');
            return;
        }

        try {
            const logs = JSON.parse(stdout);
            // Using native fetch (Node 18+) to send to your cloud backend
            const response = await fetch(SERVER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source: 'Windows-Node-Agent', data: logs })
            });

            console.log(`Successfully sent logs. Server responded with status: ${response.status}`);
        } catch (err) {
            console.error('Failed to parse or send logs:', err.message);
        }
    });
}

// Execute the function
fetchAndSendLogs();