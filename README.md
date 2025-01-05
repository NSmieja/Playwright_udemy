## Terminal commends:

### New project
https://playwright.dev/docs/intro
- npm init playwright@latest

### Running tests
    - npx playwright test
    - npx playwright test --headed
    - npx playwright test --ui
    - npx playwright test --debug  (Runs the tests in debug mode = Playwright Inspector)
    - npx playwright test --project=chromium  (Runs the tests only on Desktop Chrome)
    - npx playwright test tests/examplespec.js  (Runs the tests in a specific file - e.g. tests/client_app.spec.js)
    - npx playwright codegen  (Auto generate tests with Codegen)
    - npx playwright show-report

To run a single test: name the test: 
    - test.only()


## Runninig tests on localhost:8080
1. Inside file with tests (.spec.js files):
    - add: const BASE_URL = 'http://localhost:8080';
    - instde each test use: await page.goto(`${BASE_URL}/file_name.html`);
2. Terminal (first) for running the server:
    - npx http-server *folder/location/to/html/file* -p 8080 (e.g. npx http-server app -p 8080)
3. Terminal (second) with tests run:
    - npx playwright test
4. YAML file - add code to jobs - test - steps:
    - name: Start static server \
      run: npx http-server *folder/location/to/html/file* -p 8080 &


## Config file
- timeout: 30000 - 30 sec. for the test to run, if not finished then failed
- expect: {timeout: 5000} - 5 sec. for the assertion insied a test to run, if not finished then failed
- use: {headless: true} - will run tests in headles mode



## Text 
- /some text/         - anything before and anything afert is not relevant (we only want to check if that 'some text' is there)
- /some text/i        - case insensitive
- [tagname*='text fragment']  - * (asterix) will work as regex, pratial text will be good enough, e.g. when searching for a locator style="display: block", use [style*='block']



## Creating tests

### Import external module from external package:
- const { test, expect, request } = require('@playwright/test');


### Test syntax:
- test("name", async function() { await *code* });
- test("name", async () => { await *code* });


### Asynchronous programming:
(all code is executed at the same time) \
**async** function() {**await** *code*}


### Playwright fixtures:
- {browser}
    - browser.newContext() - incognito mode where I can inject plugins / cookies / proxy / ...
- {page}
- {request}


### Writting tests 
    - test("*name*", async ({*fixture*}) => { *code* });
    - test.beforeAll();       - will run before all tests once
    - test.beforeEach();      - will run before each test


### Given-When-Then with test.step()
    test("SCENARIO: ", async ({ page }) => {
      await test.step("GIVEN: ", async () => {
          
        });

      await test.step("WHEN: ", async () => {
          
        });

      await test.step("THEN: ", async () => {
          
        });
    });


### Test suite with test.describe()
    test.describe('two tests', () => {
      test('Group one', async ({ page }) => {
        // ...
      });

      test('Group two', async ({ page }) => {
        // ...
      });
    });
- https://playwright.dev/docs/api/class-test#test-describe 


### Extending timeout for a single test:
- inside test use: test.setTimeout(120_000) 



## Child elements onthe page

### Child page (separate window)
- See: 03_child_page.spec.js 
- See: https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/31110482#overview
- Use __browser__ fixture instead of page fixture
- __Example:__
  - primary page: 
      - const context = await browser.newContext();
      - const page = await context.newPage();
      - await page.goto("*https://some_address*");
  - secondary page: 
      - const newPageLink = page.locator("*some_link_to_new_window_page*")
      - const [newPage] = await Promise.all( \
              [ \
                  context.waitForEvent("page"),  // listen for any new pages to open \
                  newPageLink.click(),  // opens link to a new page in separate window \
              ] \
          );
  - then use newPage variable (instead of page) to perform actions on the externally opened page


### Accessing child frame on the main frame on the page
- see file: 07_ui... and https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/31110680#overview
- we can check if on the page is tag named iframe or frameset
- then switch to the child frame with frameLocator() by the frame name or frame id
    - const framePage = page.frameLocator("*locator*");   - to switch to the child frame, locator is either #id or name
    - framePage.locator();      - to use the child frame instead of main frame use framePage object instead of page object



## API testing
- https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/31110732#questions/18040366 
- See also files: 
  - 08_api_login.spec.js 
  - 09_api_testing.spec.js

NOTE: Remember to import and add fixture request to the test 

