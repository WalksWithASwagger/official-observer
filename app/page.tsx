import type { Metadata } from "next";
import ObservatoryClient from "@/components/ObservatoryClient";

const SITE_URL = "https://official.observer";
const DESCRIPTION =
  "A public, interactive living map of the BC + AI, ED + AI, and Futureproof ecosystem.";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "The Observatory",
      url: `${SITE_URL}/`,
      description: DESCRIPTION,
    },
    {
      "@type": "Dataset",
      "@id": `${SITE_URL}/#dataset`,
      name: "The Observatory — BC + AI ecosystem map",
      description: DESCRIPTION,
      url: `${SITE_URL}/`,
      license: "https://creativecommons.org/licenses/by/4.0/",
      isAccessibleForFree: true,
      distribution: {
        "@type": "DataDownload",
        contentUrl: `${SITE_URL}/api/v1/graph`,
        encodingFormat: "application/json",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <ObservatoryClient />
    </>
  );
}
