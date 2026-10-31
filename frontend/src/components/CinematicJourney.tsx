import { ArrowDown, BookOpen, Check, Compass, Heart, House } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { LogoMark } from './Logo';

gsap.registerPlugin(ScrollTrigger);

const scenes = [
  {
    number: '01',
    title: 'Wonder',
    heading: 'Every beautiful journey begins with a question.',
    body: 'What does it take to build a family through adoption?',
    image: '/images/child-outdoors.webp',
    alt: 'A young child playing outdoors in natural light.',
    color: '#f8f5ee',
  },
  {
    number: '02',
    title: 'Understanding',
    heading: 'Understanding where to begin changes everything.',
    body: 'A little clarity can make a complex system feel more human.',
    image: '/images/family-reading.webp',
    alt: 'A child exploring a toy camera during an everyday moment at home.',
    color: '#d2ded0',
  },
  {
    number: '03',
    title: 'Preparation',
    heading: 'Every step becomes easier with the right guidance.',
    body: 'Move at your own pace, with trusted information close at hand.',
    image: '/images/family-outdoors.webp',
    alt: 'Families and children spending a quiet evening together outdoors.',
    color: '#ede7da',
  },
  {
    number: '04',
    title: 'Support',
    heading: 'You do not have to navigate the journey alone.',
    body: 'Thoughtful guidance helps you find the next right question.',
    image: '/images/story-scene.webp',
    alt: 'A parent and two young children sharing an everyday moment at home.',
    color: '#173d32',
  },
];

export function CinematicJourney() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!root.current) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const stage = root.current?.querySelector<HTMLElement>('[data-story-stage]');
        const emblem = root.current?.querySelector<HTMLElement>('[data-story-emblem]');
        const photos = gsap.utils.toArray<HTMLElement>('[data-story-photo]');
        if (!stage || !emblem || photos.length !== scenes.length) return;

        gsap.set(photos, { autoAlpha: 0, scale: 1.035 });
        gsap.set(photos[0], { autoAlpha: 1, scale: 1 });
        gsap.set(emblem, { x: 0, y: 0, scale: 1, rotation: -8 });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top+=88',
            end: 'bottom bottom',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        const positions = [
          { x: 105, y: -86, scale: 0.82, rotation: 8 },
          { x: -90, y: 110, scale: 1.08, rotation: -13 },
          { x: 95, y: 95, scale: 0.9, rotation: 12 },
        ];

        positions.forEach((position, index) => {
          const at = index + 0.72;
          timeline
            .to(stage, { backgroundColor: scenes[index + 1].color, duration: 1 }, at)
            .to(photos[index], { autoAlpha: 0, scale: 1.06, duration: 0.55 }, at)
            .to(photos[index + 1], { autoAlpha: 1, scale: 1, duration: 0.65 }, at + 0.12)
            .to(emblem, { ...position, duration: 1, ease: 'power1.inOut' }, at + 0.15);
        });

        timeline.to(emblem, { x: 0, y: 0, scale: 1.06, rotation: 0, duration: 0.7 }, 3.65);
        return () => timeline.scrollTrigger?.kill();
      });

      return () => media.revert();
    }, root);

    return () => context.revert();
  }, []);

  return (
    <section ref={root} className="story-experience section" aria-label="The EKTARA journey">
      <div className="container-page">
        <div className="mb-10 max-w-2xl space-y-3">
          <p className="eyebrow">A gentler way to find your footing</p>
          <p className="text-sm leading-7 text-ink-soft">
            These four chapters describe the EKTARA experience—not official adoption stages. They are a storytelling guide; official procedures and responsibilities depend on the pathway and are set by the relevant authorities.
          </p>
        </div>
        <div className="story-grid grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:gap-16">
          <div className="story-steps">
            {scenes.map((scene) => (
              <article className="story-step" key={scene.number}>
                <p className="eyebrow">{scene.number} / {scene.title}</p>
                <h2 className="mt-4 max-w-xl text-4xl leading-[1.08] tracking-[-0.03em] sm:text-5xl">
                  {scene.heading}
                </h2>
                <p className="mt-5 max-w-md text-base leading-7 text-ink-soft sm:text-lg">
                  {scene.body}
                </p>
                {scene.number === '04' && (
                  <Link className="btn-secondary mt-7 w-fit" to="/navigator">
                    Explore the Route Navigator <Heart className="h-4 w-4" aria-hidden />
                  </Link>
                )}
              </article>
            ))}
          </div>

          <div className="story-stage" data-story-stage>
            {scenes.map((scene, index) => (
              <div className="story-photo" data-story-photo key={scene.number} aria-hidden="true">
                <img
                  src={scene.image}
                  alt=""
                  width={1200}
                  height={900}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
            <div className="story-emblem" data-story-emblem aria-hidden="true">
              <LogoMark size={76} />
            </div>
            <span className="story-float left-[9%] top-[15%]" aria-hidden="true"><Compass className="h-5 w-5" /></span>
            <span className="story-float right-[8%] top-[35%]" aria-hidden="true"><BookOpen className="h-5 w-5" /></span>
            <span className="story-float bottom-[19%] left-[12%]" aria-hidden="true"><Check className="h-5 w-5" /></span>
            <span className="story-float bottom-[13%] right-[15%]" aria-hidden="true"><House className="h-5 w-5" /></span>
            <p className="story-note text-xs font-medium">
              Illustrative family moments only. No child shown is available for adoption or matching.
            </p>
          </div>
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-soft lg:hidden">
          <ArrowDown className="h-3.5 w-3.5" aria-hidden /> Scroll through each chapter
        </p>
      </div>
    </section>
  );
}
