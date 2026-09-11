-- PawPicks Thailand — security hardening (fixes from `supabase db advisors`)
--
-- is_admin() is deliberately NOT touched here: RLS policies invoke it as the
-- querying role (anon/authenticated), so revoking EXECUTE would break every
-- policy that calls it ("permission denied for function is_admin"). Calling
-- it directly is harmless — auth.uid() is null for anon, so it just returns
-- false. The advisor flags this; it's an accepted false positive.

-- Pin the search_path so it can't be hijacked by an earlier schema on the
-- caller's search_path. The function doesn't reference any unqualified
-- objects, so this is pure hardening with no behaviour change.
alter function public.set_updated_at() set search_path = public, pg_temp;

-- handle_new_user() only needs to run as the `on_auth_user_created` trigger
-- (trigger invocation doesn't require the DML role to have EXECUTE). It has
-- no legitimate reason to be callable directly via /rest/v1/rpc/handle_new_user.
revoke execute on function public.handle_new_user() from anon, authenticated;
