import { Component } from "react";
import axios from "axios";

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

class StripeCheckout extends Component {
  componentDidMount() {
    const { siteTitle, lang, stripeKey } = this.props;

    this.configureStripeCheckout({
      name: siteTitle,
      key: stripeKey,
      locale: lang
    });
  }

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

  openStripeCheckout = (checkoutArgs, orderArgs, callback) => {
    if (!this.stripeHandler) {
      console.error("Stripe Checkout is not available on window");
      return;
    }

    this.stripeHandler.open({
      ...checkoutArgs,
      token: token => {
        return createAndPayStripeOrder({
          ...orderArgs,
          token: token
        })
          .then(response => callback(true))
          .catch(error => callback(false));
      }
    });
  };

  render() {
    const { children } = this.props;

    return children(this.openStripeCheckout);
  }
}

export default StripeCheckout;
