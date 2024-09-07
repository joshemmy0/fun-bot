// Load environment variables
require('dotenv').config();

// Import Baileys library
const { default: makeWASocket, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const qrcode = require('qrcode-terminal');

// Function to start the WhatsApp bot
const startBot = async () => {
    // Initialize the WhatsApp connection
    const sock = makeWASocket({
        logger: P({ level: 'silent' }),  // Change to 'debug' for more logs
        printQRInTerminal: true,         // Print QR code in terminal for scanning
        browser: ['HelloWorld Bot', 'Chrome', '1.0.0']
    });

    // Listen for connection updates
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            // Show QR code in the terminal for authentication
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') {
            console.log('✅ Successfully connected to WhatsApp!');
        }

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect.error)?.output.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                console.log('❌ Logged out from WhatsApp. Reconnect needed.');
            } else {
                console.log('❌ Connection closed. Reconnecting...');
                startBot();  // Reconnect the bot
            }
        }
    });

    // Listen for incoming messages
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const messageType = Object.keys(msg.message)[0];

        // Reply with 'Hello World' to any message
        if (messageType === 'conversation') {
            await sock.sendMessage(from, { text: 'Hello World' });
            console.log(`Sent 'Hello World' to ${from}`);
        }
    });
};

// Start the bot
startBot();
