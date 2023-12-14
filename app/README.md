This is a [Next.js](https://nextjs.org/) project bootstrapped with
[`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Env variables

- `NEXT_PUBLIC_URL`: Canonical url of the app. Will be used for meta tags and
  social media shares. Not needed in Vercel deploys.

- `NEXT_PUBLIC_API_URL`: URL of the API. Depending on the environment we will
  use different urls. For now, https://marxan49.westeurope.cloudapp.azure.com is
  the one we use as PROD in frontend.

- [`NEXTAUTH_URL`](https://next-auth.js.org/configuration/options#nextauth_url): Needed by the next-auth library for [handling auth requests
  and callbacks](https://next-auth.js.org/configuration/options#nextauth_url).
  Set the environment variable to the canonical URL of your site.
  
- [`NEXTAUTH_SECRET`](https://next-auth.js.org/configuration/options#secret): Used to encrypt the NextAuth.js JWT. This variable is **mandatory**.

- `NEXT_PUBLIC_MAPBOX_API_TOKEN`: Mapbox token. It MUST be TNC mapbox token.

- `NEXT_PUBLIC_FEATURE_FLAGS` (comma-separated list of feature flag strings,
  optional, default is an empty list): list features here in order to _enable_
  them in the frontend app; features available behind feature flags are:
  - `strat`: make _stratification_ functionality available for conservation
    features in the frontend app

- `NEXT_PUBLIC_CONTACT_EMAIL`: Email address to be used for general contact inquiries.

- `ENABLE_MAINTENANCE_MODE`: If set to "true", maintenance mode is enabled on the frontend application, displaying an
informative message and blocking access to all site pages.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
result.

You can start editing the page by modifying `pages/index.js`. The page
auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub
repository](https://github.com/vercel/next.js/) - your feedback and
contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel
Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment
documentation](https://nextjs.org/docs/deployment#managed-nextjs-with-vercel)
for more details.
