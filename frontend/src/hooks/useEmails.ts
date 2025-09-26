import { useState, useEffect, useCallback } from 'react';
import type { Email, EmailAccount, SearchFilters, SuggestedReply } from '../types/email';

const API_BASE_URL = 'http://localhost:5000/api';

// API service functions
const apiService = {
  // Get all connected accounts
  async getAccounts(): Promise<EmailAccount[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts`);
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const data = await response.json();
      
      return data.map((account: any) => ({
        id: account.id,
        name: account.email.split('@')[0],
        email: account.email,
        provider: account.provider || 'IMAP',
        isConnected: account.status === 'connected',
        lastSync: account.lastSync,
        totalEmails: account.totalEmails || 0
      }));
    } catch (error) {
      console.error('Error fetching accounts:', error);
      return [];
    }
  },

  // Get saved account configurations
  async getSavedAccounts(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/saved`);
      if (!response.ok) throw new Error('Failed to fetch saved accounts');
      const data = await response.json();
      return data.accounts || [];
    } catch (error) {
      console.error('Error fetching saved accounts:', error);
      return [];
    }
  },

  // Add new account
  async addAccount(accountData: any): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add account');
    }
  },

  // Reconnect account
  async reconnectAccount(email: string, password: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/accounts/reconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to reconnect account');
    }
  },

  // Get emails by account
  async getEmailsByAccount(email: string): Promise<Email[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/emails?email=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error('Failed to fetch emails');
      const data = await response.json();
      
      console.log('Backend response for emails:', data); // Debug log
      
      return data.map((email: any, index: number) => ({
        id: email.id || `email-${index}`,
        messageId: email.messageId || `msg-${index}`,
        subject: email.subject || 'No Subject',
        from: {
          name: email.from || 'Unknown Sender',
          address: email.from || 'unknown@example.com'
        },
        to: [{ name: 'You', address: email.to || 'you@example.com' }],
        date: email.date || new Date().toISOString(),
        body: {
          text: email.text || '',
          html: email.html || ''
        },
        folder: email.folder || 'INBOX',
        account: email.accountEmail || email.account,
        category: this.normalizeCategory(email.category || 'uncategorized'),
        isRead: false,
        hasAttachments: false,
        priority: 'normal' as const
      }));
    } catch (error) {
      console.error('Error fetching emails by account:', error);
      return [];
    }
  },

  // Search emails
  async searchEmails(filters: SearchFilters): Promise<Email[]> {
    try {
      const params = new URLSearchParams();
      if (filters.query) params.append('query', filters.query);
      if (filters.account !== 'all') params.append('account', filters.account);
      if (filters.folder !== 'all') params.append('folder', filters.folder);
      
      // Use the correct search endpoint
      const response = await fetch(`${API_BASE_URL}/emails/search?${params.toString()}`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to search emails');
      const data = await response.json();
      
      console.log('Backend search response:', data); // Debug log
      
      // Handle both array and object responses
      const emailsArray = Array.isArray(data) ? data : (data.emails || []);
      
      return emailsArray.map((email: any, index: number) => ({
        id: email.id || `email-${index}`,
        messageId: email.messageId || `msg-${index}`,
        subject: email.subject || 'No Subject',
        from: {
          name: email.from || 'Unknown Sender',
          address: email.from || 'unknown@example.com'
        },
        to: [{ name: 'You', address: email.to || 'you@example.com' }],
        date: email.date || new Date().toISOString(),
        body: {
          text: email.text || '',
          html: email.html || ''
        },
        folder: email.folder || 'INBOX',
        account: email.accountEmail || email.account,
        category: this.normalizeCategory(email.category || 'uncategorized'),
        isRead: false,
        hasAttachments: false,
        priority: 'normal' as const
      }));
    } catch (error) {
      console.error('Error searching emails:', error);
      return [];
    }
  },

  // Normalize category names
  normalizeCategory(category: string): string {
    return category.toLowerCase()
      .replace(/\s+/g, '_')
      .replace('action_required', 'action_required')
      .replace('meeting_booked', 'meeting_booked')
      .replace('out_of_office', 'out_of_office')
      .replace('not_interested', 'not_interested');
  },

  // Get suggested reply
  async getSuggestedReply(emailId: string): Promise<SuggestedReply | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/reply/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emailId })
      });
      
      if (!response.ok) return null;
      const data = await response.json();
      
      return {
        id: `reply-${emailId}`,
        emailId,
        suggestion: data.suggestion || 'No suggestion available',
        confidence: data.confidence || 0.8,
        context: data.context || []
      };
    } catch (error) {
      console.error('Error getting suggested reply:', error);
      return null;
    }
  }
};

