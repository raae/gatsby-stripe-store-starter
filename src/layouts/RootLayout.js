import React from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { StaticQuery, graphql } from "gatsby";

import "../assets/index.scss";

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query RootLayoutMetaQuery {
        site {
          siteMetadata {
            title
            description
            keywords
          }
        }
      }
    `}
    render={data => (
      <>
        <Helmet
          title={data.site.siteMetadata.title}
          meta={[
            {
              name: "description",
              content: data.site.siteMetadata.description
            },
            { name: "keywords", content: data.site.siteMetadata.keywords }
          ]}
        >
          <html lang={data.site.siteMetadata.lang} />
        </Helmet>
        {children}
      </>
    )}
  />
);

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;
