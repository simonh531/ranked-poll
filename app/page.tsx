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

import CreateButton from "./CreateButton";
import CreatePollForm from "./CreatePollForm";
import OptionInputs from "./OptionInputs";
import Validation from "./Validation";

export default function Page() {
  return (
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
                <FieldLabel>Options</FieldLabel>
                <OptionInputs />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Validation />
        </CardContent>
        <CardFooter>
          <CreateButton />
        </CardFooter>
      </Card>
    </CreatePollForm>
  );
}
