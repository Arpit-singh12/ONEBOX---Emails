import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

import { notifySlack, triggerInterestedWebhook } from '../services/webhook.service';

// Gemini Setup...
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Simple in-memory cache for categorizations
const categorizationCache = new Map<string, EmailCategory>();
const CACHE_MAX_SIZE = 1000; // Limit cache size

// General categories...

export const EmailCategories = [
  'Interested',
  'Action required',
  'Meeting Booked',
  'Not Interested',
  'Spam',
  'Out of Office',
  'Action Required',
] as const;

export type EmailCategory = (typeof EmailCategories)[number];

/**
 * Uses Gemini to categorize an email into a predefined category.
 * @param subject Email subject
 * @param body Email plain text content
 * @param fullEmail (Optional) original parsed email used for webhooks
 */


// Cache management
function addToCache(subject: string, body: string, category: EmailCategory): void {
  const key = generateCacheKey(subject, body);
  
  // Clear cache if it gets too large
  if (categorizationCache.size >= CACHE_MAX_SIZE) {
    const firstKey = categorizationCache.keys().next().value;
    categorizationCache.delete(firstKey);
  }
  
  categorizationCache.set(key, category);
}

function getFromCache(subject: string, body: string): EmailCategory | null {
  const key = generateCacheKey(subject, body);
  return categorizationCache.get(key) || null;
}

function generateCacheKey(subject: string, body: string): string {
  // Create a hash of subject + body for consistent caching
  const content = `${subject.toLowerCase().trim()} ${body.toLowerCase().trim()}`;
  return crypto.createHash('md5').update(content).digest('hex');
}

// Rule-based categorization as fallback
function ruleBasedCategorization(subject: string, body: string): EmailCategory {
  const subjectLower = subject.toLowerCase();
  const bodyLower = body.toLowerCase();
  const combinedText = `${subjectLower} ${bodyLower}`;

  // Spam detection
  const spamKeywords = ['unsubscribe', 'opt out', 'no longer wish', 'remove from list', 'marketing', 'promotion', 'discount', 'sale', 'limited time'];
  if (spamKeywords.some(keyword => combinedText.includes(keyword))) {
    return 'Spam';
  }

  // Out of Office detection
  const oooKeywords = ['out of office', 'vacation', 'away', 'unavailable', 'auto-reply', 'automatic reply'];
  if (oooKeywords.some(keyword => combinedText.includes(keyword))) {
    return 'Out of Office';
  }

  // Meeting Booked detection
  const meetingKeywords = ['meeting', 'call', 'appointment', 'schedule', 'calendar', 'zoom', 'teams', 'google meet', 'conference'];
  if (meetingKeywords.some(keyword => combinedText.includes(keyword))) {
    return 'Meeting Booked';
  }

  // Action Required detection
  const actionKeywords = ['action required', 'please respond', 'reply needed', 'urgent', 'asap', 'deadline', 'complete', 'verify'];
  if (actionKeywords.some(keyword => combinedText.includes(keyword))) {
    return 'Action Required';
  }

  // Interested detection (business/professional emails)
  const interestedKeywords = ['proposal', 'opportunity', 'collaboration', 'partnership', 'business', 'work', 'project', 'job', 'interview'];
  if (interestedKeywords.some(keyword => combinedText.includes(keyword))) {
    return 'Interested';
  }

  // Not Interested detection (generic/automated emails)
  const notInterestedKeywords = ['newsletter', 'update', 'notification', 'system', 'automated', 'no-reply', 'noreply'];
  if (notInterestedKeywords.some(keyword => combinedText.includes(keyword))) {
    return 'Not Interested';
  }

  // Default to Action Required for important-looking emails
  if (subjectLower.includes('important') || subjectLower.includes('urgent') || subjectLower.includes('asap')) {
    return 'Action Required';
  }

  // Default categorization
  return 'Not Interested';
}

export async function categorizeEmail(
  subject: string,
  body: string,
  fullEmail?: any
): Promise<EmailCategory | null> {
  // Check cache first
  const cachedCategory = getFromCache(subject, body);
  if (cachedCategory) {
    console.log(`Using cached categorization: ${cachedCategory}`);
    
    if (cachedCategory === 'Interested' && fullEmail) {
      await Promise.all([
        notifySlack(fullEmail),
        triggerInterestedWebhook(fullEmail),
      ]);
    }
    
    return cachedCategory;
  }

  // First try AI categorization
  try {
    const prompt = `
You are an assistant that categorizes email content into one of the following categories:
- Interested
- Action required
- Meeting Booked
- Not Interested
- Spam
- Out of Office
- Action Required

Only reply with the exact category name from the above list. Do not add any explanation.

Email Subject: ${subject}
Email Body: ${body}
    `.trim();

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    const category = response.text().trim();

    if (EmailCategories.includes(category as EmailCategory)) {
      console.log(`AI categorized as: ${category}`);
      
      // Cache the result
      addToCache(subject, body, category as EmailCategory);
      
      if (category === 'Interested' && fullEmail) {
        await Promise.all([
          notifySlack(fullEmail),
          triggerInterestedWebhook(fullEmail),
        ]);
      }

      return category as EmailCategory;
    } else {
      console.warn('AI returned unknown category:', category);
      // Fallback to rule-based
      const fallbackCategory = ruleBasedCategorization(subject, body);
      console.log(`Fallback categorized as: ${fallbackCategory}`);
      
      // Cache the fallback result
      addToCache(subject, body, fallbackCategory);
      
      if (fallbackCategory === 'Interested' && fullEmail) {
        await Promise.all([
          notifySlack(fullEmail),
          triggerInterestedWebhook(fullEmail),
        ]);
      }
      
      return fallbackCategory;
    }
  } catch (error) {
    console.error('AI categorization failed:', error);
    console.log('Using rule-based fallback categorization...');
    
    // Use rule-based categorization as fallback
    const fallbackCategory = ruleBasedCategorization(subject, body);
    console.log(`Fallback categorized as: ${fallbackCategory}`);
    
    // Cache the fallback result
    addToCache(subject, body, fallbackCategory);
    
    if (fallbackCategory === 'Interested' && fullEmail) {
      await Promise.all([
        notifySlack(fullEmail),
        triggerInterestedWebhook(fullEmail),
      ]);
    }
    
    return fallbackCategory;
  }
}
