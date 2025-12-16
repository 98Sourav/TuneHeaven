import React from 'react';

/**
 * CategoryStrip
 *
 * Responsive strip section like "Explore by Category".
 * Styling is Tailwind-only.
 * Data comes from props so you can plug in Shopify metaobjects/collections.
 *
 * @param {{
 *   title?: string;
 *   items: Array<{
 *     id: string | number;
 *     title: string;
 *     imageUrl: string;
 *     href?: string;
 *   }>;
 * }} props
 */
export function CategoryStrip({title = 'Explore by Category', items}) {
  if (!items || !items.length) return null;

  return (
    <section className="w-full bg-slate-950/95 py-8 text-slate-50 sm:py-10">
      {/* Centered container with equal left/right padding */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10">
        {/* Section header */}
        <div className="flex items-center gap-3 pb-6 sm:pb-8">
          <div className="hidden flex-1 border-t border-slate-700 sm:block" />
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.22em] text-slate-200 sm:text-base">
            {title}
          </h2>
          <div className="hidden flex-1 border-t border-slate-700 sm:block" />
        </div>

        {/* Scrollable row on mobile, centered grid on larger screens */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-slate-950 to-transparent sm:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-slate-950 to-transparent sm:hidden" />

          <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-3 sm:grid sm:auto-cols-fr sm:grid-cols-2 sm:gap-8 md:grid-cols-3 lg:grid-cols-5 sm:overflow-visible sm:pb-0">
            {items.map((item) => {
              const content = (
                <div className="flex w-40 flex-col items-center gap-3 sm:w-auto">
                  <div className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/80 shadow-[0_18px_40px_rgba(15,23,42,0.85)]">
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                  <p className="text-center text-xs font-medium tracking-[0.18em] text-slate-200 sm:text-sm">
                    {item.title}
                  </p>
                </div>
              );

              return (
                <div
                  key={item.id}
                  className="snap-center sm:snap-none flex-shrink-0 sm:flex-shrink"
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      className="group flex flex-col items-center gap-2 transition-transform duration-150 hover:-translate-y-1"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="group flex flex-col items-center gap-2">
                      {content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
