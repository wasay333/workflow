import { TaskParamType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { MousePointerClick, SendIcon } from "lucide-react";

export const DeleverViaWebhookTask = {
  type: TaskType.DELIVER_VIA_WEBHOOK,
  label: "Deliver via webhook",
  icon: (props) => {
    return <SendIcon className="stroke-blue-400" {...props} />;
  },
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: "Target URL",
      type: TaskParamType.STRING,
      required: true,
    },
    {
      name: "Body",
      type: TaskParamType.STRING,
      required: true,
    },
  ] as const,
  outputs: [] as const,
} satisfies WorkflowTask;
