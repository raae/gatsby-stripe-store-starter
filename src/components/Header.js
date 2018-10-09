import React from "react";
import { Link } from "gatsby";

const Header = ({ siteTitle }) => (
  <header className="hero is-light">
    <div className="hero-body">
      <div className="container has-text-centered">
        <h1 className="title is-2">
          <Link style={{ color: "currentColor" }} to="/">
            {siteTitle}
          </Link>
        </h1>
      </div>
    </div>
  </header>
);

export default Header;
