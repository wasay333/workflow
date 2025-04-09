import { ExecutionEnviroment } from "@/types/executor";
import puppeteer from "puppeteer";
import { LaunchBrowserTask } from "../task/LaunchBrowser";
export async function LaunchBrowserExecutor(
  enviroment: ExecutionEnviroment<typeof LaunchBrowserTask>
): Promise<boolean> {
  try {
    const websiteUrl = enviroment.getInput("Website Url");
    const browser = await puppeteer.launch({
      headless: true, //for testing
    });
    enviroment.log.info("Browser started successfully.");
    enviroment.setBrowser(browser);
    const page = await browser.newPage();
    page.setViewport({ width: 2560, height: 1440 });

    await page.goto(websiteUrl);
    enviroment.setPage(page);
    enviroment.log.info(`Opened page at: ${websiteUrl}`);

    return true;
  } catch (error: any) {
    enviroment.log.error(error.message);
    return false;
  }
}
