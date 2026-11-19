-- Let public website visitors submit enquiries without the service-role key.
-- INSERT only, and value-constrained so a submission can't set staff-only
-- fields (status/assignment). Reads/updates/deletes remain staff-only via the
-- existing policies, so leads are still fully private.
create policy leads_insert_public on public.leads
  for insert
  to anon, authenticated
  with check (
    status = 'new'
    and assigned_agent_id is null
    and source = 'website'
  );
