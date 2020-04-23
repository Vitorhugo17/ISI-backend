module.exports = {
    // Default country for the checkout form.
    country: 'PT',

    // Store currency.
    currency: 'eur',

    // Supported payment methods for the store.
    // Some payment methods support only a subset of currencies.
    // Make sure to check the docs: https://stripe.com/docs/sources
    paymentMethods: [
        'card', 
        'multibanco'
    ],

    // Configuration for Stripe.
    // API Keys: https://dashboard.stripe.com/account/apikeys
    // Webhooks: https://dashboard.stripe.com/account/webhooks
    // Storing these keys and secrets as environment variables is a good practice.
    // You can fill them in your own `.env` file.
    stripe: {
        // The two-letter country code of your Stripe account (required for Payment Request).
        country: process.env.STRIPE_ACCOUNT_COUNTRY || 'PT',
        // Use your test keys for development and live keys for real charges in production.
        // For non-card payments like iDEAL, live keys will redirect to real banking sites.
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        secretKey: process.env.STRIPE_SECRET_KEY,
        // Setting the webhook secret is good practice in order to verify signatures.
        // After creating a webhook, click to reveal details and find your signing secret.
        webhookSecret: "whsec_BIQmTq8lZoutrPVnCt4w0gjTGfNV5zA5"
    }
}