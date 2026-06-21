"use client";

import { useContext } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { formStateContext } from "./CreatePollForm";

export default function CreateButton() {
  const { pending } = useContext(formStateContext);
  return (
    <Button type="submit">
      Create
      {pending && <Spinner />}
    </Button>
  );
}
