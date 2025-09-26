import React, { useState } from 'react';
import { useEmails } from './hooks/useEmails';
import type { Email } from './types/email';
import { Sidebar } from './components/Sidebar';
import { SearchBar } from './components/SearchBar';
import { EmailList } from './components/EmailList';
import { EmailDetail } from './components/EmailDetail';
import { Dashboard } from './components/Dashboard';
import { AccountManager } from './components/AccountManager';
import { LayoutDashboard, Mail, Settings, AlertCircle, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';

type View = 'dashboard' | 'emails' | 'accounts';

function App() {
  const { 
    emails, 
    accounts, 
    loading, 
    error,
    filters, 
    searchEmails, 
    addAccount,
    reconnectAccount,
    getSuggestedReply,
    loadAccounts
  } = useEmails();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedFolder, setSelectedFolder] = useState('INBOX');
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
  };

  const handleBackToList = () => {
    setSelectedEmail(null);
  };

  const handleFolderSelect = (folder: string) => {
    setSelectedFolder(folder);
    setCurrentView('emails');
    searchEmails({ ...filters, folder: folder === 'INBOX' ? 'all' : folder });
  };

  // Calculate category counts for dashboard
  const categoryCounts = emails.reduce((acc, email) => {
    acc[email.category] = (acc[email.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar
          accounts={accounts}
          selectedFolder={selectedFolder}
          onFolderSelect={handleFolderSelect}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={clsx(
                  'flex items-center px-4 py-2 rounded-lg transition-colors',
                  currentView === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('emails')}
                className={clsx(
                  'flex items-center px-4 py-2 rounded-lg transition-colors',
                  currentView === 'emails'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <Mail className="w-4 h-4 mr-2" />
                Emails
              </button>
              <button
                onClick={() => setCurrentView('accounts')}
                className={clsx(
                  'flex items-center px-4 py-2 rounded-lg transition-colors',
                  currentView === 'accounts'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <Settings className="w-4 h-4 mr-2" />
                Accounts
              </button>
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="flex items-center text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        {currentView === 'dashboard' ? (
          <Dashboard
            accounts={accounts}
            totalEmails={emails.length}
            categoryCounts={categoryCounts}
          />
        ) : currentView === 'accounts' ? (
              <div className="flex-1 overflow-y-auto p-6">
                <AccountManager
                  accounts={accounts}
                  onAddAccount={addAccount}
                  onReconnectAccount={reconnectAccount}
                  loading={loading}
                />
              </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Email List Panel */}
            <div className={clsx(
              'flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
              selectedEmail ? 'w-full md:w-96' : 'flex-1',
              selectedEmail ? 'hidden md:flex' : 'flex'
            )}>
                  <SearchBar
                    filters={filters}
                    accounts={accounts}
                    onSearch={searchEmails}
                    onRefresh={loadAccounts}
                  />
              <div className="flex-1 overflow-y-auto p-4">
                <EmailList
                  emails={emails}
                  loading={loading}
                  onEmailSelect={handleEmailSelect}
                  selectedEmailId={selectedEmail?.id}
                />
              </div>
            </div>

            {/* Email Detail Panel */}
            {selectedEmail && (
              <div className={clsx(
                'flex-1 overflow-hidden',
                'md:block',
                'fixed inset-0 z-50 bg-white md:relative md:z-auto'
              )}>
                <div className="md:hidden p-4 border-b border-gray-200">
                  <button
                    onClick={handleBackToList}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to emails
                  </button>
                </div>
                <EmailDetail
                  email={selectedEmail}
                  onBack={handleBackToList}
                  getSuggestedReply={getSuggestedReply}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;