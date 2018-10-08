import React from 'react'
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

const AttributeSelection = ({ options, ...props }) => (
  <div className="field is-grouped">
    {options.map(option => (
      <Option key={option.key} option={option} {...props} />
    ))}
  </div>
)

const Product = ({
  labels = {},
  images = [],
  attributes = [],
  selectedAttributes = {},
  isSelectedAttributesValid,
  onSelectedAttributesChange,
  onBuy,
}) => {
  const buyButtonClasses = classNames('button', 'is-outlined', {
    'is-active': isSelectedAttributesValid,
  })
  const imageSrc = images[0]

  return (
    <article className="columns is-centered">
      <div className="column is-one-third">
        <figure className="image is-square">
          {imageSrc && <img alt="product" src={imageSrc} />}
        </figure>
      </div>
      <div className="column">
        <h2 className="title">{labels.title}</h2>
        <p className="subtitle id-5">{labels.price}</p>
        <div className="columns is-centered">
          <div className="column">
            {attributes.map(attribute => (
              <AttributeSelection
                key={attribute.key}
                selectedKey={selectedAttributes[attribute.key]}
                options={attribute.options}
                onChange={selectedOption =>
                  onSelectedAttributesChange([attribute.key], selectedOption)
                }
              />
            ))}
          </div>
          <div className="column">
            <div className="field">
              <button
                onClick={() => onBuy()}
                disabled={!isSelectedAttributesValid}
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

export default Product
