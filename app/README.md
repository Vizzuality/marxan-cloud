This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Env variables

`NEXT_PUBLIC_URL`: Canonical url of the app. Will be used for meta tags and social media shares. Not needed in Vercel deploys

`NEXT_PUBLIC_API_URL`: url of the API. Depending on the environment we will use different urls. For now, https://marxan49.westeurope.cloudapp.azure.com is the one we use as PROD in frontend

`NEXTAUTH_URL`: Needed by next-auth library for handling auth requests and callbacks. Set the environment variable to the canonical URL of your site. Not needed in Vercel deploys. https://next-auth.js.org/configuration/options#nextauth_url

`NEXT_PUBLIC_MAPBOX_API_TOKEN`: Mapbox token. It MUST be TNC mapbox token


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/import?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
