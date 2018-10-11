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
  selectedAttributes: {},
  attributes: {}
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

  paymentSucess = () => {
    const { labels } = this.props;

    this.resetSelectedAttributes();
    this.setState({
      paymentMessage: labels.paymentMessage.success
    });
  };

  paymentFail = () => {
    const { labels } = this.props;

    this.setState({
      paymentMessage: labels.paymentMessage.fail
    });
  };

  onCheckout = () => {
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
      success => {
        success ? this.paymentSucess() : this.paymentFail();
      }
    );
  };

  render() {
    const { product, labels, ProductComponent } = this.props;
    const {
      selectedAttributes = {},
      attributes = [],
      paymentMessage
    } = this.state;

    const props = {
      labels: {
        title: product.name,
        price: this.priceLabel(),
        description: product.description,
        ceckout: labels.checkout,
        ...labels
      },
      paymentMessage: paymentMessage,
      images: product.images,
      attributes: attributes,
      selectedAttributes: selectedAttributes,
      isSelectedAttributesValid: this.isSelectedAttributesValid(),
      onSelectedAttributesChange: this.onSelectedAttributesChange,
      onCheckout: this.onCheckout,
      onClearPaymentMessage: () => {
        this.setState({
          paymentMessage: undefined
        });
      }
    };

    return <ProductComponent {...props} />;
  }
}

export default StripeProduct;
