const express = require("express");
const cors = require("cors");
require('dotenv').config()

const stripeUtils = require("./utils/stripeUtils");
const encryptionService = require('./utils/encryptionUtils');
const wpService = require("./utils/wpUtils");
const service = require("./service");


const app = express();
const port = process.env.PORT || 6000;


app.use("/v1/webhook", express.raw({type: "application/json"}));
app.use(express.json());
app.use(cors());

process.on('uncaughtException', (err) => {
    console.error('🔥 Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Unhandled Rejection:', reason);
});


// Checks WP User activeness status and gives corresponding HTML. Used for collaborator QR code scanning.
app.get("/v1/members/check", async (req, res) => {
    const {email} = req.query;
    const html = await service.checkEmailAndGetHtmlResponse(email)
    res.status(200).send(html);
});

// Retrieves public data for the user by email or member id in a format: { result: "...", data: {...} }
app.get("/v1/members/query", async (req, res) => {
    const {email, memberId} = req.query;
    if (!email && !memberId) {
        return res.status(400).json({result: 'error', message: "Email or memberId is required"});
    }

    const dto = await service.tryQueryUserAndGetDto(email, memberId)
    res.status(200).send(dto);
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

    const dto = await service.tryLoginUserAndGetDto(email, password)
    res.json(dto);
});

app.post("/v1/webhook", express.raw({type: "application/json"}), async (req, res) => {
    res.status(200).json({success: true});

    await stripeUtils.processWebhook(req.body, req.headers["stripe-signature"])
})

app.get("/v1/payment/create", async (req, res) => {
    const {jwt} = req.query;
    const {email, createdAt} = encryptionService.extractData(jwt)
    const dto = await stripeUtils.getPaymentIntent(email)

    res.json(dto);
});

app.post("/v1/health", express.raw({type: "application/json"}), async (req, res) => {
    res.status(200).json({success: true});
})

app.listen(port, () => console.log(`Server running on port ${port}`));

app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    return res.status(500).json({result: 'error', message: 'Internal server error', details: err.message});
});
