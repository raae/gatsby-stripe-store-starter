const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export function handler(event, context, callback) {
  const { sku = {}, currency, token } = JSON.parse(event.body);

  Promise.resolve()
    .then(() => {
      return stripe.orders.create({
        email: token.email,
        currency: currency,
        items: [
          {
            type: "sku",
            parent: sku.id,
            quantity: 1
          }
        ],
        shipping: {
          address: {
            city: token.card.address_city,
            country: token.card.address_country,
            line1: token.card.address_line1,
            line2: token.card.address_line2,
            postal_code: token.card.address_zip,
            state: token.card.address_state
          },
          name: token.card.name
        }
      });
    })
    .then(order => {
      console.log("order created", order.id);
      return stripe.orders.pay(order.id, {
        source: token.id
      });
    })
    .then(payment => {
      console.log("payment created", payment.id);
      return stripe.charges.update(payment.charge, {
        receipt_email: token.email,
        description: sku.description
      });
    })
    .then(charge => {
      console.log("charge updated", charge.id);
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(charge)
      });
    })
    .catch(error => {
      console.log("Error", error.message);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify(error)
      });
    });
}
