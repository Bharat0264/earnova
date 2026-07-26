# Earnova Deployment

## Production surfaces

- Frontend: Vite static build, currently configured for Vercel.
- API: Node/Express, currently referenced through a Render URL in `client/vercel.json`.
- Database: MongoDB.
- Optional container deployment: `docker-compose.yml` provides MongoDB, API, and Nginx frontend services.

## Required environment

Use `.env.example` as the key list. Store real values only in the deployment provider's secret manager. Never commit `.env`, `server/.env`, payment secrets, database credentials, email passwords, or Cloudinary credentials.

Production must provide a strong `JWT_SECRET`, exact `CLIENT_URL` allow-list entries, MongoDB connection, and matching Razorpay keys/webhook secret. Optional services should fail clearly when their configuration is absent.

## Release checklist

1. Run frontend lint, test, type/check, and production build.
2. Run backend lint, test, and syntax/type check.
3. Apply reviewed additive database migrations/backfills.
4. Deploy the API and confirm `/api/health` returns `200`.
5. Confirm `/api/ready` returns `200` with the database connected.
6. Deploy the exact tested frontend commit.
7. Verify login, onboarding, protected routes, public marketplace routes, checkout test mode, and admin authorization.
8. Verify Razorpay webhook signing against the deployed raw-body endpoint.
9. Confirm frontend and API logs contain request IDs and no secrets.

## Rollback

Keep the prior frontend artifact and API image/release available. Phase 1 database changes are additive, so rolling application code back does not require destructive schema rollback. Do not delete new user onboarding fields during rollback.

## Backups

Enable managed MongoDB backups with retention appropriate to the launch stage. Test restoring into a non-production environment. Document the owner, schedule, encryption, retention, and most recent restore test outside this repository.
