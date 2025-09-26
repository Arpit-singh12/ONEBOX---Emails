# OneBox Email Aggregator - Frontend

A modern, responsive React frontend for the OneBox email aggregator system with AI-powered categorization, real-time synchronization, and intelligent email management.

## 🚀 Features

### ✅ **Real-Time Email Management**
- **Live Email Sync**: Real-time email synchronization with IMAP accounts
- **Smart Categorization**: AI-powered email categorization (Interested, Meeting Booked, Action Required, etc.)
- **Multi-Account Support**: Manage multiple email accounts simultaneously

### ✅ **Advanced Search & Filtering**
- **Elasticsearch-Powered Search**: Full-text search across all emails
- **Advanced Filters**: Filter by account, folder, category, and date range
- **Real-Time Results**: Instant search results with live updates

### ✅ **AI-Powered Features**
- **Smart Categorization**: Automatic email categorization using AI
- **Suggested Replies**: AI-generated reply suggestions for interested emails
- **Context-Aware Responses**: Intelligent responses based on email context

### ✅ **Modern UI/UX**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Theme**: Beautiful, accessible interface
- **Real-Time Updates**: Live notifications and status updates
- **Intuitive Navigation**: Clean, modern interface design

### ✅ **Integration Features**
- **Slack Notifications**: Automatic Slack alerts for interested emails
- **Webhook Support**: External automation triggers
- **Account Management**: Easy setup and management of email accounts

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Date-fns** - Date manipulation
- **Vite** - Fast build tool and dev server

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend server running on `http://localhost:5000`

### Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Open `http://localhost:5173` in your browser
   - The app will automatically connect to your backend

## 🎯 Usage Guide

### 1. **Account Setup**
- Navigate to the **Accounts** tab
- Click **Add Account** to connect your email
- Enter your email credentials and IMAP settings
- The system will automatically sync your emails

### 2. **Email Management**
- **Dashboard**: Overview of all accounts and email statistics
- **Emails**: Browse, search, and manage your emails
- **Categories**: View emails by AI-determined categories

### 3. **Search & Filter**
- Use the search bar to find specific emails
- Apply filters by account, folder, or category
- Real-time search results powered by Elasticsearch

### 4. **AI Features**
- **Categorization**: Emails are automatically categorized
- **Suggested Replies**: AI-generated responses for interested emails
- **Smart Notifications**: Slack alerts for important emails

## 📱 Responsive Design

### Desktop (1024px+)
- Full sidebar navigation
- Split-pane email view
- Advanced filtering options

### Tablet (768px - 1023px)
- Collapsible sidebar
- Optimized email list view
- Touch-friendly interface

### Mobile (< 768px)
- Full-screen email views
- Bottom navigation
- Swipe gestures support

## 🎨 UI Components

### **Dashboard**
- Account status overview
- Email statistics
- Recent activity feed
- Category breakdown

### **Email List**
- Categorized email cards
- Priority indicators
- Read/unread status
- Account badges

### **Email Detail**
- Full email content
- AI suggested replies
- Action buttons (Reply, Forward, Archive)
- Category information

### **Account Manager**
- Add new accounts
- Reconnect existing accounts
- Account status monitoring
- Provider-specific settings

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the frontend directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000

# Optional: Enable debug mode
VITE_DEBUG=false
```

### API Integration
The frontend automatically integrates with your backend APIs:

- `GET /api/accounts` - Fetch connected accounts
- `POST /api/accounts` - Add new account
- `POST /api/accounts/reconnect` - Reconnect account
- `POST /api/emails/search` - Search emails
- `POST /api/reply/suggest` - Get AI reply suggestions

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🔍 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── EmailCard.tsx    # Email list item
│   ├── EmailDetail.tsx  # Email detail view
│   ├── EmailList.tsx    # Email list container
│   ├── SearchBar.tsx    # Search and filters
│   ├── Sidebar.tsx      # Navigation sidebar
│   └── AccountManager.tsx # Account management
├── hooks/               # Custom React hooks
│   └── useEmails.ts     # Email data management
├── types/               # TypeScript types
│   └── email.ts         # Email-related types
├── App.tsx              # Main application
└── main.tsx             # Application entry point
```

### Key Features Implementation

#### **Real-Time Updates**
```typescript
// Automatic polling for new emails
useEffect(() => {
  const interval = setInterval(async () => {
    if (accounts.length > 0 && !loading) {
      const newResults = await apiService.searchEmails(currentFilters);
      if (newResults.length !== emails.length) {
        setEmails(newResults);
      }
    }
  }, 30000); // Check every 30 seconds
  return () => clearInterval(interval);
}, [accounts, filters, emails.length, loading]);
```

#### **Smart Categorization**
```typescript
// Category-based email display
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'interested': return 'bg-green-100 text-green-800';
    case 'meeting_booked': return 'bg-blue-100 text-blue-800';
    case 'action_required': return 'bg-yellow-100 text-yellow-800';
    // ... more categories
  }
};
```

#### **Responsive Design**
```typescript
// Mobile-first responsive classes
<div className={clsx(
  'flex flex-col bg-white border-r border-gray-200',
  selectedEmail ? 'w-full md:w-96' : 'flex-1',
  selectedEmail ? 'hidden md:flex' : 'flex'
)}>
```

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Ensure backend is running on `http://localhost:5000`
   - Check CORS settings in backend
   - Verify API endpoints are accessible

2. **Emails Not Loading**
   - Check if accounts are properly connected
   - Verify Elasticsearch is running
   - Check browser console for errors

3. **Search Not Working**
   - Ensure Elasticsearch is properly configured
   - Check if emails are indexed
   - Verify search API endpoints

### Debug Mode
Enable debug mode by setting `VITE_DEBUG=true` in your `.env.local` file.

## 📄 License

This project is part of the OneBox Email Aggregator system.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review the backend documentation
- Create an issue in the repository

---

**Built with ❤️ for efficient email management**