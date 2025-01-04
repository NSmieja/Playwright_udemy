const { test, expect } = require('@playwright/test');
const exp = require('constants');

// 04 (file), section 7 (udemy)
test("SCENARIO: Happy path for buying a product", async ({ page }) => {
    test.setTimeout(120_000);  // extending timeout for this test

    const loginURL = "https://rahulshettyacademy.com/client";
    const email = "jane.doe@example.com";
    const password = "Password1";
    const product = "IPHONE 13 PRO";
    let productId
    let orderId
    let orderIds = []

    await test.step("STEP 1: Login to the page with products", async () => {
        await page.goto(loginURL);
        await page.getByPlaceholder("email@example.com").fill(email);
        await page.locator("[type='password']").fill(password);
        await page.locator("#login").click();
        await expect(page.locator(".mt-1 p")).toHaveText("Automation Practice");
        await expect(page.locator(".btn-custom label")).not.toBeVisible();
    });

    await test.step("STEP 2: Adding a product to the cart", async () => {
        await page.locator(".card-body b").last().waitFor();
        const allProducts = await page.locator(".card-body b").allTextContents();
        for (var i = 1; i < allProducts.length; i++) {
            console.log(`'${allProducts[i]}'`);
            if (allProducts[i].toLowerCase() === product.toLowerCase()) {
                // await page.getByText(" Add to Cart").nth(i).click(); // or
                await page.locator(".card-body").nth(i).locator("text= Add to Cart").click()
                break
            }
        };
        await expect(page.locator(".btn-custom label")).toBeVisible();
        await expect(page.locator(".btn-custom label")).toHaveText("1");
    });


    await test.step("STEP 3: Proceeding to the cart page and verifying the added product", async () => {
        await page.getByRole("listitem").getByRole("button", { name: "Cart" }).click();
        await expect(page).toHaveURL("https://rahulshettyacademy.com/client/dashboard/cart");

        // in case of a single product in the cart
        await expect(page.locator(".cartSection h3")).toHaveText(product);
        productId = await page.locator(".itemNumber").textContent();
        productId = productId.substring(1);
        console.log(productId);

        // in case of many products added to the cart:
        await page.locator(".cartSection h3").last().waitFor();
        const allCarts = page.locator(".cartSection");
        let productFound = false;
        for (var i = 0; i < await allCarts.count(); i++) {
            if (await allCarts.locator("h3").nth(i).textContent() === product) {
                productFound = true;
                break;
            }
        }
        expect(productFound).toBeTruthy();

        // alternative way
        await page.locator(".cartSection h3").last().waitFor();
        await expect(page.getByRole('heading').filter({ hasText: product })).toBeVisible();
    });


    await test.step("STEP 4: Proceeding to the checkout", async () => {
        await page.getByRole("button", { name: "Checkout" }).click();  // or
        // await page.locator("button[type='button']").last().click()

        expect(page.url()).toContain(productId);
        await expect(page.locator(".payment__title").first()).toHaveText("Payment Method ");
        await expect(page.locator(".item__title")).toHaveText(product);
    });


    await test.step("STEP 5: Filling the payment form", async () => {
        await page.waitForLoadState("networkidle");

        await page.locator(".user__name input").last().pressSequentially("pol");
        await page.locator(".ta-results").waitFor();
        const availableCountries = await page.locator(".ta-results span").allTextContents();
        for (var i = 0; i < availableCountries.length; i++) {
            console.log("☑️ Country:", availableCountries[i].toLowerCase());
            if (availableCountries[i].toLowerCase().includes("poland")) // NOTE: some country names may be included in more than just one option (e.g. india) so use with caution
            {
                await page.locator(".ta-results span").getByText(availableCountries[i]).click();
                break
            }
        };
        await expect(page.locator(".input.txt.text-validated").last()).toHaveValue("Poland");

        await expect(page.locator(".user__name input").first()).toHaveValue(email);  // or
        await expect(page.locator(".user__name [type='text']").last()).toHaveValue(email);
        await expect(page.locator(".user__name label")).toHaveText(email);  // or
        await expect(page.locator(".user__name [type='text']").first()).toHaveText(email);

        await page.locator('input[type="text"]').nth(0).fill("1111 2222 3333 4444");
        await expect(page.locator('input[type="text"]').nth(0)).toHaveValue("1111 2222 3333 4444");

        await page.locator('input[type="text"]').nth(1).fill("123");
        await expect(page.locator('input[type="text"]').nth(1)).toHaveValue("123");

        await page.locator('input[type="text"]').nth(2).fill("SmiNat");
        await expect(page.locator('input[type="text"]').nth(2)).toHaveValue("SmiNat");

        await page.locator('input[type="text"]').nth(3).fill("rahulshettyacademy");
        await page.locator("button[type='submit']").click();
        await expect(page.locator(".mt-1.ng-star-inserted")).toContainText("* Coupon Applied");

        await page.locator("select.input").first().selectOption("05");
        await expect(page.locator("select.input").first()).toHaveValue("05");

        await page.locator("select.input").last().selectOption("24");
        await expect(page.locator("select.input").last()).toHaveValue("24");

    });

    await test.step("STEP 6: Placing an order", async () => {
        await page.locator(".action__submit").click();

        expect(page.url()).toContain(productId);
        await expect(page.locator(".hero-primary")).toContainText(" Thankyou for the order. ")

        const ids = page.locator(".em-spacer-1 .ng-star-inserted")
        const idsCount = await ids.count();

        if (idsCount === 1) {
            orderId = await page.locator(".em-spacer-1 .ng-star-inserted").textContent();
            orderId = orderId.replace("|", "").replace("|", "");
            orderId = orderId.trim();
            console.log("☑️ Order ID:", orderId);
        }
        else {
            for (var i = 0; i < idsCount; i++) {
                var singleId = await page.locator(".em-spacer-1 .ng-star-inserted").nth(i).textContent()
                singleId = singleId.replace("|", "").replace("|", "");
                singleId = singleId.trim();
                console.log("☑️ Single order ID:", singleId);
                orderIds.push(singleId);
            }
            console.log("☑️ All orders ids:", orderIds);
        }
    });
});


