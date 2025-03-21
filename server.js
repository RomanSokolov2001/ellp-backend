const express = require("express");
const axios = require("axios");
const cors = require("cors");
const encryptionService = require('./utils/encryptionService');
const utilityFunctions = require("./utils/utilityFunctions");
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
    signup(email, username, password, firstName, lastName)

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
    const {email, password, userName} = req.body;
    if ((!email && !userName) || !password) {
        return res.status(400).json({result: 'error', message: "Email or username and password required"});
    }

    let response

    try {
        response = await loginInByEmailOrUserName(email, password, userName);
    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({result: 'error', message: "API request failed", details: error.message});
    }
    console.log("test2")



    if (!utilityFunctions.isLoginSuccessful(response.data)) {
        return res.json({'result': 'error', message: response.data.message ? response.data : 'Unexpected error.'});
    }

    try {
        response = await queryByEmailOrId(email);
        res.json(response);

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({result: 'error', message: "API request failed", details: error.message});
    }

    const token = encryptionService.createToken(response.data.member_data.email);
    const dto = utilityFunctions.createUserdataDtoFromUserdata(response.data, token)

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
        return await sendGetRequest(params);
    } catch (error) {
        throw Error("API Error:", error.message);
    }
}

async function loginInByEmailOrUserName(email = null, userName = null, password = null) {
    const params = {
        swpm_api_action: "login",
        key: API_KEY,
        ...(email ? {email: email} : {username: userName}),
        password,
    };
    try {
        return await sendGetRequest(params);
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
        console.log(response.data);
        // if success =>
        // const paramsUpdate = {
        //   swpm_api_action: "update",
        //   key: API_KEY,
        //   first_name: firstName,
        //   last_name: lastName,
        //   member_id: response.data.member.member_id,
        //   account_state: "activation_required",
        //   member_since: getFormattedCurrentDate(),
        // };
        //
        // const responseUpdate = await axios.post(`${WORDPRESS_URL}/`, paramsUpdate, {
        //   headers: {
        //     "Content-Type": "application/x-www-form-urlencoded", // Required for form data
        //   },
        // });
        // console.log(responseUpdate.data);
        //
        // // Return API response to client
        // res.json(responseUpdate.data);
    } catch (error) {
    }
}
