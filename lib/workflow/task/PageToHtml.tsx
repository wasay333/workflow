import { TaskParamType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { CodeIcon, LucideProps } from "lucide-react";

export const PAGETOHTMLTASK={
    type:TaskType.PAGE_TO_HTML,
    label:"Get html from page",
    icon:(props: LucideProps)=>{
      return <CodeIcon className="stroke-rose-400" {...props}/>
    },
    isEntryPoint:false,
    credits:2,
    inputs:[
        {
          name: "Web page",
          type: TaskParamType.BROWSER_INSTANCE,
          required: true,
        },
      ],
    outputs:[{
      name:"Html",
      type:TaskParamType.STRING
    },
    {
      name:"Web Page",
      type:TaskParamType.BROWSER_INSTANCE
    }
  ]
} satisfies WorkflowTask