// 05 (file), section 8 (udemy)
test("SCENARIO: Additonal locators in use", async ({ page }) => {
    await page.goto("https://rahulshettyacademy.com/angularpractice/");

    // checkbox
    // - getByLabel locator
    await page.getByLabel("Check me out if you Love IceCreams!").check();  // Playwright will look for a place to clisk within this line, not only within label
    // - classic locator
    await page.locator(".form-check-input").first().uncheck();
    await page.locator("#exampleCheck1").check();

    // radio button
    // - getByLabel locator
    await page.getByLabel("Employed").check();
    // - classic locator
    await page.locator("#inlineRadio1").check();

    // dropdown list
    // - getByLabel locator
    await page.getByLabel("Gender").selectOption("Female");
    // - classic locator
    await page.locator("#exampleFormControlSelect1").selectOption("Male");

    // form field (typing)
    // - classic locator
    await page.locator("#exampleInputPassword1").fill("sth123");  // or
    // - getByLabel locator
    // await page.getByLabel("Password").fill("another_password");  // // NOTE! NOT recomended for typing field (not always work)
    // - getByPlaceholder locator
    await page.getByPlaceholder("Password").fill("abc1");

    // date field
    await page.locator("[name='bday']").pressSequentially("22112020");

    // sumbitting the form
    // - classic locator
    // await page.locator("[type='submit']").click();  // or
    // - getByRole locator
    await page.getByRole("button", { name: "submit" }).click();

    await expect(page.locator(".alert-success")).toBeVisible();

    // closing the alert message
    await page.locator(".close").click();
    await expect(page.locator(".alert-success")).not.toBeVisible();

    // redirecting to the Shop page
    // - classic locator
    // await page.locator(".nav-link").nth(1).click(); // or
    // - getByRole locator
    await page.getByRole("link", { name: "Shop" }).click();

    // we want to add Nokia Edge to the cart
    await expect(page.locator(".nav-link").last()).toContainText("0");
    await page.locator("app-card").filter({ hasText: "Nokia Edge" }).getByRole("button", { name: "Add " }).click();
    await expect(page.locator(".nav-link").last()).toContainText("1");
})

// 07 (file), section 9 (udemy)
test("SCENARIO: Moving between two pages", async ({ page }) => {
    await page.goto("https://rahulshettyacademy.com/AutomationPractice/");
    await expect(page.locator("h1")).toHaveText("Practice Page");

    await page.goto("https://www.monkeyuser.com/2018/replace-all/");
    await expect(page.locator("h1")).toHaveText("MonkeyUser");

    await page.goBack();
    await expect(page.locator("h1")).toHaveText("Practice Page");

    await page.goForward();
    await expect(page.locator("h1")).toHaveText("MonkeyUser");

})

test("SCENARIO: Validating hidden fields", async ({ page }) => {
    await test.step("GIVEN: The page is loaded", async () => {
        await page.goto("https://rahulshettyacademy.com/AutomationPractice/");
        await page.waitForLoadState("networkidle");
    });

    await test.step("AND: The page has an element visible to the user", async () => {
        await expect(page.getByPlaceholder("Hide/Show Example")).toBeVisible();
    });

    await test.step("WHEN: User clicks on 'Hide' button", async () => {
        await page.locator("#hide-textbox").click();
    });

    await test.step("THEN: Element is no longer visible for the user", async () => {
        await expect(page.getByPlaceholder("Hide/Show Example")).not.toBeVisible();
    });
});

//https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/31110670#overview
test("SCENARIO: JAVA popups (dialogs)", async ({ page }) => {
    // opening the page
    await page.goto("https://rahulshettyacademy.com/AutomationPractice/");
    await page.waitForLoadState("networkidle");

    // setting listener on JAVA popup (dialog) window with action to click OK when it will shown up
    // NOTE: first you must set a listener (page.on() method) who will listen if given action occure, and then click on button that will trigger that action
    // page.on() is a method to set a listener - will listen for events and will be notified when that event occure
    page.on("dialog", dialog => dialog.accept());   // accept will click on OK
    // page.on("dialog", dialog => dialog.dismiss());  // dismiss will click on Cancel

    // clicking on button that will trigger the popup (dialog) window to show up
    await page.locator("#confirmbtn").click();
});

test("SCENARIO: Hovering over some button/dropdown list", async ({ page }) => {
    await page.goto("https://rahulshettyacademy.com/AutomationPractice/");
    await expect(page.locator(".mouse-hover-content a").first()).not.toBeVisible();

    await page.locator("#mousehover").hover();
    await expect(page.locator(".mouse-hover-content a").first()).toBeVisible();

});

