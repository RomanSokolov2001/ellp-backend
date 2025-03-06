const express = require("express");
const axios = require("axios");
const cors = require("cors");
const encryptionService = require('./utils/encryptionService');
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

WORDPRESS_URL = "https://erasmuslifelaspalmas.com"
const API_KEY = process.env.API_KEY;

const sendRequest = async (params) => {
  try {
    const url = `${WORDPRESS_URL}/?${new URLSearchParams(params).toString()}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    return { error: error.message };
  }
};
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
  // Decide if you want to exit or recover
  process.exit(1); // Exit to avoid unpredictable state
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection:', reason);
  // You can log it and decide if the server should keep running
});

// ✅ Query a member profile by email or ID
app.get("/api/members/query", async (req, res) => {
  const { email, member_id } = req.query;

  if (!email && !member_id) {
    return res.status(400).json({ result: 'error', message: "Email or member_id is required" });
  }
  const url = `${WORDPRESS_URL}/?swpm_api_action=query&key=${API_KEY}&${email ? `email=${email}` : `member_id=${member_id}`}`;

  try {
    const response = await axios.get(url);

    if (typeof response.data === "string" && response.data.includes("<html>")) {
      console.error("Error: Received unexpected HTML response");
      return res.status(500).json({ result: 'error', message: "Unexpected HTML response. Check API URL or key." });
    }

    res.json(response.data); // Send back JSON response
  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({ result: 'error', message: "API request failed", details: error.message });
  }
});


// ✅ Login a member
app.post("/api/members/login", async (req, res) => {
  // Simple Membership API accepts param username as an email. 
  // Proceed with this as an email but in API request will be sent as username
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ result: 'error', message: "Email and password required" });
  };

  const params = {
    swpm_api_action: "login",
    key: API_KEY,
    username: email,
    password,
  };

  const response = await sendRequest(params);

  // Simple Membership API returns param result in json as success even if user account is expired or non-actve and etc
  const isSuccessful = checkIfLoginSuccessful(response);
  if (!isSuccessful) {
    return res.json(
      {
        'result': 'failure',
        message: response.message ? response.message : 'Unexpected error.'
      }
    );
  };

  // TODO: Duplicated code. Create function
  // Query an userdataa by email to retrieve data and return JWT back
  const url = `${WORDPRESS_URL}/?swpm_api_action=query&key=${API_KEY}&email=${email}`;
  var queryReponse
  try {
    queryReponse = await axios.get(url);
    if (typeof queryReponse.data === "string" && queryReponse.data.includes("<html>")) {
      console.error("Error: Received unexpected HTML response. Check API URL or key.");

      res.json(
        {
          result: 'error',
          message: queryReponse.message ? queryReponse.message : 'Internal server error.'
        }
      );
    }

    // Return JWT
    // Example Usage
    const token = encryptionService.createToken('user@example.com');
    const dto = createUserdataDtoFromUserdata(queryReponse.data)
    dto.jwt = token

    console.log('Generated Token:', token);

    const data = encryptionService.extractData(token);
    console.log('Extracted Data:', data);

    console.log('Is Token Valid?:', encryptionService.validateToken(token));
    res.json(dto);
  }
  catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({ result: 'error', error: "API request failed", details: error.message });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));

function checkIfLoginSuccessful(response) {
  if (response && response.message === 'The login action result: Logged In.') {
    return true;
  } else false;
};

function createUserdataDtoFromUserdata(responseData) {
  if (responseData && responseData.member_data) {
    console.log(responseData)
    return {
      result: 'success',
      data: {
        memberId: responseData.member_data.member_id,
        username: responseData.member_data.user_name,
        firstName: responseData.member_data.first_name,
        lastName: responseData.member_data.last_name,
        memberSince: responseData.member_data.member_since,
        accountState: responseData.member_data.account_state
      }
    }
  } else {
    console.error('Unreachable userdata in query successful response')
    throw Error('Internal server error')
  }
}

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ result: 'error', error: 'Internal Server Error', details: err.message });
});
