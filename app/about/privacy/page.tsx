import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy & Cookie Policy | Ranked Poll",
  description: "Read the Privacy & Cookie Policy for Ranked Poll.",
};

export default function PrivacyPage() {
  return (
    <Card className="shadow-sm animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          Privacy & Cookie Policy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm md:text-base leading-relaxed text-muted-foreground">
        <p>
          Ranked Poll is built with privacy in mind. We do not use any advertising, tracking, or marketing cookies.
        </p>

        <div>
          <h3 className="text-lg font-bold text-foreground mb-2">What we store:</h3>
          <ul className="list-disc list-inside space-y-3 pl-2">
            <li>
              <strong className="text-foreground">Authentication Cookies:</strong> Standard, secure session identifiers managed by Supabase Auth, used solely to keep you logged in and link votes to anonymous guest sessions.
            </li>
            <li>
              <strong className="text-foreground">Local Storage:</strong> We use your browser's local storage to save your recent poll browsing history so you can easily access your created or voted polls from the navigation bar.
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
  );
}
