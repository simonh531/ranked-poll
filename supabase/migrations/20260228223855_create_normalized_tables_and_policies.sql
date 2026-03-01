CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the 'polls' table
CREATE TABLE polls (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    question text NOT NULL,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    settings jsonb DEFAULT '{"is_anonymous": true, "allow_multiple": false}'::jsonb
);

-- Enable RLS for 'polls' table
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

-- Allow public read access to everyone
CREATE POLICY "Allow public read access to polls" ON polls
    FOR SELECT USING (true);

-- Allow users to create polls
CREATE POLICY "Allow users to create polls" ON polls
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow owners to update their own polls
CREATE POLICY "Allow owners to update their own polls" ON polls
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow owners to delete their own polls
CREATE POLICY "Allow owners to delete their own polls" ON polls
    FOR DELETE USING (auth.uid() = user_id);


-- Create the 'poll_options' table
CREATE TABLE poll_options (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label text NOT NULL,
    original_label text NOT NULL, 
    position integer NOT NULL,     
    created_at timestamp with time zone DEFAULT now() NOT NULL
    edited_at timestamp with time zone,
);

ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to poll_options" ON poll_options
    FOR SELECT USING (true);

-- Allow users who own the parent poll to insert options
CREATE POLICY "Allow poll owners to insert options" ON poll_options
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users who own the parent poll to update options
CREATE POLICY "Allow poll owners to update options" ON poll_options
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow poll owners to delete options" ON poll_options
    FOR DELETE USING (auth.uid() = user_id);


-- Create the 'votes' table
CREATE TABLE votes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    poll_id uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id uuid NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rank integer NOT NULL DEFAULT 1,
    
    -- Constraint: A user cannot rank the same option twice in one poll
    UNIQUE (poll_id, user_id, option_id),
    -- Constraint: A user cannot give two different options the same rank
    UNIQUE (poll_id, user_id, rank)
);

-- Enable RLS for 'votes' table
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Allow users to insert votes
CREATE POLICY "Allow users to insert votes" ON votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own votes
CREATE POLICY "Allow users to read their own votes" ON votes
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own votes
CREATE POLICY "Allow users to update their own votes" ON votes
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own votes
CREATE POLICY "Allow users to delete their own votes" ON votes
    FOR DELETE USING (auth.uid() = user_id);

-- 1. Create the function that handles the logic
CREATE OR REPLACE FUNCTION handle_poll_option_update()
RETURNS TRIGGER AS $$
BEGIN
    -- LOCK original_label: If they try to change it, set it back to what it was
    NEW.original_label := OLD.original_label;

    -- SET edited_at: Only if the label actually changed
    IF NEW.label IS DISTINCT FROM OLD.label THEN
        NEW.edited_at := now();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Bind the function to the poll_options table
CREATE TRIGGER tr_on_poll_option_update
BEFORE UPDATE ON poll_options
FOR EACH ROW
EXECUTE FUNCTION handle_poll_option_update();

-- Automatically sync original_label on insert and track edits
CREATE OR REPLACE FUNCTION handle_option_integrity()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        NEW.original_label := NEW.label;
    ELSIF (TG_OP = 'UPDATE') THEN
        NEW.original_label := OLD.original_label; -- Lock it
        IF NEW.label IS DISTINCT FROM OLD.label THEN
            NEW.edited_at := now();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_option_integrity
BEFORE INSERT OR UPDATE ON poll_options
FOR EACH ROW EXECUTE FUNCTION handle_option_integrity();

PUBLIC RESULTS VIEW (SECURITY DEFINER)
-- This allows anyone to see the aggregated totals without seeing individual user_ids.
CREATE OR REPLACE VIEW public_poll_results AS
SELECT 
    poll_id,
    option_id,
    count(*) as total_votes,
    avg(rank) as avg_rank
FROM votes
GROUP BY poll_id, option_id;