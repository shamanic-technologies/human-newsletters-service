import { Request, Response, NextFunction } from "express";

const EXEMPT_PATHS = ["/health", "/openapi.json"];

export interface ServiceHeaders {
  orgId: string;
  userId: string;
  runId: string;
}

/**
 * Middleware that requires x-org-id, x-user-id, and x-run-id headers
 * on all endpoints except /health and /openapi.json.
 *
 * Parsed headers are available via req.serviceHeaders.
 */
export function requireHeaders(req: Request, res: Response, next: NextFunction) {
  if (EXEMPT_PATHS.includes(req.path)) {
    next();
    return;
  }

  const orgId = req.headers["x-org-id"] as string | undefined;
  const userId = req.headers["x-user-id"] as string | undefined;
  const runId = req.headers["x-run-id"] as string | undefined;

  const missing: string[] = [];
  if (!orgId) missing.push("x-org-id");
  if (!userId) missing.push("x-user-id");
  if (!runId) missing.push("x-run-id");

  if (missing.length > 0) {
    res.status(400).json({
      error: `Missing required headers: ${missing.join(", ")}`,
    });
    return;
  }

  req.serviceHeaders = { orgId: orgId!, userId: userId!, runId: runId! };
  next();
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      serviceHeaders: ServiceHeaders;
    }
  }
}
