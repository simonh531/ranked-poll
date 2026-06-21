-- Update create_poll_with_options RPC to accept a settings parameter
CREATE OR REPLACE FUNCTION create_poll_with_options(
  question text,
  options text[],
  user_id uuid,
  slug text,
  settings jsonb DEFAULT '{"is_anonymous": true, "allow_multiple": false}'::jsonb
)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql;
