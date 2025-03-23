const express = require("express");
const axios = require("axios");
const cors = require("cors");
const encryptionService = require('./utils/encryptionService');
const utilityFunctions = require("./utils/utilityFunctions");
const res = require("express/lib/response");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

WORDPRESS_URL = "https://erasmuslifelaspalmas.com"
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
        res.json(responseData);

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({result: 'error', message: "API request failed", details: error.message});
    }
});


app.post("/api/members/signup", async (req, res) => {
    const {email, password, firstName, lastName, username} = req.body;

    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({result: "error", message: "Email, password, first and last names required"});
    }
    const result = await signup(email, username, password, firstName, lastName)
    res.json(result);

    // try {
    //     const params = {
    //         swpm_api_action: "create",
    //         key: API_KEY,
    //         user_name: userName,
    //         email: email,
    //         password: password,
    //         first_name: firstName,
    //         last_name: lastName,
    //     };
    //
    //     // Correct axios request: Send data in the body, not the URL
    //     const response = await axios.post(`${WORDPRESS_URL}/`, params, {
    //         headers: {
    //             "Content-Type": "application/x-www-form-urlencoded", // Required for form data
    //         },
    //     });
    //     console.log(response.data);
    //     // if success =>
    //     const paramsUpdate = {
    //         swpm_api_action: "update",
    //         key: API_KEY,
    //         first_name: firstName,
    //         last_name: lastName,
    //         member_id: response.data.member.member_id,
    //         account_state: "activation_required",
    //         member_since: getFormattedCurrentDate(),
    //     };
    //
    //     const responseUpdate = await axios.post(`${WORDPRESS_URL}/`, paramsUpdate, {
    //         headers: {
    //             "Content-Type": "application/x-www-form-urlencoded", // Required for form data
    //         },
    //     });
    //     console.log(responseUpdate.data);
    //
    //     // Return API response to client
    //     res.json(responseUpdate.data);
    // } catch (error) {
    //     console.error("Error in signup:", error.response?.data || error.message);
    //     res.status(500).json({result: "error", message: "Server error"});
    // }
});

// ✅ Login a member
app.post("/api/members/login", async (req, res) => {
    const {email, password, username} = req.body;
    if ((!email && !username) || !password) {
        return res.status(400).json({result: 'error', message: "Email or username and password required"});
    }

    let responseData

    try {
        responseData = await loginInByEmailOrUserName(email, username, password);
    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({result: 'error', message: "API request failed", details: error.message});
    }
    console.log("test2")


    if (!utilityFunctions.isLoginSuccessful(responseData)) {
        const isActRequired = utilityFunctions.checkIfActivationRequired(responseData)
        if (!isActRequired) {
            return res.json({'result': 'error', message: responseData.message ? utilityFunctions.extractErrorMessage(responseData.message) : 'Unexpected error.'});
        }
    }

    try {
        responseData = await queryByEmailOrId(email);
        // res.json(responseData);

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({result: 'error', message: "API request failed", details: error.message});
    }

    const token = encryptionService.createToken(responseData.member_data.email);
    const dto = utilityFunctions.createUserdataDtoFromUserdata(responseData, token)

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
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw Error("API Error:", error.message);
    }
}

async function loginInByEmailOrUserName(email = null, username = null, password = null) {
    const params = {
        swpm_api_action: "login",
        key: API_KEY,
        username: email ? email : username,
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
                message = message + ' ' + response.data.errors.wp_email;
            }
            if (response.data.errors.user_name) {
                message =  message + ' ' + response.data.errors.user_name;
            }
            if (response.data.errors.email) {
                message =  message + ' ' + response.data.errors.email;
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
