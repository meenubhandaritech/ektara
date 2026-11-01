import { env, geminiConfigured, isDemo } from '../config/env.js';
import { store, type Doc } from './store.js';

export interface SourceCard {
  title: string;
  organisation: string;
  url: string;
  documentName: string;
  section: string;
  relevance: string;
  summary: string;
  lastReviewed: string;
  sourceType: string;
  verificationStatus: string;
}

export interface AssistantReply {
  answer: string;
  sources: SourceCard[];
  mode: 'gemini-grounded' | 'faq-fallback' | 'no-source';
  answerType: 'official' | 'general' | 'confirmation';
  nextStep: string;
  notice: string;
  followUps: string[];
}

const STOP = new Set(['the', 'a', 'an', 'is', 'are', 'what', 'how', 'do', 'i', 'to', 'in', 'of', 'and', 'for', 'can', 'my', 'me', 'does', 'who', 'where', 'it', 'about']);

function tokens(s: string) {
  return s.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\s-]/gu, ' ').split(/\s+/).filter((t) => t && !STOP.has(t));
}

function score(q: string[], a: Doc) {
  const hay = `${a.title} ${(a.keywords ?? []).join(' ')} ${a.content}`.toLowerCase();
  let s = 0;
  for (const t of q) {
    if (hay.includes(t)) s += 1;
    if ((a.keywords ?? []).some((k: string) => k.toLowerCase() === t)) s += 2;
    if (String(a.title).toLowerCase().includes(t)) s += 1;
  }
  return s;
}

export function followUpsFor(ranked: { a: Doc; s: number }[], question: string): string[] {
  const normalizedQuestion = question.toLowerCase();
  return ranked
    .map(({ a }) => String(a.title).trim())
    .filter((title, index, titles) => title && titles.indexOf(title) === index)
    .filter((title) => !normalizedQuestion.includes(title.toLowerCase()))
    .slice(0, 3)
    .map((title) => (/[?!]$/.test(title) ? title : `${title}?`));
}

// Requests the assistant must refuse rather than answer.
const UNSAFE: { re: RegExp; reply: string }[] = [
  { re: /\b(am i|will i be|can i be)\b.*\b(eligible|approved|allowed)\b|\bdo i qualify\b/i, reply: 'I can’t decide whether you are legally eligible — only the official authorities can. I can explain how eligibility is assessed in general and point you to the official sources.' },
  { re: /\b(how long|when)\b.*\b(referral|get a child|will i get|wait)\b|\bguarantee\b/i, reply: 'I can’t predict waiting times, referral dates or outcomes, and nobody can guarantee an adoption. The official process and CARINGS are the only reliable places to understand your position.' },
  { re: /\b(shortcut|bypass|skip|without registering|cheat|faster)\b.*\b(adopt|process|carings|cara)\b|\b(buy|purchase)\b.*\bchild\b/i, reply: 'I can’t help with shortcuts or arrangements outside the official system. Adoption is lawful only through the official process, and approaching children or private intermediaries can harm children and families.' },
  { re: /\bcontact\b.*\b(child|children|orphan)\b|\bmeet\b.*\bchild\b/i, reply: 'Please don’t approach children directly. Contact with children is arranged only through the official, authorised process to protect them.' },
];

export function refusalFor(message: string): string | null {
  for (const u of UNSAFE) if (u.re.test(message)) return u.reply;
  return null;
}

async function callGemini(question: string, context: string, lang: 'en' | 'hi'): Promise<string | null> {
  const system =
    'You are EKTARA Assistant. Answer ONLY using the CONTEXT below. If the context does not contain the answer, say so and point to official authorities. ' +
    'Never declare anyone legally eligible, never predict timelines or availability, never invent legal provisions, never claim access to CARINGS. ' +
    `Use simple language. Reply in ${lang === 'hi' ? 'Hindi' : 'English'}. Keep it under 150 words.`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.gemini.model}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.gemini.apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: `CONTEXT:\n${context}\n\nQUESTION: ${question}` }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 400 },
    }),
  });
  if (!res.ok) return null;
  const json: any = await res.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

