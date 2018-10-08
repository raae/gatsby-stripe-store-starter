import React, { Component } from 'react'
import { uniq, keys, zipObject } from 'lodash'

import Product from './Product'

class StripeProduct extends Component {
  state = {
    attributeKeys: [],
    selectedAttributes: {},
    attributes: {},
  }

  constructor(props) {
    super(props)

    const { product, skus = [] } = props

    const attributeKeys = product.attributes || []

    const attributes = zipObject(
      attributeKeys,
      attributeKeys.map(key => {
        return uniq(
          skus.map(sku => {
            return sku.attributes[key]
          })
        ).map(value => ({
          key: value,
          label: value,
        }))
      })
    )

    this.state = {
      attributeKeys,
      attributes,
    }
  }

  onSelectedAttributesChange = (type, selectedKey) => {
    this.setState({
      selectedAttributes: {
        ...this.state.selectedAttributes,
        [type]: selectedKey,
      },
    })
  }

  isSelectedAttributesValid = () => {
    return keys(this.state.selectedAttributes).reduce(
      (acc, key) => acc && !!this.state.selectedAttributes[key],
      true
    )
  }

  onBuy = () => {
    const selectedSku = this.props.skus.find(sku => {
      return keys(this.state.selectedAttributes).reduce(
        (acc, key) =>
          acc && sku.attributes[key] === this.state.selectedAttributes[key],
        true
      )
    })

    this.setState({ selectedAttributes: {} })

    console.log('Buy', selectedSku)
  }

  render() {
    const { name, images, description } = this.props.product

    const props = {
      labels: {
        title: name,
        price: '$10',
        description: description,
        buyButton: 'Buy',
      },
      images: images,
      attributeKeys: this.state.attributeKeys,
      attributes: this.state.attributes,
      selectedAttributes: this.state.selectedAttributes,
      isSelectedAttributesValid: this.isSelectedAttributesValid(),
      onSelectedAttributesChange: this.onSelectedAttributesChange,
      onBuy: this.onBuy,
    }

    return <Product {...props} />
  }
}

export default StripeProduct
