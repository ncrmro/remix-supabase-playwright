CREATE TABLE public.profiles
(
    id         uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    first_name text,
    last_name  text,

    PRIMARY KEY (id)
);

ALTER TABLE public.profiles
    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by users who created them."
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile."
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
    ON profiles FOR UPDATE
    USING (auth.uid() = id);