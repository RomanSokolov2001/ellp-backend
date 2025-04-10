const axios = require("axios");
const utilityFunctions = require("./utils/utilityFunctions");

const WORDPRESS_URL = "https://erasmuslifelaspalmas.com"
const API_KEY = process.env.API_KEY;


class WPService {
    async activateUserByEmail(email) {
        const prevUser = (await this.queryByEmailOrId(email)).member_data

        const paramsUpdate = {
            swpm_api_action: "update",
            key: API_KEY,
            first_name: prevUser.first_name,
            last_name: prevUser.last_name,
            member_id: prevUser.member_id,
            account_state: "active",
            member_since: prevUser.member_since,
            membership_level: '2',
            subscription_stats: utilityFunctions.getFormattedCurrentDate()
        };

        const response = await axios.post(`${WORDPRESS_URL}/`, paramsUpdate, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        return response.data;
    }

    async queryByEmailOrId(email = null, id = null) {
        const params = {
            swpm_api_action: "query",
            key: API_KEY,
            ...(email ? {email: email} : {member_id: id}),
        };
        try {
            var response = await axios.get(`${WORDPRESS_URL}/?${new URLSearchParams(params).toString()}`);

            return response.data;
        } catch (error) {
            throw Error("API Error:", error);
        }
    }

    async loginInByEmail(email = null, password = null) {
        const params = {
            swpm_api_action: "login",
            key: API_KEY,
            username: email,
            password,
        };
        try {
            const response = await axios.get(`${WORDPRESS_URL}/?${new URLSearchParams(params).toString()}`);
            return response.data;
        } catch (error) {
            throw Error(error.message);
        }
    }

    async signup(email, username, password, firstName, lastName) {
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
                    message = message + response.data.errors.user_name + ' ';
                }
                if (response.data.errors.email) {
                    message = message + response.data.errors.email;
                }
                return {result: 'error', message: message};
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
}

module.exports = new WPService();
