"use server";

import prisma from "@/lib/prisma";
import { WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { Workflow } from "lucide-react";
import { revalidatePath } from "next/cache";

export async function UnpublishWorkFlow(id: string) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("unauthenticated");
  }
  const workflow = await prisma.workflow.findUnique({
    where: {
      id,
      userId,
    },
  });
  if (!workflow) {
    throw new Error("workflow not found");
  }
  if (workflow.status !== WorkflowStatus.PUBLISHED) {
    throw new Error("workflow not published");
  }
  await prisma.workflow.update({
    where: {
      id,
      userId,
    },
    data: {
      status: WorkflowStatus.DRAFT,
      executionPlan: null,
      creditsCost: 0,
    },
  });
  revalidatePath(`/workflow/editor/${id}`);
}
