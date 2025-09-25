import { connectAndSync } from "./iClient";
import fs from 'fs';
import path from 'path';

// defining elements to store in the array....
type ConnectedAccount = {
  id: string;
  email: string;
  provider: string;
  status: 'connected';
  lastSync: string;
  totalEmails: number;
};

type AccountConfig = {
  email: string;
  host: string;
  port: number;
  secure: boolean;
  // Note: Password is not stored for security reasons
  // User will need to re-enter password on server restart
};

const connectedAccounts: Record<string, boolean> = {};
const accountConfigs: Record<string, AccountConfig> = {};

// Storing connected account in memory as array....
const listAccount: ConnectedAccount[] = [];

// File path for persistent storage
const ACCOUNTS_FILE = path.join(__dirname, '../config/accounts.json');

// Load saved account configurations
function loadAccountConfigs(): void {
  try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const data = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
      const accounts: AccountConfig[] = JSON.parse(data);
      
      accounts.forEach(account => {
        accountConfigs[account.email] = account;
      });
      
      console.log(`Loaded ${accounts.length} saved account configurations`);
    }
  } catch (error) {
    console.error('Error loading account configs:', error);
  }
}

// Save account configuration (without password)
function saveAccountConfig(account: {
  email: string;
  host: string;
  port: number;
  secure: boolean;
}): void {
  try {
    const config: AccountConfig = {
      email: account.email,
      host: account.host,
      port: account.port,
      secure: account.secure
    };
    
    accountConfigs[account.email] = config;
    
    // Save to file
    const accounts = Object.values(accountConfigs);
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
    
    console.log(`Saved configuration for ${account.email}`);
  } catch (error) {
    console.error('Error saving account config:', error);
  }
}

// Setting fields for the identification of the user....
export async function addImapAccount(account: {
  email: string;
  password: string;
  host: string;
  port: number;
  secure: boolean;
}) {
  if (connectedAccounts[account.email]) {
    console.log(`Account ${account.email} is already connected.`);
    return;
  }

  try {
    await connectAndSync(account);
    connectedAccounts[account.email] = true;
    
    // Save account configuration (without password)
    saveAccountConfig({
      email: account.email,
      host: account.host,
      port: account.port,
      secure: account.secure
    });
    
    // checking for duplicate email...
    const existing = listAccount.find(acc => acc.email === account.email);

    if (!existing){
      listAccount.push({
      id: Date.now().toString(),
      email: account.email,
      provider: 'IMAP',
      status: 'connected',
      lastSync: new Date().toISOString(),
      totalEmails: 30,
    });
  }
    
    console.log(`connected to ${account.email}`);
  }catch (error){
    console.log(`Connection failed to ${account.email}:`, error);
  }
}

// Get saved account configurations (for reconnection)
export function getSavedAccountConfigs(): AccountConfig[] {
  return Object.values(accountConfigs);
}

// Initialize account manager (load saved configs)
export function initializeAccountManager(): void {
  loadAccountConfigs();
}

// retreving all the connected accounts...

// Extracting values from the account obeject and returning to the new array...
export function getConnectedAccounts(){
  return listAccount;
}