import { db } from "../db/client";
import { actionLogs } from "../db/schema";

export async function logAction({
  userId,
  action,
  toolName,
  riskLevel,
  status,
  inputSummary,
  outputSummary,
}: {
  userId: string;
  action: string;
  toolName: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  status: "success" | "failed" | "pending_approval" | "denied";
  inputSummary?: string;
  outputSummary?: string;
}) {
  await db.insert(actionLogs).values({
    userId,
    action,
    toolName,
    riskLevel,
    status,
    inputSummary: inputSummary?.slice(0, 500),
    outputSummary: outputSummary?.slice(0, 500),
  });
}
