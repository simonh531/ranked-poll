-- 1. SETUP
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLES
CREATE TABLE polls (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    question text NOT NULL,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    settings jsonb DEFAULT '{"is_anonymous": true, "allow_multiple": false}'::jsonb
);

CREATE TABLE poll_options (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label text NOT NULL,
    original_label text NOT NULL, 
    position integer NOT NULL,     
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    edited_at timestamp with time zone
);

CREATE TABLE votes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    poll_id uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id uuid NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rank integer NOT NULL DEFAULT 1,
    UNIQUE (poll_id, user_id, option_id),
    UNIQUE (poll_id, user_id, rank)
);

-- 3. INDEXING (Performance)
CREATE INDEX idx_polls_user ON polls(user_id);
CREATE INDEX idx_options_poll ON poll_options(poll_id);
CREATE INDEX idx_votes_poll ON votes(poll_id);
CREATE INDEX idx_votes_user ON votes(user_id);

-- 4. RLS POLICIES
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Polls Policies
CREATE POLICY "polls_select" ON polls FOR SELECT USING (true);
CREATE POLICY "polls_insert" ON polls FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "polls_update" ON polls FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "polls_delete" ON polls FOR DELETE USING (auth.uid() = user_id);

-- Options Policies
CREATE POLICY "options_select" ON poll_options FOR SELECT USING (true);
CREATE POLICY "options_insert" ON poll_options FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "options_update" ON poll_options FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "options_delete" ON poll_options FOR DELETE USING (auth.uid() = user_id);

-- Votes Policies (Private/Secure)
CREATE POLICY "votes_insert" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_select" ON votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "votes_update" ON votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "votes_delete" ON votes FOR DELETE USING (auth.uid() = user_id);

-- 5. INTEGRITY FUNCTION & TRIGGER
CREATE OR REPLACE FUNCTION handle_option_integrity()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        NEW.original_label := NEW.label;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Prevent changing the original label
        NEW.original_label := OLD.original_label; 
        -- Update timestamp only if text changed
        IF NEW.label IS DISTINCT FROM OLD.label THEN
            NEW.edited_at := now();
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER tr_option_integrity
BEFORE INSERT OR UPDATE ON poll_options
FOR EACH ROW EXECUTE FUNCTION handle_option_integrity();

-- Save for later maybe?
-- -- 6. PUBLIC AGGREGATE VIEW
-- -- SECURITY DEFINER bypasses RLS so anyone can see the *count*, 
-- -- but they can't see *who* voted.
-- CREATE OR REPLACE VIEW public_poll_results AS
-- SELECT 
--     poll_id,
--     option_id,
--     count(*) as total_votes,
--     avg(rank) as avg_rank
-- FROM votes
-- GROUP BY poll_id, option_id;

-- Ensure the 'anon' and 'authenticated' roles can read the view
GRANT SELECT ON public_poll_results TO anon, authenticated;