// Mock data for demonstration - replace with actual API calls
// const mockEmails: Email[] = [
//   {
//     id: '1',
//     messageId: 'msg-001',
//     subject: 'Job Application Follow-up - Frontend Developer Position',
//     from: { name: 'Arpit Singh', address: 'Arpit@techcorp.com' },
//     to: [{ name: 'You', address: 'user@example.com' }],
//     date: new Date().toISOString(),
//     body: {
//       text: 'Hi, Thank you for your application. We would like to schedule a technical interview. When would be a good time for you?',
//       html: '<p>Hi,</p><p>Thank you for your application. We would like to schedule a technical interview. When would be a good time for you?</p>'
//     },
//     folder: 'INBOX',
//     account: 'Account1@example.com',
//     category: 'interested',
//     isRead: false,
//     hasAttachments: false,
//     priority: 'high'
//   },
//   {
//     id: '2',
//     messageId: 'msg-002',
//     subject: 'Meeting Confirmation - Product Demo',
//     from: { name: 'Kartik singh', address: 'Kartik@startup.io' },
//     to: [{ name: 'You', address: 'you@example.com' }],
//     date: new Date(Date.now() - 3600000).toISOString(),
//     body: {
//       text: 'Great! I have booked our meeting for tomorrow at 2 PM. Looking forward to the demo.',
//       html: '<p>Great! I have booked our meeting for tomorrow at 2 PM. Looking forward to the demo.</p>'
//     },
//     folder: 'INBOX',
//     account: 'Account1@example.com',
//     category: 'meeting_booked',
//     isRead: true,
//     hasAttachments: false,
//     priority: 'normal'
//   },
//   {
//     id: '3',
//     messageId: 'msg-003',
//     subject: 'Out of Office - Vacation',
//     from: { name: 'Neha', address: 'Neha@company.com' },
//     to: [{ name: 'You', address: 'you@example.com' }],
//     date: new Date(Date.now() - 7200000).toISOString(),
//     body: {
//       text: 'I am currently out of office until next Monday. I will respond to your email when I return.',
//       html: '<p>I am currently out of office until next Monday. I will respond to your email when I return.</p>'
//     },
//     folder: 'INBOX',
//     account: 'Account@gmail.com',
//     category: 'out_of_office',
//     isRead: true,
//     hasAttachments: false,
//     priority: 'low'
//   }
// ];

// const mockAccounts: EmailAccount[] = [
//   {
//     id: '1',
//     name: 'User Email',
//     email: 'Account@example.com',
//     provider: 'Gmail',
//     isConnected: true,
//     lastSync: new Date().toISOString(),
//     totalEmails: 1247
//   },
//   {
//     id: '2',
//     name: 'My Gmail',
//     email: 'Account2@gmail.com',
//     provider: 'Gmail',
//     isConnected: true,
//     lastSync: new Date(Date.now() - 300000).toISOString(),
//     totalEmails: 892
//   }
// ];