### 1. Making a GET call:
Getting the response from GET method: 
- method 1 (without using request fixture - must import request from library):
    - const apiContext = await request.newContext(); 
    - const respose = await apiContext.get("*url*");
- method 2 (with request fixture):
    - const response = await request.get("*url*"); 

### 2. Making a POST call for token:
Getting the response from POST method:
- method 1 (without using request fixture - must import request from library):
    - const apiContext = await request.newContext();
    - const response = await apicontext.post("*url*", {data: *payload*});   - where e.g. payload = {username: "abc", password: "xyz"}
- method 2 (with request fixture):
    - const response = await request.post("*url*", {data: *payload*});
- assertions:
    - expect(response.ok()).toBeTruthy();     -  validating response status code if it is 200 or 201  or
    - expect(response.status()).toBe(200);
- extract token from response body

### 3. Making a POST call for creating orderID with use of token:
https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/31110810#questions/18040366

- with method 1 (without using request fixture - must import request from library):
  - const apiContext = await request.newContext();
  - var response = await apiContext.post(
        "*url*",
        {
            data: {*orders: [{ country: country, productOrderedId: productId }]*},  // form from API call on the Inspect -> Network >> POST for given API call >> Request body
            headers: {
                "Authorization": token,             // check in Inspect -> Network >> POST for create-order >> Headers >> look where token goes; token value from previous API call
                "Content-Type": "application/json"  // check in Inspect -> Network >> POST for given API call >> Headers >> look for content-type used
            }
        },
    );
  - // then create var with response body and extract order ID from response body


### 4. Extracting response body:
Extracting body in JSON format:
- method 1
    - const responseBody = JSON.parse(await response.text()); 
- method 2:
    - const responseBody = await response.json(); 

### 5. Inserting token to the local page storage in the test
https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/31110780#questions/18040366

- NOTE: To insert token, we must first extract it from API call and save it as a global variable \
- To insert js function with the token use code: 
    - await page.addInitScript(value => {
            window.localStorage.setItem("token", value);
        },
        token
      );
- NOTE: "token" may have different name (bearerToken, authorization etc.) - verify first in the browser Application / ask developer
- NOTE: token may be placed in different storage (like: window.sessionStorage.setItem("token", value)) - verify first in the browser Application / ask developer


### Response methods:
    - response.ok();        - check if status code is 200 or 201 (T/F)
    - response.status();    - return status code
    - response.json();      - return response body in JSON format
    - response.body();      - return JSON body
    - response.header();    - return header



## Constructing test cases

### Page methods:
    - await page.goto("*url*");     - navigate to the page
    - await page.goBack();          - navigates to the previous page
    - await page.goForward();       - navigates to the next page

    - await page.title();           - return a page title
    - await page.pause();           - will stop the test to see what is happening and open Playwright Inspector window

    - await page.fill("*locator*", "*text*");  - will fill field addressed by loactor with given text

    - page.on();              - for handling listeners like for JAVA popups
                              - NOTE! It will work from any line in the code (does not have to be after clicking popub button)
      -  page.on("dialog", dialog => dialog.accept());    - clicking on JAVA popup on OK button
      -  page.on("dialog", dialog => dialog.dismiss());   - clicking on JAVA popup on CANCEL button

    - page.frameLocator();      - to switch to a child frame (use it as a const framePage = page.frameLocator("*some id or name*");) and then use framePage instead of page
See: https://playwright.dev/docs/writing-tests 



