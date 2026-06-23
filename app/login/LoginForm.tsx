"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import loginAction from "./loginAction";

export default function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, {
    error: "",
    success: false,
  });
  const [emailInput, setEmailInput] = useState("");

  return (
    <div className="grow w-full relative flex items-center justify-center py-12 px-4">
      <form action={action} className="w-full max-w-md">
        <Card className="w-full shadow-lg border border-indigo-100/80 dark:border-indigo-900/50 bg-background/80 backdrop-blur-md">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex justify-center">
              <Logo className="text-3xl" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.success ? (
              <div className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm border border-emerald-500/20 text-center">
                <p className="font-semibold text-base mb-1">Check your inbox!</p>
                <p>
                  We sent a magic link to <strong className="break-all">{emailInput}</strong>.
                  Click the link to log in and permanently secure your poll history.
                </p>
              </div>
            ) : (
              <FieldGroup>
                <FieldSet>
                  <FieldLegend className="text-lg font-semibold text-foreground/90">
                    Log In or Sign Up
                  </FieldLegend>
                  <FieldDescription className="text-sm text-muted-foreground/80 mt-1">
                    Enter your email to secure your account. Any polls or votes you created as a guest will be linked automatically.
                  </FieldDescription>
                  <FieldSet className="mt-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="email" className="text-sm font-medium">
                          Email Address
                        </FieldLabel>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          autoComplete="email"
                          placeholder="email@example.com"
                          className="mt-1 w-full"
                          disabled={isPending}
                        />
                      </Field>
                    </FieldGroup>
                  </FieldSet>
                </FieldSet>
              </FieldGroup>
            )}

            {state.error && (
              <div className="p-3 bg-destructive/10 text-destructive dark:text-red-400 rounded-lg text-sm border border-destructive/20 text-center font-medium">
                {state.error}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2">
            {!state.success && (
              <Button
                className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md shadow transition-colors"
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Sending link..." : "Send Account Link"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
