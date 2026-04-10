import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";

export default function PollTitle({
  params,
  searchParams,
}: PageProps<"/polls/[slug]">) {
  return (
    <Suspense>
      <PollTitleWithData params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function PollTitleWithData({ params }: PageProps<"/polls/[slug]">) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: poll } = await supabase
    .from("polls")
    .select("*")
    .eq("slug", slug)
    .single();
  if (!poll) {
    return "Poll Not Found";
  }
  return poll?.question;
}
