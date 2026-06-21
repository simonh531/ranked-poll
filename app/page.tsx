import { H1 } from "@/components/typography";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import CreateButton from "./CreateButton";
import CreatePollForm from "./CreatePollForm";
import OptionInputs from "./OptionInputs";
import Validation from "./Validation";
import RecentPollsHome from "@/components/RecentPollsHome";
import ThemeSelector from "@/components/ThemeSelector";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  const question = typeof resolvedSearchParams.question === "string" ? resolvedSearchParams.question : "";
  const description = typeof resolvedSearchParams.description === "string" ? resolvedSearchParams.description : "";
  const randomize = resolvedSearchParams.randomize === "true";
  const hideResults = resolvedSearchParams.hideResults === "true";
  const theme = typeof resolvedSearchParams.theme === "string" ? resolvedSearchParams.theme : "";

  let initialOptions: string[] = [];
  if (typeof resolvedSearchParams.options === "string") {
    try {
      initialOptions = JSON.parse(resolvedSearchParams.options);
    } catch (e) {
      console.error("Failed to parse options query parameter:", e);
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://rankedpoll.com/#software",
        "name": "Ranked Poll",
        "url": "https://rankedpoll.com",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "description": "Instantly create and share ranked choice polls for free. Learn about Condorcet voting and the Ranked Pairs algorithm.",
        "offers": {
          "@type": "Offer",
          "price": "0.00",
          "priceCurrency": "USD"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://rankedpoll.com/#website",
        "url": "https://rankedpoll.com",
        "name": "Ranked Poll",
        "description": "Instantly create and share ranked choice polls! Learn about Condorcet voting and the Ranked Pairs method. Free, open source, and no sign-up required."
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl px-4 justify-center items-center lg:items-start my-8 mx-auto">
        <div className="w-full max-w-2xl lg:max-w-3xl">
        <CreatePollForm>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>
                <H1>Create a Ranked Poll</H1>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Question</FieldLabel>
                    <Input
                      name="question"
                      placeholder="What would you like to poll?"
                      defaultValue={question}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Details</FieldLabel>
                    <Textarea
                      name="description"
                      placeholder="Provide details or instructions for this poll..."
                      defaultValue={description}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Options</FieldLabel>
                    <OptionInputs initialOptions={initialOptions} />
                  </Field>
                  <Field orientation="horizontal" className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="randomize"
                      name="randomize"
                      value="true"
                      defaultChecked={randomize}
                      className="h-4 w-4 accent-black rounded border-input cursor-pointer"
                    />
                    <label htmlFor="randomize" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                      Shuffle option order
                    </label>
                  </Field>
                  <Field orientation="horizontal" className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hideResults"
                      name="hideResults"
                      value="true"
                      defaultChecked={hideResults}
                      className="h-4 w-4 accent-black rounded border-input cursor-pointer"
                    />
                    <label htmlFor="hideResults" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                      Hide results until closed
                    </label>
                  </Field>
                  <ThemeSelector initialTheme={theme} />
                </FieldGroup>
              </FieldSet>

              <Validation />
            </CardContent>
            <CardFooter>
              <CreateButton />
            </CardFooter>
          </Card>
        </CreatePollForm>
      </div>
      <RecentPollsHome />
    </div>
    </>
  );
}