export async function answer(message: string, lang: 'en' | 'hi', route?: string): Promise<AssistantReply> {
  const notice = 'EKTARA Assistant gives general information only. It is not legal advice and not an official authority.';
  const refusal = refusalFor(message);
  if (refusal) {
    return {
      answer: refusal,
      sources: [],
      mode: 'no-source',
      answerType: 'confirmation',
      nextStep: 'Check the official CARA website or ask a qualified professional.',
      notice,
      followUps: [],
    };
  }

  const [articles, sources] = await Promise.all([store.list('knowledgeArticles'), store.list('officialSources')]);
  const q = tokens(message);
  const today = new Date().toISOString().slice(0, 10);
  const ranked = articles
    .filter((article) => article.status === 'published')
    .filter(
      (article) =>
        isDemo || sources.some((source) => source.id === article.sourceId && source.verificationStatus === 'verified' && source.nextReview > today),
    )
    .map((a) => ({ a, s: score(q, a) }))
    .filter((x) => x.s >= 2)
    .sort((x, y) => y.s - x.s)
    .slice(0, 3);

  if (ranked.length === 0) {
    return {
      answer:
        'I don’t have approved information that answers this reliably, so I won’t guess. Please check the official CARA website or CARINGS, or ask a qualified professional.',
      sources: [],
      mode: 'no-source',
      answerType: 'confirmation',
      nextStep: 'Open the official CARA guidance for prospective adoptive parents.',
      notice,
      followUps: [],
    };
  }

  const cards: SourceCard[] = [];
  for (const { a } of ranked) {
    const src = sources.find((s) => s.id === a.sourceId);
    if (!src || cards.some((c) => c.url === src.url)) continue;
    cards.push({
      title: src.title,
      organisation: src.organisation,
      url: src.url,
      documentName: a.documentName,
      section: a.section ?? '',
      relevance: a.title,
      summary: src.summary,
      lastReviewed: a.lastReviewed,
      sourceType: src.sourceType,
      verificationStatus: src.verificationStatus,
    });
  }

  if (cards.length === 0) {
    return {
      answer: 'I could not find a reliable source for this information, so I won’t guess. Please check the official CARA website or ask a qualified professional.',
      sources: [],
      mode: 'no-source',
      answerType: 'confirmation',
      nextStep: 'Open the official CARA guidance for prospective adoptive parents.',
      notice,
      followUps: [],
    };
  }

  const context = ranked.map(({ a }) => `- ${a.title}: ${a.content}`).join('\n');
  let text: string | null = null;
  let mode: AssistantReply['mode'] = 'faq-fallback';
  if (geminiConfigured) {
    try {
      text = await callGemini(message, route ? `${context}\n(User's selected route for context: ${route})` : context, lang);
      if (text) mode = 'gemini-grounded';
    } catch {
      text = null;
    }
  }
  const fallbackText = ranked[0].a.content;
  if (typeof fallbackText !== 'string' || fallbackText.length === 0) {
    throw new Error('Published knowledge article is missing valid content.');
  }
  if (!text) {
    // Fallback: curated approved text, shown as-is. Hindi is not machine-translated here to avoid inventing wording.
    text = fallbackText;
  }
  const answerText = !mode.includes('gemini') && lang === 'hi'
    ? 'अनुमोदित सामग्री अभी केवल अंग्रेज़ी में उपलब्ध है:\n' + fallbackText
    : text ?? fallbackText;
  return {
    answer: answerText,
    sources: cards,
    mode,
    answerType: cards.every((card) => card.sourceType === 'official' && card.verificationStatus === 'verified' && sources.find((source) => source.url === card.url)?.nextReview > today)
      ? 'official'
      : cards.every((card) => card.verificationStatus === 'verified')
        ? 'general'
        : 'confirmation',
    nextStep: 'Confirm the details on the linked official source before taking any step.',
    notice,
    followUps: followUpsFor(ranked, message),
  };
}
