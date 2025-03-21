class UtilityFunctions {
    removePrivateUserData(memberData) {
        return {
            first_name: memberData.user_name,
            user_name: memberData.first_name,
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
            console.log(responseData)
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
                    jwt: token
                }
            }
        } else {
            console.error('Unreachable userdata in query successful response')
            throw Error('Internal server error')
        }
    }

    isLoginSuccessful(response) {
        if (response && response.message === 'The login action result: Logged In.') {
            return true;
        } else false;
    };
}

module.exports = new UtilityFunctions();
