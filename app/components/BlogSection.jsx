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
            {posts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/50 shadow-[0_25px_60px_rgba(2,6,23,0.65)] transition-transform duration-200 hover:-translate-y-1 hover:border-emerald-400/50"
              >
                <Link to={post.href} className="relative block aspect-[4/3] overflow-hidden">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.imageAlt || post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-slate-800 text-xs uppercase tracking-[0.18em] text-slate-400">
                      No image
                    </div>
                  )}
                  <span className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white backdrop-blur">
                    Read more
                  </span>
                </Link>

                <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-6">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                    <span>{post.author || 'TuneHeaven'}</span>
                    {post.publishedAt ? (
                      <>
                        <span className="h-1 w-1 rounded-full bg-slate-500" aria-hidden="true" />
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
                  <Link to={post.href} className="text-lg font-semibold text-white transition-colors hover:text-emerald-300">
                    {post.title}
                  </Link>
                  <p className="flex-1 text-sm text-slate-400">{post.excerpt ?? ''}</p>
                  <Link
                    to={post.href}
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300"
                  >
                    Continue Reading
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
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
