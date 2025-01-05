const { test, expect, request } = require("@playwright/test")

// Section 10 (udemy) - https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/31110732#questions/22571109
// See: Inspect -> Network -> All or Fetch/XHR >> look for login request to API
// See: Inspect -> Storage -> Local Storage >> token 
// NOTE: Need to first logout from the page https://rahulshettyacademy.com/client/dashboard/dash
// Login using link: https://rahulshettyacademy.com/client (after being log out first)


const loginPayload = { userEmail: "jane.doe@example.com", userPassword: "Password1" };  // from API call on the Inspect -> Network >> POST for login >> Request body
let token;  // NOTE: token must be placed as a global variable


// making a POST call without using request fixture (NOTE: must import request from library):
test.beforeAll(async () => {
    const apiContext = await request.newContext();  // creating a new context for request
    const loginResponse = await apiContext.post("https://rahulshettyacademy.com/api/ecom/auth/login", { data: loginPayload });

    // validating status code of the response
    expect(loginResponse.ok()).toBeTruthy();     // validating response status code if it is 200 or 201, or
    expect(loginResponse.status()).toBe(200);

    // extracting response body to a variable
    const loginResponseJson = JSON.parse(await loginResponse.text());
    // or just:
    const responseJson = await loginResponse.json();

    console.log("☑️ Response body (without fixture):", responseJson);

    // extracting token from resonse body
    token = responseJson.token;
    console.log("☑️ Token:", token);

});


// or
// making a POST call with request fixture:
test.beforeEach(async ({ request }) => {
    const response = await request.post("https://rahulshettyacademy.com/api/ecom/auth/login", { data: loginPayload });

    // validating status code of the response
    expect(response.ok()).toBeTruthy();     // validating response status code if it is 200 or 201, or
    expect(response.status()).toBe(200);

    // extracting response body to a variable
    const loginResponseJson = JSON.parse(await response.text());
    // or just:
    const responseJson = await response.json();

    console.log("☑️ Response body (with fixture):", responseJson);

    // extracting token from resonse body
    token = responseJson.token;
    console.log("☑️ Token:", token);

});


// placing token extracted from API in the test
test("Web Client App login", async ({ page }) => {
    // login - without using API token extracted:
    // const email = "anshika@gmail.com";
    // await page.locator("#userEmail").fill(email);
    // await page.locator("#userPassword").fill("Iamking@000");
    // await page.locator("[value='Login']").click();
    // await page.waitForLoadState('networkidle');

    // login - with the use of extracted token in API request:
    // we are inserting js function to the test
    await page.addInitScript(value => {
        window.localStorage.setItem("token", value);  // NOTE: token may have different name (bearerToken, authorization etc.) - verify first in the browser Application
        // window.sessionStorage.setItem("token", value);  // NOTE: token may be placed in different storage - verify first in the browser Application
    },
        token
    );
    // injecting token directly to cookies (to storage) will bypass login page and will go directly to product page with login credentials based on generated token

    await page.goto("https://rahulshettyacademy.com/client");
    await page.locator(".card-body b").first().waitFor();

    console.log("Number of elements:", await page.locator(".card-body").count());
    console.log("First product name:", await page.locator(".card-body b").first().textContent());
    console.log("Product titles:", await page.locator(".card-body h5 b").allTextContents());
});
