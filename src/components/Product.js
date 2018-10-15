import React from "react";
import classNames from "classnames";

const AttributeOption = ({
  option,
  selectedOption,
  isCheckoutInProgess,
  onChange,
  labels = {}
}) => {
  const optionClasses = classNames("button", "is-small", {
    "is-focused": option === selectedOption
  });
  return (
    <p className="control">
      <button
        disabled={isCheckoutInProgess}
        onClick={() => onChange(option)}
        className={optionClasses}
      >
        {labels[option] || option}
      </button>
    </p>
  );
};

const AttributeSelection = ({ options, ...props }) => (
  <div className="field is-grouped">
    {options.map(option => (
      <AttributeOption key={option} option={option} {...props} />
    ))}
  </div>
);

const Attributes = ({
  attributes,
  labels,
  isCheckoutInProgess,
  selectedAttributes,
  onSelectedAttributesChange
}) =>
  Object.keys(attributes).map(attributeKey => (
    <AttributeSelection
      labels={labels[attributeKey]}
      key={attributeKey}
      isCheckoutInProgess={isCheckoutInProgess}
      selectedOption={selectedAttributes[attributeKey]}
      options={attributes[attributeKey]}
      onChange={option => onSelectedAttributesChange([attributeKey], option)}
    />
  ));

const Product = ({
  labels = {},
  checkoutMessage,
  images = [],
  attributes = [],
  selectedAttributes = {},
  isCheckoutInProgess,
  isCheckoutPossible,
  onSelectedAttributesChange,
  onCheckout,
  onClearPaymentMessage
}) => {
  const checkoutButtonClasses = classNames("button", "is-outlined", {
    "is-active": isCheckoutPossible,
    "is-loading": isCheckoutInProgess
  });
  const imageSrc = images[0];

  return (
    <article className="columns is-vertically-centered">
      <div className="column is-4">
        <figure className="image is-square">
          {imageSrc && <img alt="product" src={imageSrc} />}
        </figure>
      </div>
      <div className="column is-6">
        <h2 className="title">{labels.title}</h2>
        <p className="subtitle id-5">{labels.price}</p>
        <div
          style={{ position: "relative" }}
          className="columns is-vertically-centered"
        >
          <div className="column is-two-thirds">
            <Attributes
              labels={labels.attributes}
              isCheckoutInProgess={isCheckoutInProgess}
              attributes={attributes}
              selectedAttributes={selectedAttributes}
              onSelectedAttributesChange={onSelectedAttributesChange}
            />
          </div>
          <div className="column">
            <div className="field">
              <button
                onClick={() => onCheckout()}
                disabled={!isCheckoutPossible}
                className={checkoutButtonClasses}
              >
                {labels.checkout}
              </button>
            </div>
          </div>
          {checkoutMessage && (
            <div className="is-overlay has-background-white center-content">
              <div className="notification">
                <button
                  onClick={() => onClearPaymentMessage()}
                  className="delete is-small"
                />
                <p>{checkoutMessage}</p>
              </div>
            </div>
          )}
        </div>
        <div className="content">{labels.description}</div>
      </div>
    </article>
  );
};

export default Product;
