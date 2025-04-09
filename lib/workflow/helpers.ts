import { AppNode } from "@/types/appNode";
import { TaskRegistry } from "./task/registry";

export function CalculateWorkflowCost(nodes: AppNode[]) {
  return nodes.reduce((acc, node) => {
    return acc + TaskRegistry[node.data.type].credits;
  }, 0);
}
export function getAppUrl(path: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  return `${appUrl}/${path}`;
}
