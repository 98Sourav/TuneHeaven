import React from 'react';
import {Link} from 'react-router';

/**
 * @param {{
 *   title?: string;
 *   heading?: string;
 *   posts?: Array<{
 *     id: string;
 *     title: string;
 *     excerpt?: string | null;
 *     href: string;
 *     imageUrl?: string | null;
 *     imageAlt?: string | null;
 *     author?: string | null;
 *     publishedAt?: string | null;
 *   }>;
 * }}
 */
export function BlogSection({
  title = 'Latest on the Blog',
  heading = 'From the TuneHeaven Journal',
  posts = [],
}) {
  const hasPosts = posts?.length > 0;

  return (
    <section className="w-full bg-gradient-to-b from-slate-900 via-slate-950 to-black py-14 text-slate-50 sm:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300">
            {title}
          </p>
          <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {heading}
          </h3>
          <p className="max-w-2xl text-sm text-slate-400">
            Dive deeper into the world of music gear with curated guides and interviews from the TuneHeaven editorial team.
          </p>
        </div>

        {hasPosts ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <article
                key={post.id}
                className="group relative flex flex-col bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/90 shadow-[0_25px_60px_rgba(2,6,23,0.65)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_35px_80px_rgba(16,185,129,0.15)]"
                style={{
                  clipPath: index === 0 
                    ? 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' 
                    : 'polygon(0 0, 100% 0, 100% 100%, 40px 100%, 0 calc(100% - 40px))',
                  border: '2px solid rgba(148, 163, 184, 0.2)',
                }}
              >
                {/* Accent corner gradient */}
                <div 
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
                  style={{
                    background: index === 0 
                      ? 'linear-gradient(135deg, transparent 85%, rgba(16,185,129,0.2) 100%)'
                      : 'linear-gradient(225deg, transparent 85%, rgba(16,185,129,0.2) 100%)',
                  }}
                />

                <Link to={post.href} className="relative block aspect-[4/3] overflow-hidden" style={{clipPath: 'inherit'}}>
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.imageAlt || post.title}
                      className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-slate-800 text-xs uppercase tracking-[0.18em] text-slate-400">
                      No image
                    </div>
                  )}
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
                  
                  <span className="absolute bottom-4 left-4 rounded-full bg-emerald-500/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300 backdrop-blur-md border border-emerald-400/30 transition-all duration-300 group-hover:bg-emerald-500/30 group-hover:border-emerald-400/50">
                    Read more
                  </span>
                </Link>

                <div className="relative flex flex-1 flex-col gap-4 px-5 pb-6 pt-6">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-slate-400">
                    <span className="font-semibold text-emerald-400">{post.author || 'TuneHeaven'}</span>
                    {post.publishedAt ? (
                      <>
                        <span className="h-1 w-1 rounded-full bg-emerald-500/60" aria-hidden="true" />
                        <span>
                          {new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }).format(new Date(post.publishedAt))}
                        </span>
                      </>
                    ) : null}
                  </div>
                  <Link to={post.href} className="text-lg font-bold leading-tight text-white transition-colors hover:text-emerald-300">
                    {post.title}
                  </Link>
                  <p className="flex-1 text-sm leading-relaxed text-slate-400">{post.excerpt ?? ''}</p>
                  <Link
                    to={post.href}
                    className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-400 transition-all duration-200 hover:gap-3 hover:text-emerald-300"
                  >
                    Continue Reading
                    <svg
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-700/80 bg-slate-900/40 px-6 py-14 text-center">
            <p className="text-base font-semibold uppercase tracking-[0.2em] text-slate-200">
              Blog stories coming soon
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Publish a few articles in your Shopify admin and they will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
