import React, {useEffect, useState} from 'react';

/**
 * @param {{
 *   slides?: Array<{
 *     id: string | number;
 *     title: string;
 *     subtitle?: string;
 *     description?: string;
 *     cta_label?: string;
 *     cta_link?: string;
 *     imageUrl?: string;
 *   }>;
 * }} props 
 */
export function HeroCarousel({slides = []}) {
  // Local fallback slides for when Shopify metaobjects are not configured yet
  const defaultSlides = [
    {
      id: 1,
      title: 'Find your perfect tone',
      subtitle: 'Curated instruments for every musician',
      description:
        'From vintage guitars to studio-ready keys, explore handpicked gear tuned for feel and sound.',
      cta_label: 'Shop instruments',
      cta_link: '/collections/all',
      imageUrl:
        'https://images.pexels.com/photos/811838/pexels-photo-811838.jpeg?auto=compress&cs=tinysrgb&w=1200',
    },
    {
      id: 2,
      title: 'Studio-ready sound',
      subtitle: 'Microphones, monitors & more',
      description:
        'Build a creative space that inspires you with pro‑grade audio gear and accessories.',
      cta_label: 'Browse studio gear',
      cta_link: '/collections',
      imageUrl:
        'https://images.pexels.com/photos/995301/pexels-photo-995301.jpeg?auto=compress&cs=tinysrgb&w=1200',
    },
    {
      id: 3,
      title: 'Play every stage',
      subtitle: 'Live performance essentials',
      description:
        'From pedals to PA, get everything you need to sound incredible on stage or on stream.',
      cta_label: 'Explore live gear',
      cta_link: '/collections',
      imageUrl:
        'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=1200',
    },
  ];

  // Prefer slides from Shopify; fall back to local defaults
  const items = slides && slides.length ? slides : defaultSlides;
  const [activeIndex, setActiveIndex] = useState(0);

  // Optional autoplay – change slide every 6 seconds
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  const active = items[activeIndex];

  return (
    <section className="relative w-full overflow-hidden bg-slate-950/95 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 md:flex-row md:items-center md:py-16 lg:px-8">
        {/* Text */}
        <div className="relative z-10 max-w-2xl space-y-4 md:space-y-6">
          {active.subtitle ? (
            <p className="inline-flex items-center rounded-full bg-slate-900/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/90 sm:text-sm">
              {active.subtitle}
            </p>
          ) : null}
          <br />
          <br />

          {/* {active.title ? (
            <h2 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl md:text-5xl lg:text-6xl">
              {active.title}
            </h2>
          ) : null} */}

          {active.description ? (
            <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {active.description}
            </p>
          ) : null}

          <br />
          <br />

          {active.cta_link || active.cta_label ? (
            <div className="pt-3">
              <a
                href={active.cta_link}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold tracking-wide text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 underline-none"
              >
                {active.cta_label}
                <span className="text-lg" aria-hidden>
                  →
                </span>
              </a>
            </div>
          ) : null}
        </div>

        {/* Image */}
        <div className="relative ml-auto flex w-full max-w-6xl flex-1 items-center justify-center md:max-w-6xl">
          <div className="relative aspect-[4/3] md:aspect-[5/3] w-full overflow-hidden rounded-3xl border border-slate-700/70 bg-gradient-to-br from-emerald-500/15 via-sky-500/10 to-fuchsia-500/15 shadow-[0_25px_80px_rgba(15,23,42,0.9)]">
            {active.imageUrl ? (
              <img
                src={active.imageUrl}
                alt={active.title}
                className="h-full w-full object-cover object-center opacity-95"
                loading="lazy"
              />
            ) : null}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(16,185,129,0.25),transparent_55%),radial-gradient(circle_at_100%_0,rgba(59,130,246,0.16),transparent_55%)] mix-blend-screen" />
          </div>
        </div>
      </div>

      {/* Dots / indicators */}
      <div className="flex justify-center gap-2 pb-4">
        {items.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={slide.id ?? index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                isActive
                  ? 'w-8 bg-emerald-400'
                  : 'w-3 bg-slate-600 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          );
        })}
      </div>
    </section>
  );
}