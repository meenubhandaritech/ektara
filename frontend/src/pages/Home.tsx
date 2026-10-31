import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  FileText,
  Heart,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CinematicJourney } from '../components/CinematicJourney';
import { LogoMark } from '../components/Logo';
import { Accordion, Disclaimer } from '../components/ui';
import { useLang } from '../context/LangContext';
import { AUTHORITIES, HOME_FAQ, PATHWAYS } from '../data/education';

const promises = [
  {
    icon: BookOpen,
    title: 'Understand the language',
    body: 'Clear explanations for terms, steps, and the people involved.',
  },
  {
    icon: Compass,
    title: 'Find a starting point',
    body: 'Preliminary pointers to official information that may be relevant.',
  },
  {
    icon: ShieldCheck,
    title: 'Stay close to sources',
    body: 'Government sources stay distinct from professional and educational material.',
  },
  {
    icon: HeartHandshake,
    title: 'Prepare at your pace',
    body: 'A private checklist, notes, and reminders when you are ready.',
  },
];

export default function Home() {
  const { t } = useLang();

  return (
    <>
      <section className="hero-section relative overflow-hidden">
        <div className="container-page grid min-h-[min(48rem,calc(100svh-5rem))] items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_0.94fr] lg:gap-16 lg:py-16">
          <div className="relative z-10 space-y-7 lg:py-12">
            <p className="eyebrow inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2">
              <LogoMark size={21} /> An independent guide to adoption in India
            </p>
            <h1 className="max-w-3xl text-5xl leading-[1.03] tracking-[-0.04em] sm:text-6xl lg:text-[4.7rem]">
              {t('hero.title')}
            </h1>
            <p className="max-w-xl text-lg leading-8 text-ink-soft sm:text-xl">
              {t('hero.body')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/navigator" className="btn-primary">
                {t('hero.cta1')} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/understand" className="btn-secondary">
                {t('hero.cta2')}
              </Link>
            </div>
            <p className="max-w-lg text-xs leading-5 text-ink-soft">
              EKTARA is independent. It does not replace CARA or CARINGS, assess eligibility, or match children.
            </p>
          </div>

          <div className="hero-frame relative mx-auto w-full max-w-[39rem] px-3 pb-8 pt-4 sm:px-7">
            <div className="editorial-photo hero-image aspect-[0.93] max-h-[39rem]">
              <img
                src="/images/story-scene.webp"
                alt="A parent and two young children sharing an everyday moment at home."
                width={1200}
                height={900}
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-x-4 bottom-4 z-10 rounded-2xl border border-white/35 bg-forest-900/45 p-4 text-white backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:p-5">
                <p className="font-serif text-2xl leading-tight sm:text-3xl">A little more clarity. A little less overwhelm.</p>
                <p className="mt-2 text-xs leading-5 text-white/85">
                  Illustrative family photography. No child shown is available for adoption or matching.
                </p>
              </div>
            </div>
            <div className="absolute -bottom-1 -left-1 z-10 flex items-center gap-3 rounded-2xl border border-beige-200 bg-ivory px-4 py-3 shadow-editorial sm:-left-4 sm:bottom-0">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-sage-200 text-forest-900">
                <Heart className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-sm font-semibold text-forest-900">A thoughtful first step</span>
            </div>
          </div>
        </div>
        <a href="#about" className="mx-auto mb-7 hidden w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-forest-800 lg:flex">
          Explore EKTARA <ArrowDown className="h-4 w-4" aria-hidden />
        </a>
      </section>

      <section id="about" className="section bg-white">
        <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-20">
          <div className="space-y-5">
            <p className="eyebrow">A companion, not an authority</p>
            <h2 className="display-heading">The first step can simply be understanding.</h2>
          </div>
          <div className="space-y-5">
            <p className="text-lg leading-8 text-ink-soft">
              Adoption can bring new terms, different pathways, and many questions. EKTARA helps you explore them in plain language and find the official sources behind the answers.
            </p>
            <p className="text-lg leading-8 text-ink-soft">
              There is no need to have it all figured out. Start with what you want to understand today.
            </p>
            <Disclaimer />
          </div>
        </div>
      </section>

      <CinematicJourney />

      <section className="section bg-ivory-100">
        <div className="container-page space-y-10">
          <div className="max-w-2xl space-y-4">
            <p className="eyebrow">A few steady companions</p>
            <h2 className="display-heading">Small steps. Clearer questions.</h2>
            <p className="text-lg leading-8 text-ink-soft">
              Helpful tools for learning and preparation—designed to support your own choices, not make them for you.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {promises.map(({ icon: Icon, title, body }, index) => (
              <article key={title} className="card group !p-6 sm:!p-7">
                <span className="mb-7 grid h-12 w-12 place-items-center rounded-2xl bg-sage-100 text-forest-800 transition-transform duration-300 group-hover:-translate-y-1">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="mb-3 text-xs font-bold tracking-[0.16em] text-earth">0{index + 1}</p>
                <h3 className="text-2xl leading-tight">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="space-y-5">
            <p className="eyebrow">How to use EKTARA</p>
            <h2 className="display-heading">A learning guide, not an official process.</h2>
            <p className="text-lg leading-8 text-ink-soft">
              These are ways EKTARA can help you prepare. They are separate from official adoption procedures, which vary by pathway and must be confirmed with the relevant authorities.
            </p>
            <Link to="/journey" className="btn-secondary w-fit">Explore the official-process overview <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          <ol className="divide-y divide-beige-200 border-y border-beige-200">
            {[
              ['01', 'Learn', 'Read plain-language explanations and get familiar with the terms.'],
              ['02', 'Explore', 'Use the Navigator to find official information that may be relevant.'],
              ['03', 'Prepare', 'Use optional private notes, reminders, and checklists at your own pace.'],
            ].map(([number, title, body]) => (
              <li key={number} className="grid gap-3 py-6 sm:grid-cols-[4rem_1fr] sm:gap-6 sm:py-8">
                <span className="font-serif text-3xl text-earth">{number}</span>
                <div>
                  <h3 className="text-2xl">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bg-sage-100">
        <div className="container-page grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:gap-20">
          <div className="space-y-5 lg:sticky lg:top-28">
            <p className="eyebrow">Different circumstances, different guidance</p>
            <h2 className="display-heading">Understand the route before the details.</h2>
            <p className="text-base leading-7 text-ink-soft">
              Pathways can depend on the family’s situation and current rules. These summaries are only starting points—confirm the relevant process with CARA or a qualified professional.
            </p>
            <Link to="/understand#pathways" className="btn-primary">Compare pathways in the guide</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {PATHWAYS.map((pathway, index) => (
              <Link
                key={pathway.id}
                to={`/understand#pathway-${pathway.id}`}
                className="group rounded-2xl border border-forest-900/10 bg-ivory/75 p-5 transition-colors hover:bg-white sm:p-6"
              >
                <span className="font-serif text-2xl text-earth">0{index + 1}</span>
                <h3 className="mt-3 text-xl">{pathway.title}</h3>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-forest-800">
                  Read the overview <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
          <div className="space-y-5">
            <p className="eyebrow">A little help with your questions</p>
            <h2 className="display-heading">Curiosity deserves careful answers.</h2>
            <p className="text-lg leading-8 text-ink-soft">
              The EKTARA Assistant draws only on approved material, shows its sources, and is honest when it cannot answer. It will not decide eligibility or predict outcomes.
            </p>
            <Link to="/assistant" className="btn-primary w-fit">
              Visit the EKTARA Assistant <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] bg-forest-900 p-7 text-white sm:p-10">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full border border-white/15" aria-hidden />
            <div className="absolute -right-3 -top-3 h-32 w-32 rounded-full border border-white/15" aria-hidden />
            <div className="relative space-y-5">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                <MessageCircle className="h-5 w-5" aria-hidden />
              </span>
              <p className="font-serif text-3xl leading-tight">“Where can I find official guidance?”</p>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-6 text-white/80">
                Start with CARA’s official guidance for prospective adoptive parents. The Assistant shares links so you can check current information directly.
              </div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-sage-300">
                <ShieldCheck className="h-4 w-4" aria-hidden /> Source-led, not a legal opinion
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-20">
          <div className="space-y-5">
            <p className="eyebrow">Your preparation space</p>
            <h2 className="display-heading">Keep your own next steps in one quiet place.</h2>
            <p className="text-lg leading-8 text-ink-soft">
              Save a route, keep a checklist, and make private notes or reminders. Your dashboard is for preparation—it is not an official CARINGS application status.
            </p>
            <Link to="/register" className="btn-secondary w-fit">
              Create your preparation space <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="rounded-[2rem] border border-beige-200 bg-ivory-100 p-5 shadow-soft sm:p-8">
            <div className="flex items-center justify-between border-b border-beige-200 pb-5">
              <div>
                <p className="eyebrow">A space for you</p>
                <p className="mt-2 font-serif text-2xl text-forest-900">Your preparation</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-sage-200 text-forest-900"><Heart className="h-5 w-5" aria-hidden /></span>
            </div>
            <div className="space-y-3 py-5">
              {[
                [Check, 'A checklist that follows your route'],
                [FileText, 'Notes only you can see'],
                [Sparkles, 'Reminders you set for yourself'],
              ].map(([Icon, text]) => {
                const ItemIcon = Icon as typeof Check;
                return (
                  <div key={text as string} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm text-ink-soft">
                    <ItemIcon className="h-4 w-4 shrink-0 text-forest-700" aria-hidden />{text as string}
                  </div>
                );
              })}
            </div>
            <p className="text-xs leading-5 text-ink-soft">Private preparation tools. No document uploads, child records, or government-system connection.</p>
          </div>
        </div>
      </section>

      <section className="section bg-ivory-100">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div className="space-y-5">
            <p className="eyebrow">Grounded in official sources</p>
            <h2 className="display-heading">Go back to the source whenever you need to.</h2>
            <p className="text-lg leading-8 text-ink-soft">
              CARA and CARINGS remain the official channels. EKTARA helps you find your way to them with more context.
            </p>
            <Link to="/resources" className="btn-primary w-fit">Browse resources</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['CARA', 'Official guidance and information from India’s central adoption authority.'],
              ['CARINGS', 'The government portal where official registration and processing take place.'],
              ['Trusted material', 'EKTARA’s library distinguishes official, professional, and educational sources.'],
              ['Support directory', 'Find verified sources and organisations; entries are reviewed before listing.'],
            ].map(([title, body], index) => (
              <Link key={title} to={index === 3 ? '/directory' : '/resources'} className="group rounded-2xl border border-beige-200 bg-white p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-6">
                <span className="eyebrow">0{index + 1}</span>
                <h3 className="mt-3 text-2xl">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{body}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-forest-800">
                  Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div className="space-y-5">
            <p className="eyebrow">People and responsibilities</p>
            <h2 className="display-heading">A few of the names you may come across.</h2>
            <p className="text-base leading-7 text-ink-soft">
              Roles and responsibilities are set by the official system. These plain-language summaries are a starting point, not legal definitions.
            </p>
            <Link to="/understand" className="btn-secondary w-fit">Understand the system</Link>
          </div>
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {AUTHORITIES.slice(0, 6).map((authority) => (
              <div key={authority.abbr} className="border-t border-beige-200 pt-4">
                <dt className="font-serif text-2xl text-forest-900">{authority.abbr}</dt>
                <dd className="mt-1 text-xs font-semibold text-earth">{authority.name}</dd>
                <dd className="mt-2 text-sm leading-6 text-ink-soft">{authority.role}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section bg-sage-100">
        <div className="container-page grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div className="space-y-5">
            <p className="eyebrow">Questions are welcome</p>
            <h2 className="display-heading">A few things people often wonder about.</h2>
            <Link to="/understand" className="btn-secondary w-fit">Read the guide <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          <div className="space-y-3">
            {HOME_FAQ.map((faq) => (
              <Accordion key={faq.q} title={faq.q}>{faq.a}</Accordion>
            ))}
          </div>
        </div>
      </section>

      <section id="start" className="final-cta relative overflow-hidden bg-forest-900 py-20 text-center text-white sm:py-28">
        <div className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full border border-white/10" aria-hidden />
        <div className="pointer-events-none absolute -right-20 -bottom-32 h-96 w-96 rounded-full border border-white/10" aria-hidden />
        <div className="container-page relative space-y-6">
          <p className="eyebrow text-sage-300">Whenever you are ready</p>
          <h2 className="mx-auto max-w-4xl font-serif text-5xl leading-[1.05] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
            Every child deserves a loving home.
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
            Every family’s story is different. Start with a question, explore the information, and take your next step when it feels right.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to="/navigator" className="btn rounded-full bg-ivory px-6 py-3 text-forest-900 hover:bg-white">
              Start your journey <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/understand" className="btn border border-white/35 bg-transparent px-6 py-3 text-white hover:bg-white/10">
              Explore adoption
            </Link>
          </div>
          <div className="mx-auto max-w-2xl pt-7 text-left"><Disclaimer /></div>
        </div>
      </section>
    </>
  );
}
