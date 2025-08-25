Required GitHub repository secrets for workflows

- DATABASE_URL: Postgres connection string for Neon/Postgres used by Prisma and the scraper.
- NEXTAUTH_SECRET: Secret used by NextAuth for signing session tokens.

Add these under your repository Settings → Secrets → Actions.

Notes:
- The editor may warn that "Context access might be invalid" until these secrets exist in the repo settings. This is an informational lint warning only and does not break the workflow.
