const { test, expect } = require('@playwright/test');
const exp = require('constants');

// Section 7 (udemy) - start: https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/31110570#overview
// Section 8, no. 38 (udemy) - rewriting the code - https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/45928973#overview
// code after section 8: https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/45928985#overview

test("SCENARIO: End to end path for buying 'IPHONE 13 PRO'", async ({ page }) => {
    test.setTimeout(120_000);  // extending timeout for this test

    const loginURL = "https://rahulshettyacademy.com/client";
    const email = "jane.doe@example.com";
    const password = "Password1";
    const product = "IPHONE 13 PRO";
    const productPrice = "231500";
    const additionalProduct = "qwerty"
    const additionalProductPrice = "11500";
    let productID;
    let orderID;
    let orderIDs = [];

    await test.step("STEP 1: Login to the page with products", async () => {

        await page.goto(loginURL);
        await page.getByPlaceholder("email@example.com").fill(email);
        // await page.getByPlaceholder("enter your passsword").fill(password);  // or
        await page.locator("[type='password']").fill(password);
        // await page.locator("#login").click();  // or
        await page.getByRole("button", { name: "login" }).click();

        await expect(page).toHaveURL("https://rahulshettyacademy.com/client/dashboard/dash");
        await expect(page.locator(".logo-holder.logo-7")).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Automation' })).toBeVisible();
        await expect(page.locator(".mt-1 p")).toHaveText("Automation Practice");
    });


    await test.step("STEP 2: Searching for a product by title and adding to the cart", async () => {
        // loading full page content
        // await page.waitForLoadState("networkidle");  // does not work
        await page.waitForSelector(".card-body", { state: "visible" });
        // checking that cart is empty
        await expect(page.locator("xpath=/html/body/app-root/app-dashboard/app-sidebar/nav/ul/li[4]/button/label")).not.toHaveText("1");
        await expect(page.locator("xpath=/html/body/app-root/app-dashboard/app-sidebar/nav/ul/li[4]/button/label")).toBeEmpty();
        // or
        await expect(page.locator(".btn-custom label")).not.toBeVisible();

        // method 1 for adding product to the basket (for loop)
        // creating list with product titles
        await page.locator(".card-body b").first().waitFor();
        let allTitles = await page.locator(".card-body b").allTextContents();
        console.log(allTitles);
        console.log(allTitles.length);
        // expect(allTitles.length).toBe(6);  // can change over time

        // iterating over the list to add 'IPHONE 13 PRO' to cart
        for (let i = 0; i < allTitles.length; i++) {
            console.log(allTitles[i]);
            if (allTitles[i] === product) {
                await page.getByRole('button', { name: ' Add To Cart' }).nth(i).click()  // or
                // await page.getByText(" Add to Cart").nth(i).click();  // the same result as above
                break
            };
        };

        // method 2 for adding product to the basket (filters)
        await page.locator(".card-body").filter({ hasText: product }).getByRole("button", { name: " Add to Cart" }).click();

        // verifying that product was added to the cart (cart icon has value of 1)
        await expect(page.locator("xpath=/html/body/app-root/app-dashboard/app-sidebar/nav/ul/li[4]/button/label")).toHaveText("1");  // or
        await expect(page.getByRole("listitem").getByRole("button", { name: "Cart" })).toContainText("1"); // or
        await expect(page.locator(".btn-custom label")).toBeVisible();
        await expect(page.locator(".btn-custom label")).toHaveText("1");
    });


    await test.step("STEP 2a: Adding additional product to the cart (optional)", async () => {
        await page.locator(".card-body").last().waitFor();

        // method 1 (for loop)
        const cards = page.locator(".card-body");
        const cardsCount = await cards.count();

        console.log("☑️ Cards count:", cardsCount);
        for (var i = 0; i < cardsCount; i++) {
            console.log("☑️ ", i)
            if (await cards.nth(i).locator("h5").textContent() === additionalProduct) {
                await cards.nth(i).getByText(" Add To Cart").click();
                break
            }
        };

        // method 2 (filters)
        await page.locator(".card").filter({ hasText: additionalProduct }).getByRole("button", { name: " Add to Cart" }).click();

        // await page.reload();
        await expect(page.locator(".btn-custom label")).toBeVisible();
        await expect(page.locator(".btn-custom label")).toHaveText("2");  // or
        await expect(page.getByRole("listitem").getByRole("button", { name: "Cart" })).toContainText("2");
    });


    await test.step("STEP 3: Verifying that correct product is in the cart and clicking 'Checkout'", async () => {
        // redirecting to the cart page
        await page.locator("[routerlink='/dashboard/cart']").click();  // or
        await page.locator("[routerlink*='cart']").click();  // or
        await page.getByRole("listitem").getByRole("button", { name: "Cart" }).click();

        // verifiying if user was redirected to cart page
        await expect(page).toHaveURL("https://rahulshettyacademy.com/client/dashboard/cart");
        await expect(page.locator(".heading.cf h1")).toHaveText("My Cart");

        // validating number of prodycts added to the cart
        const addedProducts = await page.locator(".itemNumber").count();
        let productNthPlace

        if (addedProducts === 1) {
            // verifying the product in the cart
            await expect(page.locator(".cartSection h3")).toHaveText(product);  // or
            await expect(page.locator("h3:has-text('IPHONE 13 PRO')")).toBeVisible();  // or
            await expect(page.getByText(product)).toBeVisible();
            await expect(page.locator(".cartSection p").nth(1)).toContainText(productPrice);
            await expect(page.locator(".prodTotal.cartSection p").nth(0)).toContainText(productPrice);
            await expect(page.getByText("$").nth(2)).toContainText(productPrice);
            await expect(page.getByText("$").nth(3)).toContainText(productPrice);
        }
        else {
            // in case of many products added to the cart
            // page.locator(".cartSection").last().waitFor();  // <- this one sometimes causes error, try this
            await page.waitForSelector(".cartSection");
            const allCarts = page.locator(".cartSection");
            console.log("➡️ Products count:", await allCarts.count());
            let productFound = false;
            for (var i = 0; i < await allCarts.count(); i++) {
                console.log("☑️ Product:", await allCarts.locator("h3").nth(i).textContent());
                if (await allCarts.locator("h3").nth(i).textContent() === product) {
                    productFound = true;
                    productNthPlace = i;
                    break;
                }
            }
            expect(productFound).toBeTruthy();
        };

        // alternative way
        await page.locator(".cartSection h3").last().waitFor();
        await expect(page.getByRole('heading').filter({ hasText: product })).toBeVisible();

        // saving product ID to a variable
        console.log("☑️ Product nth place:", productNthPlace);
        productID = await page.locator(".itemNumber").nth(productNthPlace).textContent();
        console.log("☑️ Product ID:", productID);
        productID = productID.substring(1);  // removing '#' from ID
        console.log("☑️ Product ID:", productID);
    });


    await test.step("STEP 4: Proceeding with 'Checkout'", async () => {
        // proceeding with checkout
        await page.getByRole("button", { name: "Checkout" }).click();  // or
        // await page.locator("button[type='button']").last().click()

        // verifying if user was redirected to payment page
        expect(page.url()).toContain("https://rahulshettyacademy.com/client/dashboard/order");
        expect(page.url()).toContain(productID);
        await expect(page.locator(".payment__title").first()).toHaveText("Payment Method");

    });


    await test.step("STEP 5: Verifying the product on Payment page", async () => {
        const itemsCount = await page.locator(".item__details").count();

        if (itemsCount === 1) {
            await expect(page.locator(".item__title")).toHaveText(product);
            await expect(page.locator(".item__price")).toContainText(productPrice);
            await expect(page.locator(".item__description ul li").first()).toContainText("Apple Iphone13 pro");
        }
        else {
            await expect(page.locator(".item__title").getByText(product)).toBeVisible();
            await expect(page.locator(".item__price").getByText(productPrice)).toBeVisible();
            await expect(page.locator(".item__description ul li").getByText(/Apple Iphone13 pro/)).toBeVisible();
        }
    });


    await test.step("STEP 6: Filling the payment form", async () => {
        // await page.locator(".input.txt.text-validated").nth(2).fill("Poland");  // we cannot use fill method in dropdown selector

        // method 1 for clicking on the correct country from dropdown list
        await page.getByPlaceholder("Select Country").pressSequentially("pol");
        var countryDropdown = page.locator(".ta-results");
        await countryDropdown.waitFor();
        let optionsCount = await countryDropdown.locator("button").count();
        for (let i = 0; i < optionsCount; i++) {
            if (await countryDropdown.locator("button").nth(i).textContent() === " Poland") {
                await countryDropdown.locator("button").nth(i).click();
                break;
            }
        };
        // or

        // method 2 for clicking on the correct country from dropdown list
        // - clearing previous country name form method 1 (NOTE: clean() and reload() will not work on this page - throws 404)
        await page.goBack();
        await page.goForward();
        await page.getByPlaceholder("Select Country").waitFor();
        // - providing new name with the use of getBy locator
        await page.getByPlaceholder("Select Country").pressSequentially("pola");
        var countryDropdown = page.locator(".ta-results");
        await countryDropdown.waitFor();
        await page.getByRole("button", { name: "Poland" }).click();

        await expect(page.locator(".input.txt.text-validated").last()).toHaveValue("Poland");  // or
        await expect(page.locator(".input.txt.text-validated").nth(2)).toHaveValue("Poland");

        await page.locator(".input.txt.text-validated").first().clear();
        await page.locator(".input.txt.text-validated").first().fill("1111 2222 3333 4444");
        await page.locator(".input.ddl").first().selectOption("07");  // or
        await page.locator("select.input").first().selectOption("07");
        await page.locator(".input.ddl").nth(1).selectOption("25");  // or
        await page.locator("select.input").last().selectOption("25");
        await page.locator('input[type="text"]').nth(1).fill("865");
        await page.locator('input[type="text"]').nth(2).fill("Visa");
        await page.locator('input[type="text"]').nth(3).fill("rahulshettyacademy");  // or
        // await page.locator('input[name="coupon"]').fill("rahulshettyacademy"); 
        await page.locator('.btn.btn-primary.mt-1').click();

        await expect(page.locator(".input.txt.text-validated").first()).toHaveValue("1111 2222 3333 4444");
        await expect(page.locator(".input.txt.text-validated").nth(1)).toHaveValue(email);  // or
        await expect(page.locator(".user__name input").first()).toHaveValue(email);  // or
        await expect(page.locator(".user__name [type='text']").last()).toHaveValue(email);
        await expect(page.locator(".user__name label")).toHaveText(email);  // or
        await expect(page.locator(".user__name [type='text']").first()).toHaveText(email);
        await expect(page.locator(".input.ddl").first()).toHaveValue("07");  // or
        await expect(page.locator("select.input").first()).toHaveValue("07");
        await expect(page.locator(".input.ddl").nth(1)).toHaveValue("25");  // or
        await expect(page.locator("select.input").last()).toHaveValue("25");
        await expect(page.locator('input[type="text"]').nth(1)).toHaveValue("865");
        await expect(page.locator('input[type="text"]').nth(2)).toHaveValue("Visa");
        await expect(page.getByText('* Coupon Applied')).toBeVisible();  // or
        await expect(page.locator(".mt-1.ng-star-inserted")).toContainText("* Coupon Applied");
    });


    await test.step("STEP 7: Placing an order", async () => {
        await expect(page.locator(".ng-tns-c4-20.toast-title.ng-star-inserted")).not.toBeVisible();
        // proceeding with checkout
        await page.getByText("Place Order ").click();  // or
        // await page.locator(".action__submit").click();

        await expect(page.locator(".ng-tns-c4-20.toast-title.ng-star-inserted")).not.toBeVisible();
        expect(page.url()).toContain(productID);
        await page.waitForLoadState("networkidle");

        // verifying if user was redirected to final page (thank you page)
        await expect(page.locator(".hero-primary")).toContainText("Thankyou for the order.");  // or
        await expect(page.getByText("Thankyou for the order.")).toBeVisible();
        expect(page.url()).toContain("https://rahulshettyacademy.com/client/dashboard/thanks");

        // saving order(s) id
        const orders = page.locator(".em-spacer-1 .ng-star-inserted")
        const ordersCount = await orders.count();
        console.log("☑️ Orders count:", ordersCount);
        if (ordersCount === 1) {
            orderID = await page.locator(".ng-star-inserted").nth(2).textContent();
            console.log("☑️ Order ID:", orderID);
            orderID = orderID.replace(/\|/g, '').replace(/\s+/g, '');
            console.log("☑️ Order ID:", orderID);
        }
        else {
            for (var i = 0; i < ordersCount; i++) {
                var singleID = await page.locator(".em-spacer-1 .ng-star-inserted").nth(i).textContent()
                singleID = singleID.replace("|", "").replace("|", "");
                singleID = singleID.trim();
                console.log("☑️ Single order ID:", singleID);
                orderIDs.push(singleID);
            }
            console.log("☑️ All orders ids:", orderIDs);
        }
    });


    await test.step("STEP 8: Navigating to the page with orders", async () => {
        await page.locator("[routerlink='/dashboard/myorders']").first().click();
        await page.waitForLoadState("networkidle");
        await expect(page).toHaveURL("https://rahulshettyacademy.com/client/dashboard/myorders");
    });


    await test.step("STEP 9: Redirecting to the order by clicking View button of placed order", async () => {
        await page.locator("table tbody").waitFor();  // !!! await to load a page content!!! otherwise the count() will always be zero
        const rows = page.locator("tbody tr");
        console.log("➡️ Rows count:", await rows.count());

        // selecting order ID to track (if there are more than 1 order placed in single purchase, we take first order (= first product) ID)
        if (orderIDs) {
            // orderID = orderIDs[orderIDs.length - 1];  // last
            orderID = orderIDs[0];  // first
            console.log("➡️ Order ID:", orderID);
        }

        // searching the order ID in the list of all orders on the page
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
        expect(page.url()).toContain("https://rahulshettyacademy.com/client/dashboard/order-details");
        expect(page.url()).toContain(orderID);
        await expect(page.locator(".col-text")).toContainText(orderID);
        await expect(page.locator(".email-title")).toContainText('order summary');
        await expect(page.locator(".text").first()).toContainText(email);
        await expect(page.locator(".text").nth(1)).toContainText("Poland");
        let productTitle = await page.locator(".title").textContent();
        console.log("☑️ Product title:", productTitle.trim());
        console.log("☑️ Products list:", [product, additionalProduct]);
        expect([product, additionalProduct]).toContain(productTitle.trim());
        let productPriceClean = await page.locator(".price").textContent();
        console.log("☑️ Product price from order:", productPriceClean);
        productPriceClean = productPriceClean.replace("$", "").trim();
        console.log("☑️ Product price (cleaned):", productPriceClean);
        expect([productPrice, additionalProductPrice]).toContain(productPriceClean);
    });
});
