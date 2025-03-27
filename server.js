const express = require("express");
const axios = require("axios");
const cors = require("cors");
const encryptionService = require('./utils/encryptionService');
const utilityFunctions = require("./utils/utilityFunctions");
const res = require("express/lib/response");
const {Stripe} = require("stripe");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

const stripe = new Stripe("your_secret_key");

app.use(express.json());
app.use(cors());

const WORDPRESS_URL = "https://erasmuslifelaspalmas.com"
const API_KEY = process.env.API_KEY;
const PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE;
const MERCHANT_ID = process.env.STRIPE_MERCHANT_ID;

const sendGetRequest = async (params) => {
    try {
        const url = `${WORDPRESS_URL}/?${new URLSearchParams(params).toString()}`;
        return await axios.get(url);
    } catch (error) {
        throw Error(error.message);
    }
};


process.on('uncaughtException', (err) => {
    console.error('🔥 Uncaught Exception:', err);
    process.exit(1); // Exit to avoid unpredictable state
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Unhandled Rejection:', reason);
});


app.get("/api/members/query", async (req, res) => {
    const {email, memberId} = req.query;

    if (!email && !memberId) {
        return res.status(400).json({result: 'error', message: "Email or memberId is required"});
    }

    try {
        const responseData = await queryByEmailOrId(email, memberId);
        if (responseData.result === "failure") {
            return res.status(400).json({result: 'error', message: responseData.message});
        }
        res.json(responseData);

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({result: 'error', message: "API request failed", details: error.message});
    }
});


app.post("/api/members/signup", async (req, res) => {
    const {email, password, username, firstName, lastName} = req.body;

    if (!email || !password || !firstName || !lastName || !username) {
        return res.status(400).json({result: "error", message: "Email, username, password, first and last names required"});
    }
    const result = await signup(email, username, password, firstName, lastName)
    res.json(result);
});

app.post("/create-payment-intent", async (req, res) => {
    const { email, username } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 1,
            currency: 'eur',
            metadata: { email, username },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Login a member
app.post("/api/members/login", async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({result: 'error', message: "Email and password required"});
    }

    let responseData

    try {
        responseData = await loginInByEmail(email, password);
    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({result: 'error', message: "API request failed", details: error.message});
    }


    if (!utilityFunctions.isLoginSuccessful(responseData)) {
        const isActRequired = utilityFunctions.checkIfActivationRequired(responseData)
        if (!isActRequired) {
            return res.json({'result': 'error', message: responseData.message ? utilityFunctions.extractErrorMessage(responseData.message) : 'Unexpected error.'});
        }
    }

    try {
        responseData = await queryByEmailOrId(email);
        // res.json(responseData);
        console.log(responseData)


    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({result: 'error', message: "API request failed", details: error.message});
    }

    const token = encryptionService.createToken(responseData.member_data.email);
    const dto = utilityFunctions.createUserdataDtoFromUserdata(responseData, token)
    console.log(dto)
    res.json(dto);
});


app.listen(port, () => console.log(`Server running on port ${port}`));


app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({result: 'error', message: 'Internal server error', details: err.message});
});


async function queryByEmailOrId(email = null, id = null) {
    const params = {
        swpm_api_action: "query",
        key: API_KEY,
        ...(email ? {email: email} : {member_id: id}),
    };
    try {
        const url = `${WORDPRESS_URL}/?${new URLSearchParams(params).toString()}`;
        var response = await axios.get(url);

        if (response.data.result === 'success') {
            response.data.member_data = utilityFunctions.removePrivateUserData(response.data.member_data);
        }
        return response.data;
    } catch (error) {
        throw Error("API Error:", error.message);
    }
}

async function loginInByEmail(email = null, password = null) {
    const params = {
        swpm_api_action: "login",
        key: API_KEY,
        username: email,
        password,
    };
    try {
        const url = `${WORDPRESS_URL}/?${new URLSearchParams(params).toString()}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw Error(error.message);
    }
}

async function signup(email, username, password, firstName, lastName) {
    const params = {
        swpm_api_action: "create",
        key: API_KEY,
        user_name: username,
        email: email,
        password: password,
        first_name: firstName,
        last_name: lastName,
    };

    try {
        const response = await axios.post(`${WORDPRESS_URL}/`, params, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        let message = ''

        if (response.data.result === "failure") {
            if (response.data.errors.wp_email) {
                message = response.data.errors.wp_email + ' ';
            }
            if (response.data.errors.user_name) {
                message =  message + response.data.errors.user_name + ' ';
            }
            if (response.data.errors.email) {
                message =  message + response.data.errors.email;
            }
            return {result: 'error', message: message };
        }
        const paramsUpdate = {
          swpm_api_action: "update",
          key: API_KEY,
          first_name: firstName,
          last_name: lastName,
          member_id: response.data.member.member_id,
          account_state: "activation_required",
          member_since: utilityFunctions.getFormattedCurrentDate(),
        };

        const responseUpdate = await axios.post(`${WORDPRESS_URL}/`, paramsUpdate, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        return {result: 'success', data: responseUpdate.data};
    } catch (error) {
    }
}
