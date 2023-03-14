CREATE TABLE public.todos
(
    id         uuid PRIMARY KEY                    DEFAULT gen_random_uuid(),
    user_id    uuid REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
    text       text                       NOT NULL,
    completed  boolean                             DEFAULT FALSE,
    created_at timestamptz                NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
    updated_at timestamptz                NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
);

ALTER TABLE public.todos
    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos are viewable by users who created them."
    ON todos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos."
    ON todos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos."
    ON todos FOR UPDATE
    USING (auth.uid() = user_id);