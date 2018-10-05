import React from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'

import RootLayout from './RootLayout'
import Header from '../components/Header'
import Main from '../components/Main'
import Footer from '../components/Footer'

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query DefaultLayoutTitleQuery {
        site {
          siteMetadata {
            title
            description
          }
        }
      }
    `}
    render={data => (
      <RootLayout>
        <Header siteTitle={data.site.siteMetadata.title} />
        <Main>{children}</Main>
        <Footer content={data.site.siteMetadata.description} />
      </RootLayout>
    )}
  />
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
