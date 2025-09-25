import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { format } from 'date-fns';
import { EsStoreEmail } from '../services/elastic.service';
import { categorizeEmail } from '../Category/categorizer';  


export async function connectAndSync(account: {
  email: string;
  password: string;
  host: string;
  port: number;
  secure: boolean;
}) {
  const client = new ImapFlow({
    host: account.host,
    port: account.port,
    secure: account.secure,
    auth: {
      user: account.email,
      pass: account.password,
    },
  });

  await client.connect();
  console.log("Connect successfully to IMAP server")
  console.log(`Connected to ${account.email}`);

  await client.mailboxOpen('INBOX');

  const since = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'dd-MMM-yyyy'); 

  // Fetching last 30 days of emails from the server...
  for await (const msg of client.fetch({ since }, { uid: true, envelope: true, source: true })) {
    if (msg.source) {
      const parsed = await simpleParser(msg.source);
      console.log(`[${account.email}] Subject: ${parsed.subject}`);

      // Categorising the emails....
      const category = await categorizeEmail(parsed.subject || '', parsed.text || '');
      console.log(`Category: ${category}`);

      // Passing category to Elasticsearch storage...
      await EsStoreEmail(parsed, 'INBOX', account.email, category ?? undefined);
    } else {
      console.warn(`[${account.email}] No source found for message with UID: ${msg.uid}`);
    }
  }

  // Start IDLE mode for real-time email synchronization
  console.log(`Starting IDLE mode for ${account.email}`);
  
  // Set up real-time email monitoring
  client.on('exists', async (mailbox) => {
    console.log(`New email received for ${account.email} in ${mailbox.path}`);
    
    // Get the latest email count to fetch only new emails
    const status = await client.status('INBOX', { messages: true });
    const latestCount = status.messages || 0;
    
    if (latestCount > 0) {
      const lock = await client.getMailboxLock('INBOX');
      try {
        // Fetch the latest email (highest UID)
        const message = await client.fetchOne(latestCount, { source: true });
        if (message?.source) {
          const parsed = await simpleParser(message.source);
          console.log(`[${account.email}] New: ${parsed.subject}`);

          // Categorize the email with full specs for the notification
          const category = await categorizeEmail(parsed.subject || '', parsed.text || '', {
            subject: parsed.subject,
            from: parsed.from?.text,
            to: Array.isArray(parsed.to)
              ? parsed.to.map(addr => addr.text).join(', ')
              : parsed.to?.text,
            text: parsed.text,
            html: parsed.html,
            date: parsed.date,
            folder: 'INBOX',
            account: account.email,
          });

          // Adding category of mail before actually storing it
          const parsedWithCategory = {
            ...parsed,
            category: category || 'Uncategorized',
          };

          await EsStoreEmail(parsedWithCategory, 'INBOX', account.email);
        } else {
          console.warn(`[${account.email}] Mail not found for message.`);
        }
      } catch (err) {
        console.error(`Error processing new email for ${account.email}:`, err);
      } finally {
        lock.release();
      }
    }
  });

  // Start IDLE mode for persistent connection
  try {
    await client.idle();
    console.log(`IDLE mode active for ${account.email}`);
  } catch (err) {
    console.error(`Failed to start IDLE mode for ${account.email}:`, err);
    // Fallback to periodic noop if IDLE fails
    setInterval(() => {
      client.noop().catch(console.error);
    }, 10 * 60 * 1000); // every 10 minutes
  }
}
