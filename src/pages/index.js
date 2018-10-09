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
      const { locale } = data.site.siteMetadata;
      const productNodes = data.allStripeProduct.edges.map(edge => edge.node);
      const skuNodes = data.allStripeSku.edges.map(edge => edge.node);
      return (
        <Layout>
          {productNodes.map(node => (
            <StripeProduct
              key={node.id}
              locale={locale}
              product={node}
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
