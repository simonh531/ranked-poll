import Form from "next/form";

import { H1 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import OptionInputs from "./OptionInputs";

export default function Page() {
  return (
    <Form action="/" className="pt-8 relative flex justify-center">
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
        </CardContent>
        <CardFooter>
          <Button type="submit">Create</Button>
        </CardFooter>
      </Card>
    </Form>
  );
}
