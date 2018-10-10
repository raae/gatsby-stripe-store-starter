import React, { Component } from "react";
import { uniq, zipObject, join, values } from "lodash";

const skuToLocalizedPrice = (sku, locale) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: sku.currency
  }).format(sku.price / 100);
};

const createStripeOrder = (token, skuId) => {
  console.log("Create order", token, skuId);
  return Promise.resolve();
};

const defaultState = {
  selectedAttributes: {},
  attributes: []
};

class StripeProduct extends Component {
  constructor(props) {
    super(props);

    const { product = {}, skus = [], labels = {} } = props;
    const attributeKeys = product.attributes || [];

    const attributeLabels = {
      ...zipObject(attributeKeys, attributeKeys.map(() => ({}))),
      ...labels.attributes
    };

    const attributes = attributeKeys.map(key => {
      const options = uniq(
        skus.map(sku => {
          return sku.attributes[key];
        })
      ).map(value => ({
        key: value,
        label: attributeLabels[key][value] || value
      }));

      return {
        key,
        options
      };
    });

    this.state = {
      ...defaultState,
      attributes
    };
  }

  componentDidMount() {
    const { product = {}, lang, stripeKey } = this.props;

    this.configureStripeCheckout({
      key: stripeKey,
      name: product.name,
      locale: lang
    });
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
    const { selectedAttributes = {}, attributes = [] } = this.state;

    return attributes.reduce(
      (acc, attribute) => acc && !!selectedAttributes[attribute.key],
      true
    );
  };

  selectedSku = () => {
    const { skus = [] } = this.props;
    const { selectedAttributes = {}, attributes = {} } = this.state;

    return skus.find(sku => {
      return attributes.reduce(
        (acc, attribute) =>
          acc &&
          sku.attributes[attribute.key] === selectedAttributes[attribute.key],
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

  configureStripeCheckout = (args, closeFunc) => {
    if (!window.StripeCheckout) {
      console.error("Stripe Checkout is not available on window");
      return;
    }

    this.stripeHandler = window.StripeCheckout.configure({
      ...args,
      closed: closeFunc
    });
  };

  openStripeCheckout = (args, tokenFunc) => {
    if (!this.stripeHandler) {
      console.error("Stripe Checkout is not available on window");
      return;
    }

    this.stripeHandler.open({
      ...args,
      token: tokenFunc
    });
  };

  onBuy = () => {
    const { labels, shippable } = this.props;
    const selectedSku = this.selectedSku();

    this.openStripeCheckout(
      {
        amount: selectedSku.price,
        currency: selectedSku.currency,
        description: join(
          [...values(selectedSku.attributes), skuToLocalizedPrice(selectedSku)],
          " / "
        ),
        billingAddress: shippable
      },
      token =>
        createStripeOrder(token, selectedSku.stripeId)
          .then(() => {
            this.resetSelectedAttributes();
            this.setState({
              paymentMessage: labels.paymentMessage.success
            });
          })
          .catch(() => {
            this.setState({
              paymentMessage: labels.paymentMessage.fail
            });
          })
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
        buyButton: labels.buy
      },
      paymentMessage: paymentMessage,
      images: product.images,
      attributes: attributes,
      selectedAttributes: selectedAttributes,
      isSelectedAttributesValid: this.isSelectedAttributesValid(),
      onSelectedAttributesChange: this.onSelectedAttributesChange,
      onBuy: this.onBuy,
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
