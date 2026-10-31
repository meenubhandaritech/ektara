import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en } from '../locales/en';
import { hi } from '../locales/hi';

export type Lang = 'en' | 'hi';
interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<LangState | null>(null);
const dicts: Record<Lang, Record<string, string>> = { en, hi };

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return localStorage.getItem('ektara-lang') === 'hi' ? 'hi' : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('ektara-lang', l);
    } catch {
      /* storage unavailable; ignore */
    }
  }, []);

  const t = useCallback((key: string) => dicts[lang][key] ?? en[key] ?? key, [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useLang must be used within LangProvider');
  return c;
}
