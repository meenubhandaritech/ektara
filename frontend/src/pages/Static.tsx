import { Link } from 'react-router-dom';
import { Disclaimer } from '../components/ui';

export function PrivacyPage() {
  return (
    <div className="container-page max-w-3xl space-y-4 py-6 sm:py-10">
      <header className="space-y-3 rounded-2xl border border-beige-200 bg-gradient-to-br from-peach-100 via-ivory-100 to-white p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-700">Trust & transparency</p>
        <h1 className="text-3xl sm:text-4xl">Privacy</h1>
      </header>
      <div className="rounded-2xl border border-beige-200 bg-white p-4 sm:p-5">
        <Disclaimer />
      </div>
      <p className="rounded-xl bg-ivory-100 px-4 py-3 text-sm text-ink-soft">
        This is a project policy designed around the principles of the Digital Personal Data Protection Act, 2023. It must receive legal review before any production deployment.
      </p>
      {[
        ['What we collect', 'Your name, email, optional state, residency status, your chosen route, and the checklist, progress, reminders, bookmarks and notes you create.'],
        ['What we do not collect', 'Aadhaar numbers, passport scans, medical records, uploaded documents, or any information about children. EKTARA never lists, shows or matches children.'],
        ['Why', 'Only to personalise your preparation dashboard (purpose limitation).'],
        ['Who can see it', 'Only you. Administrators manage public content and cannot read your notes, checklist or reminders.'],
        ['Your control', 'You can edit your details and delete your account. Deleting removes your private records.'],
        ['AI assistant', 'Questions you type are processed to find approved answers. When an AI provider is configured, only your question and approved reference text are sent. Please do not type personal or sensitive details.'],
        ['Independence', 'EKTARA is an independent informational platform, not operated or endorsed by the Government of India or CARA.'],
      ].map(([h, b]) => (
        <section key={h} className="space-y-2 rounded-2xl border border-beige-200 bg-white/80 p-4 sm:p-5">
          <h2 className="text-lg font-semibold">{h}</h2>
          <p className="text-sm leading-6 text-ink-soft">{b}</p>
        </section>
      ))}
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="container-page space-y-4 py-12 text-center sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-700">EKTARA</p>
      <h1 className="text-3xl sm:text-4xl">Page not found</h1>
      <p className="mx-auto max-w-md text-sm text-ink-soft">The page you are looking for doesn’t exist.</p>
      <Link to="/" className="btn-primary">Go home</Link>
    </div>
  );
}
