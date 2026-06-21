create or replace function create_poll_with_options(
  question text,
  options text[],
  user_id uuid,
  slug text
)
returns void as $$
declare
  new_poll_id uuid;
begin
  insert into polls (question, slug, user_id)
  values ($1, $4, $3)
  returning id into new_poll_id;

  insert into poll_options (label, original_label, poll_id, "position", user_id)
  select
    option,
    option,
    new_poll_id,
    index - 1,
    $3
  from unnest($2) with ordinality as t(option, index);
end;
$$ language plpgsql;
