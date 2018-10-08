import React, { Component } from 'react'
import { uniq, keys, zipObject } from 'lodash'

class StripeProduct extends Component {
  state = {
    attributeKeys: [],
    selectedAttributes: {},
    attributes: {},
  }

  constructor(props) {
    super(props)

    const { product = {}, skus = [], labels = {} } = props
    const attributeKeys = product.attributes || []
    const attributeLabels = {
      ...zipObject(attributeKeys, attributeKeys.map(() => ({}))),
      ...labels.attributes,
    }

    const attributes = zipObject(
      attributeKeys,
      attributeKeys.map(key => {
        return uniq(
          skus.map(sku => {
            return sku.attributes[key]
          })
        ).map(value => ({
          key: value,
          label: attributeLabels[key][value] || value,
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
    const { product, labels, Product } = this.props

    const props = {
      labels: {
        title: product.name,
        price: '$10',
        description: product.description,
        buyButton: labels.buy,
      },
      images: product.images,
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
