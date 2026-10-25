# The Maitri database, explained

Written for the whole team, not only developers. Last updated 25 Oct 2026.

## In one paragraph

The danger-sign check runs entirely on the woman's phone and never needs a database. The database is only for an optional extra: a **private daily log**. If a woman signs in and taps "Save to my daily log", the date, her answers and the result are saved to her account, so she can see her history later. If she never signs in, nothing is stored anywhere except for the few minutes the check is on her screen.

## What is stored, and what is not

One saved entry (one row in the `checkins` table) looks like this:

| Field | Example | What it is |
|---|---|---|
| `entry_date` | 2026-10-25 | The day of the check (one entry per day) |
| `phase` | `pregnancy` or `postpartum` | Which stage she was in |
| `answers` | `{"q_fits": "no", "q_bleed_preg": "yes"}` | Each question and her Yes, No or Not sure |
| `tier` | `RED`, `AMBER` or `GREEN` | The result, worked out on her phone |
| `rules_version` | `0.1-draft` | Which version of the rules gave that result |
| `user_id` | a long random code | Which account owns the entry |

A second table, `profiles`, can hold her stage, due date or delivery date, and language. The app does not use it yet.

**Not stored in our tables:** her name, her phone number, her email, her address, her location, or any free text. A test checks that no column in our tables is named like a name, email or phone.

**Held by the sign-in service, not by us:** the phone number (for phone sign-in) or the Google email (for Google sign-in). The service needs these to let her back in. We never copy them into our own tables.

## How the pieces connect

```
 Her phone (the app)                                   The cloud (Supabase)
 ----------------------------------------             ----------------------------------
 Questions, rules, result, call button   <-- never leaves the phone

 "Continue with Google" / phone code  ----------->     Sign-in service
 "Save to my daily log"               ----------->     Database (Postgres)
                                                       - checkins, profiles
                                                       - row level security
```

- The app talks to the cloud **only** when she signs in, saves an entry, reads her log, or deletes her account.
- The result (RED, AMBER, GREEN) is always decided on the phone from the rules file. The database stores the result. It never decides it.
- The emergency check works with no account and no internet.
- The app finds the database through two settings, `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. If they are not set, the app shows no account features at all.

## Why one woman cannot read another's entries

Think of every row as having a lock, and her sign-in as the only key. This is called **row level security**. The rule written in the database says: "a signed-in person may read, add, change or delete a row only if the row's `user_id` is her own sign-in id." Visitors who are not signed in can do nothing.

This protection lives **inside the database**, so it holds even if the app had a bug. The "anon key" that is placed in the app is public by design and is safe to expose, because the rule above is what protects the data. The other key, the **service role key**, skips all the rules. It must never be put in the app or in this repository.

## Sign-in options

| Option | What it needs | What the sign-in service holds |
|---|---|---|
| Continue with Google | A Google OAuth client set up by the project owner | Her Google email |
| Phone number and code | A text-message provider (costs money, India needs sender registration) | Her phone number |

Google alone is enough to start. Both give her an account she can sign back into, so she does not lose her log if she loses her phone.

## What is built and how it was checked

| Piece | Status | How it was checked |
|---|---|---|
| Tables, limits and the one-entry-per-day rule | Written | Tested in a real Postgres running locally (`src/db/schema.test.ts`, 10 tests) |
| Row level security (nobody reads or changes anyone else's rows) | Written | Same tests: user B cannot read, change, delete or forge user A's entries, and visitors who are not signed in cannot read or write |
| Delete my account (removes her sign-in, entries and profile, and nobody else's) | Written | Same tests |
| Sign-in screens, daily log, save and delete in the app | Written | Tested against a simulated database client (`src/ui/account.test.tsx`) |
| A real Supabase project | **Does not exist yet** | Needs the owner. After it exists, `npm run check:backend` checks it |

The local tests copy the pieces Supabase provides (the roles, the user table and the "who am I" function) so the real migration file runs in a real Postgres. As a sanity check we also broke the rule on purpose in a throwaway run: with row level security off, user B could see user A's rows; with it on, B sees nothing. So the tests do catch the problem they are meant to catch.

**What these tests do not prove:** that a particular Supabase project is configured correctly (Google switched on, the migration run, the right keys). That is what `npm run check:backend` is for, and it needs the real project.

## What can be done by whom

**Claude can do on its own (and has):**
- Write and maintain the schema and the app code.
- Test the schema in a local Postgres, including who can see what and account deletion.
- Once you give the project URL and the public key: run `npm run check:backend`, read what it reports, and fix anything in the code or the migration it points to.

**Needs you (or a teammate):**
- Create the Supabase account and project, and run `supabase/migrations/0001_init.sql` in its SQL editor.
- Create the Google OAuth client and paste its id and secret into the Supabase dashboard (the secret never goes anywhere else).
- Send the project URL and the public key, and set the same two values in the host's environment settings (for example Vercel) before the site is built.
- Click "Continue with Google" once by hand. Claude cannot complete Google's sign-in screen.
- Connect a text-message provider if phone sign-in is wanted.

**Could be automated if you connect the Supabase connector:** Claude's connector registry lists a Supabase connector that can create projects and run SQL. It is not connected in this session. If you connect it in your claude.ai settings, Claude could create the project and run the migration itself. Creating a project may cost money, and the connector asks for a cost confirmation first. You would still need to set up Google sign-in in the dashboards.

## Checking it yourself

- `npm test` runs the database tests along with everything else.
- `npm run check:backend` checks a real project. It confirms the project answers, Google is on, the tables exist, anonymous visitors read and write nothing, and the delete function exists. With two throwaway test users it also proves that one account cannot read, write or delete the other's entries.
- Step-by-step setup is in `docs/BACKEND_SETUP.md`.

## Honest limits and what is needed before real users

- **The project owner can read the data.** Whoever has the Supabase dashboard or the service role key can read every row. Limit who has access, and tell women in plain words what is stored and who can see it.
- **No end-to-end encryption.** Data is protected in transit and by the provider at rest, but the server can read the answers.
- **The answers are health information.** Under India's Digital Personal Data Protection Act 2023 this needs consent text, a retention rule, a deletion route (the delete-account button covers part of this) and a breach plan. A legal review has not happened.
- **Hosting region.** Choose the region on purpose. It decides where the data physically lives.
- **Backups and cost.** The free tier has limits. Check them before a pilot.
- **A published Google sign-in screen** may need Google's app verification if you go beyond test users.
- **The log is not a diagnosis.** It stores what she told the app and the result. It adds no new medical advice.

## Glossary

- **Postgres:** the database software Supabase runs.
- **Supabase:** the hosted service that gives us the database, the sign-in service and a way for the app to talk to them.
- **Table, row, column:** like a spreadsheet. Each saved entry is one row.
- **Migration:** a script that creates or changes tables (`supabase/migrations/0001_init.sql`).
- **Row level security:** the lock on each row described above.
- **Anon (public) key:** a key that is safe to ship in the app. It does not unlock anyone's data on its own.
- **Service role key:** a master key that skips all the rules. Never put it in the app or in git.
- **OAuth / Google sign-in:** letting Google confirm who she is, so we do not handle a password.
- **PKCE:** the safer way the app completes a Google sign-in. It lets sign-in work with the app's hash-based page addresses.
