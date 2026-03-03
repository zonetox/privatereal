-- Create a table for user profiles with roles
create table profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique,
    role text check (role in ('admin', 'client')) default 'client' not null,
    full_name text,
    avatar_url text,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Enable Row Level Security
alter table profiles enable row level security;
-- Policies for profiles
create policy "Public profiles are viewable by everyone." on profiles for
select using (true);
create policy "Users can update their own profile." on profiles for
update using (auth.uid() = id);
create policy "Admins can see all profiles." on profiles for
select using (
        (
            select role
            from profiles
            where id = auth.uid()
        ) = 'admin'
    );
-- Role based data isolation examples (placeholders for business logic)
-- alter table some_data enable row level security;
-- create policy "Admins can do everything" on some_data for all using ( (select role from profiles where id = auth.uid()) = 'admin' );
-- create policy "Clients see their own data" on some_data for select using ( client_id = auth.uid() );
-- Function to handle new user signup
create function public.handle_new_user() returns trigger as $$ begin
insert into public.profiles (id, email, role)
values (new.id, new.email, 'client');
return new;
end;
$$ language plpgsql security definer;
-- Trigger for new user signup
create trigger on_auth_user_created
after
insert on auth.users for each row execute procedure public.handle_new_user();