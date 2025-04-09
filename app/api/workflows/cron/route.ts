import prisma from "@/lib/prisma";
import { getAppUrl } from "@/lib/workflow/helpers";
import { WorkflowStatus } from "@/types/workflow";

export async function GET(req: Request) {
  const now = new Date();
  const workflows = await prisma.workflow.findMany({
    select: { id: true },
    where: {
      status: WorkflowStatus.PUBLISHED,
      cron: { not: null },
      NextRunAt: { lte: now },
    },
  });
  for (const workflow of workflows) {
    triggerWorkflow(workflow.id);
  }
  return Response.json({ workflowsToRun: workflows.length }, { status: 200 });
}

function triggerWorkflow(workflowId: string) {
  const triggerApiUrl = getAppUrl(
    `api/workflows/execute?workflowId=${workflowId}`
  );
  fetch(triggerApiUrl, {
    headers: {
      Authorization: `Bearer ${process.env.API_SECRET!}`,
    },
    cache: "no-store",
  }).catch((error) =>
    console.error(
      "Error triggering workflow with id",
      workflowId,
      ":error->",
      error.message
    )
  );
  console.log("@@TRIGGER URL", triggerApiUrl);
}
