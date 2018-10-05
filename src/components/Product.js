import React, { Component } from 'react'
import classNames from 'classnames'

const Option = ({ option, selectedKey, onChange }) => {
  const optionClasses = classNames('button', 'is-small', {
    'is-focused': option.key === selectedKey,
  })
  return (
    <p className="control">
      <button onClick={() => onChange(option.key)} className={optionClasses}>
        {option.label}
      </button>
    </p>
  )
}

const Selection = ({ options, ...props }) => (
  <div className="field is-grouped">
    {options.map(option => (
      <Option key={option.key} option={option} {...props} />
    ))}
  </div>
)

const Product = ({
  labels = {},
  images = [],
  options = {},
  selection = {},
  isSelectionValid,
  onSelectionChange,
  onBuy,
}) => {
  const buyButtonClasses = classNames('button', 'is-outlined', {
    'is-active': isSelectionValid,
  })
  const imageSrc =
    images[0] || 'https://bulma.io/images/placeholders/480x480.png'

  return (
    <article className="columns is-centered">
      <div className="column is-one-third">
        <figure className="image is-square">
          <img alt="product" src={imageSrc} />
        </figure>
      </div>
      <div className="column">
        <h2 className="title">{labels.title}</h2>
        <p className="subtitle id-5">{labels.price}</p>
        <div className="columns is-centered">
          <div className="column">
            {options.map(option => (
              <Selection
                key={option.key}
                selectedKey={selection[option.key]}
                options={option.values}
                onChange={selectedValueKey =>
                  onSelectionChange([option.key], selectedValueKey)
                }
              />
            ))}
          </div>
          <div className="column">
            <div className="field">
              <button
                onClick={() => onBuy()}
                disabled={!isSelectionValid}
                className={buyButtonClasses}
              >
                {labels.buyButton}
              </button>
            </div>
          </div>
        </div>
        <div className="content">{labels.description}</div>
      </div>
    </article>
  )
}

class ProductContainer extends Component {
  state = {}

  constructor(props) {
    super(props)

    const { product, skus = [] } = props

    const attributes = product.attributes || []

    const selection = attributes.reduce((acc, key) => {
      acc[key] = undefined
      return acc
    }, {})

    const skuAttributeValues = attributes.reduce((acc, key) => {
      const values = acc[key] || []

      for (const sku of skus) {
        if (!values.includes(sku.attributes[key])) {
          values.push(sku.attributes[key])
        }
      }

      acc[key] = values
      return acc
    }, {})

    const options = Object.keys(skuAttributeValues).map(key => ({
      key: key,
      values: skuAttributeValues[key].map(value => ({
        key: value,
        label: value,
      })),
    }))

    this.state = {
      selection,
      options,
    }
  }

  onSelectionChange = (type, selectedKey) => {
    this.setState({
      selection: {
        ...this.state.selection,
        [type]: selectedKey,
      },
    })
  }

  isSelectionValid = () => {
    return Object.keys(this.state.selection).reduce(
      (acc, key) => acc && !!this.state.selection[key],
      true
    )
  }

  onBuy = () => {
    const selectedSku = this.props.skus.find(sku => {
      return Object.keys(this.state.selection).reduce(
        (acc, key) => acc && sku.attributes[key] === this.state.selection[key],
        true
      )
    })
    console.log('Buy', this.state.selection, selectedSku)
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
      options: this.state.options,
      selection: this.state.selection,
      isSelectionValid: this.isSelectionValid(),
      onSelectionChange: this.onSelectionChange,
      onBuy: this.onBuy,
    }

    return <Product {...props} />
  }
}

export default ProductContainer
