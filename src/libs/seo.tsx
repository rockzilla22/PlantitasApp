import config from "@/data/configProject";
import type { Metadata } from "next";

// ── Tipos ─────────────────────────────────────────────────────────────
interface SEOTagsParams {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrlRelative?: string;
  extraTags?: Partial<Metadata>;
}

export const getSEOTags = ({
  title,
  description,
  keywords,
  canonicalUrlRelative,
  extraTags,
}: SEOTagsParams = {}): Metadata => {
  const resolvedTitle = title || config.tabname || config.appName;
  const resolvedOgTitle = config.ogTitle || config.appName;
  const resolvedOgDescription = config.ogDescription || config.appDescription;
  const resolvedDescription = description || config.appDescription;

  const baseUrl = config.siteUrl;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    keywords: keywords || config.keywords,
    applicationName: config.appName,
    authors: [{ name: config.author }],
    creator: config.author,
    publisher: config.author,
    robots: "index, follow",
    metadataBase: new URL(baseUrl),

    icons: {
      icon: config.images.favicon,
      apple: config.images.appleTouch,
      shortcut: config.images.favicon,
    },

    openGraph: {
      title: resolvedOgTitle,
      description: resolvedOgDescription,
      url: config.siteUrl + "/",
      siteName: config.appName,
      locale: config.language?.replace("-", "_") ?? "es_MX",
      type: "website",
      images: [
        {
          url: config.images.ogDefault,
          width: 1200,
          height: 630,
          alt: `${config.appName} – OpenGraph`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      site: config.twitter,
      creator: config.twitter,
      title: resolvedOgTitle,
      description: resolvedOgDescription,
      images: [config.images.twitterCard],
    },

    alternates: {
      ...(canonicalUrlRelative && { canonical: canonicalUrlRelative }),
      languages: {
        "es-MX": config.siteUrl,
        "en-US": `${config.siteUrl}/en`,
      },
    },

    ...extraTags,
  };
};

// ── JSON-LD Schema ────────────────────────────────────────────────────
export const renderSchemaTags = () => {
  const schemaImageUrl = new URL(config.images.ogDefault, config.siteUrl).toString();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: config.appName,
          description: config.appDescription,
          image: schemaImageUrl,
          url: config.siteUrl,
          author: {
            "@type": "Person",
            name: config.author,
          },
          datePublished: "2024-01-01",
          applicationCategory: "BusinessApplication",
        }),
      }}
    ></script>
  );
};
