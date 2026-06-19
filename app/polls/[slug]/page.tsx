import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";

import VoteDisplay from "./VoteDisplay";

export default function Page({
  params,
  searchParams,
}: PageProps<"/polls/[slug]">) {
  return (
    <Suspense fallback={<VoteDisplay title="Loading..." options={[]} />}>
      <PageWithData params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function PageWithData({ params }: PageProps<"/polls/[slug]">) {
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
  const { data: options } = await supabase
    .from("poll_options")
    .select("*")
    .eq("poll_id", poll.id);
  return (
    <VoteDisplay
      title={poll.question}
      options={options?.map((o) => o.label) ?? []}
    />
  );
}
