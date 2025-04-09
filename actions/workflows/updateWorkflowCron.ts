"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import parser from "cron-parser";
import { revalidatePath } from "next/cache";

export async function UpdateWorkflowCron({
  id,
  cron,
}: {
  id: string;
  cron: string;
}) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("UnAuthenticated");
  }
  try {
    const interval = parser.parseExpression(cron, { utc: true });
    await prisma.workflow.update({
      where: { id, userId },
      data: {
        cron,
        NextRunAt: interval.next().toDate(),
      },
    });
  } catch (error: any) {
    console.error("Invalid cron", error.message);
    throw new Error("Invalid corn expression");
  }
  revalidatePath("/workflows");
}
