import "server-only";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import {
  ExecutionPhaseStatus,
  WorkflowExecutionStatus,
} from "@/types/workflow";
import { ExecutionPhase } from "@prisma/client";
import { AppNode } from "@/types/appNode";
import { TaskRegistry } from "./task/registry";
import { ExecutorRegistry } from "./executor/registry";
import { Enviroment, ExecutionEnviroment } from "@/types/executor";
import { TaskParamType } from "@/types/task";
import { Browser, Page } from "puppeteer";
import { Edge } from "@xyflow/react";
import { LogCollector } from "@/types/log";
import { createLogCollector } from "../log";
import { waitFor } from "../waitFor";
export async function ExecuteWorkflow(executionId: string, NextRunAt?: Date) {
  const execution = await prisma.workflowExecution.findUnique({
    where: { id: executionId },
    include: { workflow: true, phases: true },
  });
  if (!execution) {
    throw new Error("execution not found");
  }
  const edges = JSON.parse(execution.defination).edges as Edge[];
  const enviroment: Enviroment = { phases: {} };

  await initializeWorkflowExecution(
    executionId,
    execution.workflowId,
    NextRunAt
  );

  await initializePhaseStatuses(execution);

  let creditsConsumed = 0;
  let executionFailed = false;
  for (const phase of execution.phases) {
    //TODO: consume credits
    const phaseExecution = await executeWorkflowPhase(
      phase,
      enviroment,
      edges,
      execution.userId
    );
    creditsConsumed += phaseExecution.creditsConsumed;
    if (!phaseExecution.success) {
      executionFailed = true;
      break;
    }
  }
  await finalizeWorkflowExecution(
    executionId,
    execution.workflowId,
    executionFailed,
    creditsConsumed
  );
  await cleanupEnviroment(enviroment);
  revalidatePath("/workflows/runs");
}
async function initializeWorkflowExecution(
  executionId: string,
  workflowId: string,
  NextRunAt?: Date
) {
  await prisma.workflowExecution.update({
    where: { id: executionId },
    data: {
      startedAt: new Date(),
      status: WorkflowExecutionStatus.RUNNING,
    },
  });
  await prisma.workflow.update({
    where: {
      id: workflowId,
    },
    data: {
      lastRunAt: new Date(),
      lastRunStatus: WorkflowExecutionStatus.RUNNING,
      lastRunId: executionId,
      ...(NextRunAt && { NextRunAt }),
    },
  });
}
async function initializePhaseStatuses(execution: any) {
  await prisma.executionPhase.updateMany({
    where: {
      id: {
        in: execution.phases.map((phase: any) => phase.id),
      },
    },
    data: {
      status: ExecutionPhaseStatus.PENDING,
    },
  });
}

async function finalizeWorkflowExecution(
  executionId: string,
  workflowId: string,
  executionFailed: boolean,
  creditsConsumed: number
) {
  const finalStatus = executionFailed
    ? WorkflowExecutionStatus.FAILED
    : WorkflowExecutionStatus.COMPLETED;
  await prisma.workflowExecution.update({
    where: { id: executionId },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      creditsConsumed,
    },
  });
  await prisma.workflow
    .update({
      where: {
        id: workflowId,
        lastRunId: executionId,
      },
      data: {
        lastRunStatus: finalStatus,
      },
    })
    .catch((err) => {
      //ignore
      //this means that we have triggered other runs for this workflow
      //while an execution was running
    });
}
async function executeWorkflowPhase(
  phase: ExecutionPhase,
  enviroment: Enviroment,
  edges: Edge[],
  userId: string
) {
  const logCollector = createLogCollector();
  const startedAt = new Date();
  const node = JSON.parse(phase.node) as AppNode;
  setUpEnviromentForPhase(node, enviroment, edges);
  //Update phase status
  await prisma.executionPhase.update({
    where: {
      id: phase.id,
    },
    data: {
      status: ExecutionPhaseStatus.RUNNING,
      startedAt,
      inputs: JSON.stringify(enviroment.phases[node.id].inputs),
    },
  });
  const creditsRequired = TaskRegistry[node.data.type].credits;
  console.log(
    `Executing phase ${phase.name} with ${creditsRequired} credits required`
  );
  //TODO:decrement user balance (with required credits)
  let success = await decrementCredits(userId, creditsRequired, logCollector);
  const creditsConsumed = success ? creditsRequired : 0;
  if (success) {
    //we can execute the phase if credits are sufficient
    success = await executePhase(phase, node, enviroment, logCollector);
  }
  const outputs = enviroment.phases[node.id].outputs;
  await finalizePhase(
    phase.id,
    success,
    outputs,
    logCollector,
    creditsConsumed
  );
  return { success, creditsConsumed };
}
async function finalizePhase(
  phaseId: string,
  success: boolean,
  outputs: any,
  logCollector: LogCollector,
  creditsConsumed: number
) {
  const finalStatus = success
    ? ExecutionPhaseStatus.COMPLETED
    : ExecutionPhaseStatus.FAILED;
  await prisma.executionPhase.update({
    where: { id: phaseId },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      outputs: JSON.stringify(outputs),
      creditsConsumed,
      logs: {
        createMany: {
          data: logCollector.getAll().map((log) => ({
            message: log.message,
            timestamp: log.timestamp,
            logLevel: log.level,
          })),
        },
      },
    },
  });
}

