import React, { Component } from "react";
import { uniq, join, keys } from "lodash";

const skuToLocalizedPrice = (sku, locale) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: sku.currency
  }).format(sku.price / 100);
};

const productAndSkuToOrderItemDescription = (product, sku, labels, locale) => {
  const attributes = keys(sku.attributes).map(attributeKey => {
    const attributeValue = sku.attributes[attributeKey];
    const attributeLabels = labels[attributeKey] || {};
    return attributeLabels[attributeValue] || attributeValue;
  });

  const list = [product.name, ...attributes, skuToLocalizedPrice(sku, locale)];

  return join(list, " / ");
};

const skusToPossibleAttributes = (skus, attributeKeys) => {
  return attributeKeys.reduce((acc, key) => {
    const options = uniq(
      skus.map(sku => {
        return sku.attributes[key];
      })
    );

    acc[key] = options;

    return acc;
  }, {});
};

const defaultState = {
  isCheckoutInProgess: false,
  selectedAttributes: {},
  attributes: {},
  checkoutMessage: undefined
};

class StripeProduct extends Component {
  constructor(props) {
    super(props);

    const { product = {}, skus = [] } = props;
    const attributeKeys = product.attributes || [];

    this.state = {
      ...defaultState,
      attributes: skusToPossibleAttributes(skus, attributeKeys)
    };
  }

  onSelectedAttributesChange = (type, selectedKey) => {
    const { selectedAttributes = {} } = this.state;

    this.setState({
      selectedAttributes: {
        ...selectedAttributes,
        [type]: selectedKey
      }
    });
  };

  resetSelectedAttributes = () => {
    this.setState({ selectedAttributes: {} });
  };

  isSelectedAttributesValid = () => {
    const { selectedAttributes = {}, attributes = {} } = this.state;

    return keys(attributes).reduce(
      (acc, attributeKey) => acc && !!selectedAttributes[attributeKey],
      true
    );
  };

  selectedSku = () => {
    const { skus = [] } = this.props;
    const { selectedAttributes = {}, attributes = {} } = this.state;

    return skus.find(sku => {
      return keys(attributes).reduce(
        (acc, attributeKey) =>
          acc &&
          sku.attributes[attributeKey] === selectedAttributes[attributeKey],
        true
      );
    });
  };

  priceLabel = () => {
    let { skus = [], locale } = this.props;

    skus = this.selectedSku() ? [this.selectedSku()] : skus;
    const prices = uniq(skus.map(sku => skuToLocalizedPrice(sku, locale)));

    return join(prices, " / ");
  };

  onCheckout = () => {
    this.setState({ isCheckoutInProgess: true });

    const { product = {}, labels = {}, onCheckout, locale } = this.props;
    const selectedSku = this.selectedSku();
    const description = productAndSkuToOrderItemDescription(
      product,
      selectedSku,
      labels.attributes,
      locale
    );

    onCheckout(
      {
        amount: selectedSku.price,
        description: description,
        currency: selectedSku.currency,
        billingAddress: !!product.shippable
      },
      {
        currency: selectedSku.currency,
        description: description,
        item: {
          type: "sku",
          parent: selectedSku.stripeId,
          quantity: 1
        }
      },
      status => {
        let message = labels.paymentMessage.fail;

        if (status.code === "success") {
          message = labels.paymentMessage.success;
        } else if (status.code === "out_of_inventory") {
          message = labels.paymentMessage.outOfInventory;
        } else if (status.code === "closed") {
          message = undefined;
        }

        this.setState({
          checkoutMessage: message,
          isCheckoutInProgess: false
        });
      }
    );
  };

  render() {
    const { product, labels, ProductComponent } = this.props;
    const {
      isCheckoutInProgess = false,
      selectedAttributes = {},
      attributes = [],
      checkoutMessage
    } = this.state;

    const props = {
      labels: {
        title: product.name,
        price: this.priceLabel(),
        description: product.description,
        ceckout: labels.checkout,
        ...labels
      },
      checkoutMessage: checkoutMessage,
      images: product.images,
      attributes: attributes,
      selectedAttributes: selectedAttributes,
      isCheckoutPossible:
        this.isSelectedAttributesValid() && !isCheckoutInProgess,
      isCheckoutInProgess: isCheckoutInProgess,
      onSelectedAttributesChange: this.onSelectedAttributesChange,
      onCheckout: this.onCheckout,
      onClearPaymentMessage: () => {
        this.setState({
          selectedAttributes: defaultState.selectedAttributes,
          checkoutMessage: undefined
        });
      }
    };

    return <ProductComponent {...props} />;
  }
}

export default StripeProduct;
