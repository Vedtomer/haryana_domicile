const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const stringSession = new StringSession(''); 
const phoneNumber = "+380630323112";

(async () => {
    console.log("Loading interactive Telegram client...");
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });
    
    await client.start({
        phoneNumber: phoneNumber,
        password: async () => {
            const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });
            return new Promise(resolve => readline.question('Password (if any): ', pwd => { readline.close(); resolve(pwd); }));
        },
        phoneCode: async () => {
            const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });
            return new Promise(resolve => readline.question('Enter OTP Code: ', code => { readline.close(); resolve(code); }));
        },
        onError: (err) => console.log('Error:', err),
    });
    
    console.log("✅ Logged in successfully!");
    console.log("Here is your Session String (copy it to .env):");
    console.log(client.session.save());
    process.exit(0);
})();
