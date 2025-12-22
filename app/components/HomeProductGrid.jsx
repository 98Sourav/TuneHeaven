import React, {useState, useEffect} from 'react';
import {Link} from 'react-router';
import {CartForm} from '@shopify/hydrogen';

/**
 * HomeProductGrid
 * Simple PLP-style grid for homepage.
 * Tailwind-only styling.
 *
 * @param {{
 *   title?: string;
 *   products: Array<{
 *     id: string | number;
 *     handle: string;
 *     title: string;
 *     imageUrl?: string | null;
 *     price?: string;
 *     variants?: {
 *       nodes: Array<{
 *         id: string;
 *         availableForSale: boolean;
 *       }>;
 *     };
 *   }>;
 * }} props
 */
export function HomeProductGrid({title = 'Featured Products', products}) {
  const [favorites, setFavorites] = useState(new Set());

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('tuneheaven_favorites');
    if (savedFavorites) {
      try {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      } catch (e) {
        console.error('Failed to parse favorites from localStorage', e);
      }
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tuneheaven_favorites', JSON.stringify([...favorites]));
    // Dispatch custom event for navbar to listen
    window.dispatchEvent(new CustomEvent('favoritesChanged', { detail: favorites.size }));
  }, [favorites]);

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const getCartLines = (product) => {
    // Get the first available variant for the product
    const firstAvailableVariant = product.variants?.nodes?.find(
      (variant) => variant.availableForSale
    );
    
    if (!firstAvailableVariant) {
      return null;
    }

    return [
      {
        merchandiseId: firstAvailableVariant.id,
        quantity: 1,
      },
    ];
  };

  if (!products || !products.length) return null;

  return (
    <section className="w-full bg-slate-950 py-10 text-slate-50 sm:py-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section header */}
        <div className="flex items-center gap-3 pb-6 sm:pb-8">
          <div className="hidden flex-1 border-t border-slate-800 sm:block" />
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.22em] text-slate-100 sm:text-base">
            {title}
          </h2>
          <div className="hidden flex-1 border-t border-slate-800 sm:block" />
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="group relative flex h-full flex-col bg-gradient-to-br from-slate-900/70 via-slate-900/50 to-slate-950/80 shadow-[0_20px_50px_rgba(2,6,23,0.8)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_70px_rgba(16,185,129,0.12)]"
              style={{
                clipPath: index % 2 === 0 
                  ? 'polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)' 
                  : 'polygon(0 0, 100% 0, 100% 100%, 24px 100%, 0 calc(100% - 24px))',
                border: '1.5px solid rgba(148, 163, 184, 0.15)',
              }}
            >
              {/* Favorite icon */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
                className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
                  favorites.has(product.id)
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-red-400'
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill={favorites.has(product.id) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>

              <Link
                to={`/products/${product.handle}`}
                prefetch="intent"
                className="flex flex-1 flex-col"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-slate-900">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      loading="lazy"
                      className="h-full w-full object-cover object-center transition-all duration-300 group-hover:scale-110 group-hover:brightness-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em] text-slate-400">
                      No image
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                <div className="flex flex-1 flex-col gap-1.5 px-3 pb-2.5 pt-3 sm:px-3.5 sm:pb-3">
                  <h3 className="line-clamp-2 text-[11px] font-bold uppercase leading-tight tracking-[0.14em] text-slate-100 sm:text-xs">
                    {product.title}
                  </h3>
                  {product.price ? (
                    <p className="text-xs font-semibold text-emerald-400 sm:text-sm">
                      {product.price}
                    </p>
                  ) : null}
                </div>
              </Link>

              {/* Add to Cart button */}
              <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                {(() => {
                  const lines = getCartLines(product);
                  if (!lines) {
                    return (
                      <button
                        disabled
                        className="w-full rounded-lg bg-slate-600 px-3 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed sm:text-sm"
                      >
                        Unavailable
                      </button>
                    );
                  }
                  
                  return (
                    <CartForm
                      route="/cart"
                      inputs={{lines}}
                      action={CartForm.ACTIONS.LinesAdd}
                    >
                      {(fetcher) => (
                        <button
                          type="submit"
                          disabled={fetcher.state !== 'idle'}
                          className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 transition-colors duration-150 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed sm:text-sm"
                        >
                          {fetcher.state === 'submitting' ? 'Adding...' : 'Add to Cart'}
                        </button>
                      )}
                    </CartForm>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
