require('dotenv').config();
const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const stringSession = new StringSession(process.env.TELEGRAM_SESSION);
const botUsername = process.env.TELEGRAM_BOT_USERNAME;

(async () => {
    console.log("Connecting...");
    const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
    await client.connect();
    
    const bots = ['@randominfobackup', '@intelxgroup'];
    
    for (const bot of bots) {
        console.log(`\n\n--- Testing ${bot} ---`);
        try {
            await client.sendMessage(bot, { message: '/start' });
            await new Promise(r => setTimeout(r, 3000));
            
            const history = await client.invoke(
                new Api.messages.GetHistory({
                    peer: bot,
                    limit: 5,
                })
            );
            
            console.log(`\n--- BOT REPLY FROM ${bot} ---`);
            history.messages.filter(m => !m.out).forEach(m => {
                console.log(m.message);
                console.log("-----------------");
            });
        } catch (e) {
            console.error(`Error with ${bot}:`, e.message);
        }
    }
    
    process.exit(0);
})();
