"use strict";

// import puppeteer from "puppeteer";
import { Browser, Page, launch } from "puppeteer";

interface ResultOfRrepare {
  browser: Browser;
  page: Page;
}

class Scraper {
  // class variables
  private static url = "https://miraitranslate.com/trial";

  // instance variables

  constructor() {}

  public static async start(inputText: string) {
    let outputText = "";

    const resultOfRrepare = await this._prepare();
    if (resultOfRrepare) {
      const browser = resultOfRrepare.browser;
      const page = resultOfRrepare.page;

      if (browser && page) {
        const inputTexts = [inputText];
        for (let i = 0; i < inputTexts.length; i++) {
          const perText = await this._scrape(page, inputTexts[i]);
          outputText += perText;

          if (i < inputTexts.length - 1) {
            const seconds = 60 * 1000;
            await this._sleep(seconds);
          }
        }

        await this._cleanUp(browser, page);
      }
    }

    return outputText;
  }

  private static _sleep(ms: number) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  private static async _prepare() {
    try {
      const browser = await launch({
        ignoreDefaultArgs: ["--disable-extensions"],
      });

      const page = await browser.newPage();
      await page.goto(Scraper.url, { waitUntil: "networkidle0" });

      const title = await page.title();
      // await page.screenshot({ path: "D:\\screenshot_1.png", fullPage: true });

      await page.waitForSelector("#trans-container");

      await page.waitForSelector(".trans-language-label");
      await page.click(".trans-language-label");

      await page.waitForSelector('li[data-test="src-lang-ja"]');
      await page.click('li[data-test="src-lang-ja"]');

      return { browser, page };
    } catch (e) {
      console.error(e);
    }

    return null;
  }

  private static async _scrape(page: Page, inputText: string) {
    try {
      await page.waitForSelector("#source-container > textarea");

      await page.$eval(
        "#source-container > textarea",
        (el: Element, inputText: string) => {
          (el as HTMLTextAreaElement).value = inputText;
        },
        inputText
      );

      await page.focus("#source-container > textarea");
      page.keyboard.type(" ");

      // await page.waitFor(1 * 1000);
      // await page.screenshot({ path: "D:\\screenshot_2.png", fullPage: true });
      await page.waitForSelector(".btn-trans:not([disabled])");
      // await page.screenshot({ path: "D:\\screenshot_3.png", fullPage: true });
      await page.click(".btn-trans");
      await page.waitFor(1 * 1000);
      // await page.screenshot({ path: "D:\\screenshot_4.png", fullPage: true });

      await page.waitForSelector("#translated-container > textarea");
      const outputTextarea = await page.$("#translated-container > textarea");
      if (outputTextarea) {
        const valueObj = await outputTextarea.getProperty("value");
        let text = (await valueObj.jsonValue()) as string;
        return text;
      }
    } catch (e) {
      console.error(e);
    }

    return "";
  }

  private static async _cleanUp(browser: Browser, page: Page) {
    try {
      await browser.close();
    } catch (e) {
      console.error(e);
    }
  }
}

export default Scraper;
