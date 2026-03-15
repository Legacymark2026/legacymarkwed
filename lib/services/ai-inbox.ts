import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const DEFAULT_MODEL = 'gemini-2.5-flash';

export interface InboxAnalysisResult {
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'URGENT';
  topic: string;
}

/**
 * Analyzes an incoming message to determine sentiment and intent mapping.
 */
export async function analyzeIncomingMessage(messageContent: string): Promise<InboxAnalysisResult> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("No GEMINI_API_KEY found. Falling back to basic heuristic triage.");
    return fallbackAnalysis(messageContent);
  }

  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
    const prompt = `
      Analyze the following message from a customer and return a JSON object with two fields:
      - "sentiment": Must be exactly one of "POSITIVE", "NEUTRAL", "NEGATIVE", or "URGENT".
      - "topic": A concise 1-3 word classification of what the message is about (e.g., "Pricing Inquiry", "Support Request", "Complaint").
      
      Message: "${messageContent}"
      
      Respond only with the raw JSON object, no markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Clean potential markdown blocks
    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    return {
      sentiment: ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'URGENT'].includes(parsed.sentiment) ? parsed.sentiment : 'NEUTRAL',
      topic: parsed.topic || 'General Inquiry'
    };
  } catch (error) {
    console.error("[analyzeIncomingMessage] Error calling Gemini API:", error);
    return fallbackAnalysis(messageContent);
  }
}

/**
 * Drafts an AI reply based on conversation history.
 */
export async function draftCopilotReply(conversationId: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return "Please configure GEMINI_API_KEY to use the AI Copilot.";
  }

  try {
    const activeConversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 10
        },
        lead: true
      }
    });

    if (!activeConversation) throw new Error("Conversation not found");

    const historyContext = activeConversation.messages.map(m => 
      `${m.direction === 'INBOUND' ? 'Customer' : 'Agent'}: ${m.content}`
    ).join("\n");

    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
    const prompt = `
      You are a professional, helpful customer support agent for highly professional tech company.
      Draft a polite, concise reply to the customer based on the recent conversation history.
      Do not include placeholders like "[Your Name]". Keep the tone professional but warm.
      
      Conversation History:
      ${historyContext}
      
      Draft Reply (just the response text):
    `;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("[draftCopilotReply] Error:", error);
    return "I'm sorry, I couldn't generate a draft at this time. Please try again.";
  }
}

// Fallback logic if API key is missing
function fallbackAnalysis(message: string): InboxAnalysisResult {
  const text = message.toLowerCase();
  let sentiment: InboxAnalysisResult['sentiment'] = 'NEUTRAL';
  let topic = 'General Inquiry';

  if (text.includes('urgent') || text.includes('asap') || text.includes('help')) sentiment = 'URGENT';
  else if (text.includes('terrible') || text.includes('refund') || text.includes('bad')) sentiment = 'NEGATIVE';
  else if (text.includes('great') || text.includes('thanks') || text.includes('love')) sentiment = 'POSITIVE';

  if (text.includes('price') || text.includes('cost')) topic = 'Pricing';
  else if (text.includes('issue') || text.includes('broken')) topic = 'Support';

  return { sentiment, topic };
}
