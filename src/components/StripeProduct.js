import React, { Component } from "react";
import { uniq, join, keys } from "lodash";
import axios from "axios";

const skuToLocalizedPrice = (sku, locale) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: sku.currency
  }).format(sku.price / 100);
};

const skuToDescription = (sku, labels, locale) => {
  const attributes = keys(sku.attributes).map(attributeKey => {
    const attributeValue = sku.attributes[attributeKey];
    const attributeLabels = labels[attributeKey] || {};
    return attributeLabels[attributeValue] || attributeValue;
  });

  const list = [...attributes, skuToLocalizedPrice(sku, locale)];

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

const callStripeLambdaEndpoint = (endpoint, args) => {
  console.log("callStripeLambdaEndpoint", args);
  return axios
    .post(`/.netlify/functions/${endpoint}`, args)
    .then(response => {
      console.log(`/.netlify/functions/${endpoint}`, response);
      return Promise.resolve(response);
    })
    .catch(error => {
      const errorLabel = `/.netlify/functions/${endpoint}`;
      if (error.response) {
        console.error(errorLabel, error.response.status, error.response.data);
      } else if (error.request) {
        console.error(errorLabel, error.request);
      } else {
        console.error(errorLabel, error.message);
      }

      return Promise.reject(error);
    });
};

const createAndPayStripeOrder = args => {
  return callStripeLambdaEndpoint("createAndPayStripeOrder", args);
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

  onBuy = () => {
    const { product = {}, labels = {}, locale } = this.props;
    const selectedSku = this.selectedSku();
    const description = skuToDescription(
      selectedSku,
      labels.attributes,
      locale
    );

    this.openStripeCheckout(
      {
        amount: selectedSku.price,
        description: description,
        currency: selectedSku.currency,
        billingAddress: !!product.shippable
      },
      token =>
        createAndPayStripeOrder({
          currency: selectedSku.currency,
          sku: {
            id: selectedSku.stripeId,
            description: description,
            amount: selectedSku.price,
            token
          }
        })
          .then(response => this.paymentSucess(response))
          .catch(error => this.paymentFail(error))
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
        buyButton: labels.buy,
        ...labels
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
