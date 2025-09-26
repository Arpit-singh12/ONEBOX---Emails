import React, { useState } from 'react';
import { Plus, Settings, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface EmailAccount {
  id: string;
  email: string;
  provider: string;
  status: string;
  lastSync: string;
  totalEmails: number;
}

interface AccountManagerProps {
  accounts: EmailAccount[];
  onAddAccount: (accountData: any) => Promise<void>;
  onReconnectAccount: (email: string, password: string) => Promise<void>;
  loading?: boolean;
}

export const AccountManager: React.FC<AccountManagerProps> = ({
  accounts,
  onAddAccount,
  onReconnectAccount,
  loading = false
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReconnectForm, setShowReconnectForm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    host: 'imap.gmail.com',
    port: 993,
    secure: true
  });
  const [reconnectPassword, setReconnectPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    try {
      await onAddAccount(formData);
      setShowAddForm(false);
      setFormData({
        email: '',
        password: '',
        host: 'imap.gmail.com',
        port: 993,
        secure: true
      });
    } catch (error) {
      console.error('Failed to add account:', error);
      // Error is handled by parent component
    } finally {
      setLocalLoading(false);
    }
  };

  const handleReconnectAccount = async (email: string) => {
    setLocalLoading(true);
    try {
      await onReconnectAccount(email, reconnectPassword);
      setShowReconnectForm(null);
      setReconnectPassword('');
    } catch (error) {
      console.error('Failed to reconnect account:', error);
      // Error is handled by parent component
    } finally {
      setLocalLoading(false);
    }
  };

  const getProviderIcon = (email: string) => {
    if (email.includes('gmail.com')) return '📧';
    if (email.includes('outlook.com') || email.includes('hotmail.com')) return '📬';
    if (email.includes('yahoo.com')) return '📫';
    return '📨';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Email Accounts</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </button>
      </div>

      {/* Accounts List */}
      <div className="space-y-4">
        {accounts.map((account) => (
          <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{getProviderIcon(account.email)}</div>
              <div>
                <div className="font-medium text-gray-900">{account.email}</div>
                <div className="text-sm text-gray-500">
                  {account.totalEmails} emails • Last sync: {new Date(account.lastSync).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={clsx(
                'flex items-center px-3 py-1 rounded-full text-sm font-medium',
                account.status === 'connected'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              )}>
                {account.status === 'connected' ? (
                  <CheckCircle className="w-4 h-4 mr-1" />
                ) : (
                  <XCircle className="w-4 h-4 mr-1" />
                )}
                {account.status}
              </div>
              {account.status !== 'connected' && (
                <button
                  onClick={() => setShowReconnectForm(account.email)}
                  className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reconnect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Account Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Email Account</h3>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password / App Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IMAP Host
                </label>
                <select
                  value={formData.host}
                  onChange={(e) => setFormData({...formData, host: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="imap.gmail.com">Gmail (imap.gmail.com)</option>
                  <option value="outlook.office365.com">Outlook (outlook.office365.com)</option>
                  <option value="imap.mail.yahoo.com">Yahoo (imap.mail.yahoo.com)</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={localLoading || loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {localLoading || loading ? 'Adding...' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reconnect Account Modal */}
      {showReconnectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reconnect Account</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the password for {showReconnectForm}
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleReconnectAccount(showReconnectForm);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password / App Password
                </label>
                <input
                  type="password"
                  value={reconnectPassword}
                  onChange={(e) => setReconnectPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReconnectForm(null);
                    setReconnectPassword('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Reconnecting...' : 'Reconnect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
