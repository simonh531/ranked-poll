"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitVoteAction(
  pollId: string,
  vote: string[],
  lowVote: string[],
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication session not found. Please refresh." };
  }

  // 1. Fetch options for this poll to map labels to option IDs
  const { data: options, error: optionsError } = await supabase
    .from("poll_options")
    .select("id, label")
    .eq("poll_id", pollId);

  if (optionsError || !options) {
    console.error("Failed to fetch options:", optionsError);
    return { error: "Failed to validate poll options." };
  }

  const labelToIdMap = new Map<string, string>();
  options.forEach((opt) => {
    labelToIdMap.set(opt.label, opt.id);
  });

  // 2. Clear any existing votes by this user for this poll
  const { error: deleteError } = await supabase
    .from("votes")
    .delete()
    .eq("poll_id", pollId)
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("Failed to delete existing votes:", deleteError);
    return { error: "Failed to update your vote. Please try again." };
  }

  // 3. Construct the vote records to insert
  const voteRecords: {
    poll_id: string;
    option_id: string;
    user_id: string;
    rank: number;
  }[] = [];

  // Preferred options (positive ranks: 1, 2, ...)
  vote.forEach((label, index) => {
    const optionId = labelToIdMap.get(label);
    if (optionId) {
      voteRecords.push({
        poll_id: pollId,
        option_id: optionId,
        user_id: user.id,
        rank: index + 1,
      });
    }
  });

  // Least preferred options (negative ranks: -L, -(L-1), ..., -1)
  const L = lowVote.length;
  lowVote.forEach((label, index) => {
    const optionId = labelToIdMap.get(label);
    if (optionId) {
      voteRecords.push({
        poll_id: pollId,
        option_id: optionId,
        user_id: user.id,
        rank: -L + index,
      });
    }
  });

  if (voteRecords.length === 0) {
    return { error: "No valid options were ranked." };
  }

  // 4. Bulk insert the vote records
  const { error: insertError } = await supabase
    .from("votes")
    .insert(voteRecords);

  if (insertError) {
    console.error("Failed to insert votes:", insertError);
    return { error: "Failed to save your vote. Please try again." };
  }

  return { success: true };
}
