import { ExecutionEnviroment } from "@/types/executor";
import { AddPropertyFromJsonTask } from "../task/AddPropertyFromJson";
export async function AddPropertyToJsonExecutor(
  enviroment: ExecutionEnviroment<typeof AddPropertyFromJsonTask>
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
    const propertyValue = enviroment.getInput("Property value");
    if (!propertyValue) {
      enviroment.log.error("input->PropertyValue not defined");
    }
    const json = JSON.parse(jsonData);
    json[propertyName] = propertyValue;
    enviroment.setOutput("Update JSON", JSON.stringify(json));
    return true;
  } catch (error: any) {
    enviroment.log.error(error.message);
    return false;
  }
}
