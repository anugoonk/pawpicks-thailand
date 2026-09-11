-- Follow-up to 20260911000000: `revoke ... from anon, authenticated` was a
-- no-op — PostgreSQL grants EXECUTE to PUBLIC by default on function
-- creation, and anon/authenticated inherit it through that, not through a
-- direct grant. Revoke from PUBLIC to actually close it off; the
-- on_auth_user_created trigger keeps working (trigger invocation doesn't
-- check the firing role's EXECUTE privilege on the trigger function).
revoke execute on function public.handle_new_user() from public;
