import {Await, useLoaderData, Link, useRouteLoaderData} from 'react-router';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {CategoryStrip} from '~/components/CategoryStrip';
import {TopBrands} from '~/components/TopBrands';
import {HomeProductGrid} from '~/components/HomeProductGrid';
import {HeroCarousel} from '~/components/HeroCarousel';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
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
async function loadCriticalData({context}) {
  const [featuredResult, categoryResult, brandsResult, homeProductsResult] =
    await Promise.all([
      context.storefront.query(FEATURED_COLLECTION_QUERY),
      context.storefront
        .query(CATEGORY_COLLECTIONS_QUERY)
        .catch((error) => {
          console.error('Error loading category collections', error);
          return null;
        }),
      context.storefront
        .query(TOP_BRANDS_COLLECTIONS_QUERY)
        .catch((error) => {
          console.error('Error loading top brands metaobjects', error);
          return null;
        }),
      context.storefront
        .query(HOME_PRODUCTS_QUERY)
        .catch((error) => {
          console.error('Error loading home products', error);
          return null;
        }),
    ]);
  
  const featuredCollection = featuredResult.collections.nodes[0];

  const categoryItems =
    categoryResult?.collections?.nodes?.map((c) => ({
      id: c.id,
      title: c.title,
      imageUrl: c.image?.url,
      href: `/collections/${c.handle}`,
    })) ?? [];

  const brandItems =
    brandsResult?.metaobjects?.nodes
      ?.map((node) => {
        const imageField = node.fields?.find((f) => f.key === 'brand_logo');
        const collectionField = node.fields?.find((f) => f.key === 'link');
        const collectionRef = collectionField?.reference;

        if (!collectionRef) return null;

        const imageRef = imageField?.reference;
        const imageUrl =
          imageRef && 'image' in imageRef && imageRef.image
            ? imageRef.image.url
            : null;

        return {
          id: node.id,
          title: collectionRef.title ?? node.handle,
          imageUrl,
          href: `/collections/${collectionRef.handle}`,
        };
      })
      .filter(Boolean) ?? [];

  const homeProducts =
    homeProductsResult?.products?.nodes?.map((p) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      imageUrl: p.featuredImage?.url,
      price: p.priceRange?.minVariantPrice
        ? `${p.priceRange.minVariantPrice.amount} ${p.priceRange.minVariantPrice.currencyCode}`
        : null,
      variants: p.variants,
    })) ?? [];

  return {
    featuredCollection,
    categoryItems,
    brandItems,
    homeProducts,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  const rootData = useRouteLoaderData('root');
  return (
    <div className="home">
      <HeroCarousel slides={rootData.heroSlides} />
      <CategoryStrip title="Explore by Category" items={data.categoryItems} />
      <TopBrands title="Top Brands" items={data.brandItems} />
      <HomeProductGrid title="Shop the Latest" products={data.homeProducts} />
      {/* <RecommendedProducts products={data.recommendedProducts} /> */}
    </div>
  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({collection}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({products}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const HOME_PRODUCTS_QUERY = `#graphql
  query HomeProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        featuredImage {
          url
          altText
        }
        variants(first: 1) {
          nodes {
            id
            availableForSale
          }
        }
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;


const CATEGORY_COLLECTIONS_QUERY = `#graphql
  query CategoryCollections {
    collections(first: 5, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        image {
          url
          altText
        }
      }
    }
  }
`;

const TOP_BRANDS_COLLECTIONS_QUERY = `#graphql
  query TopBrandsMetaobjects {
    metaobjects(type: "brands", first: 12) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
              }
            }
            ... on Collection {
              id
              title
              handle
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
