"use client";

import Form from "next/form";
import { createContext, ReactNode, useActionState } from "react";

import createPollAction from "./createPollAction";

export const formStateContext = createContext({
  error: "",
  pending: false,
});

export default function CreatePollForm({ children }: { children: ReactNode }) {
  const [state, formAction, pending] = useActionState(createPollAction, {
    error: "",
  });
  return (
    <formStateContext.Provider value={{ error: state.error, pending }}>
      <Form action={formAction} className="relative w-full flex justify-center">
        {children}
      </Form>
    </formStateContext.Provider>
  );
}
