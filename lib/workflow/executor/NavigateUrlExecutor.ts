import { ExecutionEnviroment } from "@/types/executor";
import { ClickElementTask } from "../task/ClickElement";
import { NavigateUrlTask } from "../task/NavigateUrl";
export async function NavigateUrlExecutor(
  enviroment: ExecutionEnviroment<typeof NavigateUrlTask>
): Promise<boolean> {
  try {
    const url = enviroment.getInput("URL");
    if (!url) {
      enviroment.log.error("input->URL not defined");
    }

    await enviroment.getPage()!.goto(url);
    enviroment.log.info(`visited ${url}`);
    return true;
  } catch (error: any) {
    enviroment.log.error(error.message);
    return false;
  }
}
