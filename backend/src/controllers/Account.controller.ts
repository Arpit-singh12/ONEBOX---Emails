import { Request, Response } from 'express';
import { addImapAccount, getConnectedAccounts, getSavedAccountConfigs } from '../imap/iManager';
import { searchEmails, EmailsCountForAccount } from '../services/elastic.service';


// creating controller function to handle adding/syncing accounts operations...

export async function addAccount(req: Request, res: Response){
    console.log("Incoming request body:", req.body);
    const { email, password, host, port, secure } = req.body;
    
    if (!email || !password || !host || !port || secure === undefined) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        await addImapAccount({ email, password, host, port, secure });
        res.status(201).json({ message: `Account started syncing ${email}` });
    } catch (error) {
        console.error('Error adding account:', error);
        res.status(500).json({ error: 'Failed to add account' });
    }
}

export async function getAccounts(req: Request, res: Response){
  try {
    const accounts = getConnectedAccounts();
   res.json(accounts);
  } catch (error) {
    console.log('failed to get connected accounts', error);
    res.status(500).json({error: 'Account loading failed'});
  }
}

// taking count of emails in the connected account...
export async function getAllAccounts(req: Request, res: Response){
    try {
        const accounts = getConnectedAccounts();
        const result = await Promise.all(
            accounts.map(async (account) => {
                const totalEmails = await EmailsCountForAccount(account.email); // takes count from ES...
                return{
                    id: account.id,
                    email: account.email,
                    provider: account.provider,
                    status: account.status,
                    lastSync: account.lastSync,
                    totalEmails,
                };
            })
        );
        res.json(result);
    } catch (error) {
        console.error('Error getting all accounts:', error);
        res.status(500).json({ error: 'Failed to get accounts' });
    }
}


// To search emails by categories specific ....

export async function searchEmailsByCategory(req: Request, res: Response) {
    try {
        const category = req.query.category as string || '';
        const account = req.query.account as string || '';
        const folder = req.query.folder as string || '';

        if (!category) {
            return res.status(400).json({ error: 'Category query parameter is required' });
        }

        // Searching emails with category as query...
        
        const results = await searchEmails(category, account, folder);
        res.status(200).json({ emails: results });
    } catch (error) {
        console.error('Error searching emails by category:', error);
        res.status(500).json({ error: 'Failed to search emails' });
    }
}

// Get saved account configurations
export async function getSavedAccounts(req: Request, res: Response) {
    try {
        const savedConfigs = getSavedAccountConfigs();
        res.status(200).json({ 
            message: 'Saved account configurations',
            accounts: savedConfigs,
            note: 'Passwords are not stored for security. Use POST /api/accounts/reconnect to restore connections.'
        });
    } catch (error) {
        console.error('Error getting saved accounts:', error);
        res.status(500).json({ error: 'Failed to get saved accounts' });
    }
}

// Reconnect a saved account with password
export async function reconnectAccount(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Get saved account config
        const savedConfigs = getSavedAccountConfigs();
        const savedConfig = savedConfigs.find(config => config.email === email);
        
        if (!savedConfig) {
            return res.status(404).json({ error: 'No saved configuration found for this email' });
        }

        // Reconnect with password
        await addImapAccount({
            email: savedConfig.email,
            password: password,
            host: savedConfig.host,
            port: savedConfig.port,
            secure: savedConfig.secure
        });

        res.status(200).json({ 
            message: `Successfully reconnected ${email}`,
            email: email
        });
    } catch (error) {
        console.error('Error reconnecting account:', error);
        res.status(500).json({ error: 'Failed to reconnect account' });
    }
}