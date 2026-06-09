import { getPublicAppOrigin } from "@/lib/public-app-url";

const ORG_ID = () => `${getPublicAppOrigin()}/#organization`;
const SITE_ID = () => `${getPublicAppOrigin()}/#website`;

export function organizationJsonLd() {
  const origin = getPublicAppOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID(),
    name: "Steel Sisters & Striders — SSS Club Ballari",
    alternateName: ["Sister Stride", "SSS Club Ballari"],
    url: origin,
    description:
      "Women-first fitness community in Ballari, Karnataka, India — member programs, Couch to 5K, challenges, coaches, events, and community wellness.",
    logo: {
      "@type": "ImageObject",
      url: `${origin}/icons/icon-512.png`,
    },
    areaServed: {
      "@type": "City",
      name: "Ballari",
      containedInPlace: {
        "@type": "State",
        name: "Karnataka",
        containedInPlace: { "@type": "Country", name: "India" },
      },
    },
    knowsAbout: [
      "Women's fitness",
      "Walking and running programs",
      "Couch to 5K",
      "Community health",
      "Ballari",
    ],
    sameAs: ["https://sister-stride.intelliforge.tech/", "https://intelliforge.tech"],
  };
}

export function websiteJsonLd() {
  const origin = getPublicAppOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID(),
    name: "Sister Stride",
    url: origin,
    inLanguage: "en",
    description:
      "Women-first fitness in Ballari — programs, coaches, challenges, events, and your strider circle.",
    publisher: { "@id": ORG_ID() },
    isPartOf: { "@id": ORG_ID() },
  };
}

export function localBusinessJsonLd() {
  const origin = getPublicAppOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "@id": `${origin}/#sports-location`,
    name: "Sister Stride — SSS Club Ballari",
    url: origin,
    image: `${origin}/icons/icon-512.png`,
    description:
      "Steel Sisters & Striders (SSS Club) is a Ballari-based, women-first fitness community offering programs, coaching, challenges, and events.",
    parentOrganization: { "@id": ORG_ID() },
    areaServed: { "@type": "City", name: "Ballari", addressCountry: "IN" },
  };
}

export function faqPageJsonLd() {
  const origin = getPublicAppOrigin();
  const items = [
    {
      q: "What is Steel Sisters & Striders (SSS Club Ballari)?",
      a: "SSS Club Ballari is a women-first fitness community based in Ballari, Karnataka. The product brand is Sister Stride. Members use the web app for progress, challenges, Couch to 5K, coaches, events, and community.",
    },
    {
      q: "Where is Sister Stride based?",
      a: "The community serves Ballari (Bellary), Karnataka, India. Programming and events are oriented to local members.",
    },
    {
      q: "How do members sign in?",
      a: "Members sign in at the /login page using email or username and password, optional email magic link, or phone OTP where configured.",
    },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${origin}/#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}
