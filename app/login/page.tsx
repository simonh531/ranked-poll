import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "@/components/Logo";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Form from "next/form";

export default function Page() {
  return (
    <Form
      className="bg-blue-400 grow relative flex items-center justify-center"
      action="/test"
    >
      <Card className="w-100">
        <CardHeader>
          <CardTitle>
            <Logo className="text-2xl" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Log In or Sign Up</FieldLegend>
              <FieldDescription>
                Enter your email to log in or sign up.
              </FieldDescription>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      autoComplete="off"
                      placeholder="email@example.com"
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>
            </FieldSet>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button className="w-full cursor-pointer" type="submit">
            Send Account Link
          </Button>
        </CardFooter>
      </Card>
    </Form>
  );
}
