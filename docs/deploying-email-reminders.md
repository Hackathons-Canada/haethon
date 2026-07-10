# Deploying the email reminder cron

Steps to get the daily reminder emails (`/api/cron/send-reminders`) working in a
new environment. Do these in order.

## 1. Apply the database migration

The reminder preferences table and the new enum values live in migration
`0005_lowly_dracula`. Apply it before deploying the app that reads from it:

```bash
npm run db:migrate
```

Use `db:migrate`, never `db:push` (push has caused schema drift here before).

## 2. Create the `CRON_SECRET`

Vercel Cron authenticates to the route by sending
`Authorization: Bearer $CRON_SECRET`. The route rejects any request without it,
so this must exist before the cron can run.

1. Generate a strong random value:

   ```bash
   openssl rand -hex 32
   ```

2. Add it in **Vercel → Project → Settings → Environment Variables**:

   | Name          | Value                    | Environments             |
   | ------------- | ------------------------ | ------------------------ |
   | `CRON_SECRET` | *(the generated value)*  | Production (+ Preview)   |

Vercel injects this header automatically for crons defined in `vercel.json` once
the variable is set — you do not wire it up anywhere else.

## 3. Add the remaining environment variables

Set these alongside `CRON_SECRET` in the same Vercel settings page:

| Name                   | What it is                                                        |
| ---------------------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`  | Public base URL of the deployment, e.g. `https://haethon.dev`. Used to build the "View event details" / "View your pipeline" links in each email. No trailing slash. |
| `RESEND_API_KEY`       | Resend API key used to send the batch.                           |
| `RESEND_AUDIENCE_FROM` | Verified `From` address, e.g. `Haethon <reminders@haethon.dev>`. |

The route returns `503` (and sends nothing) if `CRON_SECRET`, `RESEND_API_KEY`,
or `RESEND_AUDIENCE_FROM` is missing, so all three must be present in the target
environment.

## 4. Verify the Resend sending domain

`RESEND_AUDIENCE_FROM` must use a domain that is verified in Resend (SPF + DKIM
records added at your DNS provider). Unverified domains cause every send to fail.

## 5. Confirm the cron schedule

`vercel.json` runs the route once a day at 12:00 UTC:

```json
{
  "crons": [{ "path": "/api/cron/send-reminders", "schedule": "0 12 * * *" }]
}
```

After deploying, check **Vercel → Project → Cron Jobs** to confirm it is
registered and enabled.

## 6. Smoke-test the endpoint

With the deployment live and the env vars set, call it manually with the secret:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://<your-app-url>/api/cron/send-reminders
```

Expected response:

```json
{ "data": { "due": 0, "sent": 0, "failed": 0 } }
```

`due` is how many reminders were ready to send, `sent` how many Resend accepted,
`failed` how many it rejected. A `401` means the secret is wrong or unset; a
`503` means Resend is not configured.

### Or send yourself a test from the admin

Once `RESEND_API_KEY` and `RESEND_AUDIENCE_FROM` are set, an admin can open
**`/admin/email-test`**, enter any address, pick a hackathon and reminder type,
and send the exact email a hacker would receive (rendered from the same template
the cron uses, so it is a true preview). This needs no `CRON_SECRET` and is the
quickest way to confirm Resend + the sending domain are wired up correctly.

## Notes

- Delivery granularity is one day: a reminder scheduled for any time is sent on
  the next 12:00 UTC run at or after its scheduled time. Move to a more frequent
  schedule if you need tighter timing.
- Each run processes up to 100 due reminders (the Resend batch limit). At higher
  volume, increase the cron frequency or add pagination.
