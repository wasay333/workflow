"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GetUserPurchaseHistory() {
  const { userId } = auth();
  if (!userId) {
    throw new Error("unauthenticated");
  }
  return prisma.userParchase.findMany({
    where: { userId },
    orderBy: {
      date: "desc",
    },
  });
}
