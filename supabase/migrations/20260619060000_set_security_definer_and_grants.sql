-- Update create_poll_with_options function to use SECURITY DEFINER and SET search_path
CREATE OR REPLACE FUNCTION create_poll_with_options(
  question text,
  options text[],
  user_id uuid,
  slug text,
  settings jsonb DEFAULT '{"is_anonymous": true, "allow_multiple": false}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_poll_id uuid;
BEGIN
  INSERT INTO polls (question, slug, user_id, settings)
  VALUES ($1, $4, $3, $5)
  RETURNING id INTO new_poll_id;

  INSERT INTO poll_options (label, original_label, poll_id, "position", user_id)
  SELECT
    option,
    option,
    new_poll_id,
    index - 1,
    $3
  FROM unnest($2) WITH ordinality AS t(option, index);
END;
$$;

-- Grant required table privileges to Supabase client roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.polls TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.poll_options TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.votes TO anon, authenticated;

-- Grant sequence privileges to Supabase client roles (in case serial types are used)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
