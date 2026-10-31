import { ExternalLink, Send } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Disclaimer } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { api } from '../services/api';
import type { AssistantReply } from '../types';

interface Msg {
  role: 'user' | 'assistant' | 'error';
  text: string;
  reply?: AssistantReply;
}

const SUGGESTIONS = [
  'How do I begin adoption in India?',
  'What is CARA?',
  'What is CARINGS?',
  'What does a Home Study Report mean?',
  'What documents should I understand before registration?',
  'What is the difference between domestic and inter-country adoption?',
  'Who conducts the Home Study Report?',
  'Where can I find an authorised adoption agency?',
];

const MODE_LABEL: Record<AssistantReply['mode'], string> = {
  'gemini-grounded': 'AI-simplified, using only approved sources',
  'faq-fallback': 'Approved text shown directly (AI is not configured)',
  'no-source': 'No approved source matched',
};
const ANSWER_TYPE_LABEL: Record<AssistantReply['answerType'], string> = {
  official: 'Information supported by official sources',
  general: 'General explanation',
  confirmation: 'Needs confirmation from an authority or qualified professional',
};

export default function Assistant() {
  const { t, lang } = useLang();
  const { status } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [msgs, busy]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setInput('');
    setMsgs((m) => [...m, { role: 'user', text: q }]);
    setBusy(true);
    try {
      const reply = await api<AssistantReply>('/assistant/chat', { method: 'POST', body: { message: q, language: lang }, auth: false });
      setMsgs((m) => [...m, { role: 'assistant', text: reply.answer, reply }]);
    } catch (e: any) {
      setMsgs((m) => [...m, { role: 'error', text: e.message }]);
    } finally {
      setBusy(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    ask(input);
  }

  return (
    <div className="container-page max-w-3xl space-y-5 py-6 sm:py-8">
      <header className="space-y-3 rounded-2xl border border-beige-200 bg-gradient-to-br from-peach-100 via-ivory-100 to-white p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-700">A careful guide</p>
        <h1 className="text-3xl sm:text-4xl">{t('assistant.title')}</h1>
        <p className="max-w-2xl text-sm text-ink-soft">
          {status?.demoMode
            ? 'Demo answers use seeded reference content that may not have been independently verified. Confirm details directly with official sources. Please do not type personal or sensitive details.'
            : 'Answers come from EKTARA’s reviewed sources, with the source shown. If it doesn’t have a reliable answer, it will say so. Please don’t type personal or sensitive details.'}
        </p>
        <p className="rounded-xl border border-beige-200 bg-white/70 px-3 py-2 text-xs text-ink-soft">
          Current mode: {status?.demoMode
            ? 'seeded demo references; verification status is shown with each answer'
            : status
              ? (status.assistant === 'gemini-grounded' ? 'AI-simplified answers from reviewed sources' : 'curated reviewed text only (AI not configured)')
              : 'checking…'}
          {lang === 'hi' && ' · Approved source text is currently available in English only.'}
        </p>
        <Disclaimer />
      </header>

      {msgs.length > 0 && (
        <div className="flex justify-end">
          <button type="button" className="btn-ghost !px-3 !py-1.5 text-sm" onClick={() => setMsgs([])} disabled={busy}>
            Clear conversation
          </button>
        </div>
      )}
      <div className="card min-h-[320px] space-y-4 border border-beige-200 bg-white/90" role="log" aria-label="Assistant conversation" aria-relevant="additions">
        {msgs.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-ink">Questions to get started</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="btn-secondary !rounded-xl !px-3 !py-2 text-left text-sm" onClick={() => ask(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
            <div className={`max-w-[92%] space-y-2 rounded-2xl p-3 text-sm sm:max-w-[85%] ${m.role === 'user' ? 'bg-forest-700 text-white' : m.role === 'error' ? 'bg-red-50 text-red-900' : 'border border-beige-200 bg-ivory-100'}`}>
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.reply && (
                <>
                  <p className="text-xs text-ink-soft">
                    {m.reply.sources.some((source) => source.verificationStatus !== 'verified')
                      ? 'Demo reference (not independently verified)'
                      : MODE_LABEL[m.reply.mode]}
                  </p>
                  <p className="text-xs font-semibold text-forest-800">{ANSWER_TYPE_LABEL[m.reply.answerType]}</p>
                  {m.reply.sources.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-ink">Sources</p>
                      {m.reply.sources.map((s) => (
                        <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-beige-200 bg-white p-2 text-ink hover:bg-ivory-100">
                          <span className="block font-medium">{s.organisation}</span>
                          <span className="flex items-center gap-1 text-sm font-semibold">
                            {s.title} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                          </span>
                          <span className="mt-1 block text-xs text-ink-soft">
                            {s.documentName}
                            {s.section ? ` · ${s.section}` : ''} · last reviewed {s.lastReviewed}
                          </span>
                          {s.verificationStatus !== 'verified' && (
                            <span className="mt-1 block text-xs font-semibold text-ink">
                              Source verification pending
                            </span>
                          )}
                          <span className="mt-2 block text-xs text-ink-soft">
                            Relevant to: {s.relevance}. {s.summary}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="text-xs"><strong>Next step:</strong> {m.reply.nextStep}</p>
                  <p className="text-xs text-ink-soft">{m.reply.notice}</p>
                </>
              )}
            </div>
          </div>
        ))}
        {busy && <p className="text-sm text-ink-soft" role="status">Looking through approved sources…</p>}
        <div ref={end} />
      </div>

      <form onSubmit={submit} className="flex flex-col gap-2 rounded-2xl border border-beige-200 bg-white p-3 sm:flex-row">
        <label htmlFor="q" className="sr-only">Your question</label>
        <input id="q" className="input min-w-0 flex-1" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('assistant.placeholder')} maxLength={600} />
        <button className="btn-primary justify-center sm:shrink-0" disabled={busy || !input.trim()}>
          <Send className="h-4 w-4" aria-hidden /> {t('assistant.send')}
        </button>
      </form>
    </div>
  );
}
