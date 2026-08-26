require('dotenv').config();
const express = require('express');
const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const stringSession = new StringSession(process.env.TELEGRAM_SESSION || '');
const botUsername = process.env.TELEGRAM_BOT_USERNAME;

let client;

async function startTelegramClient() {
    console.log('Loading Telegram Client...');
    client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });
    
    await client.start({
        phoneNumber: async () => await input.text('Please enter your number (with country code): '),
        password: async () => await input.text('Please enter your password (if 2FA is enabled): '),
        phoneCode: async () => await input.text('Please enter the code you received: '),
        onError: (err) => console.log('Telegram login error:', err),
    });
    
    console.log('\n✅ You are successfully connected to Telegram!');
    const currentSession = client.session.save();
    console.log('\n=============================================================');
    console.log('CRITICAL: Copy the text below and paste it in your .env file');
    console.log('as TELEGRAM_SESSION="..." to avoid logging in again:');
    console.log('=============================================================');
    console.log(currentSession);
    console.log('=============================================================\n');
}

app.get('/api/lookup', async (req, res) => {
    try {
        const { command } = req.query;
        if (!command) return res.status(400).json({ success: false, error: 'Command is required' });
        if (!botUsername) return res.status(500).json({ success: false, error: 'Bot username is not configured in .env' });
        
        console.log(`Sending command "${command}" to bot ${botUsername}`);
        
        // Ensure client is connected
        if (!client || !client.connected) {
            return res.status(500).json({ success: false, error: 'Telegram client is not connected' });
        }
        
        // Send message to the bot
        await client.sendMessage(botUsername, { message: command });
        
        // Wait 4 seconds for the bot to reply
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        // Fetch recent messages
        const history = await client.invoke(
            new Api.messages.GetHistory({
                peer: botUsername,
                limit: 3,
            })
        );
        
        // Find the most recent message that is FROM the bot (not our outgoing message)
        let resultText = "No response from bot within time limit.";
        if (history.messages && history.messages.length > 0) {
            const botMessage = history.messages.find(m => m.out === false);
            if (botMessage && botMessage.message) {
                resultText = botMessage.message;
            }
        }
        
        return res.json({ success: true, data: resultText });
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = 4000;
app.listen(PORT, async () => {
    console.log(`Telegram API Server running on port ${PORT}`);
    if (!apiId || !apiHash || !botUsername) {
        console.error("❌ ERROR: Missing TELEGRAM_API_ID, TELEGRAM_API_HASH, or TELEGRAM_BOT_USERNAME in .env");
        process.exit(1);
    } else {
        await startTelegramClient();
    }
});
