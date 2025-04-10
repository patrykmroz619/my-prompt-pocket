-- Migration: Initial Schema Creation
-- Description: Creates the core tables for MyPromptPocket application
-- Tables: users, prompts, tags, prompt_tags
-- Author: GitHub Copilot
-- Date: 2025-04-10

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create users table
create table users (
    id uuid primary key default uuid_generate_v4(),
    email varchar(255) unique not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable RLS for users table
alter table users enable row level security;

-- RLS Policies for users table
create policy "Allow individual user to view own data" on users
    for select
    using (auth.uid() = id);

create policy "Allow individual user to update own data" on users
    for update
    using (auth.uid() = id);

-- Create prompts table
create table prompts (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references users(id) on delete cascade,
    name varchar(100) not null,
    description varchar(1000),
    content text not null,
    parameters jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint unique_prompt_name_per_user unique (user_id, name)
);

-- Enable RLS for prompts table
alter table prompts enable row level security;

-- RLS Policies for prompts table
create policy "Users can view their own prompts" on prompts
    for select
    using (auth.uid() = user_id);

create policy "Users can create their own prompts" on prompts
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own prompts" on prompts
    for update
    using (auth.uid() = user_id);

create policy "Users can delete their own prompts" on prompts
    for delete
    using (auth.uid() = user_id);

-- Create tags table
create table tags (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references users(id) on delete cascade,
    name varchar(50) not null,
    created_at timestamptz not null default now(),
    constraint unique_tag_name_per_user unique (user_id, name)
);

-- Enable RLS for tags table
alter table tags enable row level security;

-- RLS Policies for tags table
create policy "Users can view their own tags" on tags
    for select
    using (auth.uid() = user_id);

create policy "Users can create their own tags" on tags
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own tags" on tags
    for update
    using (auth.uid() = user_id);

create policy "Users can delete their own tags" on tags
    for delete
    using (auth.uid() = user_id);

-- Create prompt_tags junction table
create table prompt_tags (
    prompt_id uuid not null references prompts(id) on delete cascade,
    tag_id uuid not null references tags(id) on delete cascade,
    primary key (prompt_id, tag_id)
);

-- Enable RLS for prompt_tags table
alter table prompt_tags enable row level security;

-- RLS Policies for prompt_tags table
create policy "Users can view prompt_tags for their prompts" on prompt_tags
    for select
    using (exists (
        select 1 from prompts
        where prompts.id = prompt_tags.prompt_id
        and prompts.user_id = auth.uid()
    ));

create policy "Users can create prompt_tags for their prompts" on prompt_tags
    for insert
    with check (exists (
        select 1 from prompts
        where prompts.id = prompt_tags.prompt_id
        and prompts.user_id = auth.uid()
    ));

create policy "Users can delete prompt_tags for their prompts" on prompt_tags
    for delete
    using (exists (
        select 1 from prompts
        where prompts.id = prompt_tags.prompt_id
        and prompts.user_id = auth.uid()
    ));

-- Create indexes for better query performance
create index idx_users_email on users using btree (email);
create index idx_prompts_user_id on prompts using btree (user_id);
create index idx_prompts_name_user_id on prompts using btree (name, user_id);
create index idx_tags_user_id on tags using btree (user_id);
create index idx_tags_name_user_id on tags using btree (name, user_id);
create index idx_prompt_tags_tag_id on prompt_tags using btree (tag_id);

-- Add updated_at trigger function
create or replace function handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger set_timestamp_users
    before update on users
    for each row
    execute function handle_updated_at();

create trigger set_timestamp_prompts
    before update on prompts
    for each row
    execute function handle_updated_at();
