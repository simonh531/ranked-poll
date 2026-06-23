import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy & Cookie Policy | Ranked Poll",
  description: "Read the Privacy & Cookie Policy for Ranked Poll.",
  alternates: {
    canonical: "/about/privacy",
  },
};

export default function PrivacyPage() {
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
        "name": "Privacy",
        "item": `${baseUrl}/about/privacy`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Card className="shadow-sm animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Privacy & Cookie Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm md:text-base leading-relaxed text-muted-foreground">
          <p>
            Ranked Poll is built with transparency in mind. We use a combination of essential cookies, local storage, and standard advertising partners to support and operate this service.
          </p>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-2">What we store &amp; use:</h3>
            <ul className="list-disc list-inside space-y-3 pl-2">
              <li>
                <strong className="text-foreground">Authentication &amp; Session Cookies:</strong> Standard, secure session identifiers managed by Supabase Auth, used solely to keep you logged in and link votes to anonymous guest sessions.
              </li>
              <li>
                <strong className="text-foreground">Local Storage:</strong> We use your browser's local storage to save your recent poll browsing history so you can easily access your created or voted polls from the navigation bar.
              </li>
              <li>
                <strong className="text-foreground">Advertising Cookies (Google AdSense):</strong> We partner with Google AdSense to serve ads. Google uses cookies to serve ads based on your prior visits to this website or other sites. You can opt out of personalized advertising by visiting Google's Ads Settings.
              </li>
            </ul>
          </div>

          <Separator />
          <div>
            <h3 className="text-lg font-bold text-foreground mb-2">Contact Us</h3>
            <p>
              If you have any questions, feedback, or would like to request deletion of your data, feel free to reach out to us at{" "}
              <a href="mailto:hello@rankedpoll.com" className="text-primary hover:underline font-medium">
                hello@rankedpoll.com
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
