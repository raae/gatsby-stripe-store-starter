import React from "react";
import { StaticQuery, graphql } from "gatsby";

import Layout from "../layouts/DefaultLayout";
import StripeProduct from "../components/StripeProduct";
import Product from "../components/Product";

const IndexPage = () => (
  <StaticQuery
    query={graphql`
      query IndexProductSku {
        site {
          siteMetadata {
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
      const { locale, lang } = data.site.siteMetadata;
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
          {productNodes.map(node => (
            <StripeProduct
              key={node.stripeId}
              stripeKey={stripePublishableKey}
              locale={locale}
              lang={lang}
              product={node}
              shippable={false}
              skus={skuNodes.filter(sku => sku.product === node.stripeId)}
              labels={{
                buy: "Kjøp",
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
          ))}
        </Layout>
      );
    }}
  />
);

export default IndexPage;
