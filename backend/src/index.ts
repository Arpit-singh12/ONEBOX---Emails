import dotenv from 'dotenv';
import { EmailIndex } from './services/elastic.service';
import { initializeAccountManager } from './imap/iManager';
import app from './app';


dotenv.config();

const PORT = process.env.PORT || 5000;

async function serverStart() {
    try {
        // Initialize Elasticsearch
        await EmailIndex();
        
        // Initialize account manager (load saved account configs)
        initializeAccountManager();
        
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
            console.log(`Account configurations loaded. Use POST /api/accounts/reconnect to restore connections.`);
        });
    } catch (error) {
        console.log("Failed to start server:", error);
    }
}
serverStart();