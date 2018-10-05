import React from 'react'
import { StaticQuery, graphql } from 'gatsby'

import Layout from '../layouts/DefaultLayout'
import Product from '../components/Product'

const IndexPage = () => (
  <StaticQuery
    query={graphql`
      query IndexProductSku {
        allStripeProduct {
          edges {
            node {
              id
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
              id
              attributes {
                size
                color
                gender
              }
              price
              product {
                id
              }
            }
          }
        }
      }
    `}
    render={data => {
      const productNodes = data.allStripeProduct.edges.map(edge => edge.node)
      const skuNodes = data.allStripeSku.edges.map(edge => edge.node)
      return (
        <Layout>
          {productNodes.map(node => (
            <Product
              key={node.id}
              product={node}
              skus={skuNodes.filter(sku => sku.product.id === node.id)}
            />
          ))}
        </Layout>
      )
    }}
  />
)

export default IndexPage
