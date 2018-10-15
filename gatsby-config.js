const proxy = require("http-proxy-middleware");

module.exports = {
  siteMetadata: {
    title: process.env.SITE_TITLE || "Stripe Store",
    description:
      process.env.SITE_DESCRIPTION || "A store with products from Stripe",
    lang: process.env.SITE_LANG || "en",
    locale: process.env.SITE_LOCALE || "en"
  },
  developMiddleware: app => {
    app.use(
      "/.netlify/functions/",
      proxy({
        target: "http://localhost:9000",
        pathRewrite: {
          "/.netlify/functions/": ""
        }
      })
    );
  },
  plugins: [
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-sass",
    "gatsby-plugin-stripe-checkout",
    {
      resolve: "gatsby-source-stripe",
      options: {
        objects: ["products", "skus"],
        secretKey: process.env.STRIPE_SECRET_KEY
      }
    },
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "Stripe Store",
        short_name: "stripestore",
        start_url: "/",
        background_color: "#663399",
        theme_color: "#663399",
        display: "minimal-ui",
        icon: "src/assets/icon.png" // This path is relative to the root of the site.
      }
    }
  ]
};
