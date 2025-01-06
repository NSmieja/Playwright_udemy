const { test, expect, request } = require("@playwright/test")
const { APIUtils } = require("../utils/api_utils");


// Section 10, from no. 50 (udemy) - https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/31110824?start=15#overview


const loginPayload = { userEmail: "jane.doe@example.com", userPassword: "Password1" };  // form from API call on the Inspect -> Network >> POST for login >> Request body
const productId = "6581cade9fd99c85e8ee7ff5";  // for IPHONE 13 PRO (from: https://rahulshettyacademy.com/client/dashboard/cart)
const country = "Cuba";
const orderPayload = { orders: [{ country: country, productOrderedId: productId }] };  // form from API call on the Inspect -> Network >> POST for create-order >> Request body

let api_response;


test.beforeAll(async () => {

    const apiContext = await request.newContext();  // creating a new context for the requests
    const apiUtils = new APIUtils(apiContext, loginPayload);  // creating object of APIUtils class

    api_response = await apiUtils.createOrderID(orderPayload);  // extracting token and orderID from API call

});


test("Redirecting to the order by clicking View button of placed order", async ({ page }) => {

    // login with the use of extracted token from API request:
    await page.addInitScript(value => {
        window.localStorage.setItem("token", value);
    },
        api_response.token
    );

    // navigating to the page with order history
    await page.goto("https://rahulshettyacademy.com/client");
    await page.locator(".card-body b").first().waitFor();
    await page.locator("[routerlink='/dashboard/myorders']").first().click();

    await page.locator("table tbody").waitFor();
    const rows = page.locator("tbody tr");
    console.log("➡️ Rows count:", await rows.count());

    // searching the order ID in the list of all orders on the page and clicking on View button
    for (let i = 0; i < await rows.count(); ++i) {
        const rowOrderID = await rows.nth(i).locator("th").textContent();
        console.log("➡️ Row order ID:", rowOrderID);
        if (api_response.orderID.includes(rowOrderID)) {
            console.log("☑️ Order ID from orders page:", rowOrderID);
            await rows.nth(i).locator("button").first().click();
            break;
        };
    };

    // testing View page content 
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".email-title")).toContainText('order summary');
    expect(page.url()).toContain("https://rahulshettyacademy.com/client/dashboard/order-details");

    expect(page.url()).toContain(api_response.orderID);
    await expect(page.locator(".col-text")).toContainText(api_response.orderID);

    await expect(page.locator(".text").first()).toContainText(loginPayload.userEmail);
    await expect(page.locator(".text").nth(1)).toContainText(orderPayload.orders[0].country);

});