export const useEmails = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    account: 'all',
    folder: 'all',
    category: 'all',
    dateRange: {}
  });

  const filteredEmails = emails.filter(email => {
    if (filters.query && !email.subject.toLowerCase().includes(filters.query.toLowerCase()) && 
        !email.from.name.toLowerCase().includes(filters.query.toLowerCase())) {
      return false;
    }
    if (filters.account !== 'all' && email.account !== filters.account) {
      return false;
    }
    if (filters.folder !== 'all' && email.folder !== filters.folder) {
      return false;
    }
    if (filters.category !== 'all' && email.category !== filters.category) {
      return false;
    }
    return true;
  });

  // Load accounts on component mount
  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const accountsData = await apiService.getAccounts();
      setAccounts(accountsData);
      
      // Auto-load emails if accounts are connected
      if (accountsData.length > 0) {
        const connectedAccounts = accountsData.filter(acc => acc.isConnected);
        if (connectedAccounts.length > 0) {
          // Load emails from first connected account as default
          const firstAccount = connectedAccounts[0];
          const accountEmails = await apiService.getEmailsByAccount(firstAccount.email);
          setEmails(accountEmails);
        }
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchEmails = async (searchFilters: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      setFilters(searchFilters);
      
      // If no specific account is selected, load emails from all connected accounts
      if (searchFilters.account === 'all' && accounts.length > 0) {
        const allEmails: Email[] = [];
        for (const account of accounts) {
          if (account.isConnected) {
            const accountEmails = await apiService.getEmailsByAccount(account.email);
            allEmails.push(...accountEmails);
          }
        }
        setEmails(allEmails);
      } else if (searchFilters.account !== 'all') {
        // Search specific account
        const searchResults = await apiService.searchEmails(searchFilters);
        setEmails(searchResults);
      } else {
        setEmails([]);
      }
    } catch (error) {
      console.error('Error searching emails:', error);
      setError('Failed to search emails');
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (accountData: any) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.addAccount(accountData);
      await loadAccounts(); // Refresh accounts list
      
      // Auto-load emails from the newly added account
      setTimeout(async () => {
        try {
          const newEmails = await apiService.getEmailsByAccount(accountData.email);
          setEmails(prevEmails => [...prevEmails, ...newEmails]);
        } catch (error) {
          console.error('Failed to load emails from new account:', error);
        }
      }, 2000); // Wait 2 seconds for emails to be processed
    } catch (error) {
      console.error('Error adding account:', error);
      setError('Failed to add account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const reconnectAccount = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.reconnectAccount(email, password);
      await loadAccounts(); // Refresh accounts list
    } catch (error) {
      console.error('Error reconnecting account:', error);
      setError('Failed to reconnect account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getSuggestedReply = async (emailId: string): Promise<SuggestedReply | null> => {
    // Mock suggested reply - replace with actual RAG API call
    const email = emails.find(e => e.id === emailId);
    if (!email || email.category !== 'interested') return null;

    return {
      id: `reply-${emailId}`,
      emailId,
      suggestion: "Thank you for your interest! I'm excited about this opportunity. You can book a convenient time slot for the technical interview here: https://cal.com/example. Looking forward to discussing my qualifications further.",
      confidence: 0.92,
      context: ['job application', 'technical interview', 'meeting booking']
    };
  };

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Simulate real-time updates by polling for new emails
  useEffect(() => {
    const interval = setInterval(async () => {
      if (accounts.length > 0 && !loading) {
        try {
          // Check for new emails by doing a quick search
          const currentFilters = { ...filters, query: '' };
          const newResults = await apiService.searchEmails(currentFilters);
          
          // Only update if we got new emails
          if (newResults.length !== emails.length) {
            setEmails(newResults);
          }
        } catch (error) {
          console.error('Error checking for new emails:', error);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [accounts, filters, emails.length, loading]);

  return {
    emails: filteredEmails,
    accounts,
    loading,
    error,
    filters,
    searchEmails,
    addAccount,
    reconnectAccount,
    loadAccounts,
    getSuggestedReply
  };
};