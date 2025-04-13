const htmlResponses = require("./utils/htmlResponses");
const wpService = require("./utils/wpUtils");
const utilityFunctions = require("./utils/utilityFunctions");
const encryptionService = require("./utils/encryptionUtils");

class Service {
    async checkEmailAndGetHtmlResponse(email) {
        try {
            const responseData = await wpService.queryByEmailOrId(email);
            if (responseData && responseData.result === 'success') {
                if (responseData.member_data.account_state === 'active') {
                    const {first_name, last_name} = responseData.member_data;
                    return htmlResponses.getSuccessHtml(first_name, last_name);
                } else {
                    const {first_name, last_name} = responseData.member_data;
                    return htmlResponses.getNotActiveHtml(first_name, last_name);
                }
            } else {
                console.error(`@check: not found: ${email}`);
                return htmlResponses.getNotFoundHtml(email);
            }
        } catch (error) {
            console.error(`@check: ${error}`);
            return htmlResponses.getErrorHtml();
        }
    }

    async tryQueryUserAndGetDto(email, memberId) {
        try {
            const responseData = await wpService.queryByEmailOrId(email, memberId);

            if (responseData.result === "failure") {
                return {result: 'error', message: responseData.message};
            }

            return utilityFunctions.createUserdataDtoFromUserdata(responseData)

        } catch (error) {
            console.error("API Error:", error.message);
            return {result: 'error', message: "API request failed", details: error.message};
        }
    }

    async tryLoginUserAndGetDto(email, password) {
        let responseData = null
        try {
            responseData = await wpService.loginInByEmail(email, password);
        } catch (error) {
            console.error("API Error:", error.message);
            return {result: 'error', message: "API request failed", details: error.message};
        }

        const isLoginSuccessful = utilityFunctions.checkIfLoginSuccessful(responseData)
        const isActivationRequired = utilityFunctions.checkIfActivationRequired(responseData)

        if (!isLoginSuccessful && !isActivationRequired) {
            return {
                'result': 'error',
                message: responseData.message ? utilityFunctions.extractErrorMessage(responseData.message) : 'Unexpected error.'
            };
        }

        try {
            responseData = await wpService.queryByEmailOrId(email);
        } catch (error) {
            console.error("API Error:", error.message);
            return {result: 'error', message: "API request failed", details: error.message};
        }

        return utilityFunctions.createUserdataDtoFromUserdata(responseData, encryptionService.createToken(responseData.member_data.email));
    }
}

module.exports = new Service();
