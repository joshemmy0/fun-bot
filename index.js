const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const Pino = require('pino');

const YOUR_PHONE_NUMBER = '2348097842653@s.whatsapp.net'; // Replace with your WhatsApp number

const startBot = async () => {
    // Authentication
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    // Initialize bot
    const sock = makeWASocket({
        logger: Pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: true
    });

    // Listen for messages
    sock.ev.on('messages.upsert', async (messageUpdate) => {
        const messages = messageUpdate.messages;
        if (messages.length > 0) {
            const message = messages[0];
            const messageText = message.message?.conversation || '';
            const sender = message.key.remoteJid;
            const isFromMe = message.key.fromMe;

            // Check if the message is from you and starts with '.'
            if (isFromMe && messageText.startsWith('.')) {
                // Extract command (everything after '.')
                const command = messageText.slice(1).trim();
                
                // Determine recipient based on the original message
                const originalRecipient = message.key.remoteJid;

                // Respond with "Hello World" to the original recipient
                await sock.sendMessage(originalRecipient, { text: 'Hello World' });
                console.log(`Sent 'Hello World' to ${originalRecipient}`);
            }
        }
    });

    // Save authentication state
    sock.ev.on('creds.update', saveCreds);

    // Handle unexpected disconnects
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to', lastDisconnect?.error, ', reconnecting...', shouldReconnect);
            if (shouldReconnect) {
                setTimeout(startBot, 5000); // Retry after 5 seconds
            }
        } else if (connection === 'open') {
            console.log('Bot connected');
        }
    });
};

// Start the bot
startBot();
