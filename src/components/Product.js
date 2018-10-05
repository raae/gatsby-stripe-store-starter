import React from 'react'

const Product = () => (
  <article className="columns is-centered">
    <div className="column is-one-third">
      <figure className="image is-square">
        <img
          alt="product"
          src="https://bulma.io/images/placeholders/480x480.png"
        />
      </figure>
    </div>
    <div className="column">
      <h2 className="title">Product name from stripe</h2>
      <p className="subtitle id-5">$10</p>
      <div className="columns is-centered">
        <div className="column">
          <div class="field is-grouped">
            <p class="control">
              <button class="button is-small">S</button>
            </p>
            <p class="control">
              <button class="button is-small">M</button>
            </p>
            <p class="control">
              <button class="button is-small is-focused">L</button>
            </p>
          </div>
          <div class="field is-grouped">
            <p class="control">
              <button class="button is-small">Pink</button>
            </p>
            <p class="control">
              <button class="button is-small is-focused">Blue</button>
            </p>
            <p class="control">
              <button class="button is-small">Yellow</button>
            </p>
          </div>
        </div>
        <div className="column">
          <div className="field">
            <button class="button is-outlined is-active">Buy</button>
          </div>
        </div>
      </div>
      <div className="content">
        <p>Product description from stripe</p>
      </div>
    </div>
  </article>
)

export default Product