async function executePhase(
  phase: ExecutionPhase,
  node: AppNode,
  enviroment: Enviroment,
  LogCollector: LogCollector
): Promise<boolean> {
  const runFn = ExecutorRegistry[node.data.type];
  if (!runFn) {
    LogCollector.error(`not found executor for ${node.data.type}`);
    return false;
  }
  const executionEnviroment: ExecutionEnviroment<any> =
    createExecutionEnviroment(node, enviroment, LogCollector);
  return await runFn(executionEnviroment);
}

function setUpEnviromentForPhase(
  node: AppNode,
  enviroment: Enviroment,
  edges: Edge[]
) {
  enviroment.phases[node.id] = { inputs: {}, outputs: {} };
  const inputs = TaskRegistry[node.data.type].inputs;
  for (const input of inputs) {
    if (input.type === TaskParamType.BROWSER_INSTANCE) continue;
    const inputValue = node.data.inputs[input.name];
    if (inputValue) {
      enviroment.phases[node.id].inputs[input.name] = inputValue;
      continue;
    }

    //Get input value from outputs in the enviroment
    const connectedEdge = edges.find(
      (edge) => edge.target === node.id && edge.targetHandle === input.name
    );
    if (!connectedEdge) {
      console.error("Missing edge for input", input.name, "node id: ", node.id);
      continue;
    }
    const outputValue =
      enviroment.phases[connectedEdge.source].outputs[
        connectedEdge.sourceHandle!
      ];
    enviroment.phases[node.id].inputs[input.name] = outputValue;
  }
}

function createExecutionEnviroment(
  node: AppNode,
  enviroment: Enviroment,
  LogCollector: LogCollector
): ExecutionEnviroment<any> {
  return {
    getInput: (name: string) => enviroment.phases[node.id]?.inputs[name],
    setOutput: (name: string, value: string) => {
      enviroment.phases[node.id].outputs[name] = value;
    },
    getBrowser: () => enviroment.browser,
    setBrowser: (browser: Browser) => (enviroment.browser = browser),
    getPage: () => enviroment.page,
    setPage: (page: Page) => (enviroment.page = page),

    log: LogCollector,
  };
}

async function cleanupEnviroment(enviroment: Enviroment) {
  if (enviroment.browser) {
    // await enviroment.browser
    //   .close()
    //   .catch((err) => console.error("Cannot close browser, reason:", err));
  }
}

async function decrementCredits(
  userId: string,
  amount: number,
  logCollector: LogCollector
) {
  try {
    await prisma.userBalance.update({
      where: { userId, credits: { gte: amount } },
      data: { credits: { decrement: amount } },
    });
    return true;
  } catch (error) {
    logCollector.error("insufficient balance");
    return false;
  }
}
