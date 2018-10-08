import React, { Component } from 'react'
import { uniq, zipObject } from 'lodash'

const defaultState = {
  attributeKeys: [],
  selectedAttributes: {},
  attributes: {},
}

class StripeProduct extends Component {
  constructor(props) {
    super(props)

    const { product = {}, skus = [], labels = {} } = props
    const attributeKeys = product.attributes || []
    const attributeLabels = {
      ...zipObject(attributeKeys, attributeKeys.map(() => ({}))),
      ...labels.attributes,
    }

    const attributes = attributeKeys.map(key => {
      const options = uniq(
        skus.map(sku => {
          return sku.attributes[key]
        })
      ).map(value => ({
        key: value,
        label: attributeLabels[key][value] || value,
      }))

      return {
        key,
        options,
      }
    })

    this.state = {
      ...defaultState,
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
    return this.state.attributes.reduce(
      (acc, attribute) => acc && !!this.state.selectedAttributes[attribute.key],
      true
    )
  }

  onBuy = () => {
    const selectedSku = this.props.skus.find(sku => {
      return this.state.attributes.reduce(
        (acc, attribute) =>
          acc &&
          sku.attributes[attribute.key] ===
            this.state.selectedAttributes[attribute.key],
        true
      )
    })

    console.log('Buy', this.state.selectedAttributes, selectedSku)
    this.setState({ selectedAttributes: {} })
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
