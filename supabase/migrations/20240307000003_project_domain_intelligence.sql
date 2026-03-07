-- Project Intelligence Framework - Domain Tables

-- 1. Project Location Intelligence
create table if not exists project_location (
  project_id uuid primary key references projects(id) on delete cascade,
  distance_to_cbd numeric, -- in km
  metro_access text, -- 'Walking Distance', 'Short Drive', 'None'
  highway_access boolean default false,
  infrastructure_pipeline text[], -- e.g. ['New Metro Line 2026', 'Airport Expansion']
  neighborhood_quality text, -- 'Premium', 'Developing', 'Established'
  updated_at timestamp with time zone default now()
);

-- 2. Project Market Intelligence
create table if not exists project_market (
  project_id uuid primary key references projects(id) on delete cascade,
  average_price_area numeric, -- per m2 avg in the area
  price_growth_3y numeric, -- percentage growth over 3 years
  rental_yield numeric, -- expected yield percentage
  supply_level text, -- 'High', 'Balanced', 'Low'
  demand_level text, -- 'High', 'Stable', 'Low'
  updated_at timestamp with time zone default now()
);

-- 3. Project Risk Intelligence
create table if not exists project_risk (
  project_id uuid primary key references projects(id) on delete cascade,
  legal_risk text, -- 'Cleared', 'Pending Final Approval', 'High Risk'
  construction_risk text, -- 'On Schedule', 'Delayed', 'Early Phase'
  supply_risk text, -- 'Low', 'High Competing Supply'
  market_risk text, -- 'Low', 'Moderate', 'High'
  overall_risk_score numeric check (overall_risk_score >= 0 and overall_risk_score <= 100),
  updated_at timestamp with time zone default now()
);

-- 4. Enable RLS
alter table project_location enable row level security;
alter table project_market enable row level security;
alter table project_risk enable row level security;

-- 5. Add Policies
-- Admin full access
create policy "Admins have full access to project_location" on project_location for all to authenticated using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));
create policy "Admins have full access to project_market" on project_market for all to authenticated using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));
create policy "Admins have full access to project_risk" on project_risk for all to authenticated using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Client view access
create policy "Clients can view project_location" on project_location for select to authenticated using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'client'));
create policy "Clients can view project_market" on project_market for select to authenticated using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'client'));
create policy "Clients can view project_risk" on project_risk for select to authenticated using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'client'));

-- 6. Trigger to create intelligence records when a project is created
create or replace function handle_project_intelligence_creation()
returns trigger as $$
begin
  insert into project_location (project_id) values (new.id) on conflict do nothing;
  insert into project_market (project_id) values (new.id) on conflict do nothing;
  insert into project_risk (project_id) values (new.id) on conflict do nothing;
  -- also make sure opportunity_cards is initiated
  insert into opportunity_cards (project_id) values (new.id) on conflict do nothing;
  return new;
end;
$$ language plpgsql;

create trigger tr_create_project_domain_intelligence
  after insert on projects
  for each row
  execute function handle_project_intelligence_creation();
