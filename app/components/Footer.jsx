import {Suspense, useState} from 'react';
import {Await, NavLink} from 'react-router';
import logo from '~/assets/logo.png';

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  const [newsletterStatus, setNewsletterStatus] = useState('idle');

  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => {
          const menu = footer?.menu || FALLBACK_FOOTER_MENU;
          const shopName = header?.shop?.name ?? 'TuneHeaven';

          return (
            <footer className="w-full bg-slate-950 text-slate-300 border-t border-slate-800">
              <div className="w-full px-4 py-8 sm:px-6 lg:px-10">
                <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.6fr)] items-start">
                  {/* Brand & description */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      <img
                        src={logo}
                        alt={shopName}
                        className="h-35 w-auto object-contain"
                      />
                    </div>
                    <p className="max-w-md text-sm text-slate-400">
                      Modern instruments, warm analog tone. Discover guitars, keys, drums and studio gear tuned for creators.
                    </p>
                  </div>

                  {/* Footer navigation from Shopify menu */}
                  {menu && header.shop.primaryDomain?.url && (
                    <div className="pt-4">
                      <FooterMenu
                        menu={menu}
                        primaryDomainUrl={header.shop.primaryDomain.url}
                        publicStoreDomain={publicStoreDomain}
                      />
                    </div>
                  )}

                  {/* Newsletter section */}
                  <div className="space-y-4 md:col-span-2 lg:col-span-1 pt-4">
                    <h3 className="text-sm font-semibold tracking-[0.22em] text-slate-100 uppercase">
                      Stay in tune
                    </h3>
                    <p className="text-sm text-slate-400">
                      Get updates on new drops, studio tips, and exclusive TuneHeaven offers. <br />No noise, only signal.
                    </p>
                    <form
                      className="flex flex-col gap-3 sm:flex-row sm:items-center"
                      onSubmit={async (event) => {
                        event.preventDefault();
                        const form = event.currentTarget;
                        const data = new FormData(form);
                        setNewsletterStatus('submitting');
                        try {
                          const res = await fetch('/api/newsletter', {
                            method: 'POST',
                            body: data,
                          });
                          if (!res.ok) throw new Error('Request failed');
                          setNewsletterStatus('success');
                          form.reset();
                        } catch (error) {
                          console.error('Newsletter signup failed', error);
                          setNewsletterStatus('error');
                        }
                      }}
                    >
                      <input
                        type="email"
                        required
                        placeholder="Enter your email"
                        className="w-full rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold tracking-wide text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={newsletterStatus === 'submitting'}
                      >
                        {newsletterStatus === 'submitting'
                          ? 'Plz wait...'
                          : 'Subscribe'}
                      </button>
                    </form>
                    {newsletterStatus === 'success' && (
                      <p className="text-xs text-emerald-300">Thanks for subscribing!</p>
                    )}
                    {newsletterStatus === 'error' && (
                      <p className="text-xs text-rose-400">Something went wrong. Please try again.</p>
                    )}
                  </div>
                </div>

                {/* Social row */}
                <div className="mt-8 flex flex-col gap-4 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4 text-slate-100">
                    <span className="text-xs uppercase tracking-[0.22em] text-slate-200">
                      Follow Us
                    </span>
                    <div className="flex items-center gap-3">
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-600/80 bg-slate-900/80 text-white transition hover:border-emerald-400 hover:text-white"
                      >
                        <span className="sr-only">Instagram</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-4.5 w-4.5"
                          fill="currentColor"
                        >
                          <path d="M7 3C4.24 3 2 5.24 2 8v8c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V8c0-2.76-2.24-5-5-5H7zm0 2h10c1.66 0 3 1.34 3 3v8c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V8c0-1.66 1.34-3 3-3zm5 2.5A4.5 4.5 0 007.5 12 4.5 4.5 0 0012 16.5 4.5 4.5 0 0016.5 12 4.5 4.5 0 0012 7.5zm0 2A2.5 2.5 0 0114.5 12 2.5 2.5 0 0112 14.5 2.5 2.5 0 019.5 12 2.5 2.5 0 0112 9.5zm4.75-3.25a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" />
                        </svg>
                      </a>
                      <a
                        href="https://youtube.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-700/70 bg-slate-900/70 text-white transition hover:border-emerald-400 hover:text-emerald-300"
                      >
                        <span className="sr-only">YouTube</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-5.5 w-5.5"
                          fill="currentColor"
                        >
                          <path d="M21.8 8.001a2.75 2.75 0 00-1.93-1.947C18.25 5.5 12 5.5 12 5.5s-6.25 0-7.87.554A2.75 2.75 0 002.2 8.001 28.7 28.7 0 001.5 12a28.7 28.7 0 00.7 3.999 2.75 2.75 0 001.93 1.947C5.75 18.5 12 18.5 12 18.5s6.25 0 7.87-.554a2.75 2.75 0 001.93-1.947A28.7 28.7 0 0022.5 12a28.7 28.7 0 00-.7-3.999zM10 15.25v-6.5L15.5 12 10 15.25z" />
                        </svg>
                      </a>
                      <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-700/70 bg-slate-900/70 text-white transition hover:border-emerald-400 hover:text-emerald-300"
                      >
                        <span className="sr-only">Facebook</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-6.5 w-6.5"
                          fill="currentColor"
                        >
                          <path d="M13.5 9H15V6.75A7.52 7.52 0 0013.06 6C10.9 6 9.5 7.24 9.5 9.7V11H7v3h2.5v6h3v-6h2.25L15 11h-2.5v-1.1c0-.84.22-1.35 1-1.35z" />
                        </svg>
                      </a>
                      <a
                        href="https://x.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-700/70 bg-slate-900/70 text-white transition hover:border-emerald-400 hover:text-emerald-300"
                      >
                        <span className="sr-only">X</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-4.5 w-4.5"
                          fill="currentColor"
                        >
                          <path d="M5 4h3.02L14 11.07 18.5 4H20l-4.94 7.7L19 20h-3.02L10 12.93 5.5 20H4l5-7.8z" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-end">
                    <p>
                      &copy; {new Date().getFullYear()} TuneHeaven. All rights reserved.
                    </p>
                    {/* <p className="text-[11px] uppercase tracking-[0.18em] text-slate-600">
                      Powered by Shopify Hydrogen
                    </p> */}
                  </div>
                </div>
              </div>
            </footer>
          );
        }}
      </Await>
    </Suspense>
  );
}