### Page locators:
https://playwright.dev/docs/locators
    - await page.getByRole("*role*", {name: "*text*"});
    - await page.getByPlaceholder("*text*");
    - await page.getByText("*text*");
    - await page.getByLabel("*Gender*").selectOption("*Male*");  - for dropdown list
    - await page.getByLabel("*Employed*").check();               - for radio button selection
    - await page.getByLabel("*Check me out*").check();           - for checkbox - Playwright will look for a place to clisk within this line, not only within label
    - await page.locator('//*abbr[text()="15"]*').click();   - xpath (abbr is a tag name, like button, label, span etc.)
    - await page.locator();         - for extractig css elements from a webpage
        - css -> tagname#id or #id              - if id is present
        - css -> tagname.class or .class        - if class attribute is present
        - css -> [attribute='value']            - based on any attribute
                [attribute*='partial value']   - * will look for partial fit (so I don't have to type [style='display: none'] only [style*='none'])
        - css -> parenttagname >> childtagname  - css with traversing from parent to child
        - "text=*text*"                         - if needs to write a locator based on text

### Filters
__Instead of using for loop for iterating over lists__ 
    - await page.locator("*app-card*").filter({ hasText: "*Nokia Edge*" }).getByRole("button", { name: "*Add*" }).click();
- see: 05_getby_locator (last part), 
- section 8 (udemy) - https://www.udemy.com/course/playwright-tutorials-automation-testing/learn/lecture/39602656#overview


### Locator methods:
    - .fill("text")             - to enter text to the field
    - .fill("")                 - to clear text inside the field
    - .pressSequentially("text") - to start typing text to get list of available selection options (e.g in country field)
    - .click()                  - to click on an action button / check in checkbox field
    - .dblclick()                - to make double click
    - .check()                  - to check a checkbox field
    - .uncheck()                - to uncheck a checkbox field
    - .isChecked()              - to validate if radio button is checked (T/F)
    - .textContent()            - to extract content of a given locator (e.g popup)
    - .count()                  - to count number of elements found (NOTE! should wait for loading the content)
    - .split()                  - to split text over given character/text (e.g. textOnPage.split("@")[1].split(" ")[0].split(".")[0])
    - .hover()                  - to hover mouse over the element
    - .focus()                  - to focus the element
    - .press()                  - to press single key
    - .selectOption()           - to select option in the drop down
    - .setInputFiles()          - to pick files to upload
    - .first()                  - to extract first element from a list
    - .last()                   - to extract first element from a list
    - .nth(*index_number*)      - to extract element by index
    - .allTextContents()        - to extract all elements (as an array) (NOTE! should wait for loading the content)
    - .last().waitFor()         - to wait until all specified page content is loaded


### Assertions:
    - await expect(page).toHaveTitle("*title*"); 
    - await expect(page.getByRole()).toBeVisible();    - e.g. await expect(page.getByRole('heading').filter({ hasText: /ZARA COAT/ })).toBeVisible();
    - await expect(locator).toContainText("*text*");
    - await expect(locator).toHaveText("*text*");
    - await expect(locator).toHaveValue("*text*");      - for validating input fields (country selector, given email address)
    - await expect(locator).toBeChecked();              - for validating radio buttons
    - await expect(locator).not.toBeChecked();          - for validating radio buttons
    - await expect(locator).toBeTruthy();
    - await expect(locator).toHaveAttribute("*type*", "*text*");


## Waiting
    - await page.locator("*sth*").last().waitFor()    - to wait until all specified page content is loaded
    - await page.waitForLoadState("networkidle");     - for loading all the content (will wait until network goes to idle state) - NOTE: can be fluky
    - await page.waitForSelector("*.classname tagname*"); 


## JAVA popup (dialog) window
- __NOTE: only after setting the listener first we can click on button that will trigger that action! (not before)__ \
    - page.on();                                      - will listen for specified events and will be notified when that event occure
    - page.on("dialog", dialog => dialog.accept());   - here we are listening for dialog event to occur (popup window to show up), so we use listener on "dialog"; then we want to click on OK button, so we need to use the accept method like this:  dialog => dialog.accept()
    - page.on("dialog", dialog => dialog.dismiss());  - if we want to click on Cancel button we need to use method .dismiss()


## Using data from .env file
https://medium.com/@dlasanthax/how-to-use-env-files-in-playwright-beb635bf90e8 \
__NOTE!__ Remember to add .env file to .gitignore file!

- TESTS WITH DATA FROM .env FILE MUST BE RUN VIA THE TERMINAL ONLY (no use in Playwright extention on VSC)
- inside file with tests (e.g. some_name.spec.js):
    - import dotenv from 'dotenv';
    - import path from 'path'; 

    - // add path to .env file 
    - dotenv.config({ path: '../folder_name/.env' });  // or just dotenv.config(); if it is in the same location
    - // dotenv.config({ path: path.resolve(__dirname, '../1_udemy/.env') });

    - const email = process.env.EMAIL;
    - const password = process.env.PASSWORD;
    - // console.log("EMAIL:", process.env.EMAIL);
    - // console.log("PASSWORD:", process.env.PASSWORD);
    - // console.log("Resolved .env path:", path.resolve(__dirname, '../1_udemy/.env'));

- in tests use created variables email and password to extract data from .env file 



## Notes
- be aware of auto-wait mechanism (not for all methods) - https://playwright.dev/docs/actionability


## Github 
https://playwright.dev/docs/ci-intro#setting-up-github-actions \
https://trace.playwright.dev/

