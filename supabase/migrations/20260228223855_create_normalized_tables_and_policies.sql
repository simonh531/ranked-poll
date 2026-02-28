-- Create the 'polls' table
CREATE TABLE polls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    question text NOT NULL,
    user_id uuid NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
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
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    poll_id uuid NOT NULL,
    description text NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

-- Enable RLS for 'poll_options' table
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to poll_options" ON poll_options
    FOR SELECT USING (true);

-- Allow users who own the parent poll to insert options
CREATE POLICY "Allow poll owners to insert options" ON poll_options
    FOR INSERT WITH CHECK (
        (SELECT user_id FROM polls WHERE id = poll_id) = auth.uid()
    );

-- Allow users who own the parent poll to update options
CREATE POLICY "Allow poll owners to update options" ON poll_options
    FOR UPDATE USING (
        (SELECT user_id FROM polls WHERE id = poll_id) = auth.uid()
    ) WITH CHECK (
        (SELECT user_id FROM polls WHERE id = poll_id) = auth.uid()
    );

-- Allow users who own the parent poll to delete options
CREATE POLICY "Allow poll owners to delete options" ON poll_options
    FOR DELETE USING (
        (SELECT user_id FROM polls WHERE id = poll_id) = auth.uid()
    );


-- Create the 'votes' table
CREATE TABLE votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    poll_id uuid NOT NULL,
    option_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rank integer NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE (poll_id, user_id, option_id),
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
