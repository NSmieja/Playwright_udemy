const { test, expect, request } = require("@playwright/test")

// Section 10, from no. 48 (udemy) - https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/31110790#questions/18040366

const loginPayload = { userEmail: "jane.doe@example.com", userPassword: "Password1" };  // form from API call on the Inspect -> Network >> POST for login >> Request body
let token;  // NOTE: token must be placed as a global variable

const productId = "6581cade9fd99c85e8ee7ff5";   // for IPHONE 13 PRO (from: https://rahulshettyacademy.com/client/dashboard/cart)
const country = "Cuba";
const orderPayload = { orders: [{ country: country, productOrderedId: productId }] };  // form from API call on the Inspect -> Network >> POST for create-order >> Request body
let orderID;  // NOTE: orderID must be placed as a global variable


test.beforeAll(async () => {
    // creating a context API (to be able to use 2 different requests)
    const apiContext = await request.newContext();  // creating a new context for request

    // 1 - extracting token from API
    const loginResponse = await apiContext.post(
        "https://rahulshettyacademy.com/api/ecom/auth/login",
        { data: loginPayload }
    );
    // validating status code of the response
    expect(loginResponse.status()).toBe(200);
    // extracting response body to a variable
    const loginResponseJson = await loginResponse.json();
    // extracting token from resonse body
    token = loginResponseJson.token;
    console.log("☑️ Token:", token);

    // 2 - extracting order ID form API
    const orderResponse = await apiContext.post(
        "https://rahulshettyacademy.com/api/ecom/order/create-order",
        {
            data: orderPayload,
            headers: {
                "Authorization": token,             // check in Inspect -> Network >> POST for create-order >> Headers >> look where token goes
                "Content-Type": "application/json"  // check in Inspect -> Network >> POST for create-order >> Headers >> look for content-type used
            }
        },
    );
    // validating status code of the response
    expect(orderResponse.status()).toBe(201);
    // extracting response body to a variable
    const orderResponseJson = await orderResponse.json();
    // extracting order ID from resonse body
    orderID = orderResponseJson.orders[0];  // check in Inspect -> Network >> POST for create-order >> Response >> look how order ID is returned
    console.log("☑️ Order ID:", orderID);

});


// placing token extracted from API in the test
// extracting order ID from API and injescting it to the test to validate order history page
test("Redirecting to the order by clicking View button of placed order", async ({ page }) => {

    // login - with the use of extracted token in API request:
    await page.addInitScript(value => {
        window.localStorage.setItem("token", value);
    },
        token
    );

    // navigating to the page with order history
    await page.goto("https://rahulshettyacademy.com/client");
    await page.locator(".card-body b").first().waitFor();
    await page.locator("[routerlink='/dashboard/myorders']").first().click();

    await page.locator("table tbody").waitFor();  // !!! await to load a page content!!! otherwise the count() will always be zero
    const rows = page.locator("tbody tr");
    console.log("➡️ Rows count:", await rows.count());

    // searching the order ID in the list of all orders on the page and clicking on View button
    for (let i = 0; i < await rows.count(); ++i) {
        const rowOrderID = await rows.nth(i).locator("th").textContent();
        console.log("➡️ Row order ID:", rowOrderID);
        if (orderID.includes(rowOrderID)) {
            console.log("☑️ Order ID from orders page:", rowOrderID);
            await rows.nth(i).locator("button").first().click();
            break;
        };
    };

    // testing View page content 
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".email-title")).toContainText('order summary');
    expect(page.url()).toContain("https://rahulshettyacademy.com/client/dashboard/order-details");

    expect(page.url()).toContain(orderID);
    await expect(page.locator(".col-text")).toContainText(orderID);

    await expect(page.locator(".text").first()).toContainText(loginPayload.userEmail);
    await expect(page.locator(".text").nth(1)).toContainText(orderPayload.orders[0].country);

});

