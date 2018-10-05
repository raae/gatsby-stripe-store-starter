module.exports = {
  siteMetadata: {
    title: 'Stripe Store',
    description: 'A store with products from Stripe',
    keywords: '',
    lang: 'no',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-sass',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'Stripe Store',
        short_name: 'stripestore',
        start_url: '/',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: 'src/assets/icon.png', // This path is relative to the root of the site.
      },
    },
  ],
}
