class APIUtils {

    constructor(apiContext, loginPayload) {
        this.apiContext = apiContext;
        this.loginPayload = loginPayload;  // (1) like this or (2) as an argument to the methods (here: option 1)
    }


    async getToken() {
        // Extracting token from the API request
        const loginResponse = await this.apiContext.post(
            "https://rahulshettyacademy.com/api/ecom/auth/login",
            { data: this.loginPayload }
        );

        const loginResponseJson = await loginResponse.json();  // extracting response body to a variable
        const token = loginResponseJson.token;  // extracting token from resonse body

        console.log("✅ Token:", token);
        return token
    };


    async createOrderID(orderPayload) {

        let response = {};
        response.token = await this.getToken();  // adding token value to the response object (dict)

        const orderResponse = await this.apiContext.post(
            "https://rahulshettyacademy.com/api/ecom/order/create-order",
            {
                data: orderPayload,
                headers: {
                    "Authorization": response.token,  // Authorization method check in Inspect -> Network >> POST for create-order >> Headers >> look where token goes
                    "Content-Type": "application/json"  // Content-Type check in Inspect -> Network >> POST for create-order >> Headers >> look for content-type used
                }
            },
        );

        const orderResponseJson = await orderResponse.json();  // extracting response body to a variable
        const orderID = orderResponseJson.orders[0];  // extracting order ID from resonse body - check in Inspect -> Network >> POST for create-order >> Response >> look how order ID is returned
        response.orderID = orderID;  // adding orderID value to the response object (dict)

        console.log("✅ Order ID:", response.orderID);
        return response;
    };
}

module.exports = { APIUtils };
