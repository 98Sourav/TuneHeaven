import React from 'react';

/**
 * TopBrands
 *
 * Responsive "Top Brands" logo grid.
 * Tailwind-only styling.
 *
 * @param {{
 *   title?: string;
 *   items: Array<{
 *     id: string | number;
 *     title: string;
 *     imageUrl: string | null;
 *     href: string;
 *   }>;
 * }} props
 */
export function TopBrands({title = 'Top Brands', items}) {
  if (!items || !items.length) return null;

  return (
    <section className="w-full bg-slate-950 py-10 text-slate-50 sm:py-12">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10">
        {/* Section header */}
        <div className="flex items-center gap-3 pb-6 sm:pb-8">
          <div className="hidden flex-1 border-t border-slate-700 sm:block" />
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.22em] text-slate-100 sm:text-base">
            {title}
          </h2>
          <div className="hidden flex-1 border-t border-slate-700 sm:block" />
        </div>

        {/* Responsive logo grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((brand) => (
            <a
              key={brand.id}
              href={brand.href}
              className="group flex items-center justify-center bg-slate-950 px-4 py-6 shadow-[0_14px_30px_rgba(15,23,42,0.7)] transition-transform duration-150 hover:-translate-y-1"
            >
              {brand.imageUrl ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <img
                  src={brand.imageUrl}
                  alt={brand.title}
                  loading="lazy"
                  className="h-42 w-full border-4 border-slate-800 bg-slate-900 object-contain p-1"
                />
              ) : (
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">
                  {brand.title}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
