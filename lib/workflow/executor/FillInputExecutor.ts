import { ExecutionEnviroment } from "@/types/executor";
import { FillInputTask } from "../task/FillInput";
import { waitFor } from "@/lib/waitFor";
export async function FillInputExecutor(
  enviroment: ExecutionEnviroment<typeof FillInputTask>
): Promise<boolean> {
  try {
    const selector = enviroment.getInput("Selector");
    if (!selector) {
      enviroment.log.error("input->selector not defined");
    }
    const value = enviroment.getInput("Value");
    if (!value) {
      enviroment.log.error("input->value not defined");
    }
    await enviroment.getPage()!.type(selector, value);
    return true;
  } catch (error: any) {
    enviroment.log.error(error.message);
    return false;
  }
}
