import React, { Component } from 'react'
import { uniq, zipObject, join } from 'lodash'

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
    const { selectedAttributes = {} } = this.state

    this.setState({
      selectedAttributes: {
        ...selectedAttributes,
        [type]: selectedKey,
      },
    })
  }

  isSelectedAttributesValid = () => {
    const { selectedAttributes = {}, attributes = [] } = this.state

    return attributes.reduce(
      (acc, attribute) => acc && !!selectedAttributes[attribute.key],
      true
    )
  }

  selectedSku = () => {
    const { skus = [] } = this.props
    const { selectedAttributes = {}, attributes = [] } = this.state

    return skus.find(sku => {
      return attributes.reduce(
        (acc, attribute) =>
          acc &&
          sku.attributes[attribute.key] === selectedAttributes[attribute.key],
        true
      )
    })
  }

  priceLabel = () => {
    const skuToLocalizedPrice = (sku, locale) => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: sku.currency,
      }).format(sku.price / 100)
    }

    let { skus = [], locale } = this.props

    skus = this.selectedSku() ? [this.selectedSku()] : skus
    const prices = uniq(skus.map(sku => skuToLocalizedPrice(sku, locale)))

    return join(prices, ' / ')
  }

  onBuy = () => {
    const { selectedAttributes = {} } = this.state

    console.log('Buy', selectedAttributes, this.selectedSku())
    this.setState({ selectedAttributes: {} })
  }

  render() {
    const { product, labels, ProductComponent } = this.props
    const { selectedAttributes = {}, attributes = [] } = this.state

    const props = {
      labels: {
        title: product.name,
        price: this.priceLabel(),
        description: product.description,
        buyButton: labels.buy,
      },
      images: product.images,
      attributes: attributes,
      selectedAttributes: selectedAttributes,
      isSelectedAttributesValid: this.isSelectedAttributesValid(),
      onSelectedAttributesChange: this.onSelectedAttributesChange,
      onBuy: this.onBuy,
    }

    return <ProductComponent {...props} />
  }
}

export default StripeProduct
