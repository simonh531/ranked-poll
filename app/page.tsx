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

export default function Page() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl px-4 justify-center items-start my-8 mx-auto">
      <div className="w-full max-w-200">
        <CreatePollForm>
          <Card className="w-full max-w-200">
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
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Details</FieldLabel>
                    <Textarea
                      name="description"
                      placeholder="Provide details or instructions for this poll..."
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Options</FieldLabel>
                    <OptionInputs />
                  </Field>
                  <Field orientation="horizontal" className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="randomize"
                      name="randomize"
                      value="true"
                      className="h-4 w-4 accent-black rounded border-input cursor-pointer"
                    />
                    <label htmlFor="randomize" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                      Shuffle option order
                    </label>
                  </Field>
                  <ThemeSelector />
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
  );
}


