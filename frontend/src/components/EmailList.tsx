import React from 'react';
import type { Email } from '../types/email';
import { EmailCard } from './EmailCard';
import { LoadingSpinner } from './LoadingSpinner';

interface EmailListProps {
  emails: Email[];
  loading: boolean;
  onEmailSelect: (email: Email) => void;
  selectedEmailId?: string;
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  loading,
  onEmailSelect,
  selectedEmailId
}) => {
  if (loading) {
    return <LoadingSpinner message="Loading emails..." />;
  }

  if (emails.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">No emails found</div>
        <div className="text-gray-500 text-sm">Try adjusting your search filters</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {emails.map((email) => (
        <EmailCard
          key={email.id}
          email={email}
          isSelected={email.id === selectedEmailId}
          onClick={() => onEmailSelect(email)}
        />
      ))}
    </div>
  );
};