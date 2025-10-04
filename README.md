# OneBox_Assignment
Assignment - Build a Feature-Rich Onebox for Emails

---

<<<<<<< HEAD
## Backend
=======
## Features
>>>>>>> 899ae2097c7521fd15eeb12067857974216bac0f


---

<<<<<<< HEAD
=======
## Local Environment Setup
>>>>>>> 899ae2097c7521fd15eeb12067857974216bac0f

## Features

### **1. Real-Time Email Synchronization**

- Sync multiple **IMAP accounts** in real-time - minimum 2
- Fetch **at least the last 30 days** of emails
- Use **persistent IMAP connections (IDLE mode)** for real-time updates (**No cron jobs!**).

### **2. Searchable Storage using Elasticsearch**

- Store emails in a **locally hosted Elasticsearch** instance (use Docker).
- Implement indexing to **make emails searchable**.
- Support filtering by **folder & account**.

### **3. AI-Based Email Categorization**

- Implement an AI model to categorize emails into the following labels:
    - **Interested**
    - **Meeting Booked**
    - **Not Interested**           
    - **Spam**
    - **Out of Office**

### **4. Slack & Webhook Integration**

- Send **Slack notifications** for every new **Interested** email.
- Trigger **webhooks** (use [webhook.site](https://webhook.site) as the webhook URL) for external automation when an email is marked as **Interested**.

### **5. AI-Powered Suggested Replies**

- Store the **product and outreach agenda** in a **vector database**.
- Use **RAG (Retrieval-Augmented Generation)** with any LLM to suggest replies.

### **6. Frontend Interface**
- Build a simple UI to display emails, filter by folder/account, and show AI categorization.

---

<<<<<<< HEAD
=======
## Contributor Guide
>>>>>>> 899ae2097c7521fd15eeb12067857974216bac0f

## Tech Stack :-

-- **Node.js** with **Express**
-- **TypeScript**
-- **Dotenv**
-- **LongChain + Choroma**
-- **IMAP** ("imapflow")
-- **ElasticSearch via Docker**
-- **OpenAI/Gemini API**
-- **Slack Webhooks**
-- **Mailparser**


---

<<<<<<< HEAD
## Folder Structure

=======
## API Reference

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

## Implementation Details

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

## Folder Structure

```
>>>>>>> 899ae2097c7521fd15eeb12067857974216bac0f
backend/
── src/
   ── controllers/
   ── routes/
   ── imap/
   ── services/
   ── utils/
   ── index.ts

── .env
── package.json
── tsconfig.json
── docker-compose.yml

<<<<<<< HEAD
=======
## Troubleshooting
>>>>>>> 899ae2097c7521fd15eeb12067857974216bac0f

## .env setup
locate/create ".env" file and then add the following:-

GEMINI_API_KEY='Enter you API key'/GEMINI_API_KEY='Enter your Gemini API key here'
SlackWebhook_URL='Enter the URL'
INTERESTED_WEBHOOK_URL='Enter the URL'

<<<<<<< HEAD
=======

## Demo link...
https://drive.google.com/file/d/1sYBR3JsdO_wWkNVQtHjTiYtnaACnDuri/view?usp=sharing 

<img width="1919" height="972" alt="Screenshot 2025-09-25 232932" src="https://github.com/user-attachments/assets/929563ba-cd8e-40ee-826c-35023c790115" />

<img width="1919" height="973" alt="Screenshot 2025-09-25 234044" src="https://github.com/user-attachments/assets/9e30d70f-7c95-4f54-ab7a-24ac01723d37" />

---

## Credits:
--Some Part of this Codebase is assisted by Chatgpt for some structure of tackling errors.
--SlackWebhook Documentation.
--Vectordb and Chroma documentaion.

---

## 📄 License
>>>>>>> 899ae2097c7521fd15eeb12067857974216bac0f

## Run this Backend Project Locally...

Follow the following to run this OneBox Backend server on your system:-

###  Prerequisites required..

Carefully install the following before running the backend:-

--**Node.js**(v18)
--**API key**
--**IMAP enabled google account and app password**(After Turning on 2FA)
--**Docker**(Install Docker dekstop and set it up)
--**Postman** (For test APIs purpose..)
--Optional guide:- **use my package.json file dependencies to recheck versions**


-----------------------------------------------------------------------------------------------------------------------------------------

## Setting Up Files on you system


1. Clone the Repository

"git clone https://github.com/Arpit-singh12/OneBox_Assignment.git"

2. Install all dependencies

**npm install**

3. Run ElasticSearch using Docker

Note: you can use my docker-compose.yml file.

On terminal:
    >Run docker --version to confirm docker is installed
    >docker-compose pull to load the docker and Kibana
    >docker-compose down to down the docker server and then again pull
    (This is personal Tip if you caught any error in ES you can do this...)

4. Start the Development server

**npm run dev**

You can see on terminal as:-

Index 'emails' already exists
Server is running on port <PORT>


-----------------------------------------------------------------------------------------------------------------------------------------
## Test the API

Recommended to use Postman

1. Create IMAP account get your key password with you
2. Use Post method http://localhost:5000/api/accounts

3. Make sure Postman read content on json format

4. on body :-
{
  "email": "your@gmail.com",
  "password": "your_app_password",
  "host": "imap.gmail.com",
  "port": 993,
  "secure": true
}


5. Search for emails:-
Use GET method http://localhost:PORT/api/account/search/category?query=demo&account=your@gmail.com&folder=INBOX

6. API 5: Suggest AI Reply (Gemini + Vector): 

POST http://localhost:5000/api/reply/suggest

BODY:
{
  "subject": "Let's schedule an interview",
  "body": "You've been shortlisted. Please share your availability.",
  "email": "hr@example.com"
}


Note:
Some issue you can tackle:-
> Gmail IMAP login failed? Make sure you use an App password.
> Have ElasticSearch Error take a look and check docker is running on port 9200.
> for categorisation issue check you API key and declaration of Key.


## Demo link...
https://drive.google.com/file/d/1sYBR3JsdO_wWkNVQtHjTiYtnaACnDuri/view?usp=sharing 

<img width="1919" height="972" alt="Screenshot 2025-09-25 232932" src="https://github.com/user-attachments/assets/929563ba-cd8e-40ee-826c-35023c790115" />

<img width="1919" height="973" alt="Screenshot 2025-09-25 234044" src="https://github.com/user-attachments/assets/9e30d70f-7c95-4f54-ab7a-24ac01723d37" />


## Credits:
--Some Part of this Codebase is assisted by Chatgpt for some structure of tackling errors.
--SlackWebhook Documentation.
--Vectordb and Chroma documentaion.

<<<<<<< HEAD
=======

**Built with ❤️ by contributors for efficient, intelligent email

>>>>>>> 899ae2097c7521fd15eeb12067857974216bac0f
