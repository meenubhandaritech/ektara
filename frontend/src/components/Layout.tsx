import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { Logo } from './Logo';
import { Disclaimer } from './ui';

export function Layout() {
  const { t, lang, setLang } = useLang();
  const { me, status, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 20);
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  const links = [
    ['/', t('nav.home')],
    ['/understand', t('nav.understand')],
    ['/journey', t('nav.journey')],
    ['/navigator', t('nav.navigator')],
    ['/resources', t('nav.resources')],
  ] as const;

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `site-nav-link rounded-full px-2.5 py-2 text-[0.72rem] font-semibold transition-colors xl:px-3 xl:text-xs ${isActive ? 'text-forest-900' : 'text-ink-soft hover:text-forest-900'}`;

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2">
        Skip to content
      </a>
      {status?.demoMode && (
        <div role="status" className="bg-peach-200 px-4 py-2 text-center text-sm font-medium text-ink">
          {t('demo.banner')}
        </div>
      )}
      <header className={`site-header sticky top-0 z-40 border-b border-transparent bg-ivory/90 backdrop-blur-lg ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-3">
          <Link to="/" aria-label="EKTARA home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} className={linkCls}>
                {label}
              </NavLink>
            ))}
            <Link to="/#about" className="site-nav-link rounded-full px-2.5 py-2 text-[0.72rem] font-semibold text-ink-soft transition-colors hover:text-forest-900 xl:px-3 xl:text-xs">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="lang">
              {t('lang.label')}
            </label>
            <select id="lang" className="rounded-full border border-beige-200 bg-white px-2 py-1 text-sm" value={lang} onChange={(e) => setLang(e.target.value as 'en' | 'hi')}>
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
            <div className="hidden items-center gap-2 lg:flex">
              {me ? (
                <>
                  <Link to="/dashboard" className="btn-secondary">
                    {t('nav.dashboard')}
                  </Link>
                  {(me.role === 'admin' || me.role === 'editor') && (
                    <Link to="/admin" className="btn-ghost">
                      {t('nav.admin')}
                    </Link>
                  )}
                  <button
                    className="btn-ghost"
                    onClick={async () => {
                      await logout();
                      nav('/');
                    }}
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hidden px-2 py-2 text-sm font-semibold text-forest-900 transition-colors hover:text-earth sm:inline-flex">
                    {t('nav.login')}
                  </Link>
                  <Link to="/navigator" className="btn-primary">
                    Start your journey
                  </Link>
                </>
              )}
            </div>
            <button className="btn-ghost lg:hidden" aria-label={t('nav.menu')} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((o) => !o)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav id="mobile-navigation" className="container-page flex flex-col gap-1 pb-4 lg:hidden" aria-label="Mobile" onClick={() => setOpen(false)}>
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} className={linkCls}>
                {label}
              </NavLink>
            ))}
            <Link to="/#about" className="site-nav-link rounded-full px-2.5 py-2 text-sm font-medium text-ink-soft hover:text-forest-900">
              About
            </Link>
            <NavLink to="/assistant" className={linkCls}>{t('nav.assistant')}</NavLink>
            <NavLink to="/directory" className={linkCls}>{t('nav.directory')}</NavLink>
            {me ? (
              <>
                <NavLink to="/dashboard" className={linkCls}>
                  {t('nav.dashboard')}
                </NavLink>
                {(me.role === 'admin' || me.role === 'editor') && (
                  <NavLink to="/admin" className={linkCls}>
                    {t('nav.admin')}
                  </NavLink>
                )}
                <button
                  className="rounded-full px-3 py-1.5 text-left text-sm font-medium text-ink-soft hover:bg-sage-100"
                  onClick={async () => {
                    await logout();
                    nav('/');
                  }}
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkCls}>
                  {t('nav.login')}
                </NavLink>
                <NavLink to="/navigator" className={linkCls}>
                  Start your journey
                </NavLink>
              </>
            )}
          </nav>
        )}
      </header>
      {lang === 'hi' && (
        <p role="status" className="border-b border-beige-200 bg-ivory-100 px-5 py-2 text-center text-xs leading-relaxed text-ink-soft">
          {t('lang.partial')}
        </p>
      )}

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-beige-200 bg-ivory-100">
        <div className="container-page grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-4">
            <Logo />
            <Disclaimer />
            <p className="max-w-3xl text-sm leading-6 text-ink-soft">
              Official adoption registration and processing happen on{' '}
              <a className="font-semibold text-forest-800 underline underline-offset-4" href="https://carings.wcd.gov.in/" target="_blank" rel="noopener noreferrer">
                CARINGS
              </a>
              ; official guidance is published by{' '}
              <a className="font-semibold text-forest-800 underline underline-offset-4" href="https://www.wcd.gov.in/prospective-adoptive-parents/cara" target="_blank" rel="noopener noreferrer">
                CARA
              </a>
              .
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm font-semibold text-forest-800" aria-label="Footer">
            <Link className="hover:underline" to="/assistant">{t('nav.assistant')}</Link>
            <Link className="hover:underline" to="/directory">{t('nav.directory')}</Link>
            <Link className="hover:underline" to="/privacy">{t('footer.privacy')}</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
