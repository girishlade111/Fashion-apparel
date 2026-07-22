export const SITE_NAME = "Fashion Apparel";
export const SITE_DESCRIPTION = "Premium fashion e-commerce storefront — timeless pieces crafted for those who move through life with intention.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function truncate(text: string | null | undefined, max = 160): string {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(" ", max - 3)) + "...";
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function productJsonLd(product: {
  name: string;
  description: string | null | undefined;
  slug: string;
  base_price: number;
  compare_at_price: number | null | undefined;
  inStock: boolean;
  image?: string | null;
  category?: string | null;
  reviewCount?: number;
  averageRating?: number | null;
}) {
  const offer: Record<string, any> = {
    "@type": "Offer",
    price: product.base_price,
    priceCurrency: "INR",
    availability: product.inStock
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    url: `${SITE_URL}/products/${product.slug}`,
  };

  if (product.compare_at_price) {
    offer.priceSpecification = {
      "@type": "UnitPriceSpecification",
      price: product.base_price,
      priceCurrency: "INR",
      priceType: "SalePrice",
      ...(product.compare_at_price && {
        referencePrice: product.compare_at_price,
      }),
    };
  }

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    url: `${SITE_URL}/products/${product.slug}`,
    image: product.image || undefined,
    category: product.category || undefined,
    offers: offer,
  };

  if (product.averageRating && product.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
    };
  }

  return schema;
}
