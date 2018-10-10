import React, { Component } from "react";
import { uniq, zipObject, join, values } from "lodash";
import axios from "axios";

const skuToLocalizedPrice = (sku, locale) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: sku.currency
  }).format(sku.price / 100);
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
    const { product = {} } = this.props;
    const selectedSku = this.selectedSku();
    const skuDescription = join(
      [...values(selectedSku.attributes), skuToLocalizedPrice(selectedSku)],
      " / "
    );

    this.openStripeCheckout(
      {
        amount: selectedSku.price,
        currency: selectedSku.currency,
        billingAddress: !!product.shippable
      },
      token =>
        createAndPayStripeOrder({
          currency: selectedSku.currency,
          sku: {
            id: selectedSku.stripeId,
            description: skuDescription
          },
          amount: selectedSku.price,
          token
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
