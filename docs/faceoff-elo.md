# Face Off rating system

Face Off ranks individual hackathon editions by community reputation and
anticipation. It is not an attendee-experience score. Ratings are provisional
until an edition has ten completed matchups.

## Rating algorithm

Algorithm version 2 uses standard Elo expected scores:

```text
expected(A) = 1 / (1 + 10 ^ ((rating(B) - rating(A)) / 400))
```

K is 40 below 10 games, 24 below 30, and 16 afterwards. A matchup uses the
smaller participant K for both sides. This protects established ratings and
makes every result exactly zero-sum. Stored ratings are integers.

Public ordering uses a confidence-adjusted score:

```text
score = 1500 + games / (games + 10) * (raw_elo - 1500)
```

The raw rating remains the source of truth for subsequent Elo updates. New and
unplayed editions start at a neutral 1500; prize money, sponsors, and catalog
data completeness do not affect the prior.

## Request flow

1. `GET /api/faceoff/matchup` chooses under-exposed candidates and favors
   close, informative comparisons while retaining some random exploration.
2. The issued matchup records left/right placement, voter fingerprint, and
   expiry. The vote API will not accept an arbitrary pair.
3. `POST /api/faceoff/vote` supplies the matchup, winner, and a unique request
   id.
4. `record_hackathon_faceoff_vote` locks the voter and both rating rows,
   validates eligibility and throttles, updates both ratings, writes the audit
   row, and consumes the matchup in one PostgreSQL transaction.
5. Open clients update optimistically from the response and reconcile against
   `/api/faceoff/leaderboard` every 15 seconds.

Anonymous cookie identifiers are SHA-256 hashed before storage. Signed-in and
anonymous voters are limited to one judgment of a pair per hour, at least 600
ms between any two votes, and 50 votes in a rolling 24-hour period.

## Data and operations

- `hackathon_faceoff_ratings` is the narrow, high-churn current-state table.
- `hackathon_faceoff_votes` is the immutable audit/reconciliation log.
- `hackathon_faceoff_matchups` stores impressions, position, skips, and
  consumption. Rows older than 90 days are removed by the daily cleanup cron.
- Vote foreign keys use `RESTRICT` so deleting a rated hackathon cannot silently
  invalidate the opponent's history.
- Run `pnpm audit:faceoff` for a read-only consistency check.
- Run `pnpm audit:faceoff -- --repair` only when the audit reports cached-state
  mismatches; it rebuilds played ratings and counters from the latest log.
