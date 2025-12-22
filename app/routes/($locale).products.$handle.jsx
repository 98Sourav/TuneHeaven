import React from 'react';
import {useLoaderData} from 'react-router';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context, params}) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product} = useLoaderData();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  const galleryItems = React.useMemo(() => {
    const getExternalEmbedUrl = (rawUrl, host) => {
      if (!rawUrl) return null;
      try {
        const parsed = new URL(rawUrl);
        if (host === 'YOUTUBE') {
          let videoId = parsed.searchParams.get('v');
          if (!videoId) {
            const segments = parsed.pathname.split('/').filter(Boolean);
            videoId = segments.pop();
          }
          if (!videoId) return rawUrl;
          const params = new URLSearchParams(parsed.searchParams);
          params.delete('v');
          const paramString = params.toString();
          return `https://www.youtube.com/embed/${videoId}${paramString ? `?${paramString}` : ''}`;
        }
        return rawUrl;
      } catch (error) {
        console.error('Failed to normalize external video url', error);
        return rawUrl;
      }
    };

    const mediaNodes = product?.media?.nodes ?? [];
    if (mediaNodes.length) {
      return mediaNodes
        .map((node) => {
          if (node.__typename === 'MediaImage' && node.image) {
            return {
              id: node.image.id ?? node.id,
              type: 'image',
              image: node.image,
              thumbnailUrl: node.image.url,
              altText: node.image.altText,
            };
          }
          if (node.__typename === 'Video') {
            const sources = (node.sources ?? []).filter((src) => Boolean(src?.url));
            if (!sources.length) return null;
            return {
              id: node.id,
              type: 'video',
              sources,
              thumbnailUrl: node.previewImage?.url ?? null,
              altText: node.previewImage?.altText ?? 'Product video',
            };
          }
          if (node.__typename === 'ExternalVideo') {
            const embedUrl = getExternalEmbedUrl(node.embeddedUrl, node.host);
            if (!embedUrl) return null;
            return {
              id: node.id,
              type: 'externalVideo',
              embedUrl,
              thumbnailUrl: node.previewImage?.url ?? null,
              altText: node.previewImage?.altText ?? 'Product video',
              host: node.host,
            };
          }
          return null;
        })
        .filter(Boolean);
    }

    const imageNodes = product?.images?.nodes ?? [];
    return imageNodes.map((img) => ({
      id: img.id,
      type: 'image',
      image: img,
      thumbnailUrl: img.url,
      altText: img.altText,
    }));
  }, [product]);

  const [selectedItem, setSelectedItem] = React.useState(
    () => galleryItems[0] ?? null,
  );

  React.useEffect(() => {
    if (!galleryItems.length) {
      setSelectedItem(null);
      return;
    }
    setSelectedItem((prev) => {
      if (!prev) return galleryItems[0];
      const match = galleryItems.find((item) => item.id === prev.id);
      return match ?? galleryItems[0];
    });
  }, [galleryItems]);

  React.useEffect(() => {
    if (!selectedVariant?.image) return;
    const match = galleryItems.find(
      (item) =>
        item.type === 'image' &&
        (item.image?.id === selectedVariant.image.id ||
          item.image?.url === selectedVariant.image.url),
    );
    if (match) {
      setSelectedItem(match);
    }
  }, [selectedVariant, galleryItems]);

  // Description accordion state
  const [descOpen, setDescOpen] = React.useState(false);

  return (
    <section className="w-full bg-white py-8 text-slate-900 sm:py-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:gap-12 lg:px-10">
        {/* Left: Image Gallery */}
        <div className="flex w-full flex-col-reverse gap-4 lg:w-3/5 lg:flex-row">
          {/* Thumbnails */}
          <div className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-y-auto lg:max-h-[500px]">
            {galleryItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItem(item)}
                className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg border-2 overflow-hidden transition-all ${
                  selectedItem?.id === item.id
                    ? 'border-red-500 shadow-md'
                    : 'border-slate-200 hover:border-slate-400'
                } flex items-center justify-center bg-white`}
              >
                {item.type === 'video' || item.type === 'externalVideo' ? (
                  <div className="relative flex h-full w-full items-center justify-center bg-slate-900 text-white">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.altText || 'Product video'}
                        className="absolute inset-0 h-full w-full object-cover opacity-60"
                      />
                    ) : null}
                    <span className="relative z-10 text-xs font-semibold tracking-wider">Video</span>
                  </div>
                ) : (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.altText || 'Product thumbnail'}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="relative flex-1 flex items-center justify-center bg-slate-50 rounded-2xl overflow-hidden min-h-[300px] lg:min-h-[500px]">
            {selectedItem ? (
              selectedItem.type === 'video' ? (
                <video
                  key={selectedItem.id}
                  controls
                  playsInline
                  poster={selectedItem.thumbnailUrl || undefined}
                  className="h-full w-full object-contain bg-black"
                  style={{pointerEvents: 'auto'}}
                >
                  {selectedItem.sources.map((source, index) => (
                    <source
                      key={`${selectedItem.id}-${index}-${source.mimeType}-${source.url}`}
                      src={source.url}
                      type={source.mimeType || undefined}
                    />
                  ))}
                  Your browser does not support the video tag.
                </video>
              ) : selectedItem.type === 'externalVideo' ? (
                <div className="h-full w-full">
                  <iframe
                    key={`${selectedItem.id}-${selectedItem.embedUrl}`}
                    src={selectedItem.embedUrl}
                    title={selectedItem.altText || 'Product video'}
                    className="h-full w-full rounded-2xl border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={selectedItem.image?.url}
                  alt={selectedItem.image?.altText || title}
                  className="max-h-full max-w-full object-contain"
                />
              )
            ) : (
              <div className="text-slate-400 text-sm">No image</div>
            )}
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="w-full lg:w-2/5 flex flex-col gap-5">
          {/* Title */}
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl leading-tight">
            {title}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
          </div>

          {/* Product Options */}
          <div className="border-t border-slate-200 pt-4">
            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
            />
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-4 gap-4 pt-4">
            {/* 2 Year Warranty */}
            <div className="flex flex-col items-center text-center">
              <svg className="w-14 h-14 mb-2" viewBox="0 0 60 70" fill="none">
                {/* Outer blue hexagon */}
                <path d="M30 2L55 17V53L30 68L5 53V17L30 2Z" fill="#3b82f6" />
                {/* Inner dark hexagon */}
                <path d="M30 10L48 21V49L30 60L12 49V21L30 10Z" fill="#1e293b" />
                {/* Shield with checkmark */}
                <path d="M30 22C30 22 22 25 22 32C22 39 26 44 30 46C34 44 38 39 38 32C38 25 30 22 30 22Z" fill="#fff" />
                <path d="M27 34L29 36L34 31" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[11px] text-slate-600 leading-tight font-medium">2 Year Warranty</span>
            </div>

            {/* Lifetime Tech Support */}
            <div className="flex flex-col items-center text-center">
              <svg className="w-14 h-14 mb-2" viewBox="0 0 60 70" fill="none">
                <path d="M30 2L55 17V53L30 68L5 53V17L30 2Z" fill="#3b82f6" />
                <path d="M30 10L48 21V49L30 60L12 49V21L30 10Z" fill="#1e293b" />
                <path d="M30 22C30 22 22 25 22 32C22 39 26 44 30 46C34 44 38 39 38 32C38 25 30 22 30 22Z" fill="#fff" />
                <path d="M27 34L29 36L34 31" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[11px] text-slate-600 leading-tight font-medium">Lifetime Tech Support</span>
            </div>

            {/* 4% CashBack */}
            <div className="flex flex-col items-center text-center">
              <svg className="w-14 h-14 mb-2" viewBox="0 0 60 70" fill="none">
                <path d="M30 2L55 17V53L30 68L5 53V17L30 2Z" fill="#3b82f6" />
                <path d="M30 10L48 21V49L30 60L12 49V21L30 10Z" fill="#1e293b" />
                <path d="M30 22C30 22 22 25 22 32C22 39 26 44 30 46C34 44 38 39 38 32C38 25 30 22 30 22Z" fill="#fff" />
                <path d="M27 34L29 36L34 31" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[11px] text-slate-600 leading-tight font-medium">4% CashBack</span>
            </div>

            {/* Non-Returnable */}
            <div className="flex flex-col items-center text-center">
              <svg className="w-14 h-14 mb-2" viewBox="0 0 60 70" fill="none">
                <path d="M30 2L55 17V53L30 68L5 53V17L30 2Z" fill="#3b82f6" />
                <path d="M30 10L48 21V49L30 60L12 49V21L30 10Z" fill="#1e293b" />
                <path d="M30 22C30 22 22 25 22 32C22 39 26 44 30 46C34 44 38 39 38 32C38 25 30 22 30 22Z" fill="#fff" />
                {/* X mark instead of checkmark */}
                <path d="M27 31L33 37M33 31L27 37" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[11px] text-slate-600 leading-tight font-medium">Non-Returnable</span>
            </div>
          </div>

          {/* Description Accordion */}
          <div className="border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setDescOpen(!descOpen)}
              className="flex w-full items-center justify-between py-2 text-left"
            >
              <span className="text-sm font-semibold text-slate-900">Description</span>
              <span className="text-slate-500 text-lg">{descOpen ? '−' : '+'}</span>
            </button>
            {descOpen && (
              <div className="prose prose-sm max-w-none pt-2 text-slate-700 leading-relaxed">
                <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
              </div>
            )}
          </div>
        </div>
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </section>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    media(first: 10) {
      nodes {
        __typename
        ... on MediaImage {
          id
          image {
            id
            url
            altText
            width
            height
          }
        }
        ... on Video {
          id
          previewImage {
            url
            altText
          }
          sources {
            mimeType
            url
          }
        }
        ... on ExternalVideo {
          id
          host
          embeddedUrl
          previewImage {
            url
            altText
          }
        }
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('./+types/products.$handle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
