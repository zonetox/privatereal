-- Lifecycle Stage Model Schema

-- 1. Create Lifecycle Record table
create table if not exists client_project_lifecycle (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  stage text not null check (stage in ('exploring', 'site_visit', 'reservation', 'deposit', 'spa_signing', 'payment', 'portfolio')),
  notes text,
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  unique(client_id, project_id)
);

-- 2. Add RLS
alter table client_project_lifecycle enable row level security;

create policy "Admins have full access to lifecycle"
  on client_project_lifecycle for all
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Clients can view their own lifecycle"
  on client_project_lifecycle for select
  to authenticated
  using (
    exists (
      select 1 from clients
      where clients.id = client_project_lifecycle.client_id
      and clients.user_id = auth.uid()
    )
  );

-- 3. Performance Indexes
create index if not exists idx_lifecycle_client_project on client_project_lifecycle(client_id, project_id);
create index if not exists idx_lifecycle_stage on client_project_lifecycle(stage);

-- 4. Automatically create lifecycle record when a project is added to workspace
create or replace function handle_workspace_selection_lifecycle()
returns trigger as $$
begin
  insert into client_project_lifecycle (client_id, project_id, stage)
  values (new.client_id, new.project_id, 'exploring')
  on conflict (client_id, project_id) do nothing;
  return new;
end;
$$ language plpgsql;

create trigger tr_workspace_to_lifecycle
  after insert on client_workspace_selections
  for each row
  execute function handle_workspace_selection_lifecycle();