/**
 * @param {{
 *   menu: FooterQuery['menu'];
 *   primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
 *   publicStoreDomain: string;
 * }}
 */
function FooterMenu({menu, primaryDomainUrl, publicStoreDomain}) {
  const baseClasses =
    'block text-[11px] font-medium uppercase tracking-[0.18em] transition-colors';

  const renderItem = (item) => {
    if (!item.url) return null;

    const rawUrl = item.url;
    const url =
      rawUrl.includes('myshopify.com') ||
      rawUrl.includes(publicStoreDomain) ||
      rawUrl.includes(primaryDomainUrl)
        ? new URL(rawUrl).pathname
        : rawUrl;

    const isExternal = !url.startsWith('/');

    if (isExternal) {
      return (
        <a
          href={url}
          key={item.id}
          rel="noopener noreferrer"
          target="_blank"
          className={`${baseClasses} text-slate-300 hover:text-emerald-300`}
        >
          {item.title}
        </a>
      );
    }

    return (
      <NavLink
        end
        key={item.id}
        prefetch="intent"
        to={url}
        className={({isActive, isPending}) =>
          `${baseClasses} ${
            isActive
              ? 'text-emerald-300'
              : isPending
              ? 'text-slate-500'
              : 'text-slate-300'
          }`
        }
      >
        {item.title}
      </NavLink>
    );
  };

  const primaryItems = menu?.items ?? [];
  const policyItems = FALLBACK_FOOTER_MENU.items;

  return (
    <nav role="navigation" className="text-[11px] text-slate-300">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
        {/* Left column: primary footer links from Shopify Admin (e.g. Contact Us, Track Order, Return Policy) */}
        <div className="space-y-2">
          {primaryItems.map((item) => renderItem(item))}
        </div>

        {/* Right column: policy links (fallback/footer menu from Shopify Admin) */}
        <div className="space-y-2">
          {policyItems.map((item) => renderItem(item))}
        </div>
      </div>
    </nav>
  );
}


const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    // {
    //   id: 'gid://shopify/MenuItem/461633093688',
    //   resourceId: 'gid://shopify/ShopPolicy/23358013496',
    //   tags: [],
    //   title: 'Refund Policy',
    //   type: 'SHOP_POLICY',
    //   url: '/policies/refund-policy',
    //   items: [],
    // },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'white',
  };
}

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
