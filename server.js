const express = require("express");
const {Stripe} = require("stripe");
const cors = require("cors");

const encryptionService = require('./utils/encryptionService');
const utilityFunctions = require("./utils/utilityFunctions");
const wpService = require("./wpService");

require("dotenv").config();
const stripe = new Stripe(process.env.STRIPE_SECRET);
const app = express();
const port = process.env.PORT || 5000;


app.use(express.json());
app.use(cors());

process.on('uncaughtException', (err) => {
    console.error('🔥 Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Unhandled Rejection:', reason);
});


app.get("/v1/members/query", async (req, res) => {
    const {email, memberId} = req.query;
    if (!email && !memberId) {
        return res.status(400).json({result: 'error', message: "Email or memberId is required"});
    }

    try {
        const responseData = await wpService.queryByEmailOrId(email, memberId);

        if (responseData.result === "failure") {
            return res.status(400).json({result: 'error', message: responseData.message});
        }

        const data = utilityFunctions.createUserdataDtoFromUserdata(responseData);

        res.json({result: 'success', data});

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({result: 'error', message: "API request failed", details: error.message});
    }
});

app.post("/v1/members/signup", async (req, res) => {
    const {email, password, username, firstName, lastName} = req.body;
    if (!email || !password || !firstName || !lastName || !username) {
        return res.status(400).json({
            result: "error",
            message: "Email, username, password, first and last names required"
        });
    }
    const result = await wpService.signup(email, username, password, firstName, lastName)
    res.json(result);
});

app.post("/v1/members/login", async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({result: 'error', message: "Email and password required"});
    }
    let responseData
    try {
        responseData = await wpService.loginInByEmail(email, password);
    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({result: 'error', message: "API request failed", details: error.message});
    }

    const isLoginSuccessful = utilityFunctions.checkIfLoginSuccessful(responseData)
    const isActivationRequired = utilityFunctions.checkIfActivationRequired(responseData)

    if (!isLoginSuccessful && !isActivationRequired) {
        return res.json({
            'result': 'error',
            message: responseData.message ? utilityFunctions.extractErrorMessage(responseData.message) : 'Unexpected error.'
        });
    }

    try {
        responseData = await wpService.queryByEmailOrId(email);
    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({result: 'error', message: "API request failed", details: error.message});
    }

    const token = encryptionService.createToken(responseData.member_data.email);
    const dto = utilityFunctions.createUserdataDtoFromUserdata(responseData, token);
    res.json(dto);
});

app.post("/v1/webhook", express.raw({type: "application/json"}), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error("Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const email = paymentIntent.metadata.email;
        await wpService.queryByEmailOrId(email)
        // TODO: add success handler and response to client
        res.status(200).json({success: true});
    } else {
        res.status(400).send("Unhandled event type");
    }
});

app.get("/v1/payment/create", async (req, res) => {
    const {jwt} = req.query;
    const {email, createdAt} = encryptionService.extractData(jwt)

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 1,
            currency: 'eur',
            metadata: {email},
        });

        res.json({clientSecret: paymentIntent.client_secret});
    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({error: error.message});
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));

app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    return res.status(500).json({result: 'error', message: 'Internal server error', details: err.message});
});



