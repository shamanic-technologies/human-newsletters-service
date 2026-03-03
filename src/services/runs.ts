const RUNS_SERVICE_URL = process.env.RUNS_SERVICE_URL || "https://runs.mcpfactory.org";
const RUNS_SERVICE_API_KEY = process.env.RUNS_SERVICE_API_KEY;

export interface CreateRunParams {
  orgId: string;
  userId: string;
  parentRunId: string;
  taskName: string;
}

export interface RunCost {
  costName: string;
  units: number;
}

export interface Run {
  id: string;
  parentRunId: string | null;
  organizationId: string;
  userId: string;
  serviceName: string;
  taskName: string;
  status: string;
}

/**
 * Creates a new run in runs-service.
 * The parentRunId is the x-run-id received from the caller.
 */
export async function createRun(params: CreateRunParams): Promise<Run> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (RUNS_SERVICE_API_KEY) {
    headers["X-API-Key"] = RUNS_SERVICE_API_KEY;
  }

  const res = await fetch(`${RUNS_SERVICE_URL}/v1/runs`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      parentRunId: params.parentRunId,
      organizationId: params.orgId,
      userId: params.userId,
      serviceName: "human-newsletters-service",
      taskName: params.taskName,
    }),
  });

  if (!res.ok) {
    throw new Error(`runs-service returned ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<Run>;
}

/**
 * Marks a run as completed.
 */
export async function completeRun(runId: string): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (RUNS_SERVICE_API_KEY) {
    headers["X-API-Key"] = RUNS_SERVICE_API_KEY;
  }

  const res = await fetch(`${RUNS_SERVICE_URL}/v1/runs/${encodeURIComponent(runId)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status: "completed" }),
  });

  if (!res.ok) {
    throw new Error(`runs-service returned ${res.status}: ${await res.text()}`);
  }
}

/**
 * Marks a run as failed.
 */
export async function failRun(runId: string): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (RUNS_SERVICE_API_KEY) {
    headers["X-API-Key"] = RUNS_SERVICE_API_KEY;
  }

  const res = await fetch(`${RUNS_SERVICE_URL}/v1/runs/${encodeURIComponent(runId)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status: "failed" }),
  });

  if (!res.ok) {
    throw new Error(`runs-service returned ${res.status}: ${await res.text()}`);
  }
}

/**
 * Adds costs to a run.
 */
export async function addRunCosts(runId: string, costs: RunCost[]): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (RUNS_SERVICE_API_KEY) {
    headers["X-API-Key"] = RUNS_SERVICE_API_KEY;
  }

  const res = await fetch(
    `${RUNS_SERVICE_URL}/v1/runs/${encodeURIComponent(runId)}/costs`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ costs }),
    }
  );

  if (!res.ok) {
    throw new Error(`runs-service returned ${res.status}: ${await res.text()}`);
  }
}
