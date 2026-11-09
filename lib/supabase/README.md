# Supabase infrastructure

Step 15 only initializes browser/server clients and validates public configuration.

- No authentication, database schema, query, migration, or RLS policy exists yet.
- Do not add a service-role key to client-visible environment variables.
- `proxy.ts` is intentionally absent. Add it in the later authentication step when session refresh and protected routes are implemented.
