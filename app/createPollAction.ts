"use server";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function createPollAction(
  _initialState: { error: string },
  formData: FormData,
) {
  // perform validations
  const question = formData.get("question");
  if (!question) {
    return { error: "Question is required" };
  }
  if (typeof question !== "string") {
    return { error: "Invalid Question Input" };
  }
  if (!question.trim()) {
    return { error: "Question is required" };
  }

  const options = formData.getAll("option");
  const cleanedOptions: string[] = [];
  options.forEach((option) => {
    if (typeof option !== "string") {
      return;
    }
    const trimmedOption = option.trim();
    if (!trimmedOption) {
      return;
    }
    cleanedOptions.push(trimmedOption);
  });

  if (cleanedOptions.length < 2) {
    return { error: "At least two options are required" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const slug = nanoid(6);
    const { error } = await supabase.rpc("create_poll_with_options", {
      options: cleanedOptions,
      question,
      slug,
      user_id: user.id,
    });

    if (error) {
      console.error(error);
      return { error: "Failed to create poll" };
    }

    redirect(`/polls/${slug}`);
  }
  return { error: "" };
}
