-- Drop the old restrictive select policy on votes
DROP POLICY IF EXISTS "votes_select" ON votes;

-- Create a new public select policy on votes
CREATE POLICY "votes_select" ON votes FOR SELECT USING (true);
