const { exec } = require('child_process');

function deployHoneyContainer(attackerIP) {
    console.log(`\n[+] INITIATING AUTONOMOUS DECEPTION FOR IP: ${attackerIP}`);
    
    // Windows command to forward port 80 traffic from the attacker to a fake port (8080)
    const command = `netsh interface portproxy add v4tov4 listenport=80 listenaddress=${attackerIP} connectport=8080 connectaddress=127.0.0.1`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`[-] Failed to deploy Honey-Container rules. (Ensure Node runs as Admin)`);
            return;
        }
        console.log(`[+] SUCCESS: Traffic from ${attackerIP} is now trapped in the Honey-Container on port 8080.`);
    });
}

// Export the function so server.js can trigger it
module.exports = { deployHoneyContainer };