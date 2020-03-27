import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Page, ElementHandle } from "puppeteer";
import dotenv from "dotenv";
import moment from "moment";
dotenv.config();

const WAIT_TIME = 4000;
const MENU_SELECTOR = "#name1337";
const MY_botS_SELECTOR = "[href='/my']";

puppeteer
  .use(StealthPlugin())
  .launch({ headless: true })
  .then(async browser => {
    const sdcPage = await browser.newPage();

    console.log("[LOAD] Navigating to SDC Bots...");
    await sdcPage.goto("https://bots.server-discord.com/");
    await sdcPage.waitFor(WAIT_TIME);
    await login(sdcPage);

    await sdcPage.click(MENU_SELECTOR);
    const mybotsButton = await sdcPage.$(MY_botS_SELECTOR);
    await mybotsButton.click();
    await sdcPage.waitFor(WAIT_TIME);
    if (!sdcPage.url().endsWith("/my")) {
      let cookies = await sdcPage.cookies();
      await sdcPage.deleteCookie(...cookies);
      await login(sdcPage);
    }

    await bumpbots(sdcPage);
  });

async function login(page: Page) {
  console.log("[LOAD] Logging in...");
  await page.click(MENU_SELECTOR); // click the 'Menu' button

  const loginButton = await page.$("[href='/login']");
  if (!loginButton) {
    console.log("[LOAD] Logged in!");
    return true;
  } else {
    await loginButton.click();
    await page.waitFor(WAIT_TIME);
    const authorizeButtonSelector = "[class*='lookFilled'][type='button']";
    let authorizeButton = await page.$(authorizeButtonSelector);

    // if not logged in
    if (!authorizeButton) {
      console.log("[LOAD] Not logged in to Discord, trying to log in...");
      await page.waitFor(4000); // for low-end systems

      const emailField = await page.$("[type='email']");
      const passwordField = await page.$("[type='password']");
      const submitButton = await page.$("[type='submit']");

      await emailField.type(process.env.DISCORD_EMAIL);
      await passwordField.type(process.env.DISCORD_PASSWORD);
      await submitButton.click();

      await page.waitFor(WAIT_TIME + 5000);
    } else {
      console.log(
        "[LOAD] Already logged in to Discord, trying to click the 'Authorize' button..."
      );
    }

    authorizeButton = await page.$(authorizeButtonSelector);
    await authorizeButton.click();
    await page.waitFor(WAIT_TIME);

    console.log("[LOAD] Logged in!");
    return true;
  }
}

async function bumpbots(mybotsPage: Page) {
  if (!mybotsPage.url().endsWith("/my")) {
    console.log("[BUMP] Some error occured...");
    return false;
  }

  const buttons = await mybotsPage.$$(".botUpBtn");
  buttons.forEach(async button => {
    const botId = await (await button.getProperty("value")).jsonValue();
    await bumpbot.bind(this, button, botId)();
  });
}

async function bumpbot(botUpButton: ElementHandle<Element>, botId: string) {
  botUpButton.click();
  console.log(`[BUMP] Tried to bump bot with id ${botId}`);
  setTimeout(setBumpTimeout.bind(this, [botUpButton]), 5000); // wait for sdc to handle bumps
}

async function setBumpTimeout(botButtons: ElementHandle<Element>[]) {
  botButtons.forEach(async button => {
    if (await button.getProperty("disabled")) {
      // hold my beer and get me a timer string
      const botIdElement = await button.getProperty("value");

      const botId = await botIdElement.jsonValue();
      const timer = await button.evaluateHandle(
        button =>
          document.querySelector(
            `[name='timer'][data-name='${button.getAttribute("value")}']`
          ),
        button
      );

      const timerText = await (
        await timer.getProperty("textContent")
      ).jsonValue();

      const duration = moment.duration(timerText);
      const additionalDuration = Math.floor(Math.random() * 60000) + 1; // for security, between 1 ms to 60 seconds

      setTimeout(
        bumpbot.bind(this, button, botId),
        duration.asMilliseconds() + additionalDuration
      );
      console.log(`[BUMP] Bump bot with id ${botId} in ${timerText}`);
    }
  });
}
