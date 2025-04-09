import { ExecutionEnviroment } from "@/types/executor";
import { PAGETOHTMLTASK } from "../task/PageToHtml";
export async function PageToHtmlExecutor(
  enviroment: ExecutionEnviroment<typeof PAGETOHTMLTASK>
): Promise<boolean> {
  try {
    const html = await enviroment.getPage()!.content();
    enviroment.setOutput("Html", html);
    return true;
  } catch (error: any) {
    enviroment.log.error(error.message);
    return false;
  }
}
