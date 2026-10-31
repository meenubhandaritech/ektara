import { Accordion, Disclaimer } from '../components/ui';
import { AUTHORITIES, CARA_URL, COMPARISON, GLOSSARY, PATHWAYS } from '../data/education';

export default function Understand() {
  return (
    <div className="container-page space-y-12 py-8 sm:py-12">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sage-100 via-ivory to-peach-100 px-6 py-8 sm:px-10 sm:py-12">
        <div className="relative max-w-3xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700">A clear place to begin</p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">Understanding adoption</h1>
          <p className="max-w-3xl text-base leading-relaxed text-ink-soft sm:text-lg">
          Plain-language explanations of how adoption works in India. This is general information, not legal advice. Details can change, so always confirm them on the{' '}
          <a className="underline" href={CARA_URL} target="_blank" rel="noopener noreferrer">
            official CARA page
          </a>
          . Detailed pages are currently in English; legal text is never machine-translated.
          </p>
          <div className="max-w-3xl pt-1"><Disclaimer /></div>
          <p className="max-w-3xl rounded-xl border border-beige-200 bg-white/70 p-4 text-sm leading-relaxed text-ink-soft">
            Legal-review note: this is a plain-language orientation, not a section-by-section legal guide. Specific statutory provisions have not been independently reviewed for this page. Confirm the current law and route with official government publications or a qualified legal professional.
          </p>
        </div>
      </header>

      <section className="grid gap-5 rounded-3xl border border-beige-200 bg-white p-6 sm:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)] sm:items-start sm:p-8">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-peach-500">The foundation</p>
          <h2 className="text-2xl font-semibold sm:text-3xl">What adoption means</h2>
        </div>
        <p className="max-w-3xl leading-relaxed text-ink-soft">
          Adoption is a legal process that makes a child a permanent member of a family. In India, adoption of children in need of care takes place through an official system overseen by CARA, with registration and processing on the CARINGS portal.
        </p>
      </section>

      <section id="pathways" className="space-y-5 scroll-mt-24">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-peach-500">Routes through the system</p>
          <h2 className="text-2xl font-semibold sm:text-3xl">Legal pathways</h2>
        </div>
        <div className="space-y-3">
          {PATHWAYS.map((p) => (
            <div key={p.id} id={`pathway-${p.id}`} className="scroll-mt-24">
              <Accordion title={p.title}>
                {p.body}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-3xl bg-ivory-100 p-6 sm:p-8">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-peach-500">Helpful distinctions</p>
          <h2 className="text-2xl font-semibold sm:text-3xl">Adoption is not the same as…</h2>
          <p className="text-sm leading-relaxed text-ink-soft">These are separate arrangements. They are not interchangeable procedures.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COMPARISON.map((c) => (
            <div key={c.term} className="card !rounded-2xl !p-5 transition-shadow duration-200 hover:shadow-md motion-reduce:transition-none">
              <h3 className="font-serif text-lg text-forest-900">{c.term}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.meaning}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-peach-500">People and institutions</p>
          <h2 className="text-2xl font-semibold sm:text-3xl">Who does what</h2>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-beige-200 bg-white shadow-sm">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <caption className="sr-only">Authorities and their roles</caption>
            <thead className="bg-sage-100 text-forest-900">
              <tr>
                <th scope="col" className="px-4 py-3">Body</th>
                <th scope="col" className="px-4 py-3">Full name</th>
                <th scope="col" className="px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {AUTHORITIES.map((a) => (
                <tr key={a.abbr} className="border-t border-beige-200 align-top transition-colors duration-150 hover:bg-ivory-100 motion-reduce:transition-none">
                  <th scope="row" className="px-4 py-3 font-semibold text-forest-900">{a.abbr}</th>
                  <td className="px-4 py-3">{a.name}</td>
                  <td className="px-4 py-3 leading-relaxed text-ink-soft">{a.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-5">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-peach-500">Words you may encounter</p>
          <h2 className="text-2xl font-semibold sm:text-3xl">Glossary</h2>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="card !rounded-2xl !p-5">
              <dt className="font-serif text-lg text-forest-900">{g.term}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-soft">{g.meaning}</dd>
            </div>
          ))}
        </dl>
        <p className="max-w-3xl border-l-2 border-peach-500 pl-3 text-xs leading-relaxed text-ink-soft">
          These explanations are simplified. The authoritative text is the original official law, regulation or notification published by the relevant government body.
        </p>
      </section>
    </div>
  );
}
