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
  labels,
  options,
  selection,
  isSelectionValid,
  onSelectionChange,
  onBuy,
}) => {
  const buyButtonClasses = classNames('button', 'is-outlined', {
    'is-active': isSelectionValid,
  })
  console.log('Valid', isSelectionValid)
  return (
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
  state = {
    selection: {
      color: undefined,
      size: undefined,
    },
  }
  sizeOptions = [
    { key: 'small', label: 'S' },
    { key: 'medium', label: 'M' },
    { key: 'large', label: 'L' },
  ]
  colorOptions = [
    { key: 'pink', label: 'Pink' },
    { key: 'yellow', label: 'Yellow' },
    { key: 'blue', label: 'Blue' },
  ]

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
    console.log('Buy', this.state.selection)
  }

  render() {
    const props = {
      labels: {
        title: 'Product title',
        price: '$10',
        description: <p>description</p>,
        buyButton: 'Buy',
      },
      options: [
        {
          key: 'size',
          values: this.sizeOptions,
        },
        {
          key: 'color',
          values: this.colorOptions,
        },
      ],
      selection: this.state.selection,
      isSelectionValid: this.isSelectionValid(),
      onSelectionChange: this.onSelectionChange,
      onBuy: this.onBuy,
    }

    return <Product {...props} />
  }
}

export default ProductContainer
