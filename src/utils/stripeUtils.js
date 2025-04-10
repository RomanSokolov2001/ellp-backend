const wpService = require("./wpUtils");

class StripeUtils {
    async getPaymentIntent(email) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: 1,
                currency: 'eur',
                metadata: {email},
                payment_method_types: [
                    'card',
                ]
            });

            return {clientSecret: paymentIntent.client_secret};
        } catch (error) {
            console.error("API Error:", error.message);
            return {error: error.message};
        }
    }

    async processWebhook(body, sig) {
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;

        try {
            event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
        } catch (err) {
            console.error("Webhook Error:", err.message);
        }

        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object;
            const email = paymentIntent.metadata.email;
            await wpService.activateUserByEmail(email)
        }
    }
}

module.exports = new StripeUtils();
