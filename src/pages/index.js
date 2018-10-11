import React from "react";
import { StaticQuery, graphql } from "gatsby";

import Layout from "../layouts/DefaultLayout";
import StripeProduct from "../components/StripeProduct";
import StripeCheckout from "../components/StripeCheckout";
import Product from "../components/Product";

const IndexPage = () => (
  <StaticQuery
    query={graphql`
      query IndexProductSku {
        site {
          siteMetadata {
            title
            locale
            lang
          }
        }
        allStripeProduct {
          edges {
            node {
              stripeId
              name
              attributes
              images
              description
              shippable
            }
          }
        }
        allStripeSku {
          edges {
            node {
              stripeId
              attributes {
                size
                color
                gender
              }
              price
              currency
              product
            }
          }
        }
      }
    `}
    render={data => {
      const { title, locale, lang } = data.site.siteMetadata;

      const productNodes = data.allStripeProduct.edges.map(edge => edge.node);
      const skuNodes = data.allStripeSku.edges.map(edge => edge.node);
      const stripePublishableKey = process.env.GATSBY_STRIPE_PUBLISHABLE_KEY;

      if (!stripePublishableKey) {
        console.warn(
          "Please provide GATSBY_STRIPE_PUBLISHABLE_KEY as an env variable"
        );
      }

      return (
        <Layout>
          <StripeCheckout
            siteTitle={title}
            stripeKey={stripePublishableKey}
            lang={lang}
          >
            {openStripeCheckout =>
              productNodes.map(node => (
                <StripeProduct
                  key={node.stripeId}
                  locale={locale}
                  product={node}
                  shippable={false}
                  skus={skuNodes.filter(sku => sku.product === node.stripeId)}
                  onCheckout={openStripeCheckout}
                  labels={{
                    checkout: "Kjøp",
                    attributes: {
                      gender: {
                        Male: "Mann",
                        Female: "Dame"
                      },
                      color: {
                        White: "Hvit",
                        Black: "Svart"
                      }
                    },
                    paymentMessage: {
                      success:
                        "Takk for handelen, t-skjorte på vei til deg innen få dager.",
                      fail: "Noe gikk galt, prøv igen eller ta kontakt. "
                    }
                  }}
                  ProductComponent={Product}
                />
              ))
            }
          </StripeCheckout>
        </Layout>
      );
    }}
  />
);

export default IndexPage;
