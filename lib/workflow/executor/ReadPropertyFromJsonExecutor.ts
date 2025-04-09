import { ExecutionEnviroment } from "@/types/executor";
import { ReadPropertyFromJsonTask } from "../task/ReadPropertyFromJson";
export async function ReadPropertyFromJsonExecutor(
  enviroment: ExecutionEnviroment<typeof ReadPropertyFromJsonTask>
): Promise<boolean> {
  try {
    const jsonData = enviroment.getInput("JSON");
    if (!jsonData) {
      enviroment.log.error("input->JSON not defined");
    }
    const propertyName = enviroment.getInput("Property name");
    if (!propertyName) {
      enviroment.log.error("input->PropertyName not defined");
    }
    const json = JSON.parse(jsonData);
    const propertyValue = json[propertyName];
    if (propertyValue === undefined) {
      enviroment.log.error(`Property not found`);
      return false;
    }
    enviroment.setOutput("Property value", propertyValue);
    return true;
  } catch (error: any) {
    enviroment.log.error(error.message);
    return false;
  }
}
