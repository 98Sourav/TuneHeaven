import {Suspense, useState, useEffect} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {Navbar} from '~/components/Navbar';
import favicon from '~/assets/favicon.svg';
import logo from '~/assets/logo.png';

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <>
      <Navbar
        hamburger={
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-500/60 bg-slate-900/60 text-slate-100 md:hidden"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        }
        brand={
          <NavLink prefetch="intent" to="/" style={activeLinkStyle} end className="flex items-center">
            <img
              src={logo}
              alt={shop.name}
              className="h-32 w-auto object-contain md:h-44"
            />
          </NavLink>
        }
        nav={
          <HeaderMenu
            menu={menu}
            viewport="desktop"
            primaryDomainUrl={header.shop.primaryDomain.url}
            publicStoreDomain={publicStoreDomain}
          />
        }
        ctas={
          <HeaderCtas
            isLoggedIn={isLoggedIn}
            cart={cart}
          />
        }
      />
      <MobileNavOverlay
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
    </>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  const normalizeUrl = (rawUrl) => {
    if (!rawUrl) return '#';
    if (
      rawUrl.includes('myshopify.com') ||
      rawUrl.includes(publicStoreDomain) ||
      rawUrl.includes(primaryDomainUrl)
    ) {
      return new URL(rawUrl).pathname;
    }
    return rawUrl;
  };

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        const url = normalizeUrl(item.url);
        const hasChildren = Array.isArray(item.items) && item.items.length > 0;
        const childLinks = hasChildren
          ? item.items.filter((child) => child?.url && child.title)
          : [];

        const link = (
          <NavLink
            className="header-menu-item"
            end
            key={hasChildren ? undefined : item.id}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );

        if (!hasChildren || viewport !== 'desktop') {
          if (!hasChildren) return link;
          return (
            <div className="header-menu-stack" key={item.id}>
              {link}
              <div className="header-menu-stack-children">
                {childLinks.map((child) => (
                  <NavLink
                    key={child.id}
                    className="header-menu-item child"
                    onClick={close}
                    prefetch="intent"
                    style={activeLinkStyle}
                    to={normalizeUrl(child.url)}
                  >
                    {child.title}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div className="header-menu-parent" key={item.id}>
            {link}
            <div className="header-submenu" role="menu">
              {childLinks.map((child) => (
                <NavLink
                  key={child.id}
                  className="header-submenu-item"
                  onClick={close}
                  prefetch="intent"
                  style={activeLinkStyle}
                  to={normalizeUrl(child.url)}
                >
                  {child.title}
                </NavLink>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'> & {onOpenMobileMenu: () => void}}
 */
function HeaderCtas({isLoggedIn, cart}) {
  return (
    <nav className="header-ctas" role="navigation">
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle} className="hidden md:inline-flex">
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (
              <span className="inline-flex items-center gap-1">
                <IconUser />
                <span className="text-[0.85rem] font-medium tracking-[0.08em] uppercase">
                  {isLoggedIn ? 'Account' : 'Sign in'}
                </span>
              </span>
            )}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <div className="hidden md:inline-flex">
        <FavoritesToggle />
      </div>
      <CartToggle cart={cart} />
    </nav>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button
      className="reset inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-800/50 transition-colors"
      onClick={() => open('search')}
      aria-label="Search"
    >
      <IconSearch />
    </button>
  );
}

function FavoritesToggle() {
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    // Load initial favorites count from localStorage
    const savedFavorites = localStorage.getItem('tuneheaven_favorites');
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites);
        setFavoritesCount(favorites.length);
      } catch (e) {
        console.error('Failed to parse favorites from localStorage', e);
      }
    }

    // Listen for favorites changes
    const handleFavoritesChange = (e) => {
      setFavoritesCount(e.detail);
    };

    window.addEventListener('favoritesChanged', handleFavoritesChange);
    return () => window.removeEventListener('favoritesChanged', handleFavoritesChange);
  }, []);

  return (
    <button
      className="reset inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
      aria-label="Favorites"
    >
      <IconHeart />
      <span className="text-[0.85rem] font-medium tracking-[0.08em] uppercase">
        Favorites
      </span>
      {favoritesCount > 0 && (
        <span className="text-[0.75rem] text-emerald-300">({favoritesCount})</span>
      )}
    </button>
  );
}

/**
 * @param {{count: number | null}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      <span className="inline-flex items-center gap-1">
        <IconCart />
        {count !== null && (
          <span className="text-[0.75rem]">{count}</span>
        )}
      </span>
    </a>
  );
}

function IconUser() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M6.25 18.5C7.4 16.4 9.5 15 12 15C14.5 15 16.6 16.4 17.75 18.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="11"
        cy="11"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M15.5 15.5L19 19"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCart() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 5H5.5L7.2 15.1C7.4 16.3 8.4 17.2 9.6 17.2H16.2C17.3 17.2 18.2 16.5 18.4 15.5L19.5 9H7.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="19.5" r="1" fill="currentColor" />
      <circle cx="16" cy="19.5" r="1" fill="currentColor" />
    </svg>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

function MobileNavOverlay({open, onClose, header, publicStoreDomain}) {
  const {menu} = header;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Slide-in menu from left */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-4/5 max-w-xs flex-col border-r border-slate-700 bg-slate-950 shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-500/60 text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
          {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
            if (!item.url) return null;

            const primaryDomainUrl = header.shop.primaryDomain.url;

            const url =
              item.url.includes('myshopify.com') ||
              item.url.includes(publicStoreDomain) ||
              item.url.includes(primaryDomainUrl)
                ? new URL(item.url).pathname
                : item.url;

            const hasChildren = Array.isArray(item.items) && item.items.length > 0;

            return (
              <div key={item.id}>
                <NavLink
                  to={url}
                  prefetch="intent"
                  onClick={onClose}
                  className="block rounded-lg px-4 py-2.5 font-medium uppercase tracking-[0.12em] text-white hover:bg-slate-800 transition-colors"
                >
                  {item.title}
                </NavLink>
                {hasChildren && (
                  <div className="ml-4 mt-2 space-y-2 border-l-2 border-slate-700 pl-3">
                    {item.items.map((child) => {
                      if (!child.url) return null;
                      const childUrl =
                        child.url.includes('myshopify.com') ||
                        child.url.includes(publicStoreDomain) ||
                        child.url.includes(primaryDomainUrl)
                          ? new URL(child.url).pathname
                          : child.url;
                      return (
                        <NavLink
                          key={child.id}
                          to={childUrl}
                          prefetch="intent"
                          onClick={onClose}
                          className="block rounded-md px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                          {child.title}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
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
    // Use light tones so links are visible on the dark navbar background
    color: isPending
      ? 'rgba(148, 163, 184, 0.9)'
      : isActive
        ? '#e5e7eb'
        : 'rgba(226, 232, 240, 0.92)',
  };
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
