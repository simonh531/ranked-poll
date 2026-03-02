"use client";

import { useContext } from "react";

import { formStateContext } from "./CreatePollForm";

export default function Validation() {
  const { error } = useContext(formStateContext);
  if (!error) {
    return null;
  }
  return (
    <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">{error}</div>
  );
}
