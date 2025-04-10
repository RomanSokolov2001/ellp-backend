class UtilityFunctions {
    removePrivateUserData(memberData) {
        return {
            member_id: memberData.member_id,
            first_name: memberData.first_name,
            user_name: memberData.user_name,
            last_name: memberData.last_name,
            member_since: memberData.member_since,
            membership_level: memberData.membership_level,
            account_state: memberData.account_state,
            email: memberData.email,
            country: memberData.country,
            gender: memberData.gender,
            subscription_starts: memberData.subscription_starts
        }
    }

    getFormattedCurrentDate() {
        return new Date().toISOString().split("T")[0];
    }

    createUserdataDtoFromUserdata(responseData, token) {
        if (responseData && responseData.member_data) {
            return {
                result: 'success',
                data: {
                    email: responseData.member_data.email,
                    memberId: responseData.member_data.member_id,
                    username: responseData.member_data.user_name,
                    firstName: responseData.member_data.first_name,
                    lastName: responseData.member_data.last_name,
                    memberSince: responseData.member_data.member_since,
                    accountState: responseData.member_data.account_state,
                    ...(token && {jwt: token})
                }
            }
        } else {
            console.error('Unreachable userdata in query successful response')
            throw Error('Internal server error')
        }
    }

    checkIfLoginSuccessful(responseData) {
        if (responseData && responseData.message === 'The login action result: Logged In.') {
            return true;
        } else false;
    };

    checkIfActivationRequired(responseData) {
        return responseData && responseData.message.slice(0, 75) === `The login action result: <div class="swpm_login_error_activation_required">`;
    }

    extractErrorMessage(htmlString) {
        if (!htmlString) {
            return null;
        }

        // Regular expression to match content between span tags with the specific class
        const regex = /<span class=\\?"swpm-login-error-msg swpm-red-error-text\\?">(.*?)<\/span>/;

        // Execute the regex against the input string
        const match = regex.exec(htmlString);

        // If a match is found, return the captured group (the error message)
        // Otherwise return null
        return match ? match[1] : null;
    }
}

module.exports = new UtilityFunctions();
