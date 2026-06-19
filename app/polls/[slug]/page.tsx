import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";

import VoteDisplay from "./VoteDisplay";
import ResultsDisplay from "./ResultsDisplay";
import PollHistoryTracker from "@/components/PollHistoryTracker";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function Page({
  params,
  searchParams,
}: PageProps) {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-4 p-6 justify-center items-center">
        <h3 className="text-xl font-bold">Loading Poll...</h3>
      </div>
    }>
      <PageWithData params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function PageWithData({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const showResults = resolvedSearchParams && resolvedSearchParams.results !== undefined;

  const supabase = await createClient();

  // 1. Fetch Poll
  const { data: poll } = await supabase
    .from("polls")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!poll) {
    return <div className="p-8 text-center text-red-500 font-bold">Poll Not Found</div>;
  }

  // 2. Fetch Options
  const { data: options } = await supabase
    .from("poll_options")
    .select("*")
    .eq("poll_id", poll.id)
    .order("position", { ascending: true });

  const optionLabels = options?.map((o) => o.label) ?? [];

  // 3. Get Session / User
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. Check if current user has already voted
  let userHasVoted = false;
  if (user) {
    const { data: existingVotes } = await supabase
      .from("votes")
      .select("id")
      .eq("poll_id", poll.id)
      .eq("user_id", user.id)
      .limit(1);
    userHasVoted = (existingVotes?.length ?? 0) > 0;
  }

  // 5. Fetch all votes to count and calculate results
  const { data: allVotes } = await supabase
    .from("votes")
    .select(`
      user_id,
      rank,
      poll_options (
        label
      )
    `)
    .eq("poll_id", poll.id);

  // Group votes by user_id to reconstruct ballots
  const userBallots: Record<
    string,
    { pos: { label: string; rank: number }[]; neg: { label: string; rank: number }[] }
  > = {};

  (allVotes || []).forEach((row: any) => {
    const userId = row.user_id;
    const label = row.poll_options?.label;
    if (!label) return;

    if (!userBallots[userId]) {
      userBallots[userId] = { pos: [], neg: [] };
    }

    if (row.rank > 0) {
      userBallots[userId].pos.push({ label, rank: row.rank });
    } else {
      userBallots[userId].neg.push({ label, rank: row.rank });
    }
  });

  const ballotsList = Object.values(userBallots).map((ballot) => {
    const vote = ballot.pos.sort((a, b) => a.rank - b.rank).map((x) => x.label);
    const lowVote = ballot.neg.sort((a, b) => a.rank - b.rank).map((x) => x.label);
    return { vote, lowVote, count: 1 };
  });

  const totalVoters = Object.keys(userBallots).length;

  const description = (poll.settings as any)?.description || "";
  const randomize = (poll.settings as any)?.randomize || false;

  return (
    <>
      <PollHistoryTracker slug={slug} question={poll.question} voteCount={totalVoters} />
      {showResults || userHasVoted ? (
        <ResultsDisplay
          pollId={poll.id}
          slug={slug}
          question={poll.question}
          description={description}
          createdAt={poll.created_at}
          options={optionLabels}
          ballots={ballotsList}
          totalVoters={totalVoters}
          userHasVoted={userHasVoted}
        />
      ) : (
        <VoteDisplay
          pollId={poll.id}
          slug={slug}
          question={poll.question}
          description={description}
          createdAt={poll.created_at}
          options={optionLabels}
          randomize={randomize}
          totalVoters={totalVoters}
        />
      )}
    </>
  );
}
