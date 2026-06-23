import React from "react";
import CalculationPlayground from "./CalculationPlayground";

export const metadata = {
  title: "Calculation Playground | Ranked Poll",
  description: "Simulate pairwise elections and inspect how the Ranked Pairs algorithm resolves Condorcet cycles.",
  alternates: {
    canonical: "/about/calculation",
  },
};

export default function CalculationPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rankedpoll.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${baseUrl}/`,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "About",
        "item": `${baseUrl}/about`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Calculation",
        "item": `${baseUrl}/about/calculation`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CalculationPlayground />
    </>
  );
}
