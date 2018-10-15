# gatsby-stripe-store-starter

This starter creates a store with inventory from a Stripe account.

It uses the gatsby-source-stripe plugin to pull in the data.

TODO: Add checkout flow

## How to use

1. Clone repo
2. Move into the repo folder
3. Do `npm install``

### Development

- Run `STRIPE_SECRET_KEY=<stripe secret key> GATSBY_STRIPE_PUBLISHABLE_KEY=<stripe publishable key> gatsby develop`.
- There are also some optional build variables, look below.

### Deployment

- Create new netlify site
- Add build environment variables using the Netlify GUI
  - SITE_TITLE
  - SITE_DESCRIPTION
  - SITE_LANG ("no" for norwegian )
  - SITE_LOCALE ("no-bok" for norwegian currency )
  - STRIPE_SECRET_KEY (used to fetch products and skus)
  - GATSBY_STRIPE_PUBLISHABLE_KEY (used for checkout flow)
- Set up continuous deployment from this repo on Github.

It is possible to use production key for STRIPE_SECRET_KEY and test key for GATSBY_STRIPE_PUBLISHABLE_KEY, but payment will fail as the sku will not exist in test.
