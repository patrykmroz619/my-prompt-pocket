# Database Schema - MyPromptPocket

## Tables

### users

- **id** (uuid): Unique identifier for the user. PRIMARY KEY, DEFAULT uuid_generate_v4()
- **email** (varchar(255)): User's email address used for login. UNIQUE, NOT NULL
- **created_at** (timestamptz): When the user account was created. NOT NULL, DEFAULT now()
- **updated_at** (timestamptz): When the user account was last updated. NOT NULL, DEFAULT now()

_Note: Additional authentication fields will be handled automatically by Supabase Auth._

### prompts

- **id** (uuid): Unique identifier for the prompt. PRIMARY KEY, DEFAULT uuid_generate_v4()
- **user_id** (uuid): The user who owns this prompt. REFERENCES users(id) ON DELETE CASCADE, NOT NULL
- **name** (varchar(100)): The prompt's name. NOT NULL
- **description** (varchar(1000)): Optional description of what the prompt does.
- **content** (text): The actual prompt text content. NOT NULL
- **parameters** (jsonb): Parameters extracted from the prompt content.
- **created_at** (timestamptz): When the prompt was created. NOT NULL, DEFAULT now()
- **updated_at** (timestamptz): When the prompt was last updated. NOT NULL, DEFAULT now()

_Constraints:_

- UNIQUE (user_id, name) - Prompt names must be unique for each user

### tags

- **id** (uuid): Unique identifier for the tag. PRIMARY KEY, DEFAULT uuid_generate_v4()
- **user_id** (uuid): The user who created this tag. REFERENCES users(id) ON DELETE CASCADE, NOT NULL
- **name** (varchar(50)): The tag name. NOT NULL
- **created_at** (timestamptz): When the tag was created. NOT NULL, DEFAULT now()

_Constraints:_

- UNIQUE (user_id, name) - Tag names must be unique for each user

### prompt_tags

- **prompt_id** (uuid): Reference to the prompt. REFERENCES prompts(id) ON DELETE CASCADE, NOT NULL
- **tag_id** (uuid): Reference to the tag. REFERENCES tags(id) ON DELETE CASCADE, NOT NULL

_Constraints:_

- PRIMARY KEY (prompt_id, tag_id) - Each prompt-tag combination should only appear once

## Indexes

- **users.email** (btree): Speed up user lookups by email during login
- **prompts.user_id** (btree): Quickly find all prompts belonging to a user
- **prompts.name, prompts.user_id** (btree): Optimize prompt searches by name for a specific user
- **tags.user_id** (btree): Quickly find all tags belonging to a user
- **tags.name, tags.user_id** (btree): Optimize tag searches by name for a specific user
- **prompt_tags.tag_id** (btree): Quickly find all prompts with a specific tag

## Row Level Security (RLS) Policies

### prompts Table Policies

```sql
-- Enable RLS on the prompts table
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select only their own prompts
CREATE POLICY select_own_prompts ON prompts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own prompts
CREATE POLICY insert_own_prompts ON prompts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update only their own prompts
CREATE POLICY update_own_prompts ON prompts
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy to allow users to delete only their own prompts
CREATE POLICY delete_own_prompts ON prompts
    FOR DELETE
    USING (auth.uid() = user_id);
```

### tags Table Policies

```sql
-- Enable RLS on the tags table
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select only their own tags
CREATE POLICY select_own_tags ON tags
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own tags
CREATE POLICY insert_own_tags ON tags
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update only their own tags
CREATE POLICY update_own_tags ON tags
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy to allow users to delete only their own tags
CREATE POLICY delete_own_tags ON tags
    FOR DELETE
    USING (auth.uid() = user_id);
```

### prompt_tags Table Policies

```sql
-- Enable RLS on the prompt_tags table
ALTER TABLE prompt_tags ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select prompt_tags for prompts they own
CREATE POLICY select_own_prompt_tags ON prompt_tags
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM prompts
        WHERE prompts.id = prompt_tags.prompt_id
        AND prompts.user_id = auth.uid()
    ));

-- Policy to allow users to insert prompt_tags for prompts they own
CREATE POLICY insert_own_prompt_tags ON prompt_tags
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM prompts
        WHERE prompts.id = prompt_tags.prompt_id
        AND prompts.user_id = auth.uid()
    ));

-- Policy to allow users to delete prompt_tags for prompts they own
CREATE POLICY delete_own_prompt_tags ON prompt_tags
    FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM prompts
        WHERE prompts.id = prompt_tags.prompt_id
        AND prompts.user_id = auth.uid()
    ));
```

## Additional Implementation Notes

1. The `parameters` column in the `prompts` table stores a JSON object representing the parameters extracted from the prompt content using the `{{ parameter }}` syntax. Application logic will handle the extraction, storage, and validation of these parameters.

2. The composite unique constraint on `(user_id, name)` in the `prompts` table ensures that prompt names are unique per user but allows different users to use the same prompt names.

3. The `ON DELETE CASCADE` constraint on foreign keys ensures that when a user is deleted, all their prompts, tags, and prompt-tag associations are automatically removed.

4. The application will be responsible for handling validation of text field lengths (e.g., ensuring prompt names are ≤ 100 characters and descriptions are ≤ 1000 characters).

5. For the search functionality mentioned in the PRD, the application will use the indexes created on prompt name and tags to efficiently query the database.

6. The Row Level Security (RLS) policies ensure data isolation between users, making it impossible for one user to access or modify another user's data, even if they attempt to make direct API calls.

7. Timestamps (`created_at` and `updated_at`) are automatically managed for all tables to track when records were created or last modified.
