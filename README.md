# OneBox: AI-Powered Email Aggregator

A full-stack solution for real-time email synchronization, AI-based categorization, smart replies, and seamless integrations. Built with Node.js, Express, TypeScript, React, Tailwind, Elasticsearch, and Gemini AI.

---

## 🚀 Features

- **Real-Time IMAP Sync:** Persistent connections (IDLE mode) for instant updates across multiple accounts.
- **Elasticsearch Search:** Fast, full-text search and filtering by account, folder, and category.
- **AI Categorization:** Gemini-powered classification (Interested, Meeting Booked, Action Required, Spam, Out of Office, etc.).
- **Suggested Replies:** RAG (Retrieval-Augmented Generation) with vector DB and LLM for context-aware responses.
- **Slack & Webhook Integration:** Automated notifications for "Interested" emails.
- **Modern Frontend:** Responsive React UI with advanced filtering, account management, and real-time updates.

---

## 🛠️ Local Environment Setup

### Prerequisites

- Node.js v18+
- npm
- Docker (for Elasticsearch & Kibana)
- IMAP-enabled email accounts (with app passwords)
- Gemini/OpenAI API Key

### Backend Setup

1. **Clone the repo:**
   ```sh
   git clone https://github.com/Arpit-singh12/OneBox_Assignment.git
   cd OneBox_Assignment/backend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment:**
   - Copy `.env.example` to `.env` and fill in:
     ```
     GEMINI_API_KEY=your_gemini_api_key
     SlackWebhook_URL=your_slack_webhook_url
     INTERESTED_WEBHOOK_URL=your_webhook_url
     ```

4. **Start Elasticsearch & Kibana:**
   ```sh
   docker-compose up -d
   # Access ES at http://localhost:9200, Kibana at http://localhost:5601
   ```

5. **Run backend server:**
   ```sh
   npm run dev
   # Server runs at http://localhost:5000
   ```

### Frontend Setup

1. **Install dependencies:**
   ```sh
   cd ../frontend
   npm install
   ```

2. **Start development server:**
   ```sh
   npm run dev
   # App runs at http://localhost:5173
   ```

---

## 🧑‍💻 Contributor Guide

- Fork and clone the repo.
- Use feature branches for changes.
- Run `npm run lint` before PRs.
- Backend code in [`backend/src`](backend/src/index.ts), frontend in [`frontend/src`](frontend/src/main.tsx).
- Environment variables must be set locally.
- Use Docker for Elasticsearch/Kibana.

---

## 📚 API Reference

### Accounts

- `POST /api/accounts`  
  Add and sync a new IMAP account.

- `GET /api/accounts`  
  List connected accounts.

- `GET /api/accounts/saved`  
  List saved account configs (no passwords).

- `POST /api/accounts/reconnect`  
  Reconnect a saved account (requires password).

- `GET /api/accounts/search/category?category=...&account=...&folder=...`  
  Search emails by category/account/folder.

### Emails

- `GET /api/emails?email=...`  
  Get emails for an account.

- `POST /api/emails/search`  
  Search emails (body: `{ query, account, folder }`).

### AI Suggested Reply

- `POST /api/reply/suggest`  
  Get AI reply suggestion (body: `{ subject, body, email }`).

---

## 🏗️ Implementation Details

- **IMAP Sync:**  
  [`imap/iClient.ts`](backend/src/imap/iClient.ts) uses ImapFlow for persistent connections and real-time updates.

- **Elasticsearch:**  
  [`elastic.service.ts`](backend/src/services/elastic.service.ts) manages indexing, searching, and counting emails.

- **AI Categorization:**  
  [`Category/categorizer.ts`](backend/src/Category/categorizer.ts) uses Gemini for classification, with rule-based fallback and caching.

- **Suggested Replies:**  
  [`reply.service.ts`](backend/src/services/reply.service.ts) uses Gemini + vector DB (Chroma) for RAG-based responses.

- **Integrations:**  
  [`webhook.service.ts`](backend/src/services/webhook.service.ts) and [`slack.service.ts`](backend/src/services/slack.service.ts) handle notifications.

- **Frontend:**  
  [`App.tsx`](frontend/src/App.tsx) provides dashboard, email list/detail, account management, and search/filter UI.

---

## 🧩 Folder Structure

```
backend/
  src/
    controllers/
    routes/
    imap/
    services/
    utils/
    Category/
    config/
frontend/
  src/
    components/
    hooks/
    types/
```

---

## 🐛 Troubleshooting

- **IMAP login failed:** Use app password, enable IMAP.
- **Elasticsearch errors:** Ensure Docker is running, check port 9200.
- **AI errors:** Validate API key and environment variables.
- **Emails not syncing:** Check backend logs, account status.

---

## 📄 License

MIT

---

**Built with ❤️ by contributors for efficient, intelligent email