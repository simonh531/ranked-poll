-- RPC function to allow poll creators to reset all votes for a poll
CREATE OR REPLACE FUNCTION reset_poll_votes(target_poll_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current authenticated user matches the creator of the poll
  IF EXISTS (
    SELECT 1 FROM polls 
    WHERE id = target_poll_id AND user_id = auth.uid()
  ) THEN
    DELETE FROM votes WHERE poll_id = target_poll_id;
  ELSE
    RAISE EXCEPTION 'Unauthorized: only the poll creator can reset votes';
  END IF;
END;
$$;

-- Grant execution privileges
GRANT EXECUTE ON FUNCTION reset_poll_votes(uuid) TO anon, authenticated;
