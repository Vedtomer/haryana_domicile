import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    await page.goto('http://localhost:8000/passport_maker/index.html', { waitUntil: 'networkidle2' });
    
    console.log("Page loaded. Uploading file...");
    
    // The file input ID in index.html is likely 'file-upload' or similar. 
    // Let's find it by input[type=file]
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
        await fileInput.uploadFile('./blank_pan.jpg.jpeg');
        console.log("File uploaded. Waiting for 3 seconds...");
        await new Promise(r => setTimeout(r, 3000));
        
        await page.screenshot({ path: 'screenshot.png' });
        console.log("Screenshot saved to screenshot.png");
    } else {
        console.log("No file input found!");
    }

    await browser.close();
})();
