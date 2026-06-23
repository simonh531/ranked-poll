import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Log In | Ranked Poll",
  description: "Log in or sign up to secure your poll history, track recent polls, and manage your votes.",
  alternates: {
    canonical: "/login",
  },
};

export default function LoginPage() {
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
        "name": "Log In",
        "item": `${baseUrl}/login`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LoginForm />
    </>
  );
}
