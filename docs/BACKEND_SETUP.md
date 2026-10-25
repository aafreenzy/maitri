# Backend setup (Supabase, Google sign-in)

For a plain-language overview of what the database stores and why it is private, read `docs/DATABASE_EXPLAINED.md` first.

You create the project and the Google client. Menu names in the dashboards change now and then, so follow the idea if a label differs.

## What stays secret and what is safe

| Value | Safe to share with the app or the team chat? |
|---|---|
| Project URL (`https://<ref>.supabase.co`) | Yes |
| Anon key or "publishable" key | Yes. It is public by design. Row level security is what protects the data. |
| `service_role` key or "secret" key | **Never.** Not in the app, not in git, not in chat. |
| Database password | Never in git or chat. |
| Google client secret | Only inside the Supabase dashboard. Never anywhere else. |

## Steps

1. **Create the project** at supabase.com. Pick the region closest to your users (check whether an India region is offered) and save the database password privately.
2. **Create the tables.** SQL editor, paste all of `supabase/migrations/0001_init.sql`, run it.
3. **Google sign-in.**
   1. Google Cloud Console, APIs and Services, OAuth consent screen: configure it (app name Maitri, your support email).
   2. Credentials, Create credentials, OAuth client ID, type Web application.
   3. Authorized redirect URI: `https://<ref>.supabase.co/auth/v1/callback` (use your own project reference).
   4. Copy the client ID and client secret into Supabase: Authentication, Providers, Google, turn it on, paste them, save.
4. **Redirect addresses.** Supabase, Authentication, URL Configuration: set Site URL to your live address and add it under Redirect URLs. For local work also add `http://localhost:5173`.
5. **Phone code sign-in (optional).** Needs a text-message provider and costs money. Google alone is enough to start. Skip this unless you need it.
6. **Copy the two public values.** Project settings, API: the Project URL and the anon or publishable key.
7. **Give them to the app.**
   - Local: create `.env.local` (it is git-ignored) with `VITE_SUPABASE_URL=...` and `VITE_SUPABASE_ANON_KEY=...`.
   - Deployed: add the same two variables in your host's environment settings (for example Vercel, Project Settings, Environment Variables) **before** the build runs. The app reads them at build time.
8. **Check the connection:** `npm run check:backend`. It confirms the project answers, Google is on, the tables exist, anonymous visitors can read and write nothing, and the delete function exists.
9. **Prove privacy between accounts (recommended).** In Supabase, Authentication, Users, add two throwaway users with email and password and auto-confirm on. Put their details in `.env.local` as `CHECK_USER1_*` and `CHECK_USER2_*` (see `.env.example`). Run `npm run check:backend` again. It checks that user 2 cannot read, write or delete user 1's entry. Delete the two test users afterwards.
10. **Try it by hand.** Open the app, Account, Continue with Google. After signing in you land on the daily log. Do a check, tap "Save to my daily log", reload, and see the entry.

## What the app does with the backend

- The emergency check never contacts the backend and works with no account and no network.
- Signing in and saving to the log are the only backend calls.
- A saved entry is the date, the answers, the result tier and the rule version. The result itself is always computed on the phone.
- The session is stored under a `maitri:` key, so "Exit now" signs her out of that phone.
- Delete account removes her entries and her sign-in.

## Before real users

Legal review under the Digital Personal Data Protection Act 2023 (consent text, retention, deletion, breach plan), a hosting-region decision, and a plain-language explanation to women of what is stored. A published Google sign-in screen also needs Google's app verification if you go beyond test users